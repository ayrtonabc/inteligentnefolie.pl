'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { getTenantFilter } from '@/lib/pocketbase'

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.fullwork.pl'

export interface ConsentState {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

export interface CustomScript {
  id: string
  name: string
  category: 'analytics' | 'marketing'
  content: string
  isActive: boolean
}

export interface AnalyticsConfig {
  ga4_id?: string
  pixel_id?: string
  custom_scripts?: CustomScript[]
}

interface CookieConsentContextValue {
  consents: ConsentState
  analyticsConfig: AnalyticsConfig | null
  loading: boolean
  updateConsents: (consents: ConsentState) => void
  hasAnalyticsConsent: boolean
  hasMarketingConsent: boolean
}

const defaultConsents: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null)

function saveConsents(consents: ConsentState) {
  localStorage.setItem('cookie-consents', JSON.stringify(consents))
}

function loadConsents(): ConsentState | null {
  try {
    const saved = localStorage.getItem('cookie-consents')
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        necessary: true,
        analytics: !!parsed.analytics,
        marketing: !!parsed.marketing,
      }
    }
  } catch {
    return null
  }
  return null
}

function injectScript(content: string, id?: string) {
  try {
    if (document.querySelector(`script[data-cookie-script="${id}"]`)) {
      return
    }
    const script = document.createElement('script')
    script.innerHTML = content.replace(/<script[^>]*>|<\/script>/gi, '')
    if (id) script.setAttribute('data-cookie-script', id)
    document.head.appendChild(script)
  } catch (e) {
    console.error('Error injecting script:', e)
  }
}

function injectAnalyticsScripts(config: AnalyticsConfig, consents: ConsentState) {
  if (consents.analytics) {
    if (config.ga4_id) {
      injectScript(`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${config.ga4_id}');
      `, 'ga4')
    }

    if (config.custom_scripts) {
      config.custom_scripts
        .filter(s => s.isActive && s.category === 'analytics')
        .forEach(s => injectScript(s.content, s.id))
    }
  }

  if (consents.marketing) {
    if (config.pixel_id) {
      injectScript(`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${config.pixel_id}');
        fbq('track', 'PageView');
      `, 'fb-pixel')
    }

    if (config.custom_scripts) {
      config.custom_scripts
        .filter(s => s.isActive && s.category === 'marketing')
        .forEach(s => injectScript(s.content, s.id))
    }
  }
}

async function fetchAnalyticsConfig(): Promise<AnalyticsConfig | null> {
  try {
    const tenantFilter = getTenantFilter()
    const res = await fetch(
      `${PB_URL}/api/collections/site_settings/records?filter=${encodeURIComponent(tenantFilter)}`
    )
    
    if (!res.ok) return null
    
    const data = await res.json()
    if (!data.items || data.items.length === 0) return null

    let config: AnalyticsConfig = {}

    const mainConfig = data.items.find((r: any) => r.setting_key === 'main_config')
    if (mainConfig?.setting_value) {
      const val = mainConfig.setting_value
      if (val.analytics_id) config.ga4_id = val.analytics_id
      if (val.pixel_id) config.pixel_id = val.pixel_id
      if (val.custom_scripts) config.custom_scripts = val.custom_scripts
    }

    const analyticsRecord = data.items.find((r: any) => r.setting_key === 'analytics_id')
    if (analyticsRecord?.setting_value && !config.ga4_id) {
      config.ga4_id = analyticsRecord.setting_value
    }

    const pixelRecord = data.items.find((r: any) => r.setting_key === 'pixel_id')
    if (pixelRecord?.setting_value && !config.pixel_id) {
      config.pixel_id = pixelRecord.setting_value
    }

    return Object.keys(config).length > 0 ? config : null
  } catch (err) {
    console.error('Error fetching analytics config:', err)
    return null
  }
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consents, setConsents] = useState<ConsentState>(defaultConsents)
  const [analyticsConfig, setAnalyticsConfig] = useState<AnalyticsConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const init = async () => {
      const savedConsents = loadConsents()
      
      if (savedConsents) {
        setConsents(savedConsents)
      }

      const config = await fetchAnalyticsConfig()
      setAnalyticsConfig(config)

      if (savedConsents) {
        injectAnalyticsScripts(config || {}, savedConsents)
      }

      setLoading(false)
      setInitialized(true)
    }

    init()
  }, [])

  useEffect(() => {
    if (!initialized || loading) return
    injectAnalyticsScripts(analyticsConfig || {}, consents)
  }, [consents, analyticsConfig, initialized, loading])

  const updateConsents = useCallback((newConsents: ConsentState) => {
    setConsents(newConsents)
    saveConsents(newConsents)
  }, [])

  const value: CookieConsentContextValue = {
    consents,
    analyticsConfig,
    loading,
    updateConsents,
    hasAnalyticsConsent: consents.analytics,
    hasMarketingConsent: consents.marketing,
  }

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext)
  if (!context) {
    throw new Error('useCookieConsent must be used within CookieConsentProvider')
  }
  return context
}

export function useHasConsent(category: 'analytics' | 'marketing'): boolean {
  const { consents } = useCookieConsent()
  return consents[category]
}
