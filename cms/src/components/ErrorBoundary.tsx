import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Copy, Code } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  name?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary: ${this.props.name || 'unknown'}]`, error, errorInfo)
    this.setState({ error, errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  handleCopyError = () => {
    const { error, errorInfo } = this.state
    const text = `Error: ${error?.message}\n${error?.stack}\n\nComponent Stack:\n${errorInfo?.componentStack}`
    navigator.clipboard.writeText(text)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white rounded-2xl border border-red-100 shadow-lg p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Coś poszło nie tak</h3>
                <p className="text-sm text-gray-600">
                  Wystąpił nieoczekiwany błąd. Przepraszamy za niedogodności.
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 max-h-48 overflow-y-auto">
                <code className="text-xs text-red-600 font-mono break-all">
                  {this.state.error.message}
                </code>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <RefreshCw size={16} />
                Odśwież stronę
              </button>
              <button
                onClick={this.handleCopyError}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
                title="Kopiuj szczegóły błędu"
              >
                <Copy size={16} />
              </button>
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => {
                    const { error, errorInfo } = this.state
                    console.error('Full error:', error, errorInfo)
                    alert('Szczegóły błędu w konsoli deweloperskiej (F12)')
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-700 text-sm font-medium rounded-xl transition-colors"
                  title="Pokaż szczegóły (dev)"
                >
                  <Code size={16} />
                </button>
              )}
            </div>

            <p className="mt-4 text-xs text-gray-400 text-center">
              Jeśli problem się powtarza, skontaktuj się z pomocą techniczną.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
