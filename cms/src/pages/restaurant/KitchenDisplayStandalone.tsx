import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Clock, 
  ChefHat,
  CheckCircle2,
  X,
  RefreshCw,
  Monitor,
  Sun,
  Moon
} from 'lucide-react'
import { useWebsiteId, useOrders } from '@/features/restaurant/hooks'
import type { RestaurantOrder } from '@/features/restaurant/types'

const STATUS_CONFIG_DARK: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  pending: { color: 'text-red-400', bg: 'bg-red-900/30 border-red-500', icon: Clock, label: 'Nowe' },
  confirmed: { color: 'text-orange-400', bg: 'bg-orange-900/30 border-orange-500', icon: Clock, label: 'Potwierdzone' },
  preparing: { color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-500', icon: ChefHat, label: 'Przygotowywane' },
  ready: { color: 'text-green-400', bg: 'bg-green-900/30 border-green-500', icon: CheckCircle2, label: 'Gotowe' },
  completed: { color: 'text-gray-400', bg: 'bg-gray-800 border-gray-600', icon: CheckCircle2, label: 'Zakończone' },
  cancelled: { color: 'text-gray-500', bg: 'bg-gray-900 border-gray-700', icon: X, label: 'Anulowane' },
}

const STATUS_CONFIG_LIGHT: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  pending: { color: 'text-red-600', bg: 'bg-red-50 border-red-300', icon: Clock, label: 'Nowe' },
  confirmed: { color: 'text-orange-600', bg: 'bg-orange-50 border-orange-300', icon: Clock, label: 'Potwierdzone' },
  preparing: { color: 'text-blue-600', bg: 'bg-blue-50 border-blue-300', icon: ChefHat, label: 'Przygotowywane' },
  ready: { color: 'text-green-600', bg: 'bg-green-50 border-green-300', icon: CheckCircle2, label: 'Gotowe' },
  completed: { color: 'text-gray-600', bg: 'bg-gray-100 border-gray-300', icon: CheckCircle2, label: 'Zakończone' },
  cancelled: { color: 'text-gray-500', bg: 'bg-gray-200 border-gray-400', icon: X, label: 'Anulowane' },
}

