import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Layers,
  Plus,
  GripVertical,
  Edit2,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  useWebsiteId,
  useMenuCategories,
  useCreateMenuCategory,
  useUpdateMenuCategory,
  useDeleteMenuCategory
} from '@/features/restaurant/hooks'

export default function CategoryFormPage() {
  const navigate = useNavigate()
  
  const { data: websiteId } = useWebsiteId()
  const { data: categories = [], refetch } = useMenuCategories(websiteId || '')
  const createCategory = useCreateMenuCategory(websiteId || '')
  const updateCategory = useUpdateMenuCategory
  const deleteCategory = useDeleteMenuCategory(websiteId || '')
  
  const [formData, setFormData] = useState({ name: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    setIsSaving(true)
    try {
      await createCategory.mutateAsync({ name: formData.name.trim() })
      setFormData({ name: '' })
      refetch()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Usunąć kategorię "${name}"?`)) return
    try {
      await deleteCategory.mutateAsync(id)
      refetch()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleEdit = (id: string, name: string) => {
    setEditingId(id)
    setEditName(name)
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return
    try {
      await updateCategory(id, websiteId || '').mutateAsync({ name: editName.trim() })
      setEditingId(null)
      refetch()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/restaurant')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Kategorie menu</h1>
            <p className="text-sm text-gray-500">{categories.length} kategorii</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-600" />
            Dodaj nową kategorię
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-4 flex gap-3">
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            placeholder="Nazwa kategorii..."
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={isSaving || !formData.name.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Dodaj
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Wszystkie kategorie
          </h2>
        </div>
        
        {categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Brak kategorii</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {categories.map((cat, index) => (
              <div 
                key={cat.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  {editingId === cat.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-48"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => handleUpdate(cat.id)}>OK</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>✕</Button>
                    </div>
                  ) : (
                    <span className="font-medium text-gray-900">{cat.name}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(cat.id, cat.name)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}