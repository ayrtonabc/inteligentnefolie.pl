import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { pb, setCurrentTenant, initTenantFromStorage, DEFAULT_TENANT_ID } from '@/lib/pocketbase'
import { useAuth } from './AuthContext'

export interface Website {
  id: string
  name: string
  domain?: string
  website_url?: string
  status: 'active' | 'draft' | 'maintenance'
  plan: 'free' | 'starter' | 'pro' | 'enterprise'
  created: string
  updated: string
}

interface SiteContextValue {
  websites: Website[]
  currentSite: Website | null
  loading: boolean
  selectSite: (siteId: string) => void
  refreshSites: () => Promise<void>
}

const SiteContext = createContext<SiteContextValue | null>(null)

export function SiteProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [websites, setWebsites] = useState<Website[]>([])
  const [currentSite, setCurrentSite] = useState<Website | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSites = useCallback(async () => {
    initTenantFromStorage()
    
    if (!user?.id) {
      setWebsites([])
      setCurrentSite(null)
      setLoading(false)
      return
    }

    try {
      const sites = await pb.collection('tenants').getFullList<any>({})
      console.log('[SiteContext] Sites from PocketBase:', sites)

      const mappedSites: Website[] = sites.map(s => {
        const domain = s.dominio || s.domain || '';
        const displayName = domain 
          ? domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
          : `Site ${s.id.substring(0, 8)}`;
        
        const rawStatus = Array.isArray(s.status) ? s.status[0] : s.status
        const rawPlan = Array.isArray(s.plan) ? s.plan[0] : s.plan
        
        const status: Website['status'] = (rawStatus === 'active' || rawStatus === 'Active') 
          ? 'active' 
          : (rawStatus === 'maintenance' || rawStatus === 'Maintenance') 
            ? 'maintenance' 
            : 'draft'
        
        const plan: Website['plan'] = (rawPlan === 'free' || rawPlan === 'starter' || rawPlan === 'pro' || rawPlan === 'enterprise')
          ? rawPlan as Website['plan']
          : 'pro'
        
        return {
          id: s.id,
          name: displayName,
          domain: domain,
          website_url: s.website_url || s.domain || '',
          status,
          plan,
          created: s.created,
          updated: s.updated,
        }
      })

      setWebsites(mappedSites)

      const savedSiteId = localStorage.getItem('cms_current_site')
      const savedSite = mappedSites.find(s => s.id === savedSiteId)
      const activeTenantId = localStorage.getItem('cms_active_tenant_id')
      const activeTenantSite = mappedSites.find(s => s.id === activeTenantId)
      
      if (savedSite) {
        setCurrentSite(savedSite)
        setCurrentTenant(savedSite.id)
      } else if (activeTenantSite) {
        setCurrentSite(activeTenantSite)
        setCurrentTenant(activeTenantSite.id)
      } else if (mappedSites.length > 0) {
        setCurrentSite(mappedSites[0])
        setCurrentTenant(mappedSites[0].id)
        localStorage.setItem('cms_current_site', mappedSites[0].id)
      } else {
        const defaultSite: Website = {
          id: DEFAULT_TENANT_ID,
          name: 'Inteligentne Folie',
          domain: 'inteligentnefolie.pl',
          website_url: 'https://www.inteligentnefolie.pl',
          status: 'active',
          plan: 'pro',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        }
        setWebsites([defaultSite])
        setCurrentSite(defaultSite)
        setCurrentTenant(defaultSite.id)
      }
    } catch (error) {
      console.error('Error fetching sites from PocketBase, using fail-safe:', error)
      
      const defaultSite: Website = {
        id: DEFAULT_TENANT_ID,
        name: 'Inteligentne Folie',
        domain: 'inteligentnefolie.pl',
        website_url: 'https://www.inteligentnefolie.pl',
        status: 'active',
        plan: 'pro',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      }
      
      setWebsites([defaultSite])
      setCurrentSite(defaultSite)
      setCurrentTenant(defaultSite.id)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchSites()
  }, [fetchSites])

  const selectSite = useCallback((siteId: string) => {
    const site = websites.find(s => s.id === siteId)
    if (site) {
      setCurrentSite(site)
      setCurrentTenant(site.id)
      localStorage.setItem('cms_current_site', site.id)
      window.location.reload()
    }
  }, [websites])

  const refreshSites = useCallback(async () => {
    await fetchSites()
  }, [fetchSites])

  return (
    <SiteContext.Provider value={{ websites, currentSite, loading, selectSite, refreshSites }}>
      {children}
    </SiteContext.Provider>
  )
}

export function useSite() {
  const ctx = useContext(SiteContext)
  if (!ctx) throw new Error('useSite must be used within SiteProvider')
  return ctx
}
