import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  UniqueIdentifier,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Save, 
  RotateCcw, 
  GripVertical,
  ChevronDown,
  ChevronRight,
  Palette,
  Type,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { pb, TENANT_ID } from '@/lib/pocketbase'
import type { MenuCategory, MenuProduct } from '@/features/menu/types'

type Device = 'mobile' | 'tablet' | 'desktop'

interface MenuCustomization {
  id?: string
  website_id: string
  category_order: string[]
  product_orders: Record<string, string[]>
  styles: {
    background_color: string
    card_bg_color: string
    text_color: string
    heading_color: string
    button_color: string
    accent_color: string
  }
  fonts: {
    family: string
    heading_size: number
    body_size: number
  }
  visibility: {
    show_prices: boolean
    show_descriptions: boolean
    show_images: boolean
    show_badges: boolean
  }
  updated_at?: string
}

interface MenuItem {
  id: string
  name: string
  type: 'category' | 'product'
  data: MenuCategory | MenuProduct
  children?: MenuItem[]
}

const DEFAULT_CUSTOMIZATION: MenuCustomization = {
  website_id: '',
  category_order: [],
  product_orders: {},
  styles: {
    background_color: '#ffffff',
    card_bg_color: '#f9fafb',
    text_color: '#374151',
    heading_color: '#111827',
    button_color: '#3b82f6',
    accent_color: '#10b981',
  },
  fonts: {
    family: 'Inter, sans-serif',
    heading_size: 16,
    body_size: 14,
  },
  visibility: {
    show_prices: true,
    show_descriptions: true,
    show_images: true,
    show_badges: true,
  },
}

const FONT_OPTIONS = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'system-ui, sans-serif', label: 'System' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
]

const DEVICE_SIZES = {
  mobile: { width: 375, label: 'Móvil' },
  tablet: { width: 768, label: 'Tablet' },
  desktop: { width: 1024, label: 'Escritorio' },
}

