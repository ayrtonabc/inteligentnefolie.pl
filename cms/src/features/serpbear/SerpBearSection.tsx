import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Trash2,
  RefreshCw,
  Target,
  Monitor,
  Smartphone,
  AlertCircle,
  X,
  Lightbulb,
  CheckCircle,
  Clock,
  Star,
  Zap,
  BookOpen,
  BarChart3,
  ChevronRight,
  Search,
  Info,
  Globe,
  Award,
  Users,
  ArrowUp,
  ArrowDown,
  Eye,
  MousePointer,
  Trophy,
  TrendingDown as TrendingDownIcon,
  Smartphone as MobileIcon,
  Monitor as DesktopIcon,
  BarChart2,
  PieChart,
  Activity,
} from 'lucide-react'
import { useSerpBear } from './hooks'
import type { AddKeywordFormData } from './types'

const ENCOURAGING_MESSAGES = [
  {
    icon: Clock,
    title: 'Cierpliwość jest kluczem',
    text: 'Pozycjonowanie to maraton, nie sprint. Google potrzebuje czasu, aby zauważyć i ocenić Twoją stronę.',
    color: 'blue',
  },
  {
    icon: Star,
    title: 'Każdy sukces zaczyna się od małych kroków',
    text: 'Nawet najlepsze strony zaczynały bez pozycji. Regularność i jakość treści to podstawa sukcesu.',
    color: 'amber',
  },
  {
    icon: Zap,
    title: 'Nowa strona = nowe możliwości',
    text: 'Masz czystą kartę do budowania solidnych fundamentów SEO. Skup się na wartościowych treściach.',
    color: 'green',
  },
  {
    icon: BookOpen,
    title: 'Treść jest królem',
    text: 'Regularnie publikuj artykuły, które odpowiadają na pytania Twoich użytkowników. To najlepsza inwestycja.',
    color: 'purple',
  },
]

const QUICK_SUGGESTIONS = [
  { keyword: 'usługi [nazwa usługi] [miasto]', example: 'usługi księgowe warszawa', tip: 'Dodaj lokalizację' },
  { keyword: 'najlepszy + [usługa]', example: 'najlepszy catering warszawa', tip: 'Klienci szukają najlepszych' },
  { keyword: '[usługa] + opinie', example: 'fryzjer opinie', tip: 'Buduje zaufanie' },
  { keyword: 'jak + [problem]', example: 'jak założyć firmę', tip: 'Poradniki są popularne' },
]

