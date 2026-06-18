import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { ErrorBoundary } from './ErrorBoundary'
import { TicketSupportCard } from './TicketSupportCard'
import { useSite } from '@/context/SiteContext'

function NoSiteWarning() {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-amber-100 shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Nie skonfigurowano żadnej strony</h3>
        <p className="text-sm text-gray-600 mb-6">
          Skontaktuj się z administratorem, aby dodać pierwszą stronę do panelu.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Odśwież stronę
        </button>
      </div>
    </div>
  )
}

export default function DashboardLayout() {
  const { currentSite, loading } = useSite()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Ładowanie panelu...</p>
        </div>
      </div>
    )
  }

  if (!currentSite) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
            <NoSiteWarning />
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
          <ErrorBoundary name="Dashboard">
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      <TicketSupportCard inline={false} />
    </div>
  )
}