function SortableCategoryItem({ 
  category, 
  products, 
  customization,
  isDragging,
  onToggleExpand,
  isExpanded,
}: {
  category: MenuCategory
  products: MenuProduct[]
  customization: MenuCustomization
  isDragging: boolean
  onToggleExpand: () => void
  isExpanded: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: `category-${category.id}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-sm border-2 mb-4 transition-all ${
        isDragging ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-gray-200'
      }`}
    >
      <div className="flex items-center gap-2 p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <button
          {...attributes}
          {...listeners}
          className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </button>
        <button
          onClick={onToggleExpand}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          )}
        </button>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900" style={{ color: customization.styles.heading_color }}>
            {category.name}
          </h3>
          {category.description && customization.visibility.show_descriptions && (
            <p className="text-sm text-gray-500 mt-1">{category.description}</p>
          )}
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
          {products.length} productos
        </span>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-2">
          {products.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No hay productos en esta categoría
            </p>
          ) : (
            products.map((product) => (
              <SortableProductItem 
                key={product.id} 
                product={product} 
                customization={customization}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function SortableProductItem({ 
  product, 
  customization 
}: { 
  product: MenuProduct
  customization: MenuCustomization 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `product-${product.id}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-move ${
        isDragging ? 'bg-blue-50 border-2 border-blue-500 shadow-md' : 'bg-gray-50 hover:bg-gray-100'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-1 hover:bg-gray-200 rounded cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900 truncate" style={{ 
            fontSize: `${customization.fonts.body_size}px`,
            color: customization.styles.text_color 
          }}>
            {product.name}
          </h4>
          {customization.visibility.show_badges && (
            <div className="flex gap-1">
              {product.is_vegetarian && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">🥗 Veg</span>
              )}
              {product.is_vegan && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">🌱 Vegan</span>
              )}
              {product.is_gluten_free && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">🌾 GF</span>
              )}
              {product.is_spicy && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">🌶️ {product.spice_level}/5</span>
              )}
            </div>
          )}
        </div>
        
        {customization.visibility.show_descriptions && product.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
        )}
      </div>

      {customization.visibility.show_prices && (
        <div className="text-right shrink-0">
          <span className="font-semibold text-blue-600" style={{ 
            fontSize: `${customization.fonts.body_size}px`,
            color: customization.styles.button_color 
          }}>
            {product.currency || 'PLN'} {product.price.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  )
}

function MenuPreview({ 
  categories, 
  products, 
  customization,
  device 
}: { 
  categories: MenuCategory[]
  products: MenuProduct[]
  customization: MenuCustomization
  device: Device 
}) {
  const orderedCategories = useMemo(() => {
    if (customization.category_order.length === 0) {
      return [...categories].sort((a, b) => a.sort_order - b.sort_order)
    }
    return customization.category_order
      .map(id => categories.find(c => c.id === id))
      .filter(Boolean) as MenuCategory[]
  }, [categories, customization.category_order])

  const getProductsForCategory = (categoryId: string) => {
    const order = customization.product_orders[categoryId] || []
    const categoryProducts = products.filter(p => p.category_id === categoryId)
    
    if (order.length === 0) {
      return categoryProducts.sort((a, b) => a.sort_order - b.sort_order)
    }
    return order
      .map(id => categoryProducts.find(p => p.id === id))
      .filter(Boolean) as MenuProduct[]
  }

  const containerStyle = {
    backgroundColor: customization.styles.background_color,
    fontFamily: customization.fonts.family,
    width: DEVICE_SIZES[device].width,
    minHeight: '100%',
    maxWidth: '100%',
    margin: '0 auto',
  }

  return (
    <div className="bg-gray-200 min-h-full p-4">
      <div style={containerStyle} className="rounded-lg shadow-xl overflow-hidden">
        <div 
          className="p-6 text-center border-b"
          style={{ backgroundColor: customization.styles.card_bg_color }}
        >
          <h1 
            className="text-2xl font-bold"
            style={{ 
              color: customization.styles.heading_color,
              fontSize: `${customization.fonts.heading_size + 8}px`
            }}
          >
            🍽️ Menú del Restaurante
          </h1>
        </div>

        <div className="p-4 space-y-6">
          {orderedCategories.map((category) => {
            const categoryProducts = getProductsForCategory(category.id)
            
            return (
              <div key={category.id}>
                <div className="mb-3 pb-2 border-b-2" style={{ borderColor: customization.styles.accent_color }}>
                  <h2 
                    className="text-lg font-bold"
                    style={{ 
                      color: customization.styles.heading_color,
                      fontSize: `${customization.fonts.heading_size + 4}px`
                    }}
                  >
                    {category.name}
                  </h2>
                  {category.description && customization.visibility.show_descriptions && (
                    <p className="text-sm mt-1" style={{ color: customization.styles.text_color }}>
                      {category.description}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {categoryProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-4 rounded-xl transition-all hover:shadow-md"
                      style={{ 
                        backgroundColor: customization.styles.card_bg_color,
                        borderLeft: `4px solid ${customization.styles.accent_color}`
                      }}
                    >
                      <div className="flex gap-4">
                        {(customization.visibility.show_images && product.images?.[0]) && (
                          <div className="w-20 h-20 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                            <img 
                              src={product.images[0].url} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 
                              className="font-semibold"
                              style={{ 
                                color: customization.styles.text_color,
                                fontSize: `${customization.fonts.body_size + 2}px`
                              }}
                            >
                              {product.name}
                            </h3>
                            
                            {customization.visibility.show_prices && (
                              <span 
                                className="font-bold whitespace-nowrap"
                                style={{ 
                                  color: customization.styles.button_color,
                                  fontSize: `${customization.fonts.body_size + 1}px`
                                }}
                              >
                                {product.currency || 'PLN'} {product.price.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {customization.visibility.show_descriptions && product.description && (
                            <p 
                              className="text-sm mt-1 line-clamp-2"
                              style={{ 
                                color: customization.styles.text_color,
                                fontSize: `${customization.fonts.body_size}px`,
                                opacity: 0.8
                              }}
                            >
                              {product.description}
                            </p>
                          )}

                          {customization.visibility.show_badges && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {product.is_vegetarian && (
                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                  🥗 Vegetariano
                                </span>
                              )}
                              {product.is_vegan && (
                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                  🌱 Vegano
                                </span>
                              )}
                              {product.is_gluten_free && (
                                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                                  🌾 Sin Gluten
                                </span>
                              )}
                              {product.is_spicy && (
                                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                                  🌶️ Picante {product.spice_level}/5
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ConfigurationPanel({
  customization,
  onUpdate,
  onSave,
  onReset,
  isSaving,
  hasChanges,
}: {
  customization: MenuCustomization
  onUpdate: (updates: Partial<MenuCustomization>) => void
  onSave: () => void
  onReset: () => void
  isSaving: boolean
  hasChanges: boolean
}) {
  const [activeSection, setActiveSection] = useState<'colors' | 'fonts' | 'visibility'>('colors')

  return (
    <div className="h-full flex flex-col bg-white border-l">
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-white">
        <h2 className="font-bold text-lg text-gray-900">Configuración del Menú</h2>
        <p className="text-sm text-gray-500 mt-1">Personaliza la apariencia del menú</p>
      </div>

      <div className="flex border-b">
        <button
          onClick={() => setActiveSection('colors')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeSection === 'colors' 
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Palette className="w-4 h-4" />
          Colores
        </button>
        <button
          onClick={() => setActiveSection('fonts')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeSection === 'fonts' 
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Type className="w-4 h-4" />
          Fuentes
        </button>
        <button
          onClick={() => setActiveSection('visibility')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeSection === 'visibility' 
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {activeSection === 'visibility' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          Mostrar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeSection === 'colors' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color de Fondo
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customization.styles.background_color}
                  onChange={(e) => onUpdate({ 
                    styles: { ...customization.styles, background_color: e.target.value }
                  })}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={customization.styles.background_color}
                  onChange={(e) => onUpdate({ 
                    styles: { ...customization.styles, background_color: e.target.value }
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color de Tarjetas
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customization.styles.card_bg_color}
                  onChange={(e) => onUpdate({ 
                    styles: { ...customization.styles, card_bg_color: e.target.value }
                  })}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={customization.styles.card_bg_color}
                  onChange={(e) => onUpdate({ 
                    styles: { ...customization.styles, card_bg_color: e.target.value }
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color de Texto
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customization.styles.text_color}
                  onChange={(e) => onUpdate({ 
                    styles: { ...customization.styles, text_color: e.target.value }
                  })}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={customization.styles.text_color}
                  onChange={(e) => onUpdate({ 
                    styles: { ...customization.styles, text_color: e.target.value }
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color de Títulos
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customization.styles.heading_color}
                  onChange={(e) => onUpdate({ 
                    styles: { ...customization.styles, heading_color: e.target.value }
                  })}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={customization.styles.heading_color}
                  onChange={(e) => onUpdate({ 
                    styles: { ...customization.styles, heading_color: e.target.value }
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color de Botones/Precios
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customization.styles.button_color}
                  onChange={(e) => onUpdate({ 
                    styles: { ...customization.styles, button_color: e.target.value }
                  })}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={customization.styles.button_color}
                  onChange={(e) => onUpdate({ 
                    styles: { ...customization.styles, button_color: e.target.value }
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color de Acento
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customization.styles.accent_color}
                  onChange={(e) => onUpdate({ 
                    styles: { ...customization.styles, accent_color: e.target.value }
                  })}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={customization.styles.accent_color}
                  onChange={(e) => onUpdate({ 
                    styles: { ...customization.styles, accent_color: e.target.value }
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'fonts' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Familia de Fuente
              </label>
              <select
                value={customization.fonts.family}
                onChange={(e) => onUpdate({ 
                  fonts: { ...customization.fonts, family: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tamaño de Títulos: {customization.fonts.heading_size}px
              </label>
              <input
                type="range"
                min="12"
                max="24"
                value={customization.fonts.heading_size}
                onChange={(e) => onUpdate({ 
                  fonts: { ...customization.fonts, heading_size: parseInt(e.target.value) }
                })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tamaño de Texto: {customization.fonts.body_size}px
              </label>
              <input
                type="range"
                min="10"
                max="20"
                value={customization.fonts.body_size}
                onChange={(e) => onUpdate({ 
                  fonts: { ...customization.fonts, body_size: parseInt(e.target.value) }
                })}
                className="w-full"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2" style={{ fontFamily: customization.fonts.family }}>
                Vista Previa del Texto
              </h4>
              <p style={{ 
                fontFamily: customization.fonts.family,
                fontSize: `${customization.fonts.body_size}px`
              }}>
                Este es un ejemplo de cómo se verá el texto en el menú.
              </p>
            </div>
          </div>
        )}

        {activeSection === 'visibility' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium text-gray-900">Mostrar Precios</span>
                <p className="text-xs text-gray-500">Visible en cada producto</p>
              </div>
              <button
                onClick={() => onUpdate({ 
                  visibility: { ...customization.visibility, show_prices: !customization.visibility.show_prices }
                })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  customization.visibility.show_prices ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  customization.visibility.show_prices ? 'translate-x-6' : ''
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium text-gray-900">Mostrar Descripciones</span>
                <p className="text-xs text-gray-500">Texto explicativo de productos</p>
              </div>
              <button
                onClick={() => onUpdate({ 
                  visibility: { ...customization.visibility, show_descriptions: !customization.visibility.show_descriptions }
                })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  customization.visibility.show_descriptions ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  customization.visibility.show_descriptions ? 'translate-x-6' : ''
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium text-gray-900">Mostrar Imágenes</span>
                <p className="text-xs text-gray-500">Fotos de productos</p>
              </div>
              <button
                onClick={() => onUpdate({ 
                  visibility: { ...customization.visibility, show_images: !customization.visibility.show_images }
                })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  customization.visibility.show_images ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  customization.visibility.show_images ? 'translate-x-6' : ''
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium text-gray-900">Mostrar Badges</span>
                <p className="text-xs text-gray-500">Vegetariano, Vegano, etc.</p>
              </div>
              <button
                onClick={() => onUpdate({ 
                  visibility: { ...customization.visibility, show_badges: !customization.visibility.show_badges }
                })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  customization.visibility.show_badges ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  customization.visibility.show_badges ? 'translate-x-6' : ''
                }`} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-gray-50 space-y-2">
        <Button
          onClick={onSave}
          disabled={isSaving || !hasChanges}
          className="w-full"
          variant={hasChanges ? 'primary' : 'outline'}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Guardar Cambios
            </>
          )}
        </Button>
        
        <Button
          onClick={onReset}
          variant="outline"
          className="w-full"
        >
          <RotateCcw className="w-4 h-4" />
          Restaurar Valores Originales
        </Button>

        {hasChanges && (
          <p className="text-xs text-amber-600 text-center flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Tienes cambios sin guardar
          </p>
        )}
      </div>
    </div>
  )
}

