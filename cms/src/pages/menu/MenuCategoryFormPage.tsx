import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  useWebsiteId,
  useMenuCategory,
  useCreateMenuCategory,
  useUpdateMenuCategory
} from '@/features/menu/hooks'
import type { MenuCategoryFormData } from '@/features/menu/types'

export function MenuCategoryFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  
  const { data: websiteId } = useWebsiteId()
  const { data: category } = useMenuCategory(id || '')
  const createCategory = useCreateMenuCategory(websiteId || '')
  const updateCategory = useUpdateMenuCategory(id || '')
  
  const [formData, setFormData] = useState<MenuCategoryFormData>({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    image_url: category?.image_url || '',
    sort_order: category?.sort_order || 0,
    is_active: category?.is_active ?? true,
    is_featured: category?.is_featured || false,
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('El nombre es obligatorio')
      return
    }

    setIsSaving(true)
    try {
      if (isEditing) {
        await updateCategory.mutateAsync(formData)
      } else {
        await createCategory.mutateAsync(formData)
      }
      navigate('/panel/restaurant')
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Błąd podczas zapisywania kategorii')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/panel/restaurant')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Wróć
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edytuj kategorię' : 'Nowa kategoria'}
            </h1>
          </div>
          <Button onClick={handleSubmit} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Zapisywanie...' : 'Zapisz'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la categoría *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Entradas"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL)
                </label>
                <Input
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="ej: entradas"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pozostaw puste, aby wygenerować automatycznie
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción de la categoría"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de imagen
                </label>
                <div className="flex gap-2">
                  <Input
                    value={formData.image_url || ''}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="flex-1"
                  />
                  {formData.image_url && (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {!formData.image_url && (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orden
                </label>
                <Input
                  type="number"
                  value={formData.sort_order || 0}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Número menor = aparece primero
                </p>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Aktywna</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 text-yellow-600 rounded"
                  />
                  <span className="text-sm text-yellow-700">Destacada</span>
                </label>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}


