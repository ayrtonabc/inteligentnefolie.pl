import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ImageIcon,
  Layers,
  ArrowLeft,
  UtensilsCrossed
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  useWebsiteId, 
  useMenuProducts, 
  useMenuCategories,
  useDeleteMenuProduct 
} from '@/features/menu/hooks'

export default function MenuProductListPage() {
  const navigate = useNavigate()
  const { data: websiteId } = useWebsiteId()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const { data: products = [], refetch } = useMenuProducts(websiteId || '')
  const { data: categories = [] } = useMenuCategories(websiteId || '')
  const deleteProduct = useDeleteMenuProduct()

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Usunąć produkt "${name}"?`)) return
    try {
      await deleteProduct.mutateAsync(id)
      refetch()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Bez kategorii'
  }

  const getProductImage = (product: any) => {
    if (product.images && product.images.length > 0) {
      const img = product.images[0]
      return typeof img === 'string' ? img : img?.url || img?.image_url
    }
    if (product.image_url) return product.image_url
    return null
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/restaurant')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Produkty</h1>
            <p className="text-sm text-gray-500">{filteredProducts.length} produktów</p>
          </div>
        </div>
        <Button onClick={() => navigate('/restaurant/products/new')} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Dodaj produkt
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Szukaj produktów..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white"
        >
          <option value="">Wszystkie kategorie</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Brak produktów</p>
              <p className="text-sm">Dodaj pierwszy produkt</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div 
                key={product.id}
                className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {getProductImage(product) ? (
                    <img src={getProductImage(product) || ''} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 truncate">{product.name}</p>
                    {!product.is_available && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Niedostępny</span>
                    )}
                  </div>
                  {product.category_id && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Layers className="w-3 h-3" /> {getCategoryName(product.category_id)}
                    </p>
                  )}
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900">{(product.price || 0).toFixed(2)} PLN</p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => navigate(`/restaurant/products/${product.id}/edit`)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id, product.name || '')}
                    className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}