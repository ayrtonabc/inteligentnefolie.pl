import { useState, FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'
import { LogIn, Eye, EyeOff, Mail, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const LOGO_URL = '/logoseogrow.webp'
const LOGIN_IMAGE_URL = '/panel/login.webp'

function LoginShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="w-full max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.18)] lg:grid lg:grid-cols-[0.95fr_1.15fr]">
      <div className="hidden min-h-[640px] bg-[linear-gradient(180deg,#fcfcfd_0%,#f5f7fa_100%)] lg:flex lg:flex-col lg:items-center lg:px-12 lg:pb-12 lg:pt-24 border-r border-gray-100">
        <img
          src={LOGO_URL}
          alt="SeoGrow"
          className="h-16 w-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
        />
        <div className="mt-3 flex flex-1 items-center justify-center self-stretch">
          <img
            src={LOGIN_IMAGE_URL}
            alt="Panel Preview"
            className="max-h-[500px] w-full max-w-[520px] object-contain"
          />
        </div>
      </div>

      <div className="flex items-center justify-center px-8 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="lg:hidden">
              <img src={LOGO_URL} alt="SeoGrow" className="h-12 w-auto" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const { login, resetPassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/website')
    } catch {
      setError('Nieprawidłowe dane logowania')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: FormEvent) => {
    e.preventDefault()
    setResetError('')
    setResetLoading(true)

    try {
      await resetPassword(resetEmail || email)
      setResetSent(true)
    } catch {
      setResetError('Nie udało się wysłać linku resetującego. Sprawdź adres email.')
    } finally {
      setResetLoading(false)
    }
  }

  if (showReset) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#eef4fb_0%,#f8fbff_55%,#ffffff_100%)] px-6 py-10">
        <LoginShell
          title={resetSent ? 'Sprawdź swoją pocztę' : 'Reset hasła'}
          subtitle={
            resetSent
              ? 'Wysłaliśmy link do odzyskania dostępu do panelu.'
              : 'Podaj adres e-mail powiązany z kontem, a wyślemy link do ustawienia nowego hasła.'
          }
        >
          <div>
            <button
              onClick={() => {
                setShowReset(false)
                setResetSent(false)
                setResetError('')
              }}
              className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Wróć do logowania
            </button>

            {resetSent ? (
              <div className="space-y-5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <Mail size={20} />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  Link resetujący został wysłany na{' '}
                  <strong className="text-slate-900">{resetEmail || email}</strong>.
                </div>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-5">
                {resetError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {resetError}
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">E-mail</label>
                  <input
                    type="email"
                    value={resetEmail || email}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                    placeholder="nazwa@firma.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {resetLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      Wyślij link resetujący
                      <Mail size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </LoginShell>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#eef4fb_0%,#f8fbff_55%,#ffffff_100%)] px-6 py-10">
      <LoginShell
        title="Zaloguj się"
        subtitle="Zaloguj się do panelu SeoGrow, aby zarządzać stroną w prosty, uporządkowany i profesjonalny sposób."
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">E-mail</label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
              placeholder="nazwa@firma.com"
              required
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Hasło</label>
              <button
                type="button"
                onClick={() => setShowReset(true)}
                className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                Nie pamiętasz hasła?
              </button>
            </div>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pr-12 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                Zaloguj się
                <LogIn size={16} />
              </>
            )}
          </button>

          <div className="flex justify-end pt-1 text-sm">
            <a
              href="https://mail.zoho.eu/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 transition-colors hover:text-slate-900"
            >
              Poczta firmowa
            </a>
          </div>
        </form>
      </LoginShell>
    </div>
  )
}
