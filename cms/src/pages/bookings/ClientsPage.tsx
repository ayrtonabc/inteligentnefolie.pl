import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  useWebsiteId,
  useBookingClients,
  useCreateBookingClient,
  useUpdateBookingClient,
  useDeleteBooking
} from '@/features/bookings/hooks'
import type { BookingClient, BookingClientFormData } from '@/features/bookings/types'

export function ClientsPage() {
  const navigate = useNavigate()
  const { data: websiteId } = useWebsiteId()
  const { data: clients = [], isLoading } = useBookingClients(websiteId || '')
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<BookingClient | null>(null)

  const filteredClients = clients.filter(c => {
    const searchLower = searchTerm.toLowerCase()
    return (
      c.first_name?.toLowerCase().includes(searchLower) ||
      c.last_name?.toLowerCase().includes(searchLower) ||
      c.email?.toLowerCase().includes(searchLower) ||
      c.phone?.includes(searchTerm)
    )
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/panel/bookings')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Wróć
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600">Gestiona la base de clientes</p>
          </div>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingClient(null) }}>
          <Plus className="w-4 h-4 mr-2" />
          Nowy klient
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Form */}
      {showForm && (
        <ClientForm 
          client={editingClient}
          onCancel={() => setShowForm(false)}
          onSuccess={() => setShowForm(false)}
        />
      )}

      {/* Clients List */}
      <div className="grid gap-4">
        {filteredClients.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Brak klientów</h3>
            <p className="text-gray-500 mb-4">Comienza agregando tu primer cliente</p>
            <Button onClick={() => { setShowForm(true); setEditingClient(null) }}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar cliente
            </Button>
          </div>
        ) : (
          filteredClients.map((client) => (
            <div 
              key={client.id} 
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {client.first_name} {client.last_name}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      {client.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {client.phone}
                        </span>
                      )}
                      {client.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {client.email}
                        </span>
                      )}
                    </div>
                    {client.notes && (
                      <p className="text-sm text-gray-600 mt-2">{client.notes}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>{client.total_bookings} reservas</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="text-green-600">{client.completed_bookings} completadas</span>
                    <span className="text-red-600">{client.cancelled_bookings} canceladas</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => { setEditingClient(client); setShowForm(true) }}
                    >
                      Edytuj
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Formulario de cliente
function ClientForm({ 
  client, 
  onCancel, 
  onSuccess 
}: { 
  client: BookingClient | null
  onCancel: () => void
  onSuccess: () => void
}) {
  const { data: websiteId } = useWebsiteId()
  const createClient = useCreateBookingClient(websiteId || '')
  const updateClient = useUpdateBookingClient(client?.id || '')

  const [formData, setFormData] = useState<BookingClientFormData>({
    first_name: client?.first_name || '',
    last_name: client?.last_name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    notes: client?.notes || '',
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.first_name.trim()) {
      alert('El nombre es obligatorio')
      return
    }

    setIsSaving(true)
    try {
      if (client) {
        await updateClient.mutateAsync(formData)
      } else {
        await createClient.mutateAsync(formData)
      }
      onSuccess()
    } catch (error) {
      alert('Błąd podczas zapisywania klienta')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {client ? 'Edytuj klienta' : 'Nowy klient'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <Input
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              placeholder="Nombre"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido
            </label>
            <Input
              value={formData.last_name || ''}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              placeholder="Apellido"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <Input
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1234567890"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@ejemplo.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notas sobre el cliente..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isSaving} className="flex-1">
            <CheckCircle className="w-4 h-4 mr-2" />
            {isSaving ? 'Zapisywanie...' : 'Zapisz'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Anuluj
          </Button>
        </div>
      </form>
    </div>
  )
}