export default function SerpBearSection({ websiteId, websiteUrl }: { websiteId: string | null; websiteUrl?: string }) {
  const {
    keywords,
    selectedKeyword,
    stats,
    loading,
    checking,
    error,
    refresh,
    addNewKeyword,
    removeKeyword,
    selectKeyword,
    checkPosition,
    checkAllPositions,
    setSelectedKeyword,
    isConnected,
    syncing,
    seoSummary,
    googleAppearances,
    deviceComparison,
    positionChanges,
    lostOpportunities,
    competitors,
    syncWithGoogle,
  } = useSerpBear(websiteId)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [formData, setFormData] = useState<AddKeywordFormData>({
    keyword: '',
    domain: websiteUrl?.replace(/^https?:\/\//, '').replace(/\/$/, '') || '',
    device: 'desktop',
    location: 'pl',
  })

  const getRandomMessage = () => {
    return ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)]
  }

  const [currentMessage] = useState(getRandomMessage)

  const handleAdd = async () => {
    if (!formData.keyword || !formData.domain) return
    try {
      await addNewKeyword(formData)
      setShowAddModal(false)
      setFormData({
        ...formData,
        keyword: '',
        domain: formData.domain,
      })
    } catch (e) {
      console.error('Error adding keyword:', e)
    }
  }

  const handleQuickSuggestion = (example: string) => {
    setFormData({ ...formData, keyword: example })
    setShowAddModal(true)
  }

  const getPositionColor = (position?: number) => {
    if (!position) return 'text-gray-400'
    if (position <= 10) return 'text-green-600'
    if (position <= 30) return 'text-emerald-600'
    if (position <= 50) return 'text-amber-600'
    return 'text-red-600'
  }

  const getMessageColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      amber: 'bg-amber-50 border-amber-200 text-amber-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800',
    }
    return colors[color] || colors.blue
  }

  const MessageIcon = currentMessage.icon

  const hasKeywords = keywords.length > 0
  const hasPositions = keywords.some((k) => k.lastPosition)

  return (
    <div className="space-y-6">
      {/* Encouraging Message Banner - Only show if no positions yet */}
      {!hasPositions && (
        <div className={`rounded-xl p-5 border ${getMessageColorClass(currentMessage.color)}`}>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/50 rounded-xl">
              <MessageIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{currentMessage.title}</h3>
              <p className="text-sm opacity-80">{currentMessage.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Start Guide */}
      {!hasKeywords && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Info className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Jak zacząć śledzić pozycje?</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-start gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    1
                  </span>
                  Dodaj słowa kluczowe, które są ważne dla Twojego biznesu
                </p>
                <p className="flex items-start gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    2
                  </span>
                  Kliknij &quot;Sprawdź pozycję&quot; aby zobaczyć gdzie jesteś w Google
                </p>
                <p className="flex items-start gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    3
                  </span>
                  Powtarzaj regularnie, aby śledzić postępy
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Słowa kluczowe</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats?.totalKeywords || 0}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Top 10</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats?.top10Count || 0}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <BarChart3 className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-sm text-gray-500">Top 50</span>
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats?.top50Count || 0}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Średnia</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats?.averagePosition ? `#${stats.averagePosition}` : '—'}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center gap-2"
          disabled={!websiteId}
        >
          <Plus size={16} />
          Dodaj słowo kluczowe
        </button>

        <button
          onClick={checkAllPositions}
          className="btn btn-secondary flex items-center gap-2"
          disabled={checking || keywords.length === 0}
        >
          <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
          {checking ? 'Sprawdzam...' : 'Sprawdź wszystkie'}
        </button>

        <button
          onClick={() => setShowGuide(!showGuide)}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Lightbulb size={16} />
          Porady
        </button>

        <button onClick={refresh} className="btn btn-secondary flex items-center gap-2" disabled={loading}>
          <Search size={16} />
          Odśwież
        </button>
      </div>

      {/* ================================================================================
          SEKCJA: DANE Z GOOGLE SEARCH CONSOLE (DLA UŻYTKOWNIKÓW NIETECHNICZNYCH)
          ================================================================================ */}

      {/* Google Connection Status */}
      <div className={`border rounded-xl p-5 ${isConnected ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isConnected ? 'bg-green-100' : 'bg-amber-100'}`}>
              <Globe className={`w-6 h-6 ${isConnected ? 'text-green-600' : 'text-amber-600'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {isConnected ? 'Połączono z Google Search Console' : 'Brak połączenia z Google'}
              </h3>
              <p className="text-sm text-gray-600">
                {isConnected
                  ? 'Masz dostęp do prawdziwych danych z Google'
                  : 'Połącz konto Google w zakładce Konfiguracja, aby zobaczyć realne dane'}
              </p>
            </div>
          </div>
          {isConnected && (
            <button
              onClick={syncWithGoogle}
              disabled={syncing}
              className="btn btn-secondary flex items-center gap-2"
            >
              <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Synchronizacja...' : 'Synchronizuj dane'}
            </button>
          )}
        </div>
      </div>

      {/* PODSUMOWANIE SEO - Sekcja główna dla użytkowników */}
      {seoSummary && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Podsumowanie SEO</h3>
                <p className="text-sm text-gray-600">Ogólny stan pozycji Twojej strony</p>
              </div>
            </div>
          </div>

          <div className="p-5">
            {/* Główne metryki */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">{(seoSummary.top_3_percentage ?? 0).toFixed(1)}%</div>
                <div className="text-xs text-green-600">Top 3</div>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-emerald-700">{(seoSummary.top_10_percentage ?? 0).toFixed(1)}%</div>
                <div className="text-xs text-emerald-600">Top 10</div>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <Target className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-amber-700">
                  {seoSummary.average_position ? `#${(seoSummary.average_position).toFixed(0)}` : '—'}
                </div>
                <div className="text-xs text-amber-600">Średnia pozycja</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-700">
                  {((seoSummary.average_ctr ?? 0) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-purple-600">CTR</div>
              </div>
            </div>

            {/* Rozkład pozycji */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">Rozkład pozycji słów kluczowych</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-32">Pozycje 1-3</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium"
                      style={{ width: `${((seoSummary.position_1_3 ?? 0) / (seoSummary.total_keywords ?? 1)) * 100}%` }}
                    >
                      {seoSummary.position_1_3 ?? 0}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-32">Pozycje 4-10</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium"
                      style={{ width: `${((seoSummary.position_4_10 ?? 0) / (seoSummary.total_keywords ?? 1)) * 100}%` }}
                    >
                      {seoSummary.position_4_10 ?? 0}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-32">Pozycje 11-20</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium"
                      style={{ width: `${((seoSummary.position_11_20 ?? 0) / (seoSummary.total_keywords ?? 1)) * 100}%` }}
                    >
                      {seoSummary.position_11_20 ?? 0}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-32">Pozycje 21-50</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-orange-500 h-full rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium"
                      style={{ width: `${((seoSummary.position_21_50 ?? 0) / (seoSummary.total_keywords ?? 1)) * 100}%` }}
                    >
                      {seoSummary.position_21_50 ?? 0}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-32">Pozycje 51+</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-red-500 h-full rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium"
                      style={{ width: `${((seoSummary.position_51_plus ?? 0) / (seoSummary.total_keywords ?? 1)) * 100}%` }}
                    >
                      {seoSummary.position_51_plus ?? 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Podstawowe statystyki */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">Wszystkie frazy</div>
                <div className="text-lg font-bold text-gray-900">{seoSummary.total_keywords ?? 0}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">Wyświetlenia</div>
                <div className="text-lg font-bold text-gray-900">{(seoSummary.total_impressions ?? 0).toLocaleString()}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">Kliknięcia</div>
                <div className="text-lg font-bold text-gray-900">{(seoSummary.total_clicks ?? 0).toLocaleString()}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">Okres</div>
                <div className="text-lg font-bold text-gray-900">{seoSummary.period_days ?? 0} dni</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ZMIANY POZYCJI - Dla użytkowników nietechnicznych */}
      {positionChanges.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Zmiany pozycji</h3>
                <p className="text-sm text-gray-600">Co się zmieniło w ostatnim czasie</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {positionChanges.slice(0, 10).map((change, i) => (
              <div key={i} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">&quot;{change.query}&quot;</div>
                    <div className="text-xs text-gray-500 truncate mt-1">
                      {change.page_url.replace(/^https?:\/\//, '').split('/')[0]}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right">
                      <div className={`font-bold ${getPositionColor(change.current_position)}`}>
                        #{change.current_position}
                      </div>
                      <div className="text-xs text-gray-400">
                        {change.previous_position ? `było #${change.previous_position}` : 'nowa'}
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                      change.change_type === 'improved' ? 'bg-green-100 text-green-700' :
                      change.change_type === 'declined' ? 'bg-red-100 text-red-700' :
                      change.change_type === 'new' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {change.change_type === 'improved' && <ArrowUp className="w-4 h-4" />}
                      {change.change_type === 'declined' && <ArrowDown className="w-4 h-4" />}
                      {change.change_type === 'new' && <Plus className="w-4 h-4" />}
                      {change.change_type === 'stable' && <Minus className="w-4 h-4" />}
                      {change.change_type === 'improved' ? `+${change.change}` :
                       change.change_type === 'declined' ? change.change :
                       change.change_type === 'new' ? 'NOWA' : 'bez zmian'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WSZYSTKIE POJAWIENIA W GOOGLE */}
      {googleAppearances.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Globe className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Wszystkie appearencje w Google</h3>
                <p className="text-sm text-gray-600">Frazy z którymi Twoja strona się wyświetla</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Fraza</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Pozycja</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Wyświetlenia</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Kliknięcia</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">CTR</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Urządzenie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {googleAppearances.slice(0, 20).map((app, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                      &quot;{app.query}&quot;
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${getPositionColor(app.pos)}`}>#{app.pos}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {(app.impressions ?? 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {(app.clicks ?? 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-gray-700">{(app.ctr * 100).toFixed(1)}%</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        app.device === 'desktop' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {app.device === 'desktop' ? <DesktopIcon className="w-3 h-3" /> : <MobileIcon className="w-3 h-3" />}
                        {app.device === 'desktop' ? 'PC' : 'Mobile'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {googleAppearances.length > 20 && (
            <div className="p-3 text-center text-sm text-gray-500 border-t border-gray-100">
              ...i {googleAppearances.length - 20} więcej fraz
            </div>
          )}
        </div>
      )}

      {/* PORÓWNANIE URZĄDZEŃ */}
      {deviceComparison.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BarChart2 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Porównanie urządzeń</h3>
                <p className="text-sm text-gray-600">Różnice w pozycjach PC vs Mobile</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {deviceComparison.slice(0, 8).map((comp, i) => (
              <div key={i} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">&quot;{comp.query}&quot;</div>
                  </div>
                  <div className="flex items-center gap-6 ml-4">
                    <div className="flex items-center gap-2">
                      <DesktopIcon className="w-4 h-4 text-blue-600" />
                      <span className={`font-bold ${getPositionColor(comp.desktop_position)}`}>
                        #{comp.desktop_position}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MobileIcon className="w-4 h-4 text-green-600" />
                      <span className={`font-bold ${getPositionColor(comp.mobile_position)}`}>
                        #{comp.mobile_position}
                      </span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-sm font-medium ${
                      comp.position_diff > 0 ? 'bg-green-100 text-green-700' :
                      comp.position_diff < 0 ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {comp.position_diff > 0 ? `+${comp.position_diff}` : comp.position_diff}
                      {comp.position_diff !== 0 && (
                        <span className="text-xs ml-1">
                          {comp.position_diff > 0 ? 'lepiej na mobile' : 'lepiej na PC'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UTRACONE MOŻLIWOŚCI */}
      {lostOpportunities.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDownIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Utracone możliwości</h3>
                <p className="text-sm text-gray-600">Frazy z potencjałem (pozycje 11-50)</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {lostOpportunities.slice(0, 10).map((opp, i) => (
              <div key={i} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">&quot;{opp.query}&quot;</div>
                    <div className="text-xs text-gray-500 truncate mt-1">
                      {opp.page_url.replace(/^https?:\/\//, '').split('/')[0]}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right">
                      <div className={`font-bold ${getPositionColor(opp.best_position)}`}>
                        #{opp.best_position}
                      </div>
                      <div className="text-xs text-gray-400">najlepsza pozycja</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-900 font-medium">{(opp.impressions ?? 0).toLocaleString()}</div>
                      <div className="text-xs text-gray-400">wyświetleń</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      opp.best_position <= 20 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {opp.best_position <= 20 ? 'Możliwe TOP 10!' : 'Wymaga pracy'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KONKURENCI */}
      {competitors.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-200 rounded-lg">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Konkurenci</h3>
                <p className="text-sm text-gray-600">Strony z podobnymi frazami kluczowymi</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 p-4">
            {competitors.slice(0, 6).map((comp, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium text-gray-900">{comp.competitor_domain}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {comp.shared_keywords} wspólnych fraz
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    comp.your_avg_position < comp.competitor_avg_position
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {comp.your_avg_position < comp.competitor_avg_position ? 'Wyprzedzasz' : 'Przegrywasz'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center p-2 bg-white rounded-lg">
                    <div className="text-xs text-gray-500">Twoja średnia</div>
                    <div className={`font-bold ${getPositionColor(Math.round(comp.your_avg_position))}`}>
                      #{Math.round(comp.your_avg_position)}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-white rounded-lg">
                    <div className="text-xs text-gray-500">Ich średnia</div>
                    <div className="font-bold text-gray-600">
                      #{Math.round(comp.competitor_avg_position)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips Panel */}
      {showGuide && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-gray-900">Przykładowe słowa kluczowe</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Kliknij, aby szybko dodać do listy. Możesz też wpisać własne.
          </p>
          <div className="grid gap-3">
            {QUICK_SUGGESTIONS.map((suggestion, i) => (
              <div
                key={i}
                onClick={() => handleQuickSuggestion(suggestion.example)}
                className="bg-white rounded-lg p-4 border border-amber-100 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 group-hover:text-amber-700 transition-colors">
                      &quot;{suggestion.example}&quot;
                    </div>
                    <div className="text-xs text-amber-600 mt-1">{suggestion.tip}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-amber-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Błąd</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasKeywords && !loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak słów kluczowych</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Zacznij śledzić słowa kluczowe, aby monitorować pozycje Twojej strony w Google.
          </p>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={16} className="mr-2" />
            Dodaj pierwsze słowo kluczowe
          </button>
        </div>
      )}

      {/* Keywords Table */}
      {hasKeywords && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Twoje słowa kluczowe</h3>
            <span className="text-sm text-gray-500">{keywords.length} fraz</span>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500">Ładowanie...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Słowo kluczowe
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Urządzenie
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Pozycja
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Ostatni check
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {keywords.map((keyword) => (
                    <tr key={keyword.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{keyword.keyword}</div>
                        <div className="text-xs text-gray-400 mt-0.5 font-mono">{keyword.domain}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {keyword.device === 'desktop' ? (
                          <div className="p-2 bg-blue-100 rounded-lg inline-flex" title="Desktop">
                            <Monitor className="w-4 h-4 text-blue-600" />
                          </div>
                        ) : (
                          <div className="p-2 bg-purple-100 rounded-lg inline-flex" title="Mobile">
                            <Smartphone className="w-4 h-4 text-purple-600" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`text-lg font-bold ${getPositionColor(keyword.lastPosition)}`}>
                          {keyword.lastPosition ? `#${keyword.lastPosition}` : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {keyword.lastCheck ? (
                          <span className="text-sm text-gray-500">
                            {new Date(keyword.lastCheck).toLocaleDateString('pl-PL')}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Nigdy</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => selectKeyword(keyword.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Historia"
                          >
                            <BarChart3 size={16} />
                          </button>
                          <button
                            onClick={() => checkPosition(keyword.id)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Sprawdź"
                            disabled={checking}
                          >
                            <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
                          </button>
                          <button
                            onClick={() => removeKeyword(keyword.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Usuń"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Keyword History Modal */}
      {selectedKeyword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedKeyword.keyword}</h3>
                <p className="text-sm text-gray-500">
                  {selectedKeyword.domain} • {selectedKeyword.location?.toUpperCase() || 'PL'} •{' '}
                  {selectedKeyword.device === 'desktop' ? (
                    <Monitor className="w-3.5 h-3.5 inline" />
                  ) : (
                    <Smartphone className="w-3.5 h-3.5 inline" />
                  )}
                </p>
              </div>
              <button
                onClick={() => setSelectedKeyword(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Position */}
              <div
                className={`rounded-xl p-6 ${
                  selectedKeyword.lastPosition
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="text-sm text-gray-500 mb-2">Aktualna pozycja w Google</div>
                <div className={`text-4xl font-bold ${getPositionColor(selectedKeyword.lastPosition)}`}>
                  {selectedKeyword.lastPosition ? `#${selectedKeyword.lastPosition}` : 'Brak danych'}
                </div>
                {selectedKeyword.lastCheck && (
                  <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Sprawdzono: {new Date(selectedKeyword.lastCheck ?? 0).toLocaleString('pl-PL')}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <div className="text-sm text-gray-500 mb-1">Najlepsza</div>
                  <div className="text-2xl font-bold text-green-600">
                    #{selectedKeyword.history.length > 0 
                      ? Math.min(...selectedKeyword.history.map((h) => h.position))
                      : '—'}
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <div className="text-sm text-gray-500 mb-1">Średnia</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedKeyword.history.length > 0
                      ? `#${Math.round(
                          selectedKeyword.history.reduce((sum, h) => sum + h.position, 0) /
                            selectedKeyword.history.length
                        )}`
                      : '—'}
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <div className="text-sm text-gray-500 mb-1">Ilość pomiarów</div>
                  <div className="text-2xl font-bold text-gray-900">{selectedKeyword.history.length}</div>
                </div>
              </div>

              {/* History Chart */}
              {selectedKeyword.history.length > 1 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Historia pozycji
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <svg viewBox={`0 0 ${Math.max(selectedKeyword.history.length - 1, 1) * 60} 120`} className="w-full h-32">
                      <polyline
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={selectedKeyword.history.map((h, i) => {
                          const x = i * 60
                          const y = 120 - Math.min(h.position * 1.2, 110)
                          return `${x},${y}`
                        }).join(' ')}
                      />
                      {selectedKeyword.history.map((h, i) => {
                        const x = i * 60
                        const y = 120 - Math.min(h.position * 1.2, 110)
                        return (
                          <g key={h.id}>
                            <circle cx={x} cy={y} r="5" fill="#3b82f6" stroke="white" strokeWidth="2" />
                            <text x={x} y={135} textAnchor="middle" className="text-xs fill-gray-500">
                              {new Date(h.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
                            </text>
                            <text x={x} y={y - 10} textAnchor="middle" className="text-xs font-semibold fill-gray-700">
                              #{h.position}
                            </text>
                          </g>
                        )
                      })}
                    </svg>
                  </div>
                </div>
              )}

              {/* History Table */}
              {selectedKeyword.history.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Szczegóły pomiarów</h4>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Data</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Pozycja</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">URL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {[...selectedKeyword.history].reverse().map((h) => (
                          <tr key={h.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-600">
                              {new Date(h.date).toLocaleDateString('pl-PL')}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`font-semibold ${getPositionColor(h.position)}`}>
                                #{h.position}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600 truncate max-w-xs">{h.url || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedKeyword.history.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 mb-2">Brak historii pomiarów</p>
                  <p className="text-sm text-gray-400">Kliknij &quot;Sprawdź&quot; aby wykonać pierwszy pomiar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Keyword Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Dodaj słowo kluczowe</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fraza kluczowa *</label>
                <input
                  type="text"
                  value={formData.keyword}
                  onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                  placeholder="np. agencja marketingowa warszawa"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Wpisz frazę, którą chcesz śledzić</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Domena *</label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="np. mojafirma.pl"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urządzenie</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, device: 'desktop' })}
                      className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                        formData.device === 'desktop'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <Monitor className="w-4 h-4" />
                      <span className="text-sm font-medium">Desktop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, device: 'mobile' })}
                      className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                        formData.device === 'mobile'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span className="text-sm font-medium">Mobile</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lokalizacja</label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pl">🇵🇱 Polska</option>
                    <option value="us">🇺🇸 USA</option>
                    <option value="de">🇩🇪 Niemcy</option>
                    <option value="uk">🇬🇧 UK</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <strong>Wskazówka:</strong> Zacznij od fraz z długiego ogona (long-tail), np.
                    &quot;usługi copywritingu dla startupów&quot; zamiast ogólnych &quot;usługi&quot;.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">
                Anuluj
              </button>
              <button
                onClick={handleAdd}
                disabled={!formData.keyword || !formData.domain}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} className="mr-2" />
                Dodaj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