export default function KitchenDisplayStandalone() {
  const navigate = useNavigate()
  const { data: websiteId } = useWebsiteId()
  const { data: allOrders = [], refetch } = useOrders(websiteId || '')
  const [selectedTable, setSelectedTable] = useState<string>('all')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
      setLastUpdate(new Date())
    }, 5000)
    return () => clearInterval(interval)
  }, [refetch])

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const filteredOrders = allOrders.filter(order => {
    if (selectedTable === 'all') return true
    return order.table_id === selectedTable || order.table_number === selectedTable
  }).filter(order => ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status))

  const activeOrders = filteredOrders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status))
  const readyOrders = filteredOrders.filter(o => o.status === 'ready')

  const tables = Array.from(new Set(
    allOrders
      .filter(o => o.table_id || o.table_number)
      .map(o => o.table_number || o.table_id)
      .filter(Boolean)
  ))

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
  }

  const getTimeSince = (dateStr: string) => {
    const minutes = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
    if (minutes < 1) return 'teraz'
    if (minutes === 1) return '1 min'
    return `${minutes} min`
  }

  const OrderCard = ({ order, compact = false }: { order: RestaurantOrder; compact?: boolean }) => {
    const config = isDarkMode ? STATUS_CONFIG_DARK[order.status] : STATUS_CONFIG_LIGHT[order.status]
    const Icon = config.icon
    const isUrgent = parseInt(getTimeSince(order.created_at)) > 5

    if (compact) {
      return (
        <div className={`p-4 rounded-xl border-2 ${config.bg} ${order.status === 'pending' ? 'animate-pulse' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Stolik {order.table_number || '-'}</span>
              {order.customer_name && (
                <span className={`px-2 py-0.5 rounded-full text-sm ${isDarkMode ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>{order.customer_name}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Icon className={`w-5 h-5 ${config.color}`} />
              <span className={`font-medium ${config.color}`}>{config.label}</span>
            </div>
          </div>
          <div className="space-y-1">
            {order.items?.slice(0, 3).map(item => (
              <div key={item.id} className={`flex justify-between text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <span><span className="font-bold">{item.quantity}x</span> {item.product_name}</span>
              </div>
            ))}
            {order.items && order.items.length > 3 && (
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>+{order.items.length - 3} więcej</span>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{formatTime(order.created_at)}</span>
            <span className={`font-bold ${isUrgent ? 'text-red-500' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {getTimeSince(order.created_at)} temu
            </span>
          </div>
        </div>
      )
    }

    return (
      <div className={`p-6 rounded-2xl border-2 ${config.bg} ${order.status === 'pending' ? 'animate-pulse' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-16 h-16 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} rounded-xl flex items-center justify-center`}>
              <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{order.table_number || '-'}</span>
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Stolik {order.table_number || 'Bez stolika'}</p>
              {order.customer_name && (
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{order.customer_name}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-6 h-6 ${config.color}`} />
              <span className={`text-xl font-bold ${config.color}`}>{config.label}</span>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {formatTime(order.created_at)} • {getTimeSince(order.created_at)} temu
            </p>
          </div>
        </div>

        <div className={`rounded-xl p-4 space-y-3 ${isDarkMode ? 'bg-white/5' : 'bg-white'}`}>
          {order.items?.map(item => (
            <div key={item.id} className="flex items-start gap-3">
              <span className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl ${isDarkMode ? 'bg-blue-500/30 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                {item.quantity}
              </span>
              <div className="flex-1">
                <p className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.product_name}</p>
                {item.notes && (
                  <p className={`text-sm ${isDarkMode ? 'text-yellow-400' : 'text-orange-600'}`}>📝 {item.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {order.notes && (
          <div className={`mt-3 p-3 rounded-lg ${isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>📋 Uwaga: {order.notes}</p>
          </div>
        )}

        <div className={`mt-4 pt-4 border-t flex justify-between items-center ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Razem:</span>
          <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{order.total_amount?.toFixed(2) || '0.00'} PLN</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className={`border-b p-4 flex items-center justify-between ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/restaurant')}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Monitor kuchni</h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {activeOrders.length} aktywnych • {readyOrders.length} gotowych • 
              Zaktualizowano {lastUpdate.toLocaleTimeString('pl-PL')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
          >
            <option value="all">Wszystkie stoliki</option>
            {tables.map(table => (
              <option key={table} value={table}>Stolik {table}</option>
            ))}
          </select>
          
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            title={isDarkMode ? 'Tryb jasny' : 'Tryb ciemny'}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button
            onClick={() => refetch()}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            title="Odśwież teraz"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleFullscreen}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium text-white"
          >
            <Monitor className="w-5 h-5" />
            {isFullscreen ? 'Zamknij' : 'Pełny ekran'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <ChefHat className={`w-24 h-24 mb-4 ${isDarkMode ? 'text-gray-500 opacity-50' : 'text-gray-400'}`} />
            <p className={`text-2xl font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Brak zamówień w tym momencie</p>
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>Nowe zamówienia pojawią się automatycznie</p>
          </div>
        ) : (
          <div className="space-y-8">
            {readyOrders.length > 0 && (
              <div>
                <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  <CheckCircle2 className="w-6 h-6" />
                  GOTOWE DO PODANIA ({readyOrders.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {readyOrders.map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </div>
            )}

            {activeOrders.length > 0 && (
              <div>
                <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  <Clock className="w-6 h-6" />
                  W PRZYGOTOWANIU ({activeOrders.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {activeOrders.map(order => (
                    <OrderCard key={order.id} order={order} compact />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`border-t p-4 flex items-center justify-between text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-white border-gray-200 text-gray-500'}`}>
        <span>🖥️ Monitor kuchni • Automatyczna aktualizacja co 5 sekund</span>
        <span>{filteredOrders.length} zamówień • {tables.length} stolików</span>
      </div>
    </div>
  )
}