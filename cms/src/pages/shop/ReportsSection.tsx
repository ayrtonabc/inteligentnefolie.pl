import { useMemo } from 'react'
import {
  BarChart3, DollarSign, ShoppingCart,
  Star, Package, ArrowDownRight,
  Eye
} from 'lucide-react'
import type { ShopProduct, ShopOrder, ShopReview, ShopStats } from '@/features/shop/types'
import { formatPrice } from '@/features/shop/types'

interface ReportsProps {
  products: ShopProduct[]
  orders: ShopOrder[]
  reviews: ShopReview[]
  stats: ShopStats | null
}

function StatCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: any }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
      <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center">
        <Icon size={24} className="text-sky-600" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

export default function ReportsSection({ products, orders, reviews, stats }: ReportsProps) {
  const metrics = useMemo(() => {
    const paid = orders.filter(o => o.payment_status === 'paid')
    const totalRevenue = paid.reduce((s, o) => s + o.total, 0)
    const avgOrderValue = paid.length > 0 ? Math.round(totalRevenue / paid.length) : 0
    const cancelledRate = orders.length > 0
      ? Math.round((orders.filter(o => o.status === 'cancelled').length / orders.length) * 100)
      : 0
    const avgRating = reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0'

    const pendingRevenue = orders.filter(o => o.status === 'pending' || o.status === 'processing').reduce((s, o) => s + o.total, 0)

    const allItems = orders.flatMap(o => o.items || [])
    const avgItemsPerOrder = paid.length > 0 ? (allItems.reduce((s, item) => s + ((item as any).quantity || (item as any).qty || 0), 0) / paid.length).toFixed(1) : '0.0'

    const topProducts = [...products]
      .sort((a, b) => {
        const aSales = orders.filter(o => o.items?.some(i => ((i as any).product_name || (i as any).name) === a.name)).length
        const bSales = orders.filter(o => o.items?.some(i => ((i as any).product_name || (i as any).name) === b.name)).length
        return bSales - aSales
      })
      .slice(0, 5)
      .map(p => ({
        ...p,
        salesCount: orders.filter(o => o.items?.some(i => ((i as any).product_name || (i as any).name) === p.name)).length,
      }))

    const monthlyRevenueData: { month: string; revenue: number; orders: number }[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleDateString('pl-PL', { month: 'short' })
      const monthOrders = orders.filter(o => {
        if (!o.created) return false
        const od = new Date(o.created)
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear()
      })
      monthlyRevenueData.push({
        month: label,
        revenue: monthOrders.reduce((s, o) => s + o.total, 0),
        orders: monthOrders.length,
      })
    }

    const maxRevenue = Math.max(...monthlyRevenueData.map(d => d.revenue), 1)
    
    const topRevenue = Math.max(...monthlyRevenueData.filter(d => d.revenue > 0).map(d => d.revenue), 1)
    const effectiveMax = topRevenue || maxRevenue

    return { totalRevenue, avgOrderValue, cancelledRate, avgRating, pendingRevenue, avgItemsPerOrder, topProducts, monthlyRevenueData, maxRevenue: effectiveMax }
  }, [products, orders, reviews])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Średnia ilość / zam." value={`${metrics.avgItemsPerOrder} szt.`}
          icon={Package} />
        <StatCard title="Średnia wartość" value={formatPrice(metrics.avgOrderValue)}
          icon={DollarSign} />
        <StatCard title="Anulowane" value={`${metrics.cancelledRate}%`}
          icon={ArrowDownRight} />
        <StatCard title="Oczekujące" value={formatPrice(metrics.pendingRevenue)}
          icon={ShoppingCart} />
        <StatCard title="Ocena sklepu" value={`★ ${metrics.avgRating}`}
          icon={Star} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-500" />Przychody miesięczne
            </h3>
            <p className="text-xs text-gray-500 mt-1">Ostatnie 6 miesięcy</p>
          </div>
          <div className="p-6">
            <div className="flex items-end gap-2 h-40">
              {metrics.monthlyRevenueData.map((d, i) => {
                const barHeight = d.revenue > 0 ? Math.max(10, (d.revenue / metrics.maxRevenue) * 100) : 0
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-gray-600">
                      {d.revenue > 0 ? formatPrice(d.revenue) : '-'}
                    </span>
                    <div 
                      className={`w-full rounded-t-lg transition-all ${d.revenue > 0 ? 'bg-sky-500' : 'bg-gray-100'}`}
                      style={{ height: `${barHeight}%`, minHeight: d.revenue > 0 ? '8px' : '2px' }} 
                    />
                    <span className="text-[10px] text-gray-400">{d.month}</span>
                    <span className="text-[10px] text-gray-400">{d.orders} zam.</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-violet-500" />Najczęściej odwiedzane produkty
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {metrics.topProducts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Brak danych</p>
            ) : metrics.topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={p.images?.[0] || '/placeholder.png'} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-gray-700 truncate block">{p.name}</span>
                    <span className="text-[10px] text-gray-400">{formatPrice(p.price)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-violet-500">
                  <Eye className="w-3 h-3" />
                  <span className="text-xs font-semibold">{p.salesCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-sky-500" />Najczęściej kupowane produkty
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {metrics.topProducts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Brak danych</p>
          ) : metrics.topProducts.map((p, i) => (
            <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors">
              <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                <img src={p.images?.[0] || '/placeholder.png'} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400">#{i + 1}</span>
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                </div>
                <p className="text-xs text-gray-500">{formatPrice(p.price)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{p.salesCount} szt.</p>
                <p className="text-[10px] text-gray-400">sprzedanych</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
