import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ShoppingBag,
  DollarSign,
  UtensilsCrossed,
  Users,
  Plus,
  Search,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle2,
  ChefHat,
  Calendar,
  BarChart3,
  XCircle,
  ChevronRight,
  Coffee,
  Pizza,
  Wine,
  IceCream,
  QrCode,
  Settings,
  Zap,
  LayoutDashboard,
  Activity,
  Layers,
  ClipboardList,
  X,
  Hash,
  Monitor,
  Download,
  Filter,
  TrendingUp,
  Star,
  ArrowDown,
  ArrowUp,
} from 'lucide-react'
import {
  LineChart as RechartsLine,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import {
  useWebsiteId,
  useOrderStats,
  useActiveOrders,
  useMenuStats,
  useTables,
  useOrders,
  useUpdateOrderStatus,
  useUpdateItemStatus,
  useCreateTable,
  useDeleteTable,
} from '@/features/restaurant/hooks'
import type { RestaurantOrder, RestaurantTable, RestaurantTableFormData, RestaurantOrderItem } from '@/features/restaurant/types'

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: 'Nowe', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock },
  confirmed: { label: 'Potwierdzone', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: CheckCircle2 },
  preparing: { label: 'Przygotowywane', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: ChefHat },
  ready: { label: 'Gotowe', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: CheckCircle2 },
  delivered: { label: 'Dostarczone', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  completed: { label: 'Zakończone', color: 'text-gray-500', bg: 'bg-gray-100 border-gray-200', icon: CheckCircle2 },
  cancelled: { label: 'Anulowane', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: XCircle },
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
const statusLabels: Record<string, string> = {
  pending: 'Nowe',
  confirmed: 'Potwierdzone',
  preparing: 'Przygotowywane',
  ready: 'Gotowe',
  delivered: 'Dostarczone',
  completed: 'Zakończone',
  cancelled: 'Anulowane',
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pl-PL', { day: '2-digit', month: 'short' })
}

function AddTableDialog({ websiteId, onClose }: { websiteId: string; onClose: () => void }) {
  const [form, setForm] = useState<RestaurantTableFormData>({ number: '', capacity: 4, notes: '' })
  const [saving, setSaving] = useState(false)
  const createTable = useCreateTable(websiteId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.number.trim()) return
    setSaving(true)
    try {
      await createTable.mutateAsync(form)
      onClose()
    } catch {}
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Hash className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Dodaj stolik</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numer stolika *</label>
            <Input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="np. 1, 2, A1..." required autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Liczba miejsc</label>
            <select value={form.capacity} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              {[2, 4, 6, 8, 10, 12].map(n => (<option key={n} value={n}>{n} osób</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notatki</label>
            <Input value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="np. Przy oknie..." />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Anuluj</Button>
            <Button type="submit" disabled={saving || !form.number.trim()} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Dodawanie...' : 'Dodaj stolik'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function LiveRevenue() {
  const [revenue, setRevenue] = useState(0)
  const { data: allOrders = [] } = useOrders('')

  useEffect(() => {
    const calculateRevenue = () => {
      const today = new Date().toISOString().split('T')[0]
      const todayOrders = allOrders.filter(o => o.created_at.startsWith(today) && ['completed', 'delivered'].includes(o.status))
      const total = todayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
      setRevenue(total)
    }
    calculateRevenue()
    const interval = setInterval(calculateRevenue, 30000)
    return () => clearInterval(interval)
  }, [allOrders])

  return <>{revenue.toFixed(0)} zł</>
}

function QuickStats({ stats, activeOrders }: { stats: any; activeOrders: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-500/20">
        <p className="text-blue-100 text-xs font-medium">Zamówienia dziś</p>
        <p className="text-3xl font-bold mt-1">{stats?.today_orders || 0}</p>
        <p className="text-blue-100/70 text-xs mt-1">+12% vs wczoraj</p>
      </div>
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg shadow-emerald-500/20">
        <p className="text-emerald-100 text-xs font-medium">Przychód dziś</p>
        <p className="text-3xl font-bold mt-1">{(stats?.today_revenue || 0).toFixed(0)} zł</p>
        <p className="text-emerald-100/70 text-xs mt-1">+8% vs wczoraj</p>
      </div>
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-4 text-white shadow-lg shadow-amber-500/20">
        <p className="text-amber-100 text-xs font-medium">Aktywne</p>
        <p className="text-3xl font-bold mt-1">{activeOrders}</p>
        <p className="text-amber-100/70 text-xs mt-1">W trakcie</p>
      </div>
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg shadow-purple-500/20">
        <p className="text-purple-100 text-xs font-medium">Średnia</p>
        <p className="text-3xl font-bold mt-1">{(stats?.average_order_value || 0).toFixed(0)} zł</p>
        <p className="text-purple-100/70 text-xs mt-1">Za zamówienie</p>
      </div>
      <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl p-4 text-white shadow-lg shadow-rose-500/20">
        <p className="text-rose-100 text-xs font-medium">Real-time</p>
        <p className="text-3xl font-bold mt-1 text-green-300"><LiveRevenue /></p>
        <p className="text-rose-100/70 text-xs mt-1 flex items-center gap-1"><Activity className="w-3 h-3 animate-pulse" /> co 30s</p>
      </div>
    </div>
  )
}

function OrdersChart({ orders }: { orders: RestaurantOrder[] }) {
  const hourData = Array.from({ length: 24 }, (_, i) => {
    const hour = i
    const count = orders.filter(o => new Date(o.created_at).getHours() === hour).length
    return { hour, count }
  })
  const maxCount = Math.max(...hourData.map(h => h.count), 1)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Zamówienia w ciągu dnia (24h)</h3>
      </div>
      <div className="flex items-end justify-between gap-1 h-40">
        {hourData.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full rounded-t transition-all hover:opacity-80 ${item.count > maxCount * 0.7 ? 'bg-green-500' : item.count > maxCount * 0.3 ? 'bg-blue-500' : 'bg-blue-300'}`}
              style={{ height: `${Math.max((item.count / maxCount) * 100, item.count > 0 ? 8 : 2)}%` }}
              title={`${item.count} zamówień o ${item.hour}:00`}
            />
            {i % 3 === 0 && <span className="text-[10px] text-gray-400">{item.hour.toString().padStart(2, '0')}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function ActiveOrdersList({ orders, onUpdateStatus, onView }: { orders: RestaurantOrder[]; onUpdateStatus: (id: string, status: string) => void; onView: (id: string) => void }) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Aktywne zamówienia</h3>
        </div>
        <div className="text-center py-10">
          <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <p className="font-medium text-gray-900">Wszystko na bieżąco!</p>
          <p className="text-sm text-gray-500 mt-1">Brak oczekujących zamówień</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Aktywne zamówienia</h3>
        </div>
        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">{orders.length}</span>
      </div>
      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {orders.map(order => {
          const config = statusConfig[order.status] || statusConfig.pending
          const StatusIcon = config.icon
          return (
            <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${order.table_number ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                    {order.table_number || 'OS'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{order.customer_name || `Stolik ${order.table_number || '-'}`}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(order.created_at)}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.color}`}>
                  <StatusIcon className="w-3 h-3 inline mr-1" />{config.label}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                {order.items?.map((i: any) => `${i.quantity}x ${i.product_name}`).join(', ') || 'Brak pozycji'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">{order.total_amount?.toFixed(2)} zł</span>
                <div className="flex items-center gap-2">
                  {order.status === 'pending' && (
                    <button onClick={() => onUpdateStatus(order.id, 'confirmed')} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">Potwierdź</button>
                  )}
                  {order.status === 'confirmed' && (
                    <button onClick={() => onUpdateStatus(order.id, 'preparing')} className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700">Rozpocznij</button>
                  )}
                  {order.status === 'preparing' && (
                    <button onClick={() => onUpdateStatus(order.id, 'ready')} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">Gotowe</button>
                  )}
                  {order.status === 'ready' && (
                    <button onClick={() => onUpdateStatus(order.id, 'delivered')} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700">Dostarczono</button>
                  )}
                  <button onClick={() => onView(order.id)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TablesGrid({ tables, orders, onAddTable, websiteId }: { tables: RestaurantTable[]; orders: RestaurantOrder[]; onAddTable: () => void; websiteId: string }) {
  const deleteTable = useDeleteTable(websiteId)
  const activeTableIds = orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).map(o => o.table_id).filter(Boolean)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Stoliki ({tables.length})</h3>
        </div>
        <button onClick={onAddTable} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
          <Plus className="w-4 h-4" /> Dodaj
        </button>
      </div>
      {tables.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Brak stolików</p>
          <button onClick={onAddTable} className="mt-2 text-sm text-emerald-600 font-medium hover:underline">Dodaj pierwszy stolik</button>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {tables.map(table => {
            const isActive = activeTableIds.includes(table.id)
            return (
              <div key={table.id} className={`relative p-3 rounded-xl border-2 transition-all cursor-pointer ${isActive ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}>
                <button onClick={() => { if (confirm(`Usunąć stolik ${table.number}?`)) deleteTable.mutate(table.id) }} className="absolute -top-1 -right-1 w-5 h-5 bg-red-100 hover:bg-red-200 text-red-500 rounded-full flex items-center justify-center">
                  <X className="w-3 h-3" />
                </button>
                <p className="text-lg font-bold text-gray-900">{table.number}</p>
                <p className="text-xs text-gray-500">{table.capacity} osób</p>
                <div className={`w-2 h-2 rounded-full mt-1 ${isActive ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ActionBar({ navigate, activeTab }: { navigate: any; activeTab?: string }) {
  const tabs = [
    { label: 'General', icon: LayoutDashboard, path: '/restaurant', active: true, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Produkty', icon: UtensilsCrossed, path: '/restaurant/products' },
    { label: 'Kategorie', icon: Layers, path: '/restaurant/categories/new' },
    { label: 'QR Stoliki', icon: QrCode, path: '/restaurant/qr' },
    { label: 'Kuchnia', icon: ChefHat, path: '/restaurant/kitchen' },
    { label: 'Raporty', icon: BarChart3, path: '/restaurant', section: 'reports', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { label: 'Ustawienia', icon: Settings, path: '/restaurant/settings' },
    { label: 'Podgląd menu', icon: Monitor, path: '/restaurant/preview' },
  ]

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {tabs.map(tab => (
        <button
          key={tab.label}
          onClick={() => {
            if (tab.section === 'reports') {
              document.getElementById('reports-section')?.scrollIntoView({ behavior: 'smooth' })
            } else {
              navigate(tab.path)
            }
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${activeTab === tab.label
              ? (tab.color || 'bg-blue-50 text-blue-700 border-blue-200')
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-transparent'
            }`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </button>
      ))}
    </div>
  )
}

function ReportsSection({ orders }: { orders: RestaurantOrder[] }) {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('week')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [tableFilter, setTableFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')

  const filteredOrders = useMemo(() => {
    const now = new Date()
    let filtered = orders.filter(o => o.status !== 'cancelled')

    if (dateRange === 'today') {
      filtered = filtered.filter(o => new Date(o.created_at).toDateString() === now.toDateString())
    } else if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(o => new Date(o.created_at) >= weekAgo)
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(o => new Date(o.created_at) >= monthAgo)
    } else if (dateRange === 'custom' && startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59)
      filtered = filtered.filter(o => {
        const date = new Date(o.created_at)
        return date >= start && date <= end
      })
    }

    if (tableFilter !== 'all') filtered = filtered.filter(o => o.table_number === tableFilter)
    if (statusFilter !== 'all') filtered = filtered.filter(o => o.status === statusFilter)

    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [orders, dateRange, startDate, endDate, tableFilter, statusFilter])

  const stats = useMemo(() => {
    const completedOrders = filteredOrders.filter(o => o.status === 'completed')
    const totalRevenue = completedOrders.reduce((acc, o) => acc + (o.total_amount || 0), 0)
    const averageOrder = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0
    const totalOrders = filteredOrders.length

    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {}
    filteredOrders.forEach(order => {
      (order.items || []).forEach((item: RestaurantOrderItem) => {
        if (!productSales[item.product_name]) {
          productSales[item.product_name] = { name: item.product_name, quantity: 0, revenue: 0 }
        }
        productSales[item.product_name].quantity += item.quantity
        productSales[item.product_name].revenue += item.subtotal || item.product_price * item.quantity
      })
    })

    const topProducts = Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 5)

    return { totalRevenue, averageOrder, totalOrders, topProducts }
  }, [filteredOrders])

  const chartData = useMemo(() => {
    const groupedData: Record<string, { date: string; orders: number; revenue: number }> = {}
    filteredOrders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('pl-PL')
      if (!groupedData[date]) groupedData[date] = { date, orders: 0, revenue: 0 }
      groupedData[date].orders += 1
      groupedData[date].revenue += order.total_amount || 0
    })
    return Object.values(groupedData).sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split('.').reverse()
      const [dayB, monthB, yearB] = b.date.split('.').reverse()
      return new Date(`${yearA}-${monthA}-${dayA}`).getTime() - new Date(`${yearB}-${monthB}-${dayB}`).getTime()
    })
  }, [filteredOrders])

  const statusDistribution = useMemo(() => {
    const distribution: Record<string, number> = {}
    filteredOrders.forEach(order => {
      distribution[order.status] = (distribution[order.status] || 0) + 1
    })
    return Object.entries(distribution).map(([name, value]) => ({ name, value }))
  }, [filteredOrders])

  const exportToCSV = () => {
    const headers = ['Numer', 'Mesa', 'Cliente', 'Fecha', 'Estado', 'Total', 'Productos']
    const rows = filteredOrders.map(order => [
      order.id.slice(0, 8),
      order.table_number || '-',
      order.customer_name || '-',
      new Date(order.created_at).toLocaleString('pl-PL'),
      order.status,
      (order.total_amount || 0).toFixed(2),
      (order.items || []).map((item: RestaurantOrderItem) => `${item.product_name} x${item.quantity}`).join('; ')
    ])
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `restauracja-raport-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const uniqueTables = [...new Set(orders.map(o => o.table_number).filter(Boolean))]

  return (
    <div id="reports-section" className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Raporty i Statystyki</h2>
            <p className="text-sm text-gray-500">Analiza zamówień i przychodów</p>
          </div>
        </div>
        <Button onClick={exportToCSV} variant="outline" size="sm">
          <Download className="w-4 h-4" />
          Eksportuj CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Przychód</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalRevenue.toFixed(2)} zł</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Zamówień</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Średnia</p>
              <p className="text-lg font-semibold text-gray-900">{stats.averageOrder.toFixed(2)} zł</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Top Produkt</p>
              <p className="text-lg font-semibold text-gray-900 truncate">{stats.topProducts[0]?.name || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              options={[
                { value: 'today', label: 'Dzisiaj' },
                { value: 'week', label: 'Ostatni tydzień' },
                { value: 'month', label: 'Ostatni miesiąc' },
                { value: 'custom', label: 'Własny zakres' },
              ]}
              className="w-40"
            />
          </div>

          {dateRange === 'custom' && (
            <div className="flex items-center gap-2">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40" />
              <span className="text-gray-400">-</span>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40" />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <Select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Wszystkie stoły' },
                ...uniqueTables.map(table => ({ value: table, label: `Stół ${table}` }))
              ]}
              className="w-40"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Wszystkie statusy' },
              ...Object.entries(statusLabels).map(([value, label]) => ({ value, label }))
            ]}
            className="w-40"
          />

          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => setChartType('line')}
              className={`p-2 rounded-lg ${chartType === 'line' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-lg ${chartType === 'bar' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Przychód w czasie</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <RechartsLine data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} formatter={(value: number) => [`${value.toFixed(2)} zł`, 'Przychód']} />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </RechartsLine>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} formatter={(value: number) => [`${value.toFixed(2)} zł`, 'Przychód']} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Status zamówień</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                  {statusDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Najpopularniejsze produkty</h3>
        <div className="space-y-3">
          {stats.topProducts.map((product, index) => (
            <div key={product.name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-xs text-gray-500">{product.quantity} sprzedanych</p>
              </div>
              <p className="font-semibold text-gray-900">{product.revenue.toFixed(2)} zł</p>
            </div>
          ))}
          {stats.topProducts.length === 0 && (
            <p className="text-center text-gray-500 py-8">Brak danych</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Historia zamówień ({filteredOrders.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zamówienie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stół</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Klient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Suma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.slice(0, 50).map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">#{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.table_number || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.customer_name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(order.created_at).toLocaleString('pl-PL')}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">{order.total_amount?.toFixed(2) || '0.00'} zł</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length > 50 && (
          <div className="px-6 py-4 text-center text-sm text-gray-500 border-t border-gray-200">
            Pokazano 50 z {filteredOrders.length} zamówień
          </div>
        )}
        {filteredOrders.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">Brak zamówień w wybranym okresie</div>
        )}
      </div>
    </div>
  )
}

export default function RestaurantDashboard() {
  const navigate = useNavigate()
  const { data: websiteId } = useWebsiteId()
  const [searchTerm, setSearchTerm] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAddTable, setShowAddTable] = useState(false)
  const [showReports, setShowReports] = useState(false)

  const { data: stats } = useOrderStats(websiteId || '')
  const { data: allOrders = [], refetch: refetchOrders } = useOrders(websiteId || '')
  const { data: menuStats } = useMenuStats(websiteId || '')
  const { data: tables = [] } = useTables(websiteId || '')
  const updateOrderStatus = useUpdateOrderStatus(websiteId || '')

  const activeOrders = allOrders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status))

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await refetchOrders()
    setTimeout(() => setIsRefreshing(false), 800)
  }, [refetchOrders])

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try { await updateOrderStatus.mutateAsync({ id: orderId, status }) } catch {}
  }

  const breadcrumbs = [
    { label: 'Restauracja', path: '/restaurant' },
    { label: 'Panel', path: '' },
  ]

  return (
    <div className="min-h-screen bg-gray-50/80">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.label} className="flex items-center gap-2">
                  {i > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                  <span className={crumb.path ? 'text-gray-500' : 'text-blue-600 font-medium'}>{crumb.label}</span>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Szukaj zamówień..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-56" />
              </div>
              <button onClick={handleRefresh} className={`p-2 hover:bg-gray-100 rounded-lg ${isRefreshing ? 'animate-spin' : ''}`}>
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              <Button onClick={() => navigate('/restaurant/products/new')} className="bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200">
                <Plus className="w-4 h-4" /> Nowy produkt
              </Button>
            </div>
          </div>
          <ActionBar navigate={navigate} />
        </div>
      </div>

      <div className="p-6 space-y-6">
        <QuickStats stats={stats} activeOrders={activeOrders.length} />

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <OrdersChart orders={allOrders} />
            <ActiveOrdersList orders={activeOrders} onUpdateStatus={handleUpdateStatus} onView={(id) => navigate(`/restaurant/orders/${id}`)} />
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-6">
            <TablesGrid tables={tables} orders={allOrders} onAddTable={() => setShowAddTable(true)} websiteId={websiteId || ''} />

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Dziś</h3>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div><p className="text-gray-400 text-xs">Zamówień</p><p className="text-2xl font-bold">{allOrders.filter(o => o.created_at.startsWith(new Date().toISOString().split('T')[0])).length}</p></div>
                <div><p className="text-gray-400 text-xs">Done</p><p className="text-2xl font-bold text-green-400">{stats?.today_orders || 0}</p></div>
                <div><p className="text-gray-400 text-xs">Cancel</p><p className="text-2xl font-bold text-red-400">{activeOrders.length}</p></div>
              </div>
              <div className="pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-xs">Przychód</p>
                <p className="text-3xl font-bold text-emerald-400"><LiveRevenue /></p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Resumen
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Productos totales</span>
                  <span className="font-bold text-gray-900">{menuStats?.total_products || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Disponibles</span>
                  <span className="font-bold text-green-600">{menuStats?.available_products || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Mesas</span>
                  <span className="font-bold text-purple-600">{tables.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Pedidos totales</span>
                  <span className="font-bold text-amber-600">{allOrders.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ReportsSection orders={allOrders} />
      </div>

      {showAddTable && websiteId && (
        <AddTableDialog websiteId={websiteId} onClose={() => setShowAddTable(false)} />
      )}
    </div>
  )
}
