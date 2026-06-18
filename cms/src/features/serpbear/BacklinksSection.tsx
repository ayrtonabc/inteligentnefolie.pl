'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Link2, ExternalLink, Shield, AlertCircle, CheckCircle, 
  Clock, Package, TrendingUp, Globe, Loader2, Info,
  ChevronDown, ShoppingCart, ArrowUpRight
} from 'lucide-react'
import { useSerpBearContext } from './Context'

interface Backlink {
  source_url: string
  domain_authority: number
  anchor_text: string
  link_type: string
  is_nofollow: boolean
  first_seen_at: string
  last_seen_at: string
}

interface BacklinkStats {
  total_backlinks: number
  unique_domains: number
  dofollow_count: number
  nofollow_count: number
  avg_domain_authority: number
  high_quality_count: number
  new_backlinks_30d: number
  lost_backlinks_30d: number
}

interface BacklinkPackage {
  id: string
  name: string
  code: string
  description: string
  basic_price_pln: number
  standard_price_pln: number
  premium_price_pln: number
  basic_features: string[]
  standard_features: string[]
  premium_features: string[]
  basic_delivery_days: number
  standard_delivery_days: number
  premium_delivery_days: number
}

interface BacklinkOrder {
  id: string
  package_name: string
  package_type: string
  target_url: string
  keywords: string[]
  total_price_pln: number
  delivery_days: number
  rush_delivery: boolean
  status: string
  ordered_at: string
  estimated_delivery: string
  completed_at: string | null
}

