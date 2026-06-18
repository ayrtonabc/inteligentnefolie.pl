import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  ArrowLeft,
  Edit2,
  Trash2,
  Folder,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  useWebsiteId,
  useProjectCategories,
  useCreateProjectCategory,
  useUpdateProjectCategory,
  useDeleteProjectCategory
} from '@/features/projects/hooks'
import type { ProjectCategory, ProjectCategoryFormData } from '@/features/projects/types'

export function ProjectCategoriesPage() {
  const navigate = useNavigate()
  const { data: websiteId } = useWebsiteId()
  const { data: categories = [], isLoading } = useProjectCategories(websiteId || '')
  
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ProjectCategory | null>(null)

  const deleteCategory = useDeleteProjectCategory()

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę kategorię?')) return
    try {
      await deleteCategory.mutateAsync(id)
    } catch (error) {
      alert('Błąd podczas usuwania kategorii')
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
          <Button variant="outline" size="sm" onClick={() => navigate('/portfolio')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Wróć
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kategorie</h1>
            <p className="text-gray-600">Organizuj projekty według kategorii</p>
          </div>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingCategory(null) }}>
          <Plus className="w-4 h-4 mr-2" />
          Nowa kategoria
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <CategoryForm 
          category={editingCategory}
          onCancel={() => setShowForm(false)}
          onSuccess={() => setShowForm(false)}
        />
      )}

      {/* Categories List */}
      <div className="grid gap-4">
        {categories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Brak kategorii</h3>
            <p className="text-gray-500 mb-4">Zacznij od utworzenia pierwszej kategorii</p>
            <Button onClick={() => { setShowForm(true); setEditingCategory(null) }}>
              <Plus className="w-4 h-4 mr-2" />
              Utwórz kategorię
            </Button>
          </div>
        ) : (
          categories.map((category) => (
            <div 
              key={category.id} 
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: category.color }}
                >
                  <Folder className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-500">/{category.slug}</p>
                  {category.description && (
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => { setEditingCategory(category); setShowForm(true) }}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edytuj
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-600"
                  onClick={() => handleDelete(category.id)}
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

// Formularz kategorii
function CategoryForm({ 
  category, 
  onCancel, 
  onSuccess 
}: { 
  category: ProjectCategory | null
  onCancel: () => void
  onSuccess: () => void
}) {
  const { data: websiteId } = useWebsiteId()
  const createCategory = useCreateProjectCategory(websiteId || '')
  const updateCategory = useUpdateProjectCategory(category?.id || '')

  const [formData, setFormData] = useState<ProjectCategoryFormData>({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    color: category?.color || '#3B82F6',
    is_active: category?.is_active ?? true,
    sort_order: category?.sort_order || 0,
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Nazwa jest wymagana')
      return
    }

    setIsSaving(true)
    try {
      if (category) {
        await updateCategory.mutateAsync(formData)
      } else {
        await createCategory.mutateAsync(formData)
      }
      onSuccess()
    } catch (error) {
      alert('Błąd podczas zapisywania kategorii')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {category ? 'Edytuj kategorię' : 'Nowa kategoria'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Np. Realizacje biurowe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <Input
              value={formData.slug || ''}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="desarrollo-web"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Opis</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Opis kategorii"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kolejność</label>
            <Input
              type="number"
              value={formData.sort_order || 0}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-700">Aktywna</span>
        </label>

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
