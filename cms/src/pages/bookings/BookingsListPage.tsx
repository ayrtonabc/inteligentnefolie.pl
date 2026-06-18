import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter,
  ArrowLeft,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  useWebsiteId, 
  useBookings,
  useUpdateBookingStatus,
  useDeleteBooking
} from '@/features/bookings/hooks'
import type { Booking, BookingStatus } from '@/features/bookings/types'

export function BookingsListPage() {
  const navigate = useNavigate()
  const { data: websiteId } = useWebsiteId()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('')
  const [dateFilter, setDateFilter] = useState<string>('')

  const { data: bookings = [], isLoading } = useBookings(websiteId || '', {
    status: statusFilter || undefined,
    date_from: dateFilter || undefined,
  })

  const updateStatus = useUpdateBookingStatus()
  const deleteBooking = useDeleteBooking()

  const filteredBookings = bookings.filter(b => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = 
      b.client?.first_name?.toLowerCase().includes(searchLower) ||
      b.client?.last_name?.toLowerCase().includes(searchLower) ||
      b.client?.phone?.includes(searchTerm) ||
      b.service?.name?.toLowerCase().includes(searchLower)
    return matchesSearch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">Potwierdzona</span>
      case 'completed': return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Zakończona</span>
      case 'pending': return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">Oczekująca</span>
      case 'cancelled': return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">Anulowana</span>
      case 'no_show': return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">Nieobecność</span>
      default: return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{status}</span>
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę rezerwację?')) return
    try {
      await deleteBooking.mutateAsync(id)
    } catch (error) {
      alert('Błąd podczas usuwania rezerwacji')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/panel/bookings')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kalendarz
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lista rezerwacji</h1>
            <p className="text-gray-600">Wszystkie rezerwacje w systemie</p>
          </div>
        </div>
        <Button onClick={() => navigate('/panel/bookings/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Nowa rezerwacja
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Szukaj klienta lub usługi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as BookingStatus | '')}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">Wszystkie statusy</option>
          <option value="pending">Oczekująca</option>
          <option value="confirmed">Potwierdzona</option>
          <option value="completed">Zakończona</option>
          <option value="cancelled">Anulowana</option>
        </select>
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-auto"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Klient</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Usługa</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Data i godzina</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Cena</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Brak rezerwacji pasujących do filtrów
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.client?.first_name} {booking.client?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{booking.client?.phone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: booking.service?.color }}
                      />
                      <span className="text-gray-900">{booking.service?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{booking.booking_date}</span>
                      <Clock className="w-4 h-4 ml-2" />
                      <span>{booking.start_time?.slice(0, 5)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">${booking.service?.price}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {booking.status !== 'completed' && (
                        <button
                          onClick={() => updateStatus.mutate({ id: booking.id, status: 'completed' })}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Oznacz jako ukończoną"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/panel/bookings/${booking.id}/edit`)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edytuj"
                      >
                        <span className="text-sm">Edytuj</span>
                      </button>
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Eliminar"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


