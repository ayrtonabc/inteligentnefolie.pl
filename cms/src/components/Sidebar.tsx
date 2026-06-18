import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Image,
  Globe,
  Settings,
  Bell,
  BookOpen,
  Mail,
  Puzzle,
  Store,
  Menu,
  X,
  Bug,
  ShoppingCart,
  GraduationCap,
  UtensilsCrossed,
  CalendarClock,
  Languages,
  Brain,
  Users,
  BarChart3,
  ClipboardList
} from 'lucide-react'
import { pb } from '@/lib/pocketbase'
import { useSite } from '@/context/SiteContext'
import { useAuth } from '@/context/AuthContext'
import { hasPermission } from '@/lib/roles'
import logo from '/logo.webp'

const iconMap: Record<string, typeof LayoutDashboard> = {
  shop: ShoppingCart,
  courses: GraduationCap,
  restaurant: UtensilsCrossed,
  bookings: CalendarClock,
  multilang: Languages,
  portfolio: Image,
  blog: BookOpen,
  leads: Mail,
  popups: Bell,
  addons: Puzzle,
  pages: FileText,
  media: Image,
  seo: Globe,
  website: LayoutDashboard,
  settings: Settings,
  appstore: Store
}

interface NavItem {
  path: string
  label: string
  icon: typeof LayoutDashboard
}

const mainNavItems: NavItem[] = [
  { path: '/website', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/pages', label: 'Podstrony', icon: FileText },
  { path: '/media', label: 'Media', icon: Image },
  { path: '/seo', label: 'SEO', icon: Globe },
  { path: '/popups', label: 'Pop-upy', icon: Bell },
  { path: '/blog', label: 'Blog', icon: BookOpen },
  { path: '/leads', label: 'Kontakty', icon: Mail },
]

const bottomNavItems: NavItem[] = [
  { path: '/addons', label: 'App Store', icon: Store },
  { path: '/settings', label: 'Ustawienia', icon: Settings },
]

export default function Sidebar() {
  const location = useLocation()
  const { currentSite } = useSite()
  const { user, permissions } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [leadsCount, setLeadsCount] = useState(0)
  const [activeModules, setActiveModules] = useState<NavItem[]>([])

  const isStaff = user?.role === 'staff'

  const filteredMainNavItems = mainNavItems.filter(item => {
    if (isStaff) {
      return item.path === '/website'
    }
    return true
  })

  const staffRestaurantItems: NavItem[] = [
    { path: '/restaurant', label: 'Zamówienia', icon: ClipboardList },
  ]

  const filteredBottomNavItems = bottomNavItems.filter(item => {
    if (isStaff) {
      return false
    }
    return true
  })

  // Fetch leads count
  useEffect(() => {
    const fetchLeadsCount = async () => {
      if (!currentSite?.id) return
      try {
        const records = await pb.collection('leads').getList(1, 1, {
          filter: `website_id = "${currentSite.id}" && status = "new"`,
          $autoCancel: false,
        })
        setLeadsCount(records.totalItems)
      } catch (err) {
        console.warn('Sidebar: could not fetch leads count:', err)
      }
    }
    fetchLeadsCount()
    const interval = setInterval(fetchLeadsCount, 30000)
    return () => clearInterval(interval)
  }, [currentSite?.id])

  // Fetch active modules
  useEffect(() => {
    if (!currentSite?.id) return

    const fetchActiveModules = async () => {
      try {
        const records = await pb.collection('website_addons').getFullList({
          filter: `website_id = "${currentSite.id}" && is_active = true`,
          $autoCancel: false,
        })

        const moduleLabels: Record<string, string> = {
          bookings: 'Rezerwacje',
          courses: 'Kursy',
          multilang: 'Wielojęzyczność',
          portfolio: 'Portfolio',
          restaurant: 'Restauracja',
          shop: 'Sklep'
        }

        const modules = records
          .filter((m) => moduleLabels[m.addon_key])
          .map((m) => ({
            path: `/${m.addon_key}`,
            label: moduleLabels[m.addon_key],
            icon: iconMap[m.addon_key] || Puzzle
          }))

        setActiveModules(modules)
      } catch (err) {
        console.error('Sidebar: Error fetching active modules:', err)
      }
    }
    fetchActiveModules()

    const handleModuleUpdate = () => fetchActiveModules()
    window.addEventListener('cms:addons-updated', handleModuleUpdate)
    return () => window.removeEventListener('cms:addons-updated', handleModuleUpdate)
  }, [currentSite?.id])

  const renderNavItem = (item: NavItem, isModule = false) => {
    const Icon = item.icon
    const isVisualCmsActive = item.path === '/pages' && location.pathname.startsWith('/visual-cms/')
    const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`) || isVisualCmsActive
    const hasBadge = item.path === '/leads' && leadsCount > 0

    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={() => setIsOpen(false)}
        className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all relative ${isActive
          ? 'bg-blue-50 text-blue-700'
          : item.path === '/addons' ? 'bg-indigo-50/30 text-indigo-600 hover:bg-indigo-50' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          }`}
      >
        {isActive && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-l-full" />
        )}
        <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
        <span className="flex-1">{item.label}</span>
        {hasBadge && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {leadsCount}
          </span>
        )}
      </NavLink>
    )
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } flex flex-col h-screen overflow-hidden`}
      >
        {/* Logo */}
        <div className="p-6">
          <img src="/logoseogrow.webp" alt="SeoGrow" className="h-8 w-auto" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
          {filteredMainNavItems.map(item => renderNavItem(item))}

          {/* Active Modules Section */}
          {isStaff ? (
            <div className="mt-6 pt-2">
              <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Restauracja
              </p>
              {staffRestaurantItems.map(item => renderNavItem(item, true))}
            </div>
          ) : (
            <div className="mt-6 pt-2">
              <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Moduły
              </p>
              {activeModules.length > 0 ? (
                activeModules.map(item => renderNavItem(item, true))
              ) : (
                <p className="px-4 py-2 text-[10px] text-gray-400 italic">Brak aktywnych modułów</p>
              )}
            </div>
          )}

          {/* Bottom Nav */}
          <div className="mt-6 pt-4 border-t border-gray-50">
            {filteredBottomNavItems.map(item => renderNavItem(item))}
          </div>
        </nav>

        {/* Support Ticket Card */}
        <div className="p-4">
          <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl p-4 border border-rose-100">
            <div className="flex items-center gap-2 mb-1">
              <Bug size={14} className="text-rose-500" />
              <span className="text-xs font-bold text-gray-900">Zgłoś problem</span>
            </div>
            <p className="text-[10px] text-gray-500 mb-3 leading-tight">
              Znalazłeś błąd? Nasz zespół pomoże Ci go rozwiązać.
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-ticket-modal'))}
              className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold rounded-xl transition-colors shadow-sm shadow-rose-200"
            >
              Utwórz zgłoszenie
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
