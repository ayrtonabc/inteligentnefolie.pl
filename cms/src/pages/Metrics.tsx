import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { 
  Globe, 
  Monitor, 
  Smartphone, 
  Tablet, 
  RefreshCw, 
  Download, 
  BarChart3,
  Users,
  MousePointerClick,
  ArrowRight
} from 'lucide-react'
import { TicketSupportCard } from '@/components/TicketSupportCard'
import { pb, TENANT_ID } from '@/lib/pocketbase'
import { useToast } from '@/components/Toast'
import { useLanguage } from '@/context/LanguageContext'

type VisitStats = {
  range_visits: number
  range_unique: number
  today_visits: number
  today_unique: number
  all_visits?: number
  all_unique?: number
}

interface PageStats {
  path: string;
  visits: number;
  unique_visits: number;
}

interface DeviceStats {
  device_type: string
  count: number
}

interface BrowserStats {
  browser: string
  count: number
}

interface DailyStats {
  date: string
  visits: number
  unique_visits: number
}

export default function Metrics() {
  const toast = useToast()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState<VisitStats | null>(null)
  const [pageStats, setPageStats] = useState<PageStats[]>([])
  const [deviceStats, setDeviceStats] = useState<DeviceStats[]>([])
  const [browserStats, setBrowserStats] = useState<BrowserStats[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [selectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  const fetchMetrics = useCallback(async () => {
    setRefreshing(true)
    try {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const todayIso = today.toISOString().replace('T', ' ').split('.')[0] 

      const rangeDays = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : selectedPeriod === '90d' ? 90 : 365
      const rangeStart = new Date(today)
      rangeStart.setDate(rangeStart.getDate() - rangeDays)
      const rangeStartIso = rangeStart.toISOString().replace('T', ' ').split('.')[0]

      const [
        visits,
        rangeVisits,
        rangeUnique,
        todayVisits,
        todayUnique,
        allStats,
      ] = await Promise.all([
        pb.collection('website_visits').getFullList({
          filter: `website_id = "${TENANT_ID}" && created >= "${rangeStartIso}"`,
          sort: '-created',
        }),
        pb.collection('website_visits').getList(1, 1, { filter: `website_id = "${TENANT_ID}" && created >= "${rangeStartIso}"` }),
        pb.collection('website_visits').getList(1, 1, { filter: `website_id = "${TENANT_ID}" && created >= "${rangeStartIso}" && is_unique = true` }),
        pb.collection('website_visits').getList(1, 1, { filter: `website_id = "${TENANT_ID}" && created >= "${todayIso}"` }),
        pb.collection('website_visits').getList(1, 1, { filter: `website_id = "${TENANT_ID}" && created >= "${todayIso}" && is_unique = true` }),
        selectedPeriod === 'all'
          ? Promise.all([
              pb.collection('website_visits').getList(1, 1, { filter: `website_id = "${TENANT_ID}"` }),
              pb.collection('website_visits').getList(1, 1, { filter: `website_id = "${TENANT_ID}" && is_unique = true` }),
            ])
          : Promise.resolve(null),
      ])

      const base: VisitStats = {
        range_visits: rangeVisits.totalItems || 0,
        range_unique: rangeUnique.totalItems || 0,
        today_visits: todayVisits.totalItems || 0,
        today_unique: todayUnique.totalItems || 0,
      }

      if (allStats) {
        const [a, u] = allStats
        base.all_visits = a.totalItems || 0
        base.all_unique = u.totalItems || 0
      }

      setStats(base)

      const allVisits = visits || []

      // Estadísticas por página
      const pageMap = new Map<string, { total: number; unique: number }>()
      allVisits.forEach((visit) => {
        const key = visit.page_path || '/'
        const current = pageMap.get(key) || { total: 0, unique: 0 }
        current.total++
        if (visit.is_unique) current.unique++
        pageMap.set(key, current)
      })
      
      const pages: PageStats[] = Array.from(pageMap.entries())
        .map(([page_path, counts]) => ({
          path: page_path,
          visits: counts.total,
          unique_visits: counts.unique,
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10)

      setPageStats(pages)

      // Estadísticas por dispositivo
      const deviceMap = new Map<string, number>()
      allVisits.forEach((visit) => {
        const device = visit.device_type || 'unknown'
        deviceMap.set(device, (deviceMap.get(device) || 0) + 1)
      })
      
      const devices: DeviceStats[] = Array.from(deviceMap.entries())
        .map(([device_type, count]) => ({ device_type, count }))
        .sort((a, b) => b.count - a.count)

      setDeviceStats(devices)

      // Estadísticas por navegador
      const browserMap = new Map<string, number>()
      allVisits.forEach((visit) => {
        const browser = visit.browser || 'unknown'
        browserMap.set(browser, (browserMap.get(browser) || 0) + 1)
      })
      
      const browsers: BrowserStats[] = Array.from(browserMap.entries())
        .map(([browser, count]) => ({ browser, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setBrowserStats(browsers)

      const dailyMap = new Map<string, { total: number; unique: number }>()
      allVisits.forEach((visit) => {
        const visitDate = new Date(visit.created)
        const dateKey = visitDate.toISOString().split('T')[0]
        const current = dailyMap.get(dateKey) || { total: 0, unique: 0 }
        current.total++
        if (visit.is_unique) current.unique++
        dailyMap.set(dateKey, current)
      })

      const daily: DailyStats[] = Array.from(dailyMap.entries())
        .map(([date, counts]) => ({
          date,
          visits: counts.total,
          unique_visits: counts.unique,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      setDailyStats(daily)

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error'
      console.error('Error fetching metrics:', error)
      toast.error(`Błąd: ${message}`)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [selectedPeriod, toast])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  const exportData = () => {
    const data = {
      stats,
      pageStats,
      deviceStats,
      browserStats,
      dailyStats,
      exported_at: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `metrics_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t('data_exported_success'))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const totalDevices = Math.max(deviceStats.reduce((a, d) => a + d.count, 0), 1)
  const totalBrowsers = Math.max(browserStats.reduce((a, d) => a + d.count, 0), 1)

  return (
    <div className="p-8 bg-[#F8F9FB] min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pulpit analityczny</h1>
        <p className="text-gray-600">Monitoruj ruch na swojej stronie i zachowania użytkowników.</p>
      </div>

      {/* Main Grid - Navigation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column - Navigation Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Przegląd */}
          <Link
            to="/analytics/overview"
            className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-sky-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Przegląd</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Zobacz ogólne statystyki odwiedzin, wizyt i źródeł ruchu.
            </p>
            <div className="flex items-center text-sky-600 text-sm font-medium group-hover:gap-2 transition-all">
              <span>Zobacz szczegóły</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* Użytkownicy */}
          <Link
            to="/analytics/users"
            className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-sky-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Użytkownicy</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Analizuj demografię, geolokalizację i zachowania użytkowników.
            </p>
            <div className="flex items-center text-sky-600 text-sm font-medium group-hover:gap-2 transition-all">
              <span>Analizuj użytkowników</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* Strony */}
          <Link
            to="/analytics/pages"
            className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-sky-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Strony</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Sprawdź które strony są najczęściej odwiedzane i jak długo.
            </p>
            <div className="flex items-center text-sky-600 text-sm font-medium group-hover:gap-2 transition-all">
              <span>Zobacz strony</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* Konwersje */}
          <Link
            to="/analytics/conversions"
            className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
              <MousePointerClick className="w-6 h-6 text-sky-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Konwersje</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Śledź cele, konwersje i wartość odwiedzających.
            </p>
            <div className="flex items-center text-sky-600 text-sm font-medium group-hover:gap-2 transition-all">
              <span>Sprawdź konwersje</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        </div>

        {/* Right Column - Performance Card */}
        <div className="bg-gradient-to-br from-sky-600 to-sky-800 rounded-2xl p-6 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Wydajność</h3>
              <span className="px-2 py-1 bg-sky-500/50 rounded-full text-xs font-medium">+15.3%</span>
            </div>

            <div className="mb-6">
              <div className="text-4xl font-bold mb-1">{stats?.range_visits || 0}</div>
              <p className="text-sky-200 text-sm">Wizyt w tym okresie</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                <span className="text-sm">Dzisiaj</span>
                <span className="font-semibold">{stats?.today_visits || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                <span className="text-sm">Unikalni</span>
                <span className="font-semibold">{stats?.range_unique || 0}</span>
              </div>
            </div>

            {/* Chart decoration */}
            <div className="mt-6 flex items-end gap-1 h-16">
              {[35, 55, 40, 70, 50, 65, 85, 60, 75, 80, 90, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-white/20 rounded-t-sm"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Stats */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
              <Monitor className="w-5 h-5 text-sky-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Urządzenia</h3>
          </div>
          <div className="space-y-3">
            {deviceStats.length === 0 ? (
              <div className="text-sm text-gray-500 py-4 text-center">{t('no_data_available')}</div>
            ) : (
              deviceStats.slice(0, 4).map((d) => {
                const Icon = d.device_type === 'mobile' ? Smartphone : d.device_type === 'tablet' ? Tablet : Monitor
                const pct = Math.round((d.count / totalDevices) * 100)
                return (
                  <div key={d.device_type} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon size={16} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-900 capitalize">{d.device_type}</span>
                    </div>
                    <div className="flex items-center gap-2 w-24">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-1.5 bg-sky-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-medium text-gray-600 w-6 text-right">{pct}%</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Browser Stats */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Przeglądarki</h3>
          </div>
          <div className="space-y-3">
            {browserStats.length === 0 ? (
              <div className="text-sm text-gray-500 py-4 text-center">{t('no_data_available')}</div>
            ) : (
              browserStats.slice(0, 4).map((b) => {
                const pct = Math.round((b.count / totalBrowsers) * 100)
                return (
                  <div key={b.browser} className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-gray-900 capitalize truncate">{b.browser}</span>
                    <div className="flex items-center gap-2 w-24">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-1.5 bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-medium text-gray-600 w-6 text-right">{pct}%</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Help Card - Replaced with Ticket System */}
        <TicketSupportCard />
      </div>

      {/* Recent Activity Section */}
      {pageStats.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Najpopularniejsze strony</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchMetrics}
                disabled={refreshing}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={exportData}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download size={18} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {pageStats.slice(0, 5).map((p, i) => (
                <div key={p.path} className="flex items-center justify-between p-4 hover:bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 font-medium w-6">#{i + 1}</span>
                    <span className="text-sm font-medium text-gray-900">{p.path}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{p.unique_visits} unikalnych</span>
                    <span className="text-sm font-semibold text-sky-600">{p.visits} wizyt</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