export default function MenuPreviewCustomizer() {
  const [device, setDevice] = useState<Device>('mobile')
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [products, setProducts] = useState<MenuProduct[]>([])
  const [customization, setCustomization] = useState<MenuCustomization>({
    ...DEFAULT_CUSTOMIZATION,
    website_id: TENANT_ID,
  })
  const [originalCustomization, setOriginalCustomization] = useState<MenuCustomization | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [categoriesData, productsData, customizationData] = await Promise.allSettled([
        pb.collection('menu_categories').getFullList<MenuCategory>({
          filter: `website_id = "${TENANT_ID}"`,
        }),
        pb.collection('menu_products').getFullList<MenuProduct>({
          filter: `website_id = "${TENANT_ID}"`,
        }),
        pb.collection('menu_customizations').getFirstListItem(
          `website_id = "${TENANT_ID}"`,
        ).catch(() => null) as Promise<MenuCustomization | null>,
      ])

      const categoriesResult = categoriesData as PromiseSettledResult<MenuCategory[]>
      const productsResult = productsData as PromiseSettledResult<MenuProduct[]>
      const categoriesDataArr = categoriesResult.status === 'fulfilled' ? categoriesResult.value : []
      const productsDataArr = productsResult.status === 'fulfilled' ? productsResult.value : []

      setCategories(categoriesDataArr)
      setProducts(productsDataArr)

      const customizationResult = customizationData as PromiseSettledResult<MenuCustomization | null>
      const customization = customizationResult.status === 'fulfilled' ? customizationResult.value : null

      if (customization) {
        const loaded: MenuCustomization = {
          id: customization.id,
          website_id: customization.website_id || TENANT_ID,
          category_order: customization.category_order || categoriesDataArr.map(c => c.id),
          product_orders: customization.product_orders || {},
          styles: customization.styles || DEFAULT_CUSTOMIZATION.styles,
          fonts: customization.fonts || DEFAULT_CUSTOMIZATION.fonts,
          visibility: customization.visibility || DEFAULT_CUSTOMIZATION.visibility,
          updated_at: customization.updated_at,
        }
        setCustomization(loaded)
        setOriginalCustomization(JSON.parse(JSON.stringify(loaded)))
      } else {
        const defaultCustomization: MenuCustomization = {
          ...DEFAULT_CUSTOMIZATION,
          website_id: TENANT_ID,
          category_order: categoriesDataArr.map(c => c.id),
        }
        setCustomization(defaultCustomization)
        setOriginalCustomization(JSON.parse(JSON.stringify(defaultCustomization)))
      }

      setExpandedCategories(new Set(categoriesDataArr.map(c => c.id)))

    } catch (err) {
      console.error('Error loading menu data:', err)
      setError('Error al cargar los datos del menú')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    const activeIdStr = active.id.toString()
    const overIdStr = over.id.toString()

    if (activeIdStr.startsWith('category-') && overIdStr.startsWith('category-')) {
      const activeCategoryId = activeIdStr.replace('category-', '')
      const overCategoryId = overIdStr.replace('category-', '')

      const oldIndex = customization.category_order.indexOf(activeCategoryId)
      const newIndex = customization.category_order.indexOf(overCategoryId)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(customization.category_order, oldIndex, newIndex)
        setCustomization(prev => ({ ...prev, category_order: newOrder }))
      }
    }
  }

  const handleUpdateCustomization = (updates: Partial<MenuCustomization>) => {
    setCustomization(prev => ({ ...prev, ...updates }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      const payload = {
        website_id: TENANT_ID,
        category_order: customization.category_order,
        product_orders: customization.product_orders,
        styles: customization.styles,
        fonts: customization.fonts,
        visibility: customization.visibility,
      }

      if (customization.id) {
        await pb.collection('menu_customizations').update(customization.id, payload)
      } else {
        const created = await pb.collection('menu_customizations').create(payload)
        setCustomization(prev => ({ ...prev, id: created.id }))
      }

      setOriginalCustomization(JSON.parse(JSON.stringify(customization)))
      setSuccess('¡Cambios guardados correctamente!')
      
      setTimeout(() => setSuccess(null), 3000)

    } catch (err) {
      console.error('Error saving customization:', err)
      setError('Error al guardar los cambios')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (originalCustomization) {
      setCustomization(JSON.parse(JSON.stringify(originalCustomization)))
    }
  }

  const hasChanges = useMemo(() => {
    if (!originalCustomization) return false
    return JSON.stringify(customization) !== JSON.stringify(originalCustomization)
  }, [customization, originalCustomization])

  const getProductsForCategory = (categoryId: string) => {
    const order = customization.product_orders[categoryId] || []
    const categoryProducts = products.filter(p => p.category_id === categoryId)
    
    if (order.length === 0) {
      return categoryProducts.sort((a, b) => a.sort_order - b.sort_order)
    }
    return order
      .map(id => categoryProducts.find(p => p.id === id))
      .filter(Boolean) as MenuProduct[]
  }

  const orderedCategories = useMemo(() => {
    if (customization.category_order.length === 0) {
      return [...categories].sort((a, b) => a.sort_order - b.sort_order)
    }
    return customization.category_order
      .map(id => categories.find(c => c.id === id))
      .filter(Boolean) as MenuCategory[]
  }, [categories, customization.category_order])

  const toggleCategoryExpand = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos del menú...</p>
        </div>
      </div>
    )
  }

  if (error && categories.length === 0) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadData}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-gray-100">
      <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-xl text-gray-900">Editor Visual del Menú</h2>
          {success && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              <Check className="w-4 h-4" />
              {success}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setDevice('mobile')}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                device === 'mobile' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Móvil"
            >
              <Smartphone className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">{DEVICE_SIZES.mobile.label}</span>
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                device === 'tablet' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Tablet"
            >
              <Tablet className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">{DEVICE_SIZES.tablet.label}</span>
            </button>
            <button
              onClick={() => setDevice('desktop')}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                device === 'desktop' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Escritorio"
            >
              <Monitor className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">{DEVICE_SIZES.desktop.label}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Arrastra las categorías y productos para reordenarlos</h3>
                <p className="text-sm text-gray-500">
                  Los cambios se mostrarán en la previsualización y se guardarán al hacer clic en "Guardar Cambios"
                </p>
              </div>

              <SortableContext
                items={orderedCategories.map(c => `category-${c.id}`)}
                strategy={verticalListSortingStrategy}
              >
                {orderedCategories.map((category) => (
                  <SortableCategoryItem
                    key={category.id}
                    category={category}
                    products={getProductsForCategory(category.id)}
                    customization={customization}
                    isDragging={activeId === `category-${category.id}`}
                    onToggleExpand={() => toggleCategoryExpand(category.id)}
                    isExpanded={expandedCategories.has(category.id)}
                  />
                ))}
              </SortableContext>

              {orderedCategories.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg">
                  <p className="text-gray-500">No hay categorías disponibles</p>
                </div>
              )}
            </div>
          </DndContext>
        </div>

        <div className="w-96 border-l bg-white overflow-hidden flex-shrink-0 hidden xl:flex xl:flex-col">
          <ConfigurationPanel
            customization={customization}
            onUpdate={handleUpdateCustomization}
            onSave={handleSave}
            onReset={handleReset}
            isSaving={isSaving}
            hasChanges={hasChanges}
          />
        </div>

        <div className="xl:hidden fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => {
              const panel = document.getElementById('config-panel-mobile')
              if (panel) {
                panel.classList.toggle('hidden')
              }
            }}
            className="rounded-full w-14 h-14 shadow-lg"
          >
            <Palette className="w-6 h-6" />
          </Button>
        </div>

        <div 
          id="config-panel-mobile"
          className="xl:hidden fixed inset-0 z-40 hidden"
        >
          <div className="absolute inset-0 bg-black/50" onClick={() => {
            const panel = document.getElementById('config-panel-mobile')
            if (panel) panel.classList.add('hidden')
          }} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-hidden flex flex-col">
            <ConfigurationPanel
              customization={customization}
              onUpdate={handleUpdateCustomization}
              onSave={handleSave}
              onReset={handleReset}
              isSaving={isSaving}
              hasChanges={hasChanges}
            />
          </div>
        </div>
      </div>

      <div className="border-t bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Vista Previa en Tiempo Real</h3>
            <p className="text-sm text-gray-500">
              {DEVICE_SIZES[device].label} ({DEVICE_SIZES[device].width}px)
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {categories.length} categorías • {products.length} productos
            </div>
          </div>
        </div>
        
        <div className="mt-4 rounded-lg overflow-hidden border border-gray-200" style={{ maxHeight: '300px' }}>
          <MenuPreview
            categories={categories}
            products={products}
            customization={customization}
            device={device}
          />
        </div>
      </div>
    </div>
  )
}
