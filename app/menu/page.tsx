'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { pb, TENANT_ID } from '@/lib/pocketbase'
import type { MenuProduct, MenuCategory } from '@/features/restaurant/types'
import SchemaOrg from './components/SchemaOrg'
import DishDetailModal from './components/DishDetailModal'

interface CartItem {
  product: MenuProduct
  quantity: number
}

interface TableSelection {
  id: string
  number: string
}

const TABLE_PARAM_REGEX = /^\d{1,4}$/

const CART_STORAGE_KEY = 'restaurant_cart'

export default function RestaurantMenu() {
  const searchParams = useSearchParams()
  const tableParam = searchParams.get('table')
  
  const [websiteId] = useState(TENANT_ID)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [products, setProducts] = useState<MenuProduct[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [tables, setTables] = useState<TableSelection[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState<string>('')
  
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash')
  const [tableNote, setTableNote] = useState('')
  const [activeProduct, setActiveProduct] = useState<MenuProduct | null>(null)
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [tableError, setTableError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [websiteId])

  useEffect(() => {
    if (tableParam) {
      if (TABLE_PARAM_REGEX.test(tableParam)) {
        setSelectedTable(tableParam)
        setTableError(null)
        sessionStorage.setItem('selected_table', tableParam)
      } else {
        setTableError('Nieprawidłowy numer stolika')
      }
    } else {
      const storedTable = sessionStorage.getItem('selected_table')
      if (storedTable) {
        setSelectedTable(storedTable)
      }
    }
  }, [tableParam])

  useEffect(() => {
    const storedCart = sessionStorage.getItem(CART_STORAGE_KEY)
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart)
        if (Array.isArray(parsed)) {
          setCart(parsed)
        }
      } catch {
        console.error('Error parsing stored cart')
      }
    }
  }, [])

  useEffect(() => {
    if (cart.length > 0) {
      sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    }
  }, [cart])

  const loadData = async () => {
    try {
      const [cats, prods, tabs] = await Promise.all([
        pb.collection('menu_categories').getFullList({
          filter: `website_id = "${websiteId}" && is_active = true`,
          sort: 'sort_order'
        }),
        pb.collection('menu_products').getFullList({
          filter: `website_id = "${websiteId}" && is_available = true`,
          sort: 'sort_order'
        }),
        pb.collection('restaurant_tables').getFullList({
          filter: `website_id = "${websiteId}" && is_active = true`,
          sort: 'number'
        })
      ])
      
      setCategories(cats as unknown as MenuCategory[])
      setProducts(prods as unknown as MenuProduct[])
      setTables(tabs.map(t => ({ id: (t as any).id, number: (t as any).number })))
      
      if (cats.length > 0) {
        setActiveCategory((cats[0] as any).id)
      }
    } catch (error) {
      console.error('Error loading menu:', error)
    }
  }

  const filteredProducts = products.filter(p => p.category_id === activeCategory)

  const addToCart = useCallback((product: MenuProduct, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { product, quantity }]
    })
  }, [])

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta
          return newQty > 0 ? { ...item, quantity: newQty } : item
        }
        return item
      }).filter(item => item.quantity > 0)
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }, [])

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const generateOrderNumber = () => {
    const now = new Date()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `#${now.getHours()}${now.getMinutes()}${random}`
  }

  const submitOrder = async () => {
    if (cart.length === 0) return
    
    if (!selectedTable) {
      setTableError('Wybierz stolik, aby złożyć zamówienie')
      return
    }
    
    setIsSubmitting(true)
    try {
      const table = tables.find(t => t.id === selectedTable)
      const orderNum = generateOrderNumber()
      setOrderNumber(orderNum)
      
      const order = await pb.collection('restaurant_orders').create({
        website_id: websiteId,
        table_id: selectedTable,
        table_number: table?.number || selectedTable,
        customer_name: customerName,
        customer_phone: customerPhone,
        status: 'pending',
        payment_status: 'pending',
        payment_method: paymentMethod,
        subtotal: cartTotal,
        tax_amount: 0,
        total_amount: cartTotal,
        source: 'menu',
        order_number: orderNum,
        notes: tableNote,
      })

      for (const item of cart) {
        await pb.collection('restaurant_order_items').create({
          order_id: order.id,
          product_id: item.product.id,
          product_name: item.product.name,
          product_price: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity,
          status: 'pending'
        })
      }

      setCart([])
      sessionStorage.removeItem(CART_STORAGE_KEY)
      setIsCartOpen(false)
      setOrderSuccess(true)
      setTimeout(() => setOrderSuccess(false), 5000)
    } catch (error) {
      console.error('Error submitting order:', error)
      alert('Błąd podczas składania zamówienia')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenDetails = (product: MenuProduct) => {
    setActiveProduct(product)
  }

  const handleCloseDetails = () => {
    setActiveProduct(null)
  }

  const handleAddFromDetails = (product: MenuProduct, quantity: number) => {
    addToCart(product, quantity)
    setActiveProduct(null)
  }

  const badgeStyle = (color: string) => {
    const styles: Record<string, string> = {
      vegetarian: 'bg-green-100 text-green-700',
      vegan: 'bg-green-100 text-green-700',
      gluten: 'bg-amber-100 text-amber-700',
      spicy: 'bg-red-100 text-red-700'
    }
    return styles[color] || ''
  }

  const getSpicyLevel = (level: number) => '🌶️'.repeat(level)

  const currentCategory = categories.find(c => c.id === activeCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      <SchemaOrg
        restaurantName="Restauracja"
        menuUrl={typeof window !== 'undefined' ? window.location.href : ''}
        categories={categories}
        products={products}
        cuisine="Polska"
      />
      
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">🍽️ Karta Menu</h1>
                <p className="text-sm text-gray-500">Wybierz i zamów</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Twoje zamówienie</div>
                <div className="font-bold text-blue-600">{cartCount} pozycji</div>
              </div>
            </div>
            
            {tableError && (
              <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                ⚠️ {tableError}
              </div>
            )}
            
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Stolik:</label>
              <select 
                value={selectedTable}
                onChange={(e) => {
                  setSelectedTable(e.target.value)
                  setTableError(null)
                  if (e.target.value) {
                    sessionStorage.setItem('selected_table', e.target.value)
                  }
                }}
                className="w-full px-4 py-3 bg-gray-100 rounded-xl font-medium text-gray-900 border-0 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Wybierz stolik...</option>
                {tables.map(t => (
                  <option key={t.id} value={t.id}>
                    Stolik {t.number}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <div className="bg-white border-b sticky top-[140px] z-30">
          <div className="max-w-2xl mx-auto px-4">
            <div className="flex overflow-x-auto gap-2 py-3 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <main className="max-w-2xl mx-auto px-4 py-6 pb-28">
          {currentCategory && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{currentCategory.name}</h2>
              {currentCategory.description && (
                <p className="text-gray-500 mt-1">{currentCategory.description}</p>
              )}
              <div className="w-12 h-1 bg-blue-600 mt-2 rounded-full"></div>
            </div>
          )}

          <div className="space-y-4">
            {filteredProducts.map(product => {
              const inCart = cart.find(item => item.product.id === product.id)
              return (
                <div 
                  key={product.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  <div className="flex">
                    <div className="w-28 h-28 flex-shrink-0 bg-gray-100">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-blue-50 to-blue-100">
                          🍽️
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      </div>
                      
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {product.short_description || product.description || ''}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {product.is_vegetarian && (
                          <span className={`px-2 py-0.5 text-xs rounded-full ${badgeStyle('vegetarian')}`}>
                            🌿 Weg
                          </span>
                        )}
                        {product.is_vegan && (
                          <span className={`px-2 py-0.5 text-xs rounded-full ${badgeStyle('vegan')}`}>
                            🌱 Veg
                          </span>
                        )}
                        {product.is_gluten_free && (
                          <span className={`px-2 py-0.5 text-xs rounded-full ${badgeStyle('gluten')}`}>
                            🌾 Bez glutenu
                          </span>
                        )}
                        {product.is_spicy && product.spice_level && product.spice_level > 0 && (
                          <span className={`px-2 py-0.5 text-xs rounded-full ${badgeStyle('spicy')}`}>
                            {getSpicyLevel(product.spice_level)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-bold text-blue-600">
                          {product.price.toFixed(2)} zł
                        </span>
                        
                        {inCart ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(product.id, -1)}
                              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 font-bold"
                            >
                              −
                            </button>
                            <span className="font-bold text-gray-900 w-6 text-center">
                              {inCart.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(product.id, 1)}
                              className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 font-bold"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(product.id)}
                              className="text-xs text-red-500 hover:underline ml-2"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            {product.show_details && (
                              <button
                                onClick={() => handleOpenDetails(product)}
                                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                              >
                                Ver más
                              </button>
                            )}
                            <button
                              onClick={() => addToCart(product)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                              ➕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-lg font-medium">Brak produktów</p>
                <p className="text-sm mt-1">Dodaj produkty w tej kategorii</p>
              </div>
            )}
          </div>
        </main>

        {cart.length > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-4 rounded-full shadow-lg font-bold flex items-center gap-3 hover:bg-blue-700 transition-all z-50 animate-bounceIn"
          >
            <span className="text-xl">🛒</span>
            <span>Zamówienie ({cartCount})</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">
              {cartTotal.toFixed(2)} zł
            </span>
          </button>
        )}

        <DishDetailModal
          product={activeProduct}
          isOpen={!!activeProduct}
          onClose={handleCloseDetails}
          onAddToCart={handleAddFromDetails}
        />

        {isCartOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <div 
              className="bg-white w-full max-w-2xl mx-auto rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Twoje zamówienie</h2>
                  <p className="text-sm text-gray-500">
                    Stolik {tables.find(t => t.id === selectedTable)?.number || '-'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto">
                {cart.map(item => (
                  <div key={item.product.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.product.price.toFixed(2)} zł × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold"
                      >
                        −
                      </button>
                      <span className="font-bold w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                      <span className="font-bold text-blue-600 w-20 text-right">
                        {(item.product.price * item.quantity).toFixed(2)} zł
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <input
                  type="text"
                  placeholder="Twoje imię (opcjonalne)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0"
                />
                <input
                  type="tel"
                  placeholder="Numer telefonu (opcjonalne)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0"
                />
                <textarea
                  placeholder="Uwagi do zamówienia (np. bez cebuli)"
                  value={tableNote}
                  onChange={(e) => setTableNote(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0 resize-none"
                  rows={2}
                />
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Metoda płatności:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">💵</div>
                    <div className={`font-medium ${paymentMethod === 'cash' ? 'text-blue-600' : 'text-gray-700'}`}>
                      Gotówka
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">💳</div>
                    <div className={`font-medium ${paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-700'}`}>
                      Karta
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-4 border-t-2 border-gray-200">
                <span className="text-lg font-bold">Suma:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {cartTotal.toFixed(2)} zł
                </span>
              </div>

              <button
                onClick={submitOrder}
                disabled={isSubmitting || !selectedTable}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
                  isSubmitting || !selectedTable
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Wysyłanie...' : '✅ Złóż zamówienie'}
              </button>
              
              {!selectedTable && (
                <p className="text-center text-sm text-red-500 mt-2">
                  Wybierz stolik, aby kontynuować
                </p>
              )}
            </div>
          </div>
        )}

        {orderSuccess && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6">
            <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full animate-bounceIn">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Zamówienie przyjęte!
              </h3>
              <p className="text-gray-600 mb-4">
                Numer zamówienia: <span className="font-bold">{orderNumber}</span>
              </p>
              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-600">Stolik</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tables.find(t => t.id === selectedTable)?.number || '-'}
                </p>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Płatność: {paymentMethod === 'cash' ? '💵 Gotówka' : '💳 Karta'}
              </p>
              <p className="text-gray-500 text-sm">
                Twój kelner zaraz przygotuje zamówienie 🍽️
              </p>
            </div>
          </div>
        )}

        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          @keyframes bounceIn {
            0% { transform: translateX(-50%) scale(0.8); opacity: 0; }
            50% { transform: translateX(-50%) scale(1.05); }
            100% { transform: translateX(-50%) scale(1); opacity: 1; }
          }
          .animate-bounceIn { animation: bounceIn 0.5s ease-out; }
        `}</style>
      </div>
    </div>
  )
}