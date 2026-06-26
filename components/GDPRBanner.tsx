'use client'

import { useState, useEffect } from 'react'
import { Cookie, X, ShieldCheck } from 'lucide-react'
import { TENANT_ID } from '@/lib/config'

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.fullwork.pl'

interface CookieSettings {
  isEnabled: boolean
  bannerText: string
  bannerPosition: 'bottom' | 'top'
  theme: 'light' | 'dark'
  privacyPolicy: string
  categories: {
    necessary: { enabled: boolean; label: string; description: string }
    analytics: { enabled: boolean; label: string; description: string }
    marketing: { enabled: boolean; label: string; description: string }
  }
  scripts?: Array<{
    id: string
    name: string
    category: string
    content: string
    isActive: boolean
  }>
}

const DEFAULT_SETTINGS: CookieSettings = {
  isEnabled: true,
  bannerText: 'Ta strona używa plików cookie, aby zapewnić najlepsze doświadczenie. Wybierz, które kategorie plików cookie chcesz zaakceptować.',
  bannerPosition: 'bottom',
  theme: 'light',
  privacyPolicy: '/polityka-prywatnosci',
  categories: {
    necessary: { 
      enabled: true, 
      label: 'Niezbędne', 
      description: 'Wymagane do prawidłowego działania strony.' 
    },
    analytics: { 
      enabled: false, 
      label: 'Analityczne', 
      description: 'Pomagają nam zrozumieć, jak użytkownicy korzystają ze strony.' 
    },
    marketing: { 
      enabled: false, 
      label: 'Marketingowe', 
      description: 'Używane do personalizacji reklam.' 
    }
  }
}

async function fetchGDPRSettings(): Promise<CookieSettings | null> {
  try {
    const res = await fetch(
      `${PB_URL}/api/collections/site_settings/records?filter=(website_id="${TENANT_ID}")`
    )
    
    if (!res.ok) return null
    
    const data = await res.json()
    if (!data.items || data.items.length === 0) return null

    let gdpr: CookieSettings | null = null

    const mainConfig = data.items.find((r: any) => r.setting_key === 'main_config')
    if (mainConfig?.setting_value?.gdpr_settings?.isEnabled) {
      gdpr = mainConfig.setting_value.gdpr_settings
    }

    if (!gdpr) {
      const legacyRecord = data.items.find((r: any) => r.setting_key === 'gdpr_settings')
      if (legacyRecord?.setting_value) {
        gdpr = legacyRecord.setting_value
      }
    }

    return gdpr
  } catch (err) {
    console.error('Error fetching GDPR settings:', err)
    return null
  }
}

export default function GDPRBanner() {
  const [settings, setSettings] = useState<CookieSettings | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [loading, setLoading] = useState(true)
  const [consents, setConsents] = useState({
    necessary: true,
    analytics: false,
    marketing: false
  })

  useEffect(() => {
    const init = async () => {
      // Check if already consented
      const savedConsents = localStorage.getItem('cookie-consents')
      if (savedConsents) {
        try {
          const parsed = JSON.parse(savedConsents)
          setConsents(parsed)
        } catch {
          // Invalid data, show banner
        }
      }

      // Fetch GDPR settings
      const gdpr = await fetchGDPRSettings()
      setLoading(false)

      if (gdpr && gdpr.isEnabled) {
        setSettings(gdpr)
        // Show banner if no saved consent OR if gdpr is enabled (force show)
        if (!savedConsents) {
          setIsVisible(true)
        }
      } else if (!savedConsents) {
        // Use default settings if nothing configured
        setSettings(DEFAULT_SETTINGS)
        setIsVisible(true)
      }
    }

    init()
  }, [])

  const injectScripts = (gdpr: CookieSettings, acceptedConsents: Record<string, boolean>) => {
    if (!gdpr.scripts) return
    
    gdpr.scripts.forEach((script: any) => {
      if (script.isActive && acceptedConsents[script.category]) {
        try {
          const s = document.createElement('script')
          s.innerHTML = script.content.replace(/<script.*?>|<\/script>/gi, '')
          document.head.appendChild(s)
        } catch (e) {
          console.error('Error injecting script:', script.name, e)
        }
      }
    })
  }

  const handleAcceptAll = () => {
    const allConsents = {
      necessary: true,
      analytics: true,
      marketing: true
    }
    saveConsents(allConsents)
  }

  const handleSavePreferences = () => {
    saveConsents(consents)
  }

  const saveConsents = (newConsents: Record<string, boolean>) => {
    localStorage.setItem('cookie-consents', JSON.stringify(newConsents))
    setIsVisible(false)
    if (settings) injectScripts(settings, newConsents)
  }

  // Don't render if loading or not visible
  if (loading || !isVisible) return null

  const currentSettings = settings || DEFAULT_SETTINGS
  const isDark = currentSettings.theme === 'dark'
  const isTop = currentSettings.bannerPosition === 'top'

  return (
    <div className={`fixed left-0 right-0 z-[10000] p-4 ${isTop ? 'top-0' : 'bottom-0'}`}>
      <div className={`max-w-4xl mx-auto rounded-2xl shadow-2xl border overflow-hidden ${
        isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
      }`}>
        
        {!showDetails ? (
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
            <div className={`w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center ${
              isDark ? 'bg-sky-900/50 text-sky-400' : 'bg-sky-50 text-sky-600'
            }`}>
              <Cookie size={32} />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold mb-1">Polityka prywatności i cookies</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentSettings.bannerText}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <button 
                onClick={handleAcceptAll}
                className="w-full sm:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Akceptuję wszystkie
              </button>
              <button 
                onClick={() => setShowDetails(true)}
                className={`w-full sm:w-auto px-6 py-3 font-semibold rounded-xl transition-colors ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Ustawienia
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-sky-500" size={24} />
                <h3 className="font-bold text-lg">Ustawienia prywatności</h3>
              </div>
              <button onClick={() => setShowDetails(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {Object.entries(currentSettings.categories).map(([key, cat]: [string, any]) => {
                if (!cat.enabled && key !== 'necessary') return null
                
                return (
                  <div key={key} className={`p-4 rounded-xl border ${
                    consents[key as keyof typeof consents] 
                      ? (isDark ? 'bg-sky-900/20 border-sky-800' : 'bg-sky-50 border-sky-100')
                      : (isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-100')
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{cat.label}</span>
                        {key === 'necessary' && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full">Wymagane</span>
                        )}
                      </div>
                      <button
                        disabled={key === 'necessary'}
                        onClick={() => setConsents(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          consents[key as keyof typeof consents] ? 'bg-sky-600' : 'bg-gray-300'
                        } ${key === 'necessary' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          consents[key as keyof typeof consents] ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{cat.description}</p>
                  </div>
                )
              })}
            </div>
            
            <div className="p-6 border-t border-gray-100 flex items-center justify-between gap-4">
              <button 
                onClick={() => setShowDetails(false)}
                className="text-sm font-medium hover:underline"
              >
                Wróć
              </button>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleSavePreferences}
                  className={`px-6 py-2.5 font-bold rounded-xl border ${
                    isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Zapisz wybrane
                </button>
                <button 
                  onClick={handleAcceptAll}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl"
                >
                  Akceptuj wszystkie
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}