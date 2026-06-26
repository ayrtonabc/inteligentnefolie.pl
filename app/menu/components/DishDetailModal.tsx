import { useEffect, useRef, useCallback, useState } from 'react'
import { X, Clock, ChefHat, Plus, Minus, ShoppingCart } from 'lucide-react'
import type { MenuProduct, ProductDetailsPayload } from '@/features/menu/types'
import { ALLERGEN_OPTIONS } from '@/features/menu/types'

interface DishDetailModalProps {
  product: MenuProduct | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: MenuProduct, quantity: number) => void
}

export default function DishDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: DishDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
    
    if (e.key === 'Tab' && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeyDown)
      
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        firstFocusable?.focus()
      }, 100)
    }

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
      previousActiveElement.current?.focus()
    }
  }, [isOpen, handleKeyDown])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleAddToCart = () => {
    if (product) {
      onAddToCart(product, quantity)
      onClose()
      setQuantity(1)
    }
  }

  if (!isOpen || !product) return null

  const details = product.details_payload || {}
  const allergenList = details.allergens?.map(id => 
    ALLERGEN_OPTIONS.find(a => a.id === id)
  ).filter(Boolean) || []

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col animate-slideUp"
      >
        <div className="relative">
          {(product.primary_image?.url || product.image_url) && (
            <div className="h-56 sm:h-64 bg-gray-100">
              <img 
                src={product.primary_image?.url || product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {details.gallery_images && details.gallery_images.length > 0 && (
            <div className="px-4 pb-4">
              <div className="flex gap-2 overflow-x-auto">
                {details.gallery_images.map((img, i) => (
                  <img 
                    key={i} 
                    src={img} 
                    alt="" 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
                  />
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div>
            <h2 id="modal-title" className="text-2xl font-bold text-gray-900">
              {product.name}
            </h2>
            <p className="text-blue-600 text-xl font-bold mt-1">
              {product.currency || 'PLN'} {product.price.toFixed(2)}
            </p>
          </div>

          {details.extended_description && (
            <div className="prose prose-sm text-gray-600">
              <p>{details.extended_description}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {product.is_vegetarian && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                🌿 Wegetariańskie
              </span>
            )}
            {product.is_vegan && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                🌱 Wegańskie
              </span>
            )}
            {product.is_gluten_free && (
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                🌾 Bez glutenu
              </span>
            )}
            {details.spice_level && details.spice_level > 0 && (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                🌶️ {details.spice_level}/5
              </span>
            )}
          </div>

          {allergenList.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                ⚠️ Alergeny
              </h3>
              <div className="flex flex-wrap gap-2">
                {allergenList.map((allergen, i) => allergen && (
                  <span key={i} className="px-3 py-1 bg-white border border-red-200 text-red-700 rounded-full text-sm">
                    {allergen.icon} {allergen.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {details.ingredients && details.ingredients.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Składniki</h3>
              <ul className="space-y-1">
                {details.ingredients.map((ingredient, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {details.prep_time_minutes && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Czas przygotowania</p>
                  <p className="font-medium text-gray-900">{details.prep_time_minutes} min</p>
                </div>
              </div>
            )}
            
            {details.chef_note && (
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                <ChefHat className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-xs text-amber-600">Rekomendacja szefa</p>
                  <p className="font-medium text-gray-900 text-sm">{details.chef_note}</p>
                </div>
              </div>
            )}
          </div>

          {details.pairing_suggestion && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <h3 className="font-semibold text-purple-800 mb-1">Idealne połączenie</h3>
              <p className="text-purple-700 text-sm">{details.pairing_suggestion}</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label="Zmniejsz ilość"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label="Zwiększ ilość"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Dodaj do zamówienia ({(product.price * quantity).toFixed(2)} zł)
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        @media (min-width: 640px) {
          .animate-slideUp {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}