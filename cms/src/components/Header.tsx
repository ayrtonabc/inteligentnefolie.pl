import { useState, useEffect, useCallback } from 'react'
import { Search, Bell, Globe, ChevronDown, ChevronRight, FileText, Users, Clock, ChevronUp, CheckCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useSite } from '@/context/SiteContext'
import { useNavigate } from 'react-router-dom'
import { pb } from '@/lib/pocketbase'

interface NotificationItem {
  id: string
  type: 'lead' | 'draft' | 'page'
  title: string
  description: string
  time: string
  href: string
}

export default function Header() {
  const { user, logout } = useAuth()
  const { websites, currentSite, selectSite } = useSite()
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showSiteSwitcher, setShowSiteSwitcher] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role?: string } | null>(null)
  
  const fetchUserProfile = useCallback(async () => {
    const model = pb.authStore.model
    if (!model) return
    setCurrentUser({
      name: model.name || model.email || 'Użytkownik',
      email: model.email || '',
      role: model.role || 'editor',
    })
  }, [])

  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile])

  // Fetch real notification counts
  const fetchNotifications = useCallback(async () => {
    if (!currentSite?.id) return
    const items: NotificationItem[] = []

    try {
      // New leads from PocketBase
      const leads = await pb.collection('leads').getFullList({
        filter: `website_id = "${currentSite.id}" && status = "new"`,
        requestKey: null,
        $autoCancel: false,
      }).catch(() => [])

      leads.slice(0, 5).forEach(l => {
        const ago = timeAgo(l.created)
        items.push({
          id: `lead-${l.id}`,
          type: 'lead',
          title: `Nowy lead: ${l.name || l.email || 'Anonim'}`,
          description: `Otrzymano ${ago}`,
          time: ago,
          href: '/leads'
        })
      })
    } catch { /* ignore */ }

    try {
      // Draft blog posts from PocketBase
      const drafts = await pb.collection('blog_posts').getFullList({
        filter: `website_id = "${currentSite.id}" && status = "draft"`,
        requestKey: null,
        $autoCancel: false,
      }).catch(() => [])

      drafts.slice(0, 3).forEach(d => {
        items.push({
          id: `draft-${d.id}`,
          type: 'draft',
          title: `Szkic: ${d.title || 'Bez tytułu'}`,
          description: `Utworzono ${timeAgo(d.created)}`,
          time: timeAgo(d.created),
          href: `/blog/${d.id}`
        })
      })
    } catch { /* ignore */ }

    setNotifications(items)
  }, [currentSite?.id])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const notificationCount = notifications.length

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'przed chwilą'
    if (mins < 60) return `${mins} min temu`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} godz. temu`
    const days = Math.floor(hrs / 24)
    return `${days} dni temu`
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-700'
      case 'pro': return 'bg-blue-100 text-blue-700'
      case 'starter': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'maintenance': return 'bg-amber-500'
      default: return 'bg-gray-400'
    }
  }

  const userName = currentUser?.name || user?.name || 'Użytkownik'
  const userRole = currentUser?.role || 'Redaktor naczelny'
  const isSingleSite = websites.length <= 1

  return (
    <header className="bg-white px-6 py-3 sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 gap-4">
      {/* Site Switcher */}
      <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {isSingleSite ? (
          currentSite?.website_url ? (
            <a
              href={currentSite.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors min-w-[240px] cursor-pointer"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                <Globe size={16} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {currentSite.name}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(currentSite?.status || 'draft')}`} />
                  <span className="text-xs text-gray-500 capitalize">{currentSite?.status || '-'}</span>
                  {currentSite?.plan && (
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getPlanBadgeColor(currentSite.plan)}`}>
                      {currentSite.plan}
                    </span>
                  )}
                </div>
              </div>
            </a>
          ) : (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl min-w-[240px]">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                <Globe size={16} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {currentSite?.name || 'Wybierz stronę'}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(currentSite?.status || 'draft')}`} />
                  <span className="text-xs text-gray-500 capitalize">{currentSite?.status || '-'}</span>
                  {currentSite?.plan && (
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getPlanBadgeColor(currentSite.plan)}`}>
                      {currentSite.plan}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        ) : (
          <button
            onClick={() => setShowSiteSwitcher(!showSiteSwitcher)}
            className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors min-w-[240px]"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
              <Globe size={16} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {currentSite?.name || 'Wybierz stronę'}
              </p>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(currentSite?.status || 'draft')}`} />
                <span className="text-xs text-gray-500 capitalize">{currentSite?.status || '-'}</span>
                {currentSite?.plan && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getPlanBadgeColor(currentSite.plan)}`}>
                    {currentSite.plan}
                  </span>
                )}
              </div>
            </div>
            <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
          </button>
        )}

        {showSiteSwitcher && websites.length > 0 && (
          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Wybierz stronę</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {websites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => {
                    selectSite(site.id)
                    setShowSiteSwitcher(false)
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                    currentSite?.id === site.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe size={18} className="text-gray-600" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{site.name}</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(site.status)}`} />
                      <span className="text-xs text-gray-500 capitalize">{site.status}</span>
                      {site.domain && (
                        <span className="text-xs text-gray-400 truncate">{site.domain}</span>
                      )}
                    </div>
                  </div>
                  {currentSite?.id === site.id && (
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Szukaj stron, mediów lub wpisów..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                navigate(`/pages?q=${encodeURIComponent(searchQuery.trim())}`)
              }
            }}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-900">Powiadomienia</p>
                  <span className="text-xs text-gray-500">{notificationCount} nowych</span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      <Bell size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Brak powiadomień</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {notifications.map((n) => {
                        const icons: Record<string, typeof FileText> = {
                          lead: Users,
                          draft: FileText,
                          page: Clock
                        }
                        const colors: Record<string, string> = {
                          lead: 'bg-blue-100 text-blue-600',
                          draft: 'bg-amber-100 text-amber-600',
                          page: 'bg-gray-100 text-gray-600'
                        }
                        const Icon = icons[n.type] || FileText
                        return (
                          <button
                            key={n.id}
                            onClick={() => {
                              setShowNotifications(false)
                              navigate(n.href)
                            }}
                            className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[n.type]}`}>
                              <Icon size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{n.description}</p>
                            </div>
                            <ChevronRight size={14} className="text-gray-300 flex-shrink-0 mt-1" />
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Help */}
        <button
          onClick={() => navigate('/docs')}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
          title="Dokumentacja systemu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* User Profile */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 pl-2 pr-1 py-1.5 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-semibold text-gray-900">{userName}</span>
              <span className="text-xs text-gray-500">{userRole}</span>
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {userName.charAt(0).toUpperCase()}
            </div>
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                  <p className="text-sm font-bold text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-600 mt-1">{user?.email}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{userRole}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      navigate('/settings')
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors text-left"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Ustawienia
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      navigate('/settings')
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors text-left"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Dokumentacja
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={async () => {
                      setShowProfileMenu(false)
                      await logout()
                      navigate('/login')
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Wyloguj się
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
