import { useEffect, useState } from 'react'
import { BarChart3, FileText, Globe, TrendingUp, Eye, Users, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { getAnalyticsOverview } from './api'
import type { PageVisit } from './api'

type Trend = 'up' | 'down' | 'stable'

function getTrend(current: number, previous: number): Trend {
  if (previous === 0) return current > 0 ? 'up' : 'stable'
  const change = ((current - previous) / previous) * 100
  if (change > 5) return 'up'
  if (change < -5) return 'down'
  return 'stable'
}

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === 'up') return <ArrowUp className="w-4 h-4 text-green-600" />
  if (trend === 'down') return <ArrowDown className="w-4 h-4 text-red-500" />
  return <Minus className="w-4 h-4 text-gray-400" />
}

function VisitItem({ item, index, showTitle }: { item: PageVisit; index: number; showTitle?: boolean }) {
  const barWidth = 100
  const maxVisits = 100

  return (
    <div className="flex items-center gap-3 py-2 hover:bg-gray-50 rounded-lg px-2 transition-colors">
      <span className="w-6 text-center font-semibold text-gray-400 text-sm">{index + 1}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {item.type === 'post' ? (
            <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
          ) : (
            <Globe className="w-4 h-4 text-purple-500 flex-shrink-0" />
          )}
          <span className="text-sm text-gray-900 truncate font-medium">
            {showTitle && (item as PageVisit & { title?: string }).title
              ? (item as PageVisit & { title?: string }).title
              : item.path}
          </span>
        </div>
        <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${item.type === 'post' ? 'bg-blue-500' : 'bg-purple-500'}`}
            style={{ width: `${Math.min((item.visits / maxVisits) * barWidth, 100)}%` }}
          />
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="font-bold text-gray-900">{item.visits}</div>
        <div className="text-xs text-gray-500">wizyt</div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  color: string
  trend?: Trend
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <TrendIcon trend={trend} />
          <span className="text-xs text-gray-500">vs poprzedni okres</span>
        </div>
      )}
    </div>
  )
}

export default function AnalyticsSection() {
  const [pages, setPages] = useState<PageVisit[]>([])
  const [posts, setPosts] = useState<PageVisit[]>([])
  const [totalVisits, setTotalVisits] = useState(0)
  const [uniqueVisitors, setUniqueVisitors] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pages' | 'posts'>('pages')
  const [daysFilter, setDaysFilter] = useState(30)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const data = await getAnalyticsOverview(daysFilter)
        if (mounted) {
          setPages(data.pages)
          setPosts(data.posts)
          setTotalVisits(data.totalVisits)
          setUniqueVisitors(data.uniqueVisitors)
        }
      } catch (err) {
        console.error('Analytics error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [daysFilter])

  const lowTrafficPages = pages.filter(p => p.visits < 5)
  const topContent = activeTab === 'pages' ? pages.slice(0, 10) : posts.slice(0, 10)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Ładowanie analityki...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Analityka strony</h2>
          <p className="text-sm text-gray-500">Śledź ruch na swojej stronie i blogu</p>
        </div>
        <select
          value={daysFilter}
          onChange={(e) => setDaysFilter(Number(e.target.value))}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value={7}>Ostatnie 7 dni</option>
          <option value={14}>Ostatnie 14 dni</option>
          <option value={30}>Ostatnie 30 dni</option>
          <option value={90}>Ostatnie 90 dni</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Wszystkie wizyty"
          value={totalVisits.toLocaleString()}
          subtitle={`w ciągu ${daysFilter} dni`}
          icon={Eye}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Unikalni odwiedzający"
          value={uniqueVisitors.toLocaleString()}
          subtitle="nowi użytkownicy"
          icon={Users}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          title="Odwiedziny stron"
          value={pages.length}
          subtitle="unikalnych stron"
          icon={Globe}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Odwiedziny postów"
          value={posts.length}
          subtitle="z bloga"
          icon={FileText}
          color="bg-orange-50 text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900">Najpopularniejsza treść</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('pages')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'pages'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Globe className="w-4 h-4" />
                Strony ({pages.length})
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'posts'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                Posty bloga ({posts.length})
              </button>
            </div>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            {topContent.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Brak danych dla tego okresu</p>
              </div>
            ) : (
              topContent.map((item, index) => (
                <VisitItem
                  key={item.path}
                  item={item}
                  index={index}
                  showTitle={activeTab === 'posts'}
                />
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900">Podsumowanie</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Średnio wizyt/dzień</span>
                <span className="font-semibold text-gray-900">
                  {Math.round(totalVisits / daysFilter)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Najpopularniejsza strona</span>
                <span className="font-semibold text-gray-900 text-right truncate max-w-[120px]">
                  {pages[0]?.path || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Najpopularniejszy post</span>
                <span className="font-semibold text-gray-900 text-right truncate max-w-[120px]">
                  {posts[0] ? (posts[0] as PageVisit & { title?: string }).title || posts[0].path : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Współczynnik odrzuceń</span>
                <span className="font-semibold text-gray-900">
                  {totalVisits > 0 ? Math.round((uniqueVisitors / totalVisits) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          {lowTrafficPages.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-lg">⚠️</span>
                </div>
                <h3 className="font-semibold text-amber-800">Strony o niskim ruchu</h3>
              </div>
              <p className="text-sm text-amber-700 mb-3">
                {lowTrafficPages.length} stron ma mniej niż 5 wizyt
              </p>
              <div className="space-y-2">
                {lowTrafficPages.slice(0, 5).map((page) => (
                  <div key={page.path} className="flex justify-between items-center text-sm">
                    <span className="text-amber-800 truncate flex-1">{page.path}</span>
                    <span className="font-semibold text-amber-700 ml-2">{page.visits}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