export default function BacklinksSection() {
  const { websiteId } = useSerpBearContext()
  const [backlinks, setBacklinks] = useState<Backlink[]>([])
  const [stats, setStats] = useState<BacklinkStats | null>(null)
  const [packages, setPackages] = useState<BacklinkPackage[]>([])
  const [orders, setOrders] = useState<BacklinkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [showEducation, setShowEducation] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [selectedTier, setSelectedTier] = useState<'basic' | 'standard' | 'premium'>('standard')
  const [targetUrl, setTargetUrl] = useState('')
  const [keywords, setKeywords] = useState('')
  const [rushDelivery, setRushDelivery] = useState(false)
  const [ordering, setOrdering] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  const fetchData = useCallback(async () => {
    if (!websiteId) return
    setLoading(true)
    try {
      const [backlinksRes, statsRes, packagesRes, ordersRes] = await Promise.all([
        fetch(`/api/serpbear/backlinks?websiteId=${websiteId}`),
        fetch(`/api/serpbear/backlinks/stats?websiteId=${websiteId}`),
        fetch(`/api/serpbear/backlinks/packages`),
        fetch(`/api/serpbear/backlinks/orders?websiteId=${websiteId}`)
      ])
      if (backlinksRes.ok) {
        const data = await backlinksRes.json()
        setBacklinks(data)
      }
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data[0])
      }
      if (packagesRes.ok) {
        const data = await packagesRes.json()
        setPackages(data)
      }
      if (ordersRes.ok) {
        const data = await ordersRes.json()
        setOrders(data)
      }
    } catch (e) {
      console.error('Error fetching backlinks data:', e)
    } finally {
      setLoading(false)
    }
  }, [websiteId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleOrder = async () => {
    if (!websiteId || !selectedPackage || !targetUrl) return
    setOrdering(true)
    try {
      const res = await fetch('/api/serpbear/backlinks/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId,
          packageId: selectedPackage,
          packageType: selectedTier,
          targetUrl,
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
          rushDelivery
        })
      })
      if (res.ok) {
        setOrderSuccess(true)
        setTimeout(() => {
          setOrderSuccess(false)
          setSelectedPackage(null)
          setTargetUrl('')
          setKeywords('')
          setRushDelivery(false)
        }, 3000)
        fetchData()
      }
    } catch (e) {
      console.error('Error ordering backlinks:', e)
    } finally {
      setOrdering(false)
    }
  }

  const getPrice = (pkg: BacklinkPackage) => {
    switch (selectedTier) {
      case 'basic': return pkg.basic_price_pln
      case 'standard': return pkg.standard_price_pln
      case 'premium': return pkg.premium_price_pln
    }
  }

  const getFeatures = (pkg: BacklinkPackage) => {
    switch (selectedTier) {
      case 'basic': return pkg.basic_features
      case 'standard': return pkg.standard_features
      case 'premium': return pkg.premium_features
    }
  }

  const getDelivery = (pkg: BacklinkPackage) => {
    switch (selectedTier) {
      case 'basic': return pkg.basic_delivery_days
      case 'standard': return pkg.standard_delivery_days
      case 'premium': return pkg.premium_delivery_days
    }
  }

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname
    } catch {
      return url
    }
  }

  const getDAColor = (da: number) => {
    if (da >= 50) return 'text-green-600 bg-green-50'
    if (da >= 30) return 'text-blue-600 bg-blue-50'
    if (da >= 10) return 'text-yellow-600 bg-yellow-50'
    return 'text-gray-600 bg-gray-50'
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    }
    const labels: Record<string, string> = {
      pending: 'Oczekuje',
      in_progress: 'W realizacji',
      completed: 'Zakończony',
      delivered: 'Dostarczone',
      cancelled: 'Anulowane'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Backlinks</h2>
        <p className="text-gray-600 mt-1">Linki zwrotne i pakiety SEO</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Link2 className="w-4 h-4" />
              <span className="text-sm">Wszystkie linki</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{stats.total_backlinks}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Globe className="w-4 h-4" />
              <span className="text-sm">Unikalne domeny</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{stats.unique_domains}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Dofollow</span>
            </div>
            <p className="text-2xl font-semibold text-green-600">{stats.dofollow_count}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Wysokie DA (30+)</span>
            </div>
            <p className="text-2xl font-semibold text-blue-600">{stats.high_quality_count}</p>
          </div>
        </div>
      )}

      <section className="bg-white border border-gray-200 rounded-lg">
        <div className="px-5 py-4 border-b border-gray-100">
          <button 
            onClick={() => setShowEducation(!showEducation)} 
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-gray-500" />
              <div>
                <h3 className="font-medium text-gray-900">Czym są backlinki?</h3>
                <p className="text-sm text-gray-500">Kliknij, aby dowiedzieć się więcej</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showEducation ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {showEducation && (
          <div className="p-5 border-t border-gray-100">
            <div className="space-y-4 text-sm text-gray-600">
              <p>
                <strong className="text-gray-900">Backlink</strong> to link prowadzący z innej strony do Twojej. 
                Google traktuje backlinki jako „głosy zaufania" - gdy inna strona linkuje do Ciebie, 
                sygnalizuje, że Twoja treść jest wartościowa.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Wyższy ranking</p>
                    <p>Strony z większą liczbą jakościowych linków zajmują wyższe pozycje w Google</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Globe className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Szybsza indeksacja</p>
                    <p>Googlebot szybciej odkrywa i indeksuje Twoją stronę</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Shield className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Większa wiarygodność</p>
                    <p>Linki z renomowanych stron budują autorytet Twojej domeny</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Link2 className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Ruch referencyjny</p>
                    <p>Użytkownicy trafiają na Twoją stronę bezpośrednio z innych witryn</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Na co zwracać uwagę?</p>
                    <p className="mt-1">Jakość ważniejsza od ilości. Kilka linków z wysokim DA (30+) jest cenniejsze niż setki ze spamerskich stron.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {backlinks.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-lg">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              Wykryte backlinks ({backlinks.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {backlinks.slice(0, 10).map((backlink, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <a 
                      href={backlink.source_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium truncate flex items-center gap-1"
                    >
                      {getDomainFromUrl(backlink.source_url)}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${backlink.is_nofollow ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                      {backlink.is_nofollow ? 'Nofollow' : 'Dofollow'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-0.5">
                    Anchor: "{backlink.anchor_text || 'brak'}"
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-lg font-semibold ${getDAColor(backlink.domain_authority)}`}>
                  DA {backlink.domain_authority}
                </div>
              </div>
            ))}
          </div>
          {backlinks.length > 10 && (
            <div className="px-5 py-3 bg-gray-50 text-sm text-gray-600">
              Pokazano 10 z {backlinks.length} backlinków
            </div>
          )}
        </section>
      )}

      {backlinks.length === 0 && !loading && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <Link2 className="w-10 h-10 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Brak backlinków</h3>
          <p className="text-gray-600 mb-4">
            Nie wykryto żadnych linków zwrotnych.
          </p>
        </div>
      )}

      {orders.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-lg">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Zamówione pakiety ({orders.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {orders.map((order) => (
              <div key={order.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{order.package_name}</p>
                    <p className="text-sm text-gray-500 capitalize">{order.package_type} • {order.target_url}</p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{order.total_price_pln.toFixed(2)} zł</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {order.delivery_days} dni
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-white border border-gray-200 rounded-lg">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-gray-500" />
            <div>
              <h3 className="font-medium text-gray-900">Zakup backlinków</h3>
              <p className="text-sm text-gray-500">Pakiety z polskich stron o wysokim autorytecie</p>
            </div>
          </div>
        </div>

        {packages.length > 0 && !selectedPackage && (
          <div className="p-5">
            <div className="grid md:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <div key={pkg.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900">{pkg.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{pkg.description}</p>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between py-2 border-t border-gray-100">
                      <span className="text-gray-600">Basic</span>
                      <span className="font-medium">{pkg.basic_price_pln.toFixed(2)} zł</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-100">
                      <span className="text-gray-600">Standard</span>
                      <span className="font-medium">{pkg.standard_price_pln.toFixed(2)} zł</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-100">
                      <span className="text-gray-600">Premium</span>
                      <span className="font-medium">{pkg.premium_price_pln.toFixed(2)} zł</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPackage(pkg.id)}
                    className="w-full py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Zamów
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedPackage && (
          <div className="p-5 border-t border-gray-100 bg-gray-50">
            <div className="mb-4">
              <button
                onClick={() => setSelectedPackage(null)}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                ← Wróć
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              {(['basic', 'standard', 'premium'] as const).map(tier => {
                const pkg = packages.find(p => p.id === selectedPackage)
                if (!pkg) return null
                const price = tier === 'basic' ? pkg.basic_price_pln : tier === 'standard' ? pkg.standard_price_pln : pkg.premium_price_pln
                return (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                      selectedTier === tier 
                        ? 'border-gray-900 bg-gray-900 text-white' 
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="block">{tier.charAt(0).toUpperCase() + tier.slice(1)}</span>
                    <span className={`block ${selectedTier === tier ? 'text-gray-400' : 'text-gray-500'}`}>{price.toFixed(2)} zł</span>
                  </button>
                )
              })}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Zawiera:</p>
                <ul className="space-y-1">
                  {getFeatures(packages.find(p => p.id === selectedPackage)!).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL strony docelowej *</label>
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={e => setTargetUrl(e.target.value)}
                    placeholder="https://twoja-strona.pl"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Słowa kluczowe</label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={e => setKeywords(e.target.value)}
                    placeholder="frazakluczowa1, frazakluczowa2"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {getDelivery(packages.find(p => p.id === selectedPackage)!)} dni
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-semibold text-gray-900">
                    {getPrice(packages.find(p => p.id === selectedPackage)!).toFixed(2)} zł
                  </span>
                  <button
                    onClick={handleOrder}
                    disabled={!targetUrl || ordering || orderSuccess}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                      orderSuccess
                        ? 'bg-green-600 text-white'
                        : targetUrl
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {ordering ? 'Zamawiam...' : orderSuccess ? '✓ Zamówiono!' : 'Zamów teraz'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {packages.length === 0 && (
          <div className="p-8 text-center">
            <Package className="w-10 h-10 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">Brak dostępnych pakietów</p>
          </div>
        )}
      </section>
    </div>
  )
}
