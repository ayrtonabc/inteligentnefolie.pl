import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Calendar, Clock, User, Phone, Mail, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  useWebsiteId,
  useBooking,
  useCreateBooking,
  useUpdateBooking,
  useBookingServices,
  useBookingClients,
  useCreateBookingClient,
  useAvailableSlots
} from '@/features/bookings/hooks'
import type { BookingFormData, BookingClientFormData } from '@/features/bookings/types'

export function BookingFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id

  const { data: websiteId } = useWebsiteId()
  const { data: booking } = useBooking(id || '')
  const { data: services = [] } = useBookingServices(websiteId || '')
  const { data: clients = [] } = useBookingClients(websiteId || '')
  const createBooking = useCreateBooking(websiteId || '')
  const updateBooking = useUpdateBooking(id || '')
  const createClient = useCreateBookingClient(websiteId || '')

  const [selectedService, setSelectedService] = useState<string>(booking?.service_id || '')
  const [selectedDate, setSelectedDate] = useState<string>(booking?.booking_date || new Date().toISOString().split('T')[0])
  const [selectedClient, setSelectedClient] = useState<string>(booking?.client_id || '')
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  
  const [showNewClient, setShowNewClient] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { data: availableSlots = [] } = useAvailableSlots(
    websiteId || '',
    selectedService,
    selectedDate
  )

  const [formData, setFormData] = useState<Partial<BookingFormData>>({
    status: booking?.status || 'pending',
    payment_status: booking?.payment_status || 'pending',
    client_notes: booking?.client_notes || '',
    staff_notes: booking?.staff_notes || '',
  })

  const [newClientData, setNewClientData] = useState<BookingClientFormData>({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
  })

  useEffect(() => {
    if (booking) {
      setSelectedService(booking.service_id)
      setSelectedDate(booking.booking_date)
      setSelectedClient(booking.client_id)
      setFormData({
        status: booking.status,
        payment_status: booking.payment_status,
        client_notes: booking.client_notes,
        staff_notes: booking.staff_notes,
      })
    }
  }, [booking])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedService || !selectedDate || !selectedSlot) {
      alert('Wybierz usługę, datę i godzinę')
      return
    }

    let clientId = selectedClient

    // Crear cliente nuevo si es necesario
    if (showNewClient) {
      if (!newClientData.first_name.trim()) {
        alert('El nombre del cliente es obligatorio')
        return
      }
      try {
        const newClient = await createClient.mutateAsync(newClientData)
        clientId = newClient.id
      } catch (error) {
        alert('Error al crear el cliente')
        return
      }
    }

    if (!clientId) {
      alert('Wybierz lub utwórz klienta')
      return
    }

    const [startTime, endTime] = selectedSlot.split('|')

    setIsSaving(true)
    try {
      const bookingData: BookingFormData = {
        service_id: selectedService,
        client_id: clientId,
        booking_date: selectedDate,
        start_time: startTime,
        end_time: endTime,
        ...formData as BookingFormData,
      }

      if (isEditing) {
        await updateBooking.mutateAsync(bookingData)
      } else {
        await createBooking.mutateAsync(bookingData)
      }
      navigate('/panel/bookings')
    } catch (error) {
      console.error('Error saving booking:', error)
      alert('Błąd podczas zapisywania rezerwacji')
    } finally {
      setIsSaving(false)
    }
  }

  const selectedServiceData = services.find(s => s.id === selectedService)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/panel/bookings')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Wróć
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edytuj rezerwację' : 'Nowa rezerwacja'}
            </h1>
          </div>
          <Button onClick={handleSubmit} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Zapisywanie...' : 'Zapisz'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Servicio */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Servicio y Fecha
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servicio *
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Selecciona un servicio</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.duration_minutes} min - ${service.price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha *
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {selectedService && selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horario disponible *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots.length === 0 ? (
                      <p className="text-gray-500 col-span-4">Brak dostępnych godzin dla tej daty</p>
                    ) : (
                      availableSlots.map((slot) => (
                        <button
                          key={slot.slot_start}
                          type="button"
                          onClick={() => setSelectedSlot(`${slot.slot_start}|${slot.slot_end}`)}
                          disabled={!slot.is_available}
                          className={`p-2 rounded-lg text-sm ${
                            selectedSlot === `${slot.slot_start}|${slot.slot_end}`
                              ? 'bg-blue-600 text-white'
                              : slot.is_available
                              ? 'bg-gray-100 hover:bg-gray-200'
                              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {slot.slot_start.slice(0, 5)}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cliente */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Cliente
              </h2>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setShowNewClient(!showNewClient)}
              >
                {showNewClient ? 'Wybierz istniejącego' : '+ Nowy klient'}
              </Button>
            </div>

            {showNewClient ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <Input
                      value={newClientData.first_name}
                      onChange={(e) => setNewClientData({ ...newClientData, first_name: e.target.value })}
                      placeholder="Nombre"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                    <Input
                      value={newClientData.last_name || ''}
                      onChange={(e) => setNewClientData({ ...newClientData, last_name: e.target.value })}
                      placeholder="Apellido"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      Teléfono
                    </label>
                    <Input
                      value={newClientData.phone || ''}
                      onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <Input
                      type="email"
                      value={newClientData.email || ''}
                      onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seleccionar cliente *
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Selecciona un cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.first_name} {client.last_name} {client.phone && `(${client.phone})`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Detalles adicionales */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalles adicionales</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Estado de pago
                </label>
                <select
                  value={formData.payment_status}
                  onChange={(e) => setFormData({ ...formData, payment_status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="pending">Pendiente</option>
                  <option value="partial">Parcial</option>
                  <option value="paid">Pagado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas del cliente</label>
                <textarea
                  value={formData.client_notes || ''}
                  onChange={(e) => setFormData({ ...formData, client_notes: e.target.value })}
                  placeholder="Solicitudes especiales del cliente..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas internas</label>
                <textarea
                  value={formData.staff_notes || ''}
                  onChange={(e) => setFormData({ ...formData, staff_notes: e.target.value })}
                  placeholder="Notatki dla personelu..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}


