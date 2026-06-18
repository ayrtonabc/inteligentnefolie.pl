import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, MapPin, Clock, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useWebsiteId, useMenuCategories, useMenuProducts } from '@/features/menu/hooks'

export function MenuPreviewPage() {
  const navigate = useNavigate()
  const { data: websiteId } = useWebsiteId()
  const { data: categories = [] } = useMenuCategories(websiteId || '', { is_active: true })
  const { data: products = [] } = useMenuProducts(websiteId || '', { is_available: true })

  const getProductsForCategory = (categoryId: string) => {
    return products.filter(p => p.category_id === categoryId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/panel/restaurant')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Wróć do edytora
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Podgląd menu</h1>
              <p className="text-sm text-gray-500">Así verán tus clientes el menú</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => window.open('/menu', '_blank')}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Zobacz na żywo
          </Button>
        </div>
      </div>

      {/* Menu Preview */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Restaurant Header */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="h-48 bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-2">Tu Restaurante</h2>
              <p className="text-white/90">Menú digital</p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>Dirección del restaurante</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>+1 234 567 890</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Abierto ahora</span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              className="px-4 py-2 bg-white rounded-full shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap"
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu Content */}
        <div className="space-y-8">
          {categories.map((category) => {
            const categoryProducts = getProductsForCategory(category.id)
            if (categoryProducts.length === 0) return null

            return (
              <div key={category.id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-4 mb-6">
                  {category.image_url && (
                    <img 
                      src={category.image_url} 
                      alt={category.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                    {category.description && (
                      <p className="text-gray-600">{category.description}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {categoryProducts.map((product) => (
                    <div 
                      key={product.id} 
                      className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-24 h-24 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                        {product.primary_image?.url ? (
                          <img 
                            src={product.primary_image.url} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            Sin imagen
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">{product.name}</h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {product.short_description || product.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {product.is_vegetarian && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Vegetariano</span>
                              )}
                              {product.is_vegan && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Vegano</span>
                              )}
                              {product.is_gluten_free && (
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Sin gluten</span>
                              )}
                              {product.is_spicy && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Picante</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-bold text-lg text-gray-900">${product.price}</div>
                            {product.compare_price && (
                              <div className="text-sm text-gray-400 line-through">
                                ${product.compare_price}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 Tu Restaurante. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}


