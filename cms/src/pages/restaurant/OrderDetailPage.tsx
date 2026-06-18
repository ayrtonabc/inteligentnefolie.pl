import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Printer, Download, Clock, User, MapPin, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useOrder } from '@/features/restaurant/hooks'
import { Receipt } from '@/components/restaurant/Receipt'

const statusLabels: Record<string, string> = {
  pending: 'Nowe',
  confirmed: 'Potwierdzone',
  preparing: 'Przygotowywane',
  ready: 'Gotowe',
  delivered: 'Dostarczone',
  completed: 'Zakończone',
  cancelled: 'Anulowane'
}

const paymentLabels: Record<string, string> = {
  pending: 'Oczekuje',
  paid: 'Opłacone',
  failed: 'Niepowodzenie',
  refunded: 'Zwrócone'
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: order, isLoading } = useOrder(id || '')
  const [showReceipt, setShowReceipt] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Zamówienie nie znalezione</p>
        <Link to="/restaurant" className="text-blue-600 hover:underline mt-2 inline-block">
          Wróć do listy
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Link to="/restaurant">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Zamówienie #{order.id.slice(0, 8)}
              </h1>
              <p className="text-sm text-gray-500">
                {new Date(order.created_at).toLocaleString('pl-PL')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowReceipt(!showReceipt)}
            >
              <Printer className="w-4 h-4" />
              {showReceipt ? 'Ukryj paragon' : 'Pokaż paragon'}
            </Button>
          </div>
        </div>
      </div>

      {showReceipt && (
        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <Receipt order={order} />
          </div>
        </div>
      )}

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Informacje</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Klient</p>
                  <p className="font-medium text-gray-900">{order.customer_name || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Stolik</p>
                  <p className="font-medium text-gray-900">{order.table_number || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    order.status === 'completed' ? 'bg-green-100 text-green-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Płatność</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status płatności</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    order.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                    order.payment_status === 'failed' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {paymentLabels[order.payment_status] || order.payment_status}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Suma całkowita</p>
                <p className="text-3xl font-bold text-gray-900">{order.total_amount?.toFixed(2)} zł</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Pozycje zamówienia</h3>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produkt</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ilość</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cena</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Suma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(order.items || []).map((item: any, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.product_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">{item.product_price?.toFixed(2)} zł</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                    {(item.subtotal || item.product_price * item.quantity)?.toFixed(2)} zł
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-6 py-3 text-right text-sm text-gray-500">Suma brutna:</td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{order.subtotal?.toFixed(2)} zł</td>
              </tr>
              <tr>
                <td colSpan={3} className="px-6 py-3 text-right text-sm text-gray-500">VAT:</td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{order.tax_amount?.toFixed(2)} zł</td>
              </tr>
              <tr className="border-t-2 border-gray-200">
                <td colSpan={3} className="px-6 py-3 text-right text-base font-semibold text-gray-900">Total:</td>
                <td className="px-6 py-3 text-right text-lg font-bold text-gray-900">{order.total_amount?.toFixed(2)} zł</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {order.notes && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Notatki</h3>
            <p className="text-sm text-gray-600">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
