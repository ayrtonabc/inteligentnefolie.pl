import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  ChevronDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Check,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  useWebsiteId, 
  useBookingServices, 
  useBookingsForDate,
  useBookingStats,
  useUpdateBookingStatus,
  useDeleteBooking
} from '@/features/bookings/hooks'
import type { Booking } from '@/features/bookings/types'

// Días de la semana en polaco
const weekDays = ['PN', 'WT', 'ŚR', 'CZ', 'PT', 'SO', 'ND']
const monthNames = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
]

// Componente: Calendario mensual
function MonthCalendar({ 
  currentDate, 
  onDateSelect,
  selectedDate 
}: { 
  currentDate: Date
  onDateSelect: (date: Date) => void
  selectedDate: Date
}) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startingDay = firstDayOfMonth.getDay() || 7
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: startingDay - 1 }, (_, i) => i)
  
  const prevMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(month - 1)
    onDateSelect(newDate)
  }
  
  const nextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(month + 1)
    onDateSelect(newDate)
  }

  const isSelected = (day: number) => {
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === month && 
           selectedDate.getFullYear() === year
  }
  
  const isToday = (day: number) => {
    const today = new Date()
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          {monthNames[month]} {year}
        </h3>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs text-gray-400 font-medium py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map(day => (
          <button
            key={day}
            onClick={() => {
              const newDate = new Date(currentDate)
              newDate.setDate(day)
              onDateSelect(newDate)
            }}
            className={`
              aspect-square flex items-center justify-center text-sm font-medium rounded-lg transition-all
              ${isSelected(day) 
                ? 'bg-sky-500 text-white shadow-md' 
                : isToday(day)
                  ? 'bg-sky-100 text-sky-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  )
}

// Componente: Tarjeta de empleado
function EmployeeCard({ 
  name, 
  avatar, 
  color,
  isSelected,
  onToggle 
}: { 
  name: string
  avatar?: string
  color: string
  isSelected: boolean
  onToggle: () => void
}) {
  return (
    <button 
      onClick={onToggle}
      className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-gray-50 transition-colors"
    >
      <div className={`
        w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors
        ${isSelected ? 'border-sky-500 bg-sky-500' : 'border-gray-300'}
      `}>
        {isSelected && <Check className="w-3 h-3 text-white" />}
      </div>
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
        style={{ backgroundColor: color }}
      >
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>
      <span className="text-sm font-medium text-gray-700">{name}</span>
    </button>
  )
}

// Componente: Tarjeta de reserva en el horario
function BookingTimeCard({ 
  booking, 
  onClick 
}: { 
  booking: Booking
  onClick: (booking: Booking) => void 
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', badge: 'bg-sky-500' }
      case 'completed': return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-500' }
      case 'pending': return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-500' }
      case 'cancelled': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-500' }
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-400' }
    }
  }

  const colors = getStatusColor(booking.status)
  const duration = booking.service?.duration_minutes || 60

  return (
    <div 
      onClick={() => onClick(booking)}
      className={`
        relative p-4 rounded-xl border-l-4 cursor-pointer hover:shadow-md transition-all
        ${colors.bg} ${colors.border}
      `}
      style={{ borderLeftColor: booking.service?.color || '#3B82F6' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 font-medium">{booking.start_time?.slice(0, 5)}</span>
            <span className="text-[10px] text-gray-400">START</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">{booking.client?.first_name} {booking.client?.last_name}</h4>
              {booking.status === 'confirmed' && (
                <CheckCircle className="w-4 h-4 text-sky-500" />
              )}
            </div>
            <p className={`text-sm ${colors.text} font-medium`}>{booking.service?.name}</p>
            <p className="text-xs text-gray-500">({duration} min)</p>
            
            {/* Empleado asignado */}
            <div className="flex items-center gap-2 mt-2">
              <div 
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                style={{ backgroundColor: booking.service?.color || '#3B82F6' }}
              >
                {booking.service?.name?.charAt(0) || 'S'}
              </div>
              <span className="text-xs text-gray-600">{booking.service?.name || 'Serwis'}</span>
            </div>
          </div>
        </div>
        
        {/* Menú de acciones */}
        <button className="p-1 hover:bg-white/50 rounded transition-colors">
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  )
}

// Componente: Slot vacío para añadir reserva
function EmptyTimeSlot({ 
  time,
  onClick 
}: { 
  time: string
  onClick: () => void 
}) {
  return (
    <button 
      onClick={onClick}
      className="w-full p-3 border border-dashed border-gray-200 rounded-xl hover:border-sky-300 hover:bg-sky-50/30 transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center w-12">
          <span className="text-xs text-gray-400 font-medium">{time}</span>
        </div>
        <span className="text-sm text-gray-400 group-hover:text-sky-600 transition-colors">
          + Dodaj wizytę na tę godzinę
        </span>
      </div>
    </button>
  )
}

// Página principal - Zarządzanie Rezerwacjami
export function BookingsCalendarPage() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(['all'])
  
  const { data: websiteId } = useWebsiteId()
  const { data: services = [] } = useBookingServices(websiteId || '')
  const { data: stats } = useBookingStats(websiteId || '')
  
  const dateStr = currentDate.toISOString().split('T')[0]
  const { data: bookings = [], isLoading } = useBookingsForDate(websiteId || '', dateStr)
  
  const updateStatus = useUpdateBookingStatus()
  const deleteBooking = useDeleteBooking()

  // Horas de trabajo (8:00 - 20:00)
  const workingHours = Array.from({ length: 13 }, (_, i) => i + 8)

  const getBookingsForHour = (hour: number) => {
    return bookings.filter(b => {
      const bookingHour = parseInt(b.start_time?.split(':')[0] || '0')
      return bookingHour === hour
    })
  }

  const handleStatusChange = async (status: string) => {
    if (!selectedBooking) return
    try {
      await updateStatus.mutateAsync({ id: selectedBooking.id, status })
      setSelectedBooking(null)
    } catch (error) {
      alert('Błąd podczas aktualizacji statusu')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę rezerwację?')) return
    try {
      await deleteBooking.mutateAsync(id)
      setSelectedBooking(null)
    } catch (error) {
      alert('Błąd podczas usuwania rezerwacji')
    }
  }

  // Mock de empleados (en producción vendrían de la API)
  const employees = [
    { id: 'all', name: 'Wszyscy', color: '#3B82F6' },
    { id: '1', name: 'Marek Nowak', color: '#60A5FA' },
    { id: '2', name: 'Alicja Serwis', color: '#F472B6' },
  ]

  const toggleEmployee = (id: string) => {
    if (id === 'all') {
      setSelectedEmployees(['all'])
    } else {
      const newSelection = selectedEmployees.filter(e => e !== 'all')
      if (selectedEmployees.includes(id)) {
        setSelectedEmployees(newSelection.filter(e => e !== id))
      } else {
        setSelectedEmployees([...newSelection, id])
      }
    }
  }

  const weekDayName = currentDate.toLocaleDateString('pl-PL', { weekday: 'long' })
  const formattedDate = currentDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })

  return (
    <div className="p-8 bg-[#F8F9FB] min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Zarządzanie Rezerwacjami</h1>
            <p className="text-gray-600">
              Przeglądaj, edytuj i dodawaj nowe wizyty. Utrzymaj pełną kontrolę nad kalendarzem Twojego biznesu.
            </p>
          </div>
          
          {/* Filtros de tiempo */}
          <div className="flex items-center gap-1 bg-white rounded-full p-1 border border-gray-200 shadow-sm">
            <button
              onClick={() => setCurrentDate(new Date())}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                viewMode === 'day' && currentDate.toDateString() === new Date().toDateString()
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Dzisiaj
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                viewMode === 'week' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tydzień
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                viewMode === 'month' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Miesiąc
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-sky-600" />
              </div>
              <span className="text-xs font-medium text-sky-600 bg-sky-50 px-2 py-1 rounded-full">+12%</span>
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Dziś</p>
            <p className="text-3xl font-bold text-gray-900">{stats.today_bookings || 0}</p>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Norma</span>
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Ten tydzień</p>
            <p className="text-3xl font-bold text-gray-900">{stats.this_week_bookings || 0}</p>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Stabilnie</span>
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Potwierdzone</p>
            <p className="text-3xl font-bold text-gray-900">{stats.confirmed_bookings || 0}</p>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Uwaga</span>
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Oczekujące</p>
            <p className="text-3xl font-bold text-gray-900">{stats.pending_bookings || 0}</p>
          </div>
        </div>
      )}

      {/* Layout principal: Calendario + Horario */}
      <div className="grid grid-cols-12 gap-6">
        {/* Columna izquierda: Calendario y Empleados */}
        <div className="col-span-4 space-y-6">
          {/* Calendario */}
          <MonthCalendar 
            currentDate={currentDate}
            selectedDate={currentDate}
            onDateSelect={setCurrentDate}
          />
          
          {/* Empleados */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Pracownicy</h3>
            <div className="space-y-1">
              {employees.map(emp => (
                <EmployeeCard
                  key={emp.id}
                  name={emp.name}
                  color={emp.color}
                  isSelected={selectedEmployees.includes(emp.id)}
                  onToggle={() => toggleEmployee(emp.id)}
                />
              ))}
            </div>
          </div>
          
          {/* Botón Nowa rezerwacja */}
          <Button 
            onClick={() => navigate('new')}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-full py-6 text-base font-medium shadow-lg shadow-sky-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nowa Rezerwacja
          </Button>
        </div>
        
        {/* Columna derecha: Horario del día */}
        <div className="col-span-8">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Header del horario */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Harmonogram Dnia — {weekDayName.charAt(0).toUpperCase() + weekDayName.slice(1)}, {formattedDate}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Filtrowanie:</span>
                <span className="text-sm font-medium text-sky-600">Aktywne</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            
            {/* Línea de tiempo */}
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                </div>
              ) : (
                workingHours.map(hour => {
                  const hourBookings = getBookingsForHour(hour)
                  const hourStr = `${hour.toString().padStart(2, '0')}:00`
                  
                  return (
                    <div key={hour} className="flex gap-4">
                      {/* Hora */}
                      <div className="w-16 flex flex-col items-end pt-3">
                        <span className="text-sm font-medium text-gray-500">{hourStr}</span>
                        <span className="text-[10px] text-gray-400">START</span>
                      </div>
                      
                      {/* Contenido */}
                      <div className="flex-1 space-y-2">
                        {hourBookings.length > 0 ? (
                          hourBookings.map(booking => (
                            <BookingTimeCard
                              key={booking.id}
                              booking={booking}
                              onClick={setSelectedBooking}
                            />
                          ))
                        ) : (
                          <EmptyTimeSlot 
                            time={hourStr}
                            onClick={() => navigate('new')}
                          />
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
          
          {/* Footer card con mensaje */}
          <div className="mt-4 bg-gradient-to-r from-sky-500 to-sky-600 rounded-2xl p-6 text-white flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-lg mb-1">Twój dzień wygląda świetnie!</h4>
              <p className="text-sky-100 text-sm">
                Masz 85% obłożenia terminów. Zostały 3 wolne sloty po godzinie 16:00.
              </p>
            </div>
            <button className="px-6 py-3 bg-white text-sky-600 rounded-full font-medium text-sm hover:bg-sky-50 transition-colors shadow-lg">
              Zobacz pełny raport
            </button>
          </div>
        </div>
      </div>

      {/* Modal de detalle de reserva */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Szczegóły rezerwacji</h3>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: selectedBooking.service?.color || '#3B82F6' }}
                >
                  {selectedBooking.client?.first_name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedBooking.client?.first_name} {selectedBooking.client?.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{selectedBooking.client?.phone}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Usługa</p>
                  <p className="font-medium text-gray-900">{selectedBooking.service?.name}</p>
                  <p className="text-sm text-gray-500">{selectedBooking.service?.duration_minutes} min</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Data i godzina</p>
                  <p className="font-medium text-gray-900">{selectedBooking.booking_date}</p>
                  <p className="text-sm text-gray-500">
                    {selectedBooking.start_time?.slice(0, 5)} - {selectedBooking.end_time?.slice(0, 5)}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                  selectedBooking.status === 'confirmed' ? 'bg-sky-100 text-sky-700' :
                  selectedBooking.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                  selectedBooking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  selectedBooking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {selectedBooking.status === 'confirmed' && <CheckCircle className="w-4 h-4" />}
                  {selectedBooking.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                  {selectedBooking.status === 'pending' && <Clock className="w-4 h-4" />}
                  {selectedBooking.status === 'cancelled' && <XCircle className="w-4 h-4" />}
                  {selectedBooking.status}
                </span>
              </div>
              
              {selectedBooking.client_notes && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Notatki klienta</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedBooking.client_notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => navigate(`${selectedBooking.id}/edit`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edytuj
              </Button>
              {selectedBooking.status !== 'completed' && selectedBooking.status !== 'cancelled' && (
                <>
                  <Button 
                    variant="outline"
                    className="flex-1 text-emerald-600 hover:bg-emerald-50"
                    onClick={() => handleStatusChange('completed')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Zakończ
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 text-red-600 hover:bg-red-50"
                    onClick={() => handleStatusChange('cancelled')}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Anuluj
                  </Button>
                </>
              )}
              <Button 
                variant="outline"
                className="px-3 text-red-600 hover:bg-red-50"
                onClick={() => handleDelete(selectedBooking.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


