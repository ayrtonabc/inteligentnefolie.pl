import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Clock, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  useWebsiteId,
  useBookingService,
  useCreateBookingService,
  useUpdateBookingService
} from '@/features/bookings/hooks'
import type { BookingServiceFormData } from '@/features/bookings/types'

export function ServicesPage() {
  const navigate = useNavigate()
  const { data: websiteId } = useWebsiteId()
  const { data: services = [], isLoading } = useBookingServices(websiteId || '')
  const deleteService = useDeleteBookingService()

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return
    try {
      await deleteService.mutateAsync(id)
    } catch (error) {
      alert('Error al eliminar el servicio')
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
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/panel/bookings')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Wróć
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Servicios</h1>
            <p className="text-gray-600">Zarządzaj usługami dostępnymi do rezerwacji</p>
          </div>
        </div>
        <Button onClick={() => navigate('/panel/bookings/services/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Nowa usługa
        </Button>
      </div>

      {/* Services List */}
      <div className="grid gap-4">
        {services.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Brak usług</h3>
            <p className="text-gray-500 mb-4">Comienza agregando tu primer servicio</p>
            <Button onClick={() => navigate('/panel/bookings/services/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar servicio
            </Button>
          </div>
        ) : (
          services.map((service) => (
            <div 
              key={service.id} 
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: service.color }}
                >
                  {service.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-500">{service.duration_minutes} min • ${service.price}</p>
                  {service.description && (
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/panel/bookings/services/${service.id}/edit`)}
                >
                  Edytuj
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-600"
                  onClick={() => handleDelete(service.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Formulario de servicio (inline en la misma página por simplicidad)
function ServiceForm({ serviceId, onCancel }: { serviceId?: string; onCancel: () => void }) {
  const navigate = useNavigate()
  const { data: websiteId } = useWebsiteId()
  const { data: service } = useBookingService(serviceId || '')
  const createService = useCreateBookingService(websiteId || '')
  const updateService = useUpdateBookingService(serviceId || '')

  const [formData, setFormData] = useState<BookingServiceFormData>({
    name: service?.name || '',
    description: service?.description || '',
    duration_minutes: service?.duration_minutes || 30,
    price: service?.price || 0,
    color: service?.color || '#3B82F6',
    is_active: service?.is_active ?? true,
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (serviceId) {
        await updateService.mutateAsync(formData)
      } else {
        await createService.mutateAsync(formData)
      }
      onCancel()
    } catch (error) {
      alert('Błąd podczas zapisywania usługi')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
      <h3 className="text-lg font-semibold mb-4">
        {serviceId ? 'Edytuj usługę' : 'Nowa usługa'}
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Corte de cabello"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descripción del servicio"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
            <Input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              min="5"
              step="5"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
            <Input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              min="0"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="h-10 w-20 rounded border border-gray-300"
            />
            <Input
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="#3B82F6"
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <Button type="submit" disabled={isSaving} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Zapisywanie...' : 'Zapisz'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Anuluj
        </Button>
      </div>
    </form>
  )
}

// Hooks adicionales necesarios para ServicesPage
import { useBookingServices, useDeleteBookingService } from '@/features/bookings/hooks'
import { Plus, Trash2 } from 'lucide-react'

