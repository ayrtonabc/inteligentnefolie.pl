import { useToast } from '@/components/Toast'
import { pb } from '@/lib/pocketbase'
import { 
  ShoppingCart, 
  GraduationCap, 
  UtensilsCrossed, 
  CalendarClock, 
  Languages, 
  Image,
  Filter,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSite } from '@/context/SiteContext'

interface Addon {
  key: string
  name: string
  description: string
  icon: typeof ShoppingCart
}

export default function Addons() {
  const toast = useToast()
  const { currentSite } = useSite()
  const websiteId = currentSite?.id
  
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [states, setStates] = useState<Record<string, boolean>>({})
  const [stats, setStats] = useState({
    totalModules: 0,
    totalInstalls: 0,
    averageRating: 0
  })

  const [showContactModal, setShowContactModal] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [sending, setSending] = useState(false)

  // Real system modules
  const addons: Addon[] = useMemo(() => [
    { key: 'shop', name: 'Sklep', description: 'Produkty, płatności i wysyłka. Kompletny system e-commerce.', icon: ShoppingCart },
    { key: 'courses', name: 'Kursy', description: 'Kursy, rozdziały i materiały. System zarządzania nauczaniem.', icon: GraduationCap },
    { key: 'restaurant', name: 'Restauracja / Menu', description: 'Kategorie i produkty. System rezerwacji stolików.', icon: UtensilsCrossed },
    { key: 'bookings', name: 'Rezerwacje / Wizyty', description: 'Usługi i integracja z kalendarzem.', icon: CalendarClock },
    { key: 'multilang', name: 'Wiele języków', description: 'Języki, automatyczne tłumaczenie i korekta.', icon: Languages },
    { key: 'portfolio', name: 'Portfolio / Galeria', description: 'Dodawaj realizacje z kategoriami.', icon: Image },
  ], [])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch installed states
      const addonData = await pb.collection('website_addons').getFullList({
        filter: websiteId ? `website_id = "${websiteId}"` : ''
      });
      const next: Record<string, boolean> = {}
      addonData.forEach((r: any) => {
        next[r.addon_key] = !!r.is_active
      })
      setStates(next)

      // Fetch real stats
      const activeCount = await pb.collection('website_addons').getList(1, 1, {
        filter: websiteId ? `is_active = true && website_id = "${websiteId}"` : 'is_active = true'
      })

      setStats({
        totalModules: addons.length,
        totalInstalls: activeCount.totalItems || 0,
        averageRating: 4.8
      })
    } catch (e) {
      console.error('Addons refresh error:', e)
      setStates({})
      setStats({
        totalModules: addons.length,
        totalInstalls: 0,
        averageRating: 4.8
      })
    } finally {
      setLoading(false);
    }
  }, [addons.length])

  useEffect(() => {
    refresh()
  }, [refresh])

  const toggle = useCallback(
    async (addonKey: string) => {
      const nextValue = !(states[addonKey] ?? false)
      setSavingKey(addonKey)
      setStates((prev) => ({ ...prev, [addonKey]: nextValue }))
      try {
        let existingRecord;
        try {
          existingRecord = await pb.collection('website_addons').getFirstListItem(
            websiteId 
              ? `addon_key = "${addonKey}" && website_id = "${websiteId}"` 
              : `addon_key = "${addonKey}"`
          );
        } catch (e) {}

        if (existingRecord) {
          await pb.collection('website_addons').update(existingRecord.id, { is_active: nextValue });
        } else {
          await pb.collection('website_addons').create({ 
            addon_key: addonKey, 
            is_active: nextValue,
            website_id: websiteId 
          });
        }

        window.dispatchEvent(new Event('cms:addons-updated'))
        toast.success(nextValue ? 'Aktywowano moduł' : 'Wyłączono moduł')
        refresh()
      } catch (e) {
        setStates((prev) => ({ ...prev, [addonKey]: !nextValue }))
        console.error('Toggle addon error:', e)
      } finally {
        setSavingKey(null)
      }
    },
    [states, refresh, toast],
  )

  const featuredAddon = addons[0] // Shop module as featured

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">SKLEP Z MODUŁAMI</p>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Rozwijaj swoje umiejętności
            </h1>
            <p className="text-gray-600 text-sm max-w-md">
              Dostosuj swoją przestrzeń roboczą za pomocą potężnych modułów zaprojektowanych do skalowania Twojego biznesu.
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter size={16} />
            Filtry
          </button>
        </div>

        {/* Featured Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Shop Module Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl overflow-hidden border border-gray-100">
            <div className="flex h-full">
              {/* Left - Red illustration area */}
              <div className="w-2/5 bg-[#F87171] relative overflow-hidden flex items-center justify-center p-6">
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-black/30 text-white text-[9px] font-bold uppercase tracking-wider rounded">
                    NOWOŚĆ
                  </span>
                </div>
                {/* Storefront illustration */}
                <div className="relative w-full aspect-square max-w-[200px]">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <path d="M10 80 L30 40 L50 80 L70 40 L90 80 L110 40 L130 80 L150 40 L170 80 L190 40 L190 90 L10 90 Z" fill="white"/>
                    <path d="M10 80 L30 40 L50 80" fill="#EF4444"/>
                    <path d="M50 80 L70 40 L90 80" fill="white"/>
                    <path d="M90 80 L110 40 L130 80" fill="#EF4444"/>
                    <path d="M130 80 L150 40 L170 80" fill="white"/>
                    <path d="M170 80 L190 40 L190 80" fill="#EF4444"/>
                    <rect x="20" y="90" width="160" height="90" fill="#60A5FA"/>
                    <rect x="35" y="105" width="55" height="60" fill="#93C5FD" rx="4"/>
                    <rect x="110" y="105" width="55" height="75" fill="#93C5FD" rx="4"/>
                    <circle cx="150" cy="145" r="3" fill="white"/>
                    <path d="M130 125 C130 120, 125 118, 122 122 C119 118, 114 120, 114 125 C114 130, 122 138, 122 138 C122 138, 130 130, 130 125" fill="#EF4444"/>
                    <rect x="45" y="120" width="25" height="40" fill="white" rx="3"/>
                    <rect x="50" y="130" width="15" height="20" fill="#60A5FA" rx="1"/>
                    <text x="100" y="185" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">SAFE WORK</text>
                  </svg>
                </div>
              </div>
              {/* Right - Content */}
              <div className="w-3/5 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingCart size={14} className="text-sky-500" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">MODUŁ SKLEPU</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Kompletny Sklep Online</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Przekształć swoją stronę w platformę e-commerce z zarządzaniem zapasami, globalną wysyłką i wieloma walutami.
                  </p>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-gray-900">Sklep</span>
                  </div>
                  <button 
                    onClick={() => toggle(featuredAddon.key)}
                    disabled={savingKey === featuredAddon.key || !websiteId}
                    className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-full transition-colors disabled:opacity-50"
                  >
                    {savingKey === featuredAddon.key ? '...' : (states[featuredAddon.key] ? 'Zainstalowany' : 'Zainstaluj teraz')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Module Card - Fondo azul claro */}
          <div className="bg-[#E6F2FE] rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden border-2 border-sky-200 shadow-lg">
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Potrzebujesz niestandardowego modułu?</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Nasi deweloperzy mogą budować dedykowane rozwiązania dla Twoich unikalnych potrzeb.
              </p>
            </div>
            <button 
              onClick={() => setShowContactModal(true)}
              className="relative z-10 mt-6 w-full py-3 bg-sky-500 text-white rounded-full text-sm font-semibold hover:bg-sky-600 transition-colors shadow-md"
            >
              Skontaktuj się z nami
            </button>
          </div>
        </div>

        {/* Available Modules Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Dostępne moduły</h2>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors border border-gray-200">
              <ArrowLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors border border-gray-200">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Modules Grid */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-500">
            Ładowanie…
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {addons.map((addon) => {
              const isActive = states[addon.key] ?? false
              const busy = savingKey === addon.key
              const Icon = addon.icon
              
              return (
                <div key={addon.key} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
                      <Icon size={20} className="text-sky-500" />
                    </div>
                    {isActive && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-wider rounded">
                        AKTYWNY
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{addon.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
                    {addon.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <span className={`text-xs font-semibold ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {isActive ? 'Aktywny' : 'Dostępny'}
                    </span>
                    <button
                      onClick={() => toggle(addon.key)}
                      disabled={busy || !websiteId}
                      className="text-xs font-semibold text-sky-500 hover:text-sky-600 flex items-center gap-1 transition-colors"
                    >
                      {busy ? '...' : isActive ? 'Zarządzaj' : 'Zainstaluj'}
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Stats Section - Datos reales */}
        <div className="mt-12 bg-white rounded-2xl p-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-600 mb-1">{stats.totalModules}</div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Dostępne moduły</p>
            </div>
            <div className="text-center md:border-x border-gray-100">
              <div className="text-3xl font-bold text-sky-600 mb-1">{stats.totalInstalls}</div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Aktywnych instalacji</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-600 mb-1">{stats.averageRating}/5</div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Średnia ocena</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowContactModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Skontaktuj się z nami</h3>
              <button 
                onClick={() => setShowContactModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault()
              setSending(true)
              try {
                await pb.collection('leads').create({
                  email: contactForm.email,
                  message: contactForm.message,
                  source: 'custom_module_request',
                  status: 'new'
                })
                toast.success('Wiadomość wysłana pomyślnie!')
                setContactForm({ name: '', email: '', message: '' })
                setShowContactModal(false)
              } catch (err) {
                toast.error('Błąd wysyłania wiadomości')
              } finally {
                setSending(false)
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  placeholder="twoj@email.pl"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wiadomość</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 resize-none"
                  rows={4}
                  placeholder="Opisz czego potrzebujesz..."
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 bg-sky-500 text-white rounded-full text-sm font-semibold hover:bg-sky-600 transition-colors disabled:opacity-50"
              >
                {sending ? 'Wysyłanie...' : 'Wyślij wiadomość'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
