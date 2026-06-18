import { useState, useEffect, useRef } from 'react'
import 'react-quill/dist/quill.snow.css'
import { pb } from '@/lib/pocketbase'
import { uploadFiles } from '@/features/media/api'
import { 
  Package, ShoppingCart, DollarSign, Star, TrendingUp, 
  Plus, Search, MoreVertical, Edit, Trash2, Eye,
  ChevronRight, ArrowUpRight, ArrowDownRight, AlertTriangle,
  Tags, Users, Settings, X, Check, Clock, Truck,
  CheckCircle, XCircle, RotateCcw, FolderPlus, MessageSquare,
  ThumbsUp, ExternalLink, Image as ImageIcon, Mail, Phone, MapPin,
  CreditCard, Banknote, Globe, Shield, Loader2, ShoppingBag,
  Minus, Plus as PlusIcon, Trash, CreditCard as PayIcon,
  Shirt, Watch, Glasses, Footprints, Briefcase, Laptop, Smartphone,
  Headphones, Camera, Speaker, Bike, Car, Wrench, Hammer,
  Apple, Carrot, Coffee, Pizza, Gift, Sparkles, Heart,
  Home, Building, Store, Tag, Zap, Flame, Leaf,
  Book, Music, Palette, Pill, Dog, Cat, PawPrint,
  Mountain, Sun, Cloud, Crown, Bike as BikeIcon
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useProducts, useOrders, useShopStats, useCategories, useReviews, useCustomers, useCustomerOrders, useShopSettings, useCoupons, useFlashSales, useBundles } from '@/features/shop/hooks'
import { formatPrice, getStatusColor, getStatusLabel, getDiscountBadge, calculateDiscountedPrice } from '@/features/shop/types'
import { deleteProduct, updateOrderStatus, deleteOrder, createCategory, updateCategory, deleteCategory, approveReview, deleteReview, createCoupon, updateCoupon, deleteCoupon, createFlashSale, updateFlashSale, deleteFlashSale, createBundle, updateBundle, deleteBundle } from '@/features/shop/api'
import { updateSettings } from '@/features/shop/types'
import type { ShopProduct, ShopOrder, ShopCategory, ShopReview, ShopCustomer, ShopSettings, ShopCoupon, ShopFlashSale, ShopBundle } from '@/features/shop/types'
import { RichTextEditor } from '@/components/RichTextEditor'
import { StarRating } from '@/components/star-rating'
import { StarPicker } from '@/components/star-picker'
import OffersSection from './OffersSection'
import ReportsSection from './ReportsSection'

type TabType = 'overview' | 'products' | 'orders' | 'categories' | 'reviews' | 'customers' | 'offers' | 'reports' | 'settings'

function StatCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: any }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
      <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center">
        <Icon size={24} className="text-sky-600" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

function ConfirmDialog({ open, message, onConfirm, onCancel }: { open: boolean; message: string; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-6">
        <p className="text-gray-900 mb-6">{message}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">Anuluj</Button>
          <Button onClick={onConfirm} className="flex-1 bg-red-500 hover:bg-red-600 text-white">Usuń</Button>
        </div>
      </div>
    </div>
  )
}

function getProductImages(product: ShopProduct): string[] {
  if (!product.images) return []
  if (typeof product.images === 'string') {
    return product.images.split(',').filter(u => u)
  }
  return product.images.filter(u => u)
}

function getProductFirstImage(product: ShopProduct): string {
  const images = getProductImages(product)
  return images[0] || '/placeholder.png'
}

function ProductCard({ product, onEdit, onDelete, onPreview }: { product: ShopProduct; onEdit: (p: ShopProduct) => void; onDelete: (p: ShopProduct) => void; onPreview: (p: ShopProduct) => void }) {
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  const discountBadge = getDiscountBadge(product)
  const firstImage = getProductFirstImage(product)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-lg hover:shadow-sky-500/5 transition-all">
      <div className="relative aspect-square bg-gray-100 overflow-hidden cursor-pointer" onClick={() => onEdit(product)}>
        <img
          src={firstImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discountBadge && (
          <div className={`absolute top-2 left-2 ${discountBadge.color} text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg`}>
            -{discountBadge.label}
          </div>
        )}
        {product.stock_quantity !== null && product.stock_quantity < 5 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            NISKIE STANY
          </div>
        )}
        {product.is_featured && (
          <span className="absolute top-2 right-2 bg-sky-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            ★ Wyróżniony
          </span>
        )}
        {!product.is_published && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-700 text-xs font-bold px-3 py-1 rounded-full">SZKIC</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm truncate cursor-pointer group-hover:text-sky-600 transition-colors" onClick={() => onEdit(product)}>{product.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className={`text-base font-bold ${hasDiscount ? 'text-sky-600' : 'text-gray-900'}`}>
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.compare_at_price!)}</span>
            )}
          </div>
          {product.stock_quantity !== null && (
            <span className={`text-xs ${product.stock_quantity < 10 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
              {product.stock_quantity} szt.
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => onEdit(product)}
            className="p-2 bg-gray-100 hover:bg-sky-50 text-gray-400 hover:text-sky-600 rounded-lg transition-colors"
            title="Edytuj"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPreview(product)}
            className="p-2 bg-gray-100 hover:bg-sky-50 text-gray-400 hover:text-sky-600 rounded-lg transition-colors"
            title="Podgląd"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(product) }}
            className="p-2 bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
            title="Usuń"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function OrderStatusBadge({ status, onChange }: { status: string; onChange?: (newStatus: string) => void }) {
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
  const icons: Record<string, any> = {
    pending: Clock, processing: RotateCcw, shipped: Truck, delivered: CheckCircle, cancelled: XCircle, refunded: XCircle
  }
  const Icon = icons[status] || Clock

  if (onChange) {
    return (
      <select
        value={status}
        onChange={(e) => onChange(e.target.value)}
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer border-0 ${getStatusColor(status)}`}
      >
        {statuses.map(s => (
          <option key={s} value={s}>{getStatusLabel(s)}</option>
        ))}
      </select>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      <Icon className="w-3 h-3" />
      {getStatusLabel(status)}
    </span>
  )
}

function OrderDetailModal({ order, onClose, onStatusChange }: { order: ShopOrder; onClose: () => void; onStatusChange: (id: string, status: string) => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Zamówienie {order.order_number}</h2>
            <p className="text-sm text-gray-500">{new Date(order.created).toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Klient</h3>
              <p className="font-medium text-gray-900">{order.customer_name}</p>
              <p className="text-sm text-gray-500">{order.customer_email}</p>
              {order.customer_phone && <p className="text-sm text-gray-500">{order.customer_phone}</p>}
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</h3>
              <OrderStatusBadge status={order.status} onChange={(s) => onStatusChange(order.id, s)} />
              <div className="mt-2">
                <span className="text-xs text-gray-500">Płatność: </span>
                <span className={`text-xs font-medium ${order.payment_status === 'paid' ? 'text-green-600' : order.payment_status === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}>
                  {order.payment_status === 'paid' ? 'Opłacone' : order.payment_status === 'failed' ? 'Niepowodzenie' : 'Oczekuje'}
                </span>
              </div>
            </div>
          </div>

          {order.shipping_address && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Adres wysyłki</h3>
              <p className="text-sm text-gray-700">{order.shipping_address}</p>
            </div>
          )}

          {order.notes && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notatki</h3>
              <p className="text-sm text-gray-700">{order.notes}</p>
            </div>
          )}

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Produkty</h3>
            <div className="space-y-3">
              {(order.items || []).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded object-cover" />}
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.product_name}</p>
                      <p className="text-xs text-gray-500">x{item.quantity} · {formatPrice(item.price)}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">{formatPrice(order.subtotal, order.currency)}</span>
            </div>
            {order.shipping_cost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Dostawa</span>
                <span className="text-gray-900">{formatPrice(order.shipping_cost, order.currency)}</span>
              </div>
            )}
            {order.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Podatek</span>
                <span className="text-gray-900">{formatPrice(order.tax, order.currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span>Razem</span>
              <span>{formatPrice(order.total, order.currency)}</span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Zamknij</Button>
          <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={() => { onStatusChange(order.id, 'cancelled'); onClose() }}>
            <XCircle className="w-4 h-4 mr-2" />Anuluj zamówienie
          </Button>
        </div>
      </div>
    </div>
  )
}

function CategoryModal({ category, onClose, onSave }: { category: ShopCategory | null; onClose: () => void; onSave: () => void }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    icon: category?.icon || '',
    order_index: category?.order_index || 0,
  })
  const [searchIcon, setSearchIcon] = useState('')

  const popularIcons = [
    'Package', 'ShoppingBag', 'Shirt', 'Watch', 'Glasses', 'Footprints', 'Briefcase',
    'Laptop', 'Smartphone', 'Headphones', 'Camera', 'Speaker',
    'Bike', 'Car', 'Wrench', 'Hammer', 'Screwdriver',
    'Apple', 'Carrot', 'Coffee', 'GlassWater', 'Pizza', 'Cake', 'Cookie',
    'Dress', 'Jewelry', 'Gift', 'Sparkles', 'Heart', 'Star',
    'Home', 'Building', 'Store', 'MapPin', 'Truck', 'Package',
    'Tag', 'Ticket', 'Award', 'Crown', 'Zap', 'Flame', 'Leaf',
    'Book', 'Gamepad2', 'Music', 'Film', 'Camera', 'Palette',
    'Pill', 'Thermometer', 'Syringe', 'Shield', 'Umbrella',
    'Dog', 'Cat', 'Bird', 'Fish', 'PawPrint',
    'Mountain', 'Sun', 'Moon', 'Cloud', 'Snowflake',
    'Tshirt', 'Glasses', 'Watch', 'Ring', 'BaggageClaim',
  ]

  const filteredIcons = searchIcon
    ? popularIcons.filter(i => i.toLowerCase().includes(searchIcon.toLowerCase()))
    : popularIcons

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (category) {
        await updateCategory(category.id, form)
      } else {
        await createCategory(form)
      }
      onSave()
    } catch {
      alert('Błąd podczas zapisywania kategorii')
    } finally {
      setLoading(false)
    }
  }

  const IconPreview = ({ iconName, size = 20 }: { iconName: string; size?: number }) => {
    const icons: Record<string, React.ReactNode> = {
      Package: <Package size={size} />, ShoppingBag: <ShoppingBag size={size} />, Shirt: <Shirt size={size} />,
      Watch: <Watch size={size} />, Glasses: <Glasses size={size} />, Footprints: <Footprints size={size} />,
      Briefcase: <Briefcase size={size} />, Laptop: <Laptop size={size} />, Smartphone: <Smartphone size={size} />,
      Headphones: <Headphones size={size} />, Camera: <Camera size={size} />, Speaker: <Speaker size={size} />,
      Bike: <Bike size={size} />, Car: <Car size={size} />, Wrench: <Wrench size={size} />,
      Hammer: <Hammer size={size} />, Apple: <Apple size={size} />, Carrot: <Carrot size={size} />,
      Coffee: <Coffee size={size} />, Pizza: <Pizza size={size} />, Gift: <Gift size={size} />,
      Sparkles: <Sparkles size={size} />, Heart: <Heart size={size} />, Star: <Star size={size} />,
      Home: <Home size={size} />, Building: <Building size={size} />, Store: <Store size={size} />,
      Truck: <Truck size={size} />, Tag: <Tag size={size} />, Zap: <Zap size={size} />,
      Flame: <Flame size={size} />, Leaf: <Leaf size={size} />, Book: <Book size={size} />,
      Music: <Music size={size} />, Palette: <Palette size={size} />, Pill: <Pill size={size} />,
      Shield: <Shield size={size} />, Dog: <Dog size={size} />, Cat: <Cat size={size} />,
      PawPrint: <PawPrint size={size} />, Mountain: <Mountain size={size} />, Sun: <Sun size={size} />,
      Cloud: <Cloud size={size} />, Crown: <Crown size={size} />,
    }
    const DynamicIcon = icons[iconName]
    return DynamicIcon ? <>{DynamicIcon}</> : <Package size={size} />
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{category ? 'Edytuj kategorię' : 'Nowa kategoria'}</h2>
          <p className="text-sm text-gray-500 mt-1">{category ? 'Zmień dane kategorii' : 'Utwórz nową kategorię produktów'}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nazwa kategorii *</label>
            <input type="text" required value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: p.slug || e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Np. Odzież, Elektronika" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Slug (adres URL)</label>
            <input type="text" value={form.slug}
              onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="odziez" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ikona</label>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                {form.icon ? (
                  <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600">
                    <IconPreview iconName={form.icon} />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    <Package size={20} />
                  </div>
                )}
                <input type="text" value={form.icon}
                  onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                  className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Kliknij ikonę poniżej lub wpisz nazwę" />
              </div>
              <div className="p-3">
                <input type="text" value={searchIcon}
                  onChange={e => setSearchIcon(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Szukaj ikony..." />
                <div className="grid grid-cols-8 gap-1.5 max-h-40 overflow-y-auto">
                  {filteredIcons.map(iconName => (
                    <button key={iconName} type="button"
                      onClick={() => setForm(p => ({ ...p, icon: iconName }))}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                        form.icon === iconName
                          ? 'bg-sky-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-sky-50 hover:text-sky-600'
                      }`}
                      title={iconName}
                    >
                      <IconPreview iconName={iconName} size={16} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Wybierz ikonę z listy popularnych ikon lub wpisz nazwę własną</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Opis (opcjonalnie)</label>
            <textarea rows={2} value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
              placeholder="Krótki opis kategorii..." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Kolejność wyświetlania</label>
            <input type="number" value={form.order_index}
              onChange={e => setForm(p => ({ ...p, order_index: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="0" />
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium text-sm rounded-xl hover:bg-gray-50 transition-colors">
              Anuluj
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm rounded-xl transition-colors disabled:opacity-50">
              {loading ? 'Zapisywanie...' : 'Zapisz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ProductModal({ product, onClose, onSave }: { product: ShopProduct | null; onClose: () => void; onSave: () => void }) {
  const [loading, setLoading] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    product?.images
      ? typeof product.images === 'string'
        ? product.images.split(',').filter(u => u)
        : product.images.filter(u => u)
      : []
  )
  const [existingImages, setExistingImages] = useState<string[]>(
    product?.images
      ? typeof product.images === 'string'
        ? product.images.split(',').filter(u => u)
        : product.images.filter(u => u)
      : []
  )
  const [categories, setCategories] = useState<{id: string, name: string}[]>([])
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [savingCategory, setSavingCategory] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const websiteId = localStorage.getItem('website_id') || 'dktsle4yev6syo4'
      const records = await pb.collection('shop_categories').getList(1, 100, {
        filter: `website_id = "${websiteId}" || website_id = ""`,
        sort: 'name'
      })
      setCategories(records.items.map((c: any) => ({ id: c.id, name: c.name })))
    } catch (e) {
      console.error('Error loading categories:', e)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    setSavingCategory(true)
    try {
      const websiteId = localStorage.getItem('website_id') || 'dktsle4yev6syo4'
      await pb.collection('shop_categories').create({
        name: newCategoryName.trim(),
        slug: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
        website_id: websiteId,
        is_active: true
      })
      setNewCategoryName('')
      setShowNewCategory(false)
      await loadCategories()
    } catch (e) {
      console.error('Error creating category:', e)
    } finally {
      setSavingCategory(false)
    }
  }

  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    short_description: product?.short_description || '',
    description: product?.description || '',
    category: product?.category || product?.category_name || '',
    price: product?.price ? product.price / 100 : 0,
    compare_at_price: product?.compare_at_price ? product.compare_at_price / 100 : 0,
    sku: product?.sku || '',
    stock_quantity: product?.stock_quantity ?? 0,
    is_published: product?.is_published ?? true,
    is_featured: product?.is_featured ?? false,
  })

  useEffect(() => {
    if (!product) {
      setForm({
        name: '',
        slug: '',
        short_description: '',
        description: '',
        category: '',
        price: 0,
        compare_at_price: 0,
        sku: '',
        stock_quantity: 0,
        is_published: true,
        is_featured: false,
      })
      return
    }
    setForm({
      name: product.name || '',
      slug: product.slug || '',
      short_description: product.short_description || '',
      description: product.description || '',
      category: product.category || product.category_name || '',
      price: product.price ? product.price / 100 : 0,
      compare_at_price: product.compare_at_price ? product.compare_at_price / 100 : 0,
      sku: product.sku || '',
      stock_quantity: product.stock_quantity ?? 0,
      is_published: product.is_published ?? true,
      is_featured: product.is_featured ?? false,
    })
  }, [product])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    const newFiles = [...imageFiles, ...files].slice(0, 10)
    setImageFiles(newFiles)
    
    const previews = newFiles.map(f => URL.createObjectURL(f))
    setImagePreviews(oldPreviews => {
      oldPreviews.forEach(p => { if (p.startsWith('blob:')) URL.revokeObjectURL(p) })
      return [...existingImages, ...previews]
    })
  }

  const removeImage = (index: number) => {
    const blobIndex = index - existingImages.length
    if (blobIndex >= 0) {
      setImageFiles(prev => prev.filter((_, i) => i !== blobIndex))
      setImagePreviews(prev => {
        const url = prev[index]
        if (url.startsWith('blob:')) URL.revokeObjectURL(url)
        return prev.filter((_, i) => i !== index)
      })
    } else {
      setExistingImages(prev => prev.filter((_, i) => i !== index))
      setImagePreviews(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const priceCents = Math.round(form.price * 100)
      const compareCents = form.compare_at_price > 0 ? Math.round(form.compare_at_price * 100) : null
      const websiteId = localStorage.getItem('website_id') || 'dktsle4yev6syo4'

      let finalDescription = form.description

      const uploadedImageUrls: string[] = []

      if (imageFiles.length > 0) {
        try {
          await uploadFiles(imageFiles, 'sklep')
          for (const file of imageFiles) {
            const mediaRecord = await pb.collection('media').getFirstListItem(
              `name = "${file.name}" && website_id = "${websiteId}" && bucket_name = "sklep"`,
            )
            if (mediaRecord) {
              const publicUrl = pb.files.getURL(mediaRecord, mediaRecord.file)
              uploadedImageUrls.push(publicUrl)
            }
          }
        } catch (err) {
          console.error('Error uploading product images:', err)
        }
      }

      const imgRegex = /<img[^>]+src="(blob:[^"]+)"/g
      const blobMatches = [...form.description.matchAll(imgRegex)]
      if (blobMatches.length > 0) {
        const tempFiles: File[] = []
        const blobUrls: string[] = []

        for (const match of blobMatches) {
          const blobUrl = match[1]
          if (!blobUrls.includes(blobUrl)) {
            blobUrls.push(blobUrl)
          }
        }

        for (const blobUrl of blobUrls) {
          try {
            const response = await fetch(blobUrl)
            const blob = await response.blob()
            const fileName = `description-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
            const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' })
            tempFiles.push(file)
          } catch (err) {
            console.error('Error converting blob to file:', err)
          }
        }

        if (tempFiles.length > 0) {
          try {
            await uploadFiles(tempFiles, 'sklep')
          } catch (err) {
            console.error('Error uploading description images:', err)
          }
        }

        finalDescription = form.description
        for (let i = 0; i < blobUrls.length; i++) {
          const blobUrl = blobUrls[i]
          const fileName = `description-${Date.now()}-${tempFiles[i]?.name.split('-')[2] || Math.random().toString(36).substring(7)}.jpg`
          try {
            const mediaRecord = await pb.collection('media').getFirstListItem(
              `name ~ "${fileName.split('-')[0]}" && website_id = "${websiteId}" && bucket_name = "sklep"`,
            )
            if (mediaRecord) {
              const publicUrl = pb.files.getURL(mediaRecord, mediaRecord.file)
              finalDescription = finalDescription.replace(blobUrl, publicUrl)
              uploadedImageUrls.push(publicUrl)
            }
          } catch (err) {
            console.error('Error getting media record:', err)
          }
        }
      }

      const allImageUrls = [...existingImages, ...uploadedImageUrls].filter(u => u).join(',')

      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('slug', form.slug || `product-${Date.now()}`)
      formData.append('short_description', form.short_description)
      formData.append('description', finalDescription)
      formData.append('category_name', form.category)
      formData.append('price', String(priceCents))
      formData.append('website_id', websiteId)
      formData.append('sku', form.sku)
      formData.append('stock_quantity', String(form.stock_quantity))
      if (compareCents) formData.append('compare_at_price', String(compareCents))
      formData.append('is_published', form.is_published ? 'true' : 'false')
      formData.append('is_featured', form.is_featured ? 'true' : 'false')
      formData.append('is_active', 'true')
      formData.append('images', allImageUrls)

      let recordId = product?.id

      if (product) {
        await pb.collection('shop_products').update(product.id, formData)
      } else {
        const record = await pb.collection('shop_products').create(formData)
        recordId = record.id
      }

      setImageFiles([])
      setImagePreviews([])
      setExistingImages([])
      onSave()
    } catch (error: any) {
      console.error('Error saving product:', error)
      alert('Błąd podczas zapisywania produktu: ' + (error?.message || 'Nieznany błąd'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">{product ? 'Edytuj produkt' : 'Nowy produkt'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Zdjęcia produktu</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {imagePreviews.map((url, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                  <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(idx)}
                    className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white rounded-bl-lg flex items-center justify-center">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
              {imagePreviews.length < 10 && (
                <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 transition-colors">
                  <Plus className="w-4 h-4 text-gray-400" />
                  <span className="text-[9px] text-gray-400 mt-0.5">Dodaj</span>
                  <input type="file" accept="image/*" multiple className="hidden"
                    onChange={handleImageSelect} />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nazwa *</label>
              <input type="text" required value={form.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const target = e.target
                  const newName = target.value
                  setForm(p => ({
                    ...p,
                    name: newName,
                    slug: !p.slug || p.slug === (p.name || '').toLowerCase().replace(/\s+/g, '-') 
                      ? newName.toLowerCase().replace(/\s+/g, '-') 
                      : p.slug
                  }))
                }}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Nazwa produktu" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Krótki opis</label>
              <input type="text" value={form.short_description}
                onChange={e => setForm(p => ({ ...p, short_description: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Krótki opis produktu" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Kategoria</label>
              <div className="flex gap-1">
                <select value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white">
                  <option value="">Wybierz...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <button type="button" onClick={() => setShowNewCategory(!showNewCategory)}
                  className="px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              {showNewCategory && (
                <div className="mt-1.5 flex gap-1">
                  <input type="text" value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    placeholder="Nowa kategoria"
                    className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                  <button type="button" onClick={handleCreateCategory} disabled={savingCategory}
                    className="px-2 py-1 text-xs bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50">
                    {savingCategory ? '...' : 'Dodaj'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cena (PLN) *</label>
              <input type="number" required min="0" step="0.01" value={form.price}
                onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cena porówn.</label>
              <input type="number" min="0" step="0.01" value={form.compare_at_price}
                onChange={e => setForm(p => ({ ...p, compare_at_price: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
              <input type="text" value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Kod" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Stan mag.</label>
              <input type="number" min="0" value={form.stock_quantity} onChange={e => setForm(p => ({ ...p, stock_quantity: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Opis produktu</label>
            <RichTextEditor
              value={form.description}
              onChange={(val) => setForm(p => ({ ...p, description: val }))}
              placeholder="Opis produktu..."
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={form.is_published} onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))} className="w-3.5 h-3.5 text-cyan-500 rounded" />
              <span className="text-xs text-gray-700">Opublikowany</span>
            </label>
          </div>
          <div className="flex gap-2 pt-3 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 text-sm">Anuluj</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-sm">
              {loading ? 'Zapisywanie...' : 'Zapisz'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ProductPreviewModal({ product, onClose }: { product: ShopProduct; onClose: () => void }) {
  const { reviews } = useReviews(product.id)
  const productReviews = reviews.filter(r => r.is_approved)
  const avgRating = productReviews.length > 0
    ? productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length
    : 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Podgląd produktu</h2>
            <p className="text-sm text-gray-500">Tak widzą produkt Twoi klienci</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="relative aspect-square bg-gray-100">
              <img
                src={getProductFirstImage(product)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-2 p-6">
            <div className="flex items-center gap-2 mb-2">
              {!product.is_published && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">Szkic</span>
              )}
              {product.is_featured && (
                <span className="bg-cyan-100 text-cyan-700 text-xs px-2 py-0.5 rounded">Wyróżniony</span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.compare_at_price)}</span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={avgRating} showValue />
              <span className="text-sm text-gray-500">({productReviews.length} opinii)</span>
            </div>

            {product.sku && (
              <div className="text-sm text-gray-500 mb-2">SKU: {product.sku}</div>
            )}

            {product.stock_quantity !== null && (
              <div className={`text-sm mb-4 ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock_quantity > 0 ? `W magazynie (${product.stock_quantity} szt.)` : 'Brak w magazynie'}
              </div>
            )}

            <div className="border-t border-gray-100 pt-4 mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Opis</h3>
              {product.description ? (
                <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: product.description }} />
              ) : (
                <p className="text-gray-400 italic">Brak opisu</p>
              )}
            </div>

            {productReviews.length > 0 && (
              <div className="border-t border-gray-100 pt-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Opinie klientów ({productReviews.length})</h3>
                <div className="space-y-3">
                  {productReviews.slice(0, 5).map(review => (
                    <div key={review.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-900">{review.author_name}</span>
                        <StarRating rating={review.rating} />
                      </div>
                      {review.title && <p className="font-medium text-sm text-gray-800">{review.title}</p>}
                      {review.comment && <p className="text-sm text-gray-600 mt-1">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} className="w-full">Zamknij podgląd</Button>
        </div>
      </div>
    </div>
  )
}

export default function Shop() {
  const { products, loading: pLoading, refetch: refetchProducts } = useProducts()
  const { orders, loading: oLoading, refetch: refetchOrders } = useOrders()
  const { categories, loading: cLoading, refetch: refetchCategories } = useCategories()
  const { reviews, loading: rLoading, refetch: refetchReviews } = useReviews()
  const { customers, loading: custLoading, refetch: refetchCustomers } = useCustomers()
  const { settings, loading: settLoading, refetch: refetchSettings } = useShopSettings()
  const { stats, loading: sLoading } = useShopStats()
  const { coupons, loading: coupLoading, refetch: refetchCoupons, create: createCouponApi, update: updateCouponApi, delete: deleteCouponApi } = useCoupons()
  const { flashSales, loading: fsLoading, refetch: refetchFlashSales, create: createFlashSaleApi, update: updateFlashSaleApi, delete: deleteFlashSaleApi } = useFlashSales()
  const { bundles, loading: bundLoading, refetch: refetchBundles, create: createBundleApi, update: updateBundleApi, delete: deleteBundleApi } = useBundles()

  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ShopProduct | null>(null)
  const [previewProduct, setPreviewProduct] = useState<ShopProduct | null>(null)
  
  const [confirmDelete, setConfirmDelete] = useState<ShopProduct | null>(null)
  const [confirmDeleteReview, setConfirmDeleteReview] = useState<ShopReview | null>(null)
  
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null)
  
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ShopCategory | null>(null)
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState<ShopCategory | null>(null)

  const [selectedCustomer, setSelectedCustomer] = useState<ShopCustomer | null>(null)
  const { orders: customerOrders, loading: custOrdLoading } = useCustomerOrders(selectedCustomer?.email || '')

  const [showSettingsModal, setShowSettingsModal] = useState(false)

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus)
    refetchOrders()
  }

  const handleDeleteProduct = async () => {
    if (confirmDelete) {
      await deleteProduct(confirmDelete.id)
      setConfirmDelete(null)
      refetchProducts()
    }
  }

  const handleDeleteReview = async () => {
    if (confirmDeleteReview) {
      await deleteReview(confirmDeleteReview.id)
      setConfirmDeleteReview(null)
      refetchReviews()
    }
  }

  const handleApproveReview = async (id: string) => {
    await approveReview(id)
    refetchReviews()
  }

  const handleDeleteCategory = async () => {
    if (confirmDeleteCategory) {
      await deleteCategory(confirmDeleteCategory.id)
      setConfirmDeleteCategory(null)
      refetchCategories()
    }
  }

  const filteredProducts = products.filter(p =>
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const recentProducts = products.slice(0, 4)
  const allOrders = orders

  const isLoading = pLoading || oLoading || sLoading || cLoading || rLoading || custLoading || settLoading || coupLoading || fsLoading || bundLoading

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Ładowanie sklepu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>Redakcja</span>
            <ChevronRight size={16} />
            <span className="text-sky-600 font-medium">Zarządzanie sklepem</span>
          </div>

          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Sklep internetowy</h1>
              <p className="text-gray-600 max-w-xl">
                Sprzedawaj produkty, zarządzaj zamówieniami i monitoruj sprzedaż.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setEditingCategory(null); setShowCategoryModal(true) }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors"
              >
                <FolderPlus size={18} />Kategoria
              </button>
              <button
                onClick={() => { setEditingProduct(null); setShowProductModal(true) }}
                className="flex items-center gap-2 px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-full transition-colors"
              >
                <Plus size={18} />Produkt
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard title="Produkty" value={stats?.totalProducts || 0} icon={Package} />
            <StatCard title="Zamówienia" value={stats?.totalOrders || 0} icon={ShoppingCart} />
            <StatCard title="Przychód" value={formatPrice(stats?.totalRevenue || 0)} icon={DollarSign} />
            <StatCard title="Oczekujące" value={stats?.pendingOrders || 0} icon={AlertTriangle} />
          </div>

          <div className="flex items-center gap-1 bg-gray-100/80 rounded-full p-1 mb-6 w-fit">
            {[ 
              { key: 'overview' as TabType, label: 'Przegląd' },
              { key: 'products' as TabType, label: `Produkty (${products.length})` },
              { key: 'orders' as TabType, label: `Zamówienia (${orders.length})` },
              { key: 'categories' as TabType, label: `Kategorie (${categories.length})` },
              { key: 'reviews' as TabType, label: `Opinie (${reviews.length})` },
              { key: 'customers' as TabType, label: `Klienci (${customers.length})` },
              { key: 'offers' as TabType, label: 'Oferty' },
              { key: 'reports' as TabType, label: 'Raporty' },
              { key: 'settings' as TabType, label: 'Ustawienia' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium transition-all rounded-full ${
                  activeTab === tab.key 
                    ? 'bg-white text-sky-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                {tab.label}
              </button>
            ))}</div>

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="mb-8">
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Szukaj produktów..." value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                </div>
              </div>
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product}
                      onEdit={p => { setEditingProduct(p); setShowProductModal(true) }}
                      onDelete={p => setConfirmDelete(p)}
                      onPreview={p => setPreviewProduct(p)} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Nie znaleziono produktów</p>
                  <button
                    onClick={() => { setEditingProduct(null); setShowProductModal(true) }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-white font-medium text-sm rounded-full hover:bg-sky-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />Dodaj pierwszy produkt
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {allOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-cyan-50/30 border-b border-gray-100">
                    <tr>
                      <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Zamówienie</th>
                      <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Klient</th>
                      <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-right py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Kwota</th>
                      <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="py-3.5 px-5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.map((order, index) => (
                      <tr key={order.id} 
                        className={`border-b border-gray-50 hover:bg-cyan-50/30 transition-all cursor-pointer group ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`} 
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 bg-cyan-100 text-cyan-600 font-bold text-xs rounded-lg flex items-center justify-center">{index + 1}</span>
                            <span className="font-semibold text-gray-900">{order.order_number}</span>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <div>
                            <p className="font-medium text-gray-900">{order.customer_name}</p>
                            <p className="text-sm text-gray-500">{order.customer_email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-5" onClick={e => e.stopPropagation()}>
                          <OrderStatusBadge status={order.status} onChange={(s) => handleStatusChange(order.id, s)} />
                        </td>
                        <td className="py-4 px-5 text-right">
                          <span className="font-bold text-gray-900">{formatPrice(order.total, order.currency)}</span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="text-sm text-gray-500">{new Date(order.created).toLocaleDateString('pl-PL')}</span>
                        </td>
                        <td className="py-4 px-5">
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Brak zamówień</p>
              </div>
            )}
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden mb-8">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50/50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-6">Kategoria</div>
              <div className="col-span-4">Slug</div>
              <div className="col-span-2 text-right">Akcje</div>
            </div>
            <div className="divide-y divide-gray-100">
              {categories.length > 0 ? categories.map(cat => (
                <div key={cat.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50/50 transition-colors">
                  <div className="col-span-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center">
                      <Tags className="w-4 h-4 text-sky-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                  </div>
                  <div className="col-span-4">
                    <span className="text-sm text-gray-500">{cat.slug}</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <button onClick={() => { setEditingCategory(cat); setShowCategoryModal(true) }} className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setConfirmDeleteCategory(cat)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-gray-500">
                  <Tags className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p>Brak kategorii</p>
                  <button onClick={() => { setEditingCategory(null); setShowCategoryModal(true) }} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-full hover:bg-sky-600 transition-colors">
                    <Plus size={18} />Dodaj pierwszą kategorię
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-sky-600" />
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900">Ostatnie produkty</h2>
                </div>
                <button onClick={() => setActiveTab('products')} className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1">
                  Zobacz wszystkie <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {recentProducts.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                  {recentProducts.map(product => (
                    <ProductCard key={product.id} product={product}
                      onEdit={p => { setEditingProduct(p); setShowProductModal(true) }}
                      onDelete={p => setConfirmDelete(p)}
                      onPreview={p => setPreviewProduct(p)} />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Brak produktów</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-sky-600" />
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900">Ostatnie zamówienia</h2>
                </div>
                <button onClick={() => setActiveTab('orders')} className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1">
                  Zobacz wszystkie <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {allOrders.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {allOrders.slice(0, 5).map(order => (
                    <div key={order.id} className="p-4 flex items-center justify-between hover:bg-sky-50/30 cursor-pointer transition-colors" onClick={() => setSelectedOrder(order)}>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{order.order_number}</p>
                        <p className="text-xs text-gray-500">{order.customer_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-sm">{formatPrice(order.total, order.currency)}</p>
                        <OrderStatusBadge status={order.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Brak zamówień</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-cyan-50/20">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Star className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Opinie klientów</h2>
                  <p className="text-xs text-gray-500">{reviews.length} opinii</p>
                </div>
              </div>
            </div>
            {reviews.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {reviews.map(review => (
                  <div key={review.id} className="p-5 flex items-start justify-between hover:bg-cyan-50/20 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-50 to-amber-100 rounded-full flex items-center justify-center">
                          <Star className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{review.author_name}</p>
                          <p className="text-xs text-gray-500">{review.author_email}</p>
                        </div>
                        {!review.is_approved && (
                          <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2.5 py-1 rounded-full">Oczekuje na zatwierdzenie</span>
                        )}
                      </div>
                      <div className="ml-13 pl-0">
                        <StarRating rating={review.rating} showValue count={1} className="mb-2" />
                        {review.title && <p className="font-bold text-gray-800 text-sm mb-1">{review.title}</p>}
                        {review.comment && <p className="text-gray-600 text-sm bg-gray-50 rounded-lg p-3">{review.comment}</p>}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-400">{new Date(review.created).toLocaleDateString('pl-PL')}</span>
                          {review.product_name && (
                            <span className="text-xs text-cyan-600 font-semibold bg-cyan-50 px-2 py-0.5 rounded-full">{review.product_name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {!review.is_approved && (
                        <button onClick={() => handleApproveReview(review.id)} className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-all" title="Zatwierdź">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => setConfirmDeleteReview(review)} className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-all" title="Usuń">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-amber-400" />
                </div>
                <p className="text-gray-500 font-medium">Brak opinii</p>
              </div>
            )}
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-cyan-50/20">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Users className="w-4 h-4 text-cyan-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Klienci</h2>
                  <p className="text-xs text-gray-500">{customers.length} klientów</p>
                </div>
              </div>
            </div>
            {customers.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {customers.map(customer => (
                  <div key={customer.id} className="p-4 flex items-center justify-between hover:bg-cyan-50/30 transition-colors cursor-pointer group" onClick={() => setSelectedCustomer(customer)}>
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">
                          {customer.first_name || customer.last_name
                            ? `${customer.first_name} ${customer.last_name}`
                            : 'Brak nazwy'}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{customer.email}</span>
                          {customer.phone && (
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{customer.phone}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatPrice(customer.total_spent)}</p>
                        <p className="text-xs text-gray-500">{customer.total_orders} zamówień</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-cyan-400" />
                </div>
                <p className="text-gray-500 font-medium">Brak klientów</p>
              </div>
            )}
          </div>
        )}

        {/* OFFERS TAB */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            <OffersSection
              coupons={coupons}
              flashSales={flashSales}
              bundles={bundles}
              products={products}
              categories={categories}
              onCreateCoupon={async (data) => { await createCouponApi(data); refetchCoupons() }}
              onUpdateCoupon={async (id, data) => { await updateCouponApi(id, data); refetchCoupons() }}
              onDeleteCoupon={async (id) => { await deleteCouponApi(id); refetchCoupons() }}
              onCreateFlashSale={async (data) => { await createFlashSaleApi(data); refetchFlashSales() }}
              onUpdateFlashSale={async (id, data) => { await updateFlashSaleApi(id, data); refetchFlashSales() }}
              onDeleteFlashSale={async (id) => { await deleteFlashSaleApi(id); refetchFlashSales() }}
              onCreateBundle={async (data) => { await createBundleApi(data); refetchBundles() }}
              onUpdateBundle={async (id, data) => { await updateBundleApi(id, data); refetchBundles() }}
              onDeleteBundle={async (id) => { await deleteBundleApi(id); refetchBundles() }}
            />
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <ReportsSection
            products={products}
            orders={allOrders}
            reviews={reviews}
            stats={stats}
          />
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Ustawienia sklepu</h2>
              <p className="text-sm text-gray-500">Skonfiguruj pasarele płatności i ustawienia ogólne</p>
            </div>
            <ShopSettingsPanel settings={settings} onSave={() => refetchSettings()} />
          </div>
        )}

        {/* PRODUCT PREVIEW MODAL */}
        {previewProduct && (
          <ProductPreviewModal
            product={previewProduct}
            onClose={() => setPreviewProduct(null)}
          />
        )}

        {/* CUSTOMER DETAIL MODAL */}
        {selectedCustomer && (
          <CustomerDetailModal
            customer={selectedCustomer}
            orders={customerOrders}
            ordersLoading={custOrdLoading}
            onClose={() => setSelectedCustomer(null)}
          />
        )}

        {/* MODALS */}
        {showProductModal && (
          <ProductModal key={editingProduct?.id || 'new'}
            product={editingProduct}
            onClose={() => { setShowProductModal(false); setEditingProduct(null) }}
            onSave={() => { setShowProductModal(false); setEditingProduct(null); refetchProducts() }} />
        )}

        {selectedOrder && (
          <OrderDetailModal order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onStatusChange={(id, status) => { handleStatusChange(id, status); setSelectedOrder(null) }} />
        )}

        {showCategoryModal && (
          <CategoryModal category={editingCategory}
            onClose={() => { setShowCategoryModal(false); setEditingCategory(null) }}
            onSave={() => { setShowCategoryModal(false); setEditingCategory(null); refetchCategories() }} />
        )}

        <ConfirmDialog open={!!confirmDelete}
          message={`Usunąć produkt "${confirmDelete?.name}"? Tej operacji nie można cofnąć.`}
          onConfirm={handleDeleteProduct}
          onCancel={() => setConfirmDelete(null)} />

        <ConfirmDialog open={!!confirmDeleteCategory}
          message={`Usunąć kategorię "${confirmDeleteCategory?.name}"?`}
          onConfirm={handleDeleteCategory}
          onCancel={() => setConfirmDeleteCategory(null)} />

        <ConfirmDialog open={!!confirmDeleteReview}
          message={`Usunąć opinię "${confirmDeleteReview?.author_name}"?`}
          onConfirm={handleDeleteReview}
          onCancel={() => setConfirmDeleteReview(null)} />
        </div>
      </div>
    </div>
  )
}

function CustomerDetailModal({ customer, orders, ordersLoading, onClose }: { customer: ShopCustomer; orders: ShopOrder[]; ordersLoading: boolean; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">Szczegóły klienta</h2>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dane klienta</h3>
            <p className="text-lg font-semibold text-gray-900">
              {customer.first_name || customer.last_name
                ? `${customer.first_name} ${customer.last_name}`
                : 'Brak nazwy'}
            </p>
            <div className="flex flex-col gap-1 mt-2">
              {customer.email && (
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Mail className="w-3 h-3" />{customer.email}
                </p>
              )}
              {customer.phone && (
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Phone className="w-3 h-3" />{customer.phone}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-cyan-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Suma zamówień</p>
              <p className="text-xl font-bold text-gray-900">{formatPrice(customer.total_spent)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Liczba zamówień</p>
              <p className="text-xl font-bold text-gray-900">{customer.total_orders}</p>
            </div>
          </div>

          {customer.addresses && customer.addresses.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Adresy</h3>
              <div className="space-y-2">
                {customer.addresses.map((addr: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium bg-gray-200 px-2 py-0.5 rounded">
                        {addr.type === 'shipping' ? 'Wysyłka' : 'Faktura'}
                      </span>
                      {addr.is_default && <span className="text-xs text-cyan-600 font-medium">Domyślny</span>}
                    </div>
                    <p className="text-sm text-gray-700">
                      {[addr.company, addr.address1, addr.address2].filter(Boolean).join(', ')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {[addr.postal_code, addr.city, addr.state, addr.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Historia zamówień ({orders.length})
            </h3>
            {ordersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{order.order_number}</p>
                      <p className="text-xs text-gray-500">{new Date(order.created).toLocaleDateString('pl-PL')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 text-sm">{formatPrice(order.total, order.currency)}</p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-4">Brak zamówień</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ShopSettingsPanel({ settings, onSave }: { settings: ShopSettings | null; onSave: () => void }) {
  const [form, setForm] = useState({
    store_name: settings?.store_name || 'Sklep',
    store_email: settings?.store_email || '',
    store_phone: settings?.store_phone || '',
    store_address: settings?.store_address || '',
    currency: settings?.currency || 'PLN',
    tax_rate: settings?.tax_rate || 23,
    tax_included_in_prices: settings?.tax_included_in_prices ?? false,
    free_shipping_threshold: settings?.free_shipping_threshold || 0,
    inpost_enabled: settings?.inpost_enabled ?? true,
    inpost_api_key: settings?.inpost_api_key || '',
    inpost_organization_id: settings?.inpost_organization_id || '',
    inpost_api_url: settings?.inpost_api_url || 'https://api-shipx-pl.easypack24.net',
    inpost_price: settings?.inpost_price || 16.99,
    courier_enabled: settings?.courier_enabled ?? true,
    courier_price: settings?.courier_price || 24.99,
    pickup_enabled: settings?.pickup_enabled ?? false,
    pickup_label: settings?.pickup_label || 'Odbiór osobisty',
    stripe_enabled: settings?.stripe_enabled ?? false,
    stripe_public_key: settings?.stripe_public_key || '',
    stripe_secret_key: settings?.stripe_secret_key || '',
    stripe_webhook_secret: settings?.stripe_webhook_secret || '',
    tpay_enabled: settings?.tpay_enabled ?? false,
    tpay_client_id: settings?.tpay_client_id || '',
    tpay_secret_key: settings?.tpay_secret_key || '',
    paypal_enabled: settings?.paypal_enabled ?? false,
    paypal_client_id: settings?.paypal_client_id || '',
    paypal_secret_key: settings?.paypal_secret_key || '',
    blik_enabled: settings?.blik_enabled ?? false,
    transfer_enabled: settings?.transfer_enabled ?? true,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (settings) {
      setForm({
        store_name: settings.store_name || 'Sklep',
        store_email: settings.store_email || '',
        store_phone: settings.store_phone || '',
        store_address: settings.store_address || '',
        currency: settings.currency || 'PLN',
        tax_rate: settings.tax_rate || 23,
        tax_included_in_prices: settings.tax_included_in_prices ?? false,
        free_shipping_threshold: settings.free_shipping_threshold || 0,
        inpost_enabled: settings.inpost_enabled ?? true,
        inpost_api_key: settings.inpost_api_key || '',
        inpost_organization_id: settings.inpost_organization_id || '',
        inpost_api_url: settings.inpost_api_url || 'https://api-shipx-pl.easypack24.net',
        inpost_price: settings.inpost_price || 16.99,
        courier_enabled: settings.courier_enabled ?? true,
        courier_price: settings.courier_price || 24.99,
        pickup_enabled: settings.pickup_enabled ?? false,
        pickup_label: settings.pickup_label || 'Odbiór osobisty',
        stripe_enabled: settings.stripe_enabled ?? false,
        stripe_public_key: settings.stripe_public_key || '',
        stripe_secret_key: settings.stripe_secret_key || '',
        stripe_webhook_secret: settings.stripe_webhook_secret || '',
        tpay_enabled: settings.tpay_enabled ?? false,
        tpay_client_id: settings.tpay_client_id || '',
        tpay_secret_key: settings.tpay_secret_key || '',
        paypal_enabled: settings.paypal_enabled ?? false,
        paypal_client_id: settings.paypal_client_id || '',
        paypal_secret_key: settings.paypal_secret_key || '',
        blik_enabled: settings.blik_enabled ?? false,
        transfer_enabled: settings.transfer_enabled ?? true,
      })
    }
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    const data: any = { ...form }
    if (data.free_shipping_threshold > 0) {
      data.free_shipping_threshold = Math.round(data.free_shipping_threshold * 100)
    }
    await updateSettings(data)
    setSaving(false)
    onSave()
  }

  const currencyOptions = [
    { value: 'PLN', label: 'PLN - Złoty' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'USD', label: 'USD - Dolar' },
    { value: 'CZK', label: 'CZK - Korona czeska' },
    { value: 'GBP', label: 'GBP - Funt brytyjski' },
  ]

  return (
    <div className="p-6 space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-500" />Ogólne
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa sklepu</label>
            <input type="text" value={form.store_name}
              onChange={e => setForm(p => ({ ...p, store_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.store_email}
              onChange={e => setForm(p => ({ ...p, store_email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input type="text" value={form.store_phone}
              onChange={e => setForm(p => ({ ...p, store_phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Waluta</label>
            <select value={form.currency}
              onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
              {currencyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stawka VAT (%)</label>
            <input type="number" min="0" max="100" step="0.1" value={form.tax_rate}
              onChange={e => setForm(p => ({ ...p, tax_rate: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Darmowa dostawa od (PLN)</label>
            <input type="number" min="0" step="0.01" value={form.free_shipping_threshold}
              onChange={e => setForm(p => ({ ...p, free_shipping_threshold: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
        </div>
        <label className="flex items-center gap-2 mt-4 cursor-pointer">
          <input type="checkbox" checked={form.tax_included_in_prices}
            onChange={e => setForm(p => ({ ...p, tax_included_in_prices: e.target.checked }))}
            className="w-4 h-4 text-cyan-500 rounded" />
          <span className="text-sm text-gray-700">VAT wliczony w ceny</span>
        </label>
      </div>

      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Truck className="w-4 h-4 text-cyan-500" />Dostawa
        </h3>
        <p className="text-xs text-gray-500 mb-6">Skonfiguruj integrację InPost oraz metody wysyłki.</p>

        <div className="space-y-6">
          <div className={`border rounded-xl p-4 transition-colors ${form.inpost_enabled ? 'border-cyan-200 bg-cyan-50/30' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${form.inpost_enabled ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-400'}`}>
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">InPost Paczkomaty</p>
                  <p className="text-xs text-gray-500">Integracja API ShipX - paczkomaty 24/7</p>
                </div>
              </div>
              <button
                onClick={() => setForm(p => ({ ...p, inpost_enabled: !p.inpost_enabled }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.inpost_enabled ? 'bg-cyan-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.inpost_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {form.inpost_enabled && (
              <div className="mt-4 pt-4 border-t border-cyan-100 space-y-2">
                <p className="text-xs font-medium text-gray-600 mb-2">Dane API InPost (ShipX)</p>
                <input type="text" placeholder="API Key"
                  value={form.inpost_api_key}
                  onChange={e => setForm(p => ({ ...p, inpost_api_key: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
                <input type="text" placeholder="Organization ID"
                  value={form.inpost_organization_id}
                  onChange={e => setForm(p => ({ ...p, inpost_organization_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
                <input type="text" placeholder="API URL (domyślnie: https://api-shipx-pl.easypack24.net)"
                  value={form.inpost_api_url}
                  onChange={e => setForm(p => ({ ...p, inpost_api_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Cena wysyłki:</span>
                  <input type="number" min="0" step="0.01" value={form.inpost_price}
                    onChange={e => setForm(p => ({ ...p, inpost_price: parseFloat(e.target.value) || 0 }))}
                    className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                  <span className="text-sm text-gray-400">PLN</span>
                  {form.inpost_price === 0 && (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Darmowa</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <ShippingMethodCard
            name="Kurier"
            description="Dostawa pod wskazany adres kurierem"
            icon={<Truck className="w-5 h-5" />}
            enabled={form.courier_enabled}
            onToggle={(v) => setForm(p => ({ ...p, courier_enabled: v }))}
            price={form.courier_price}
            onPriceChange={(v) => setForm(p => ({ ...p, courier_price: v }))}
            color="bg-blue-100 text-blue-700"
          />
          <ShippingMethodCard
            name="Odbiór osobisty"
            description="Klient odbiera zamówienie w Twoim sklepie"
            icon={<Store className="w-5 h-5" />}
            enabled={form.pickup_enabled}
            onToggle={(v) => setForm(p => ({ ...p, pickup_enabled: v }))}
            price={0}
            onPriceChange={() => {}}
            label={form.pickup_label}
            onLabelChange={(v) => setForm(p => ({ ...p, pickup_label: v }))}
            color="bg-green-100 text-green-700"
            isPickup
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-500" />Pasarele płatności
        </h3>
        <p className="text-xs text-gray-500 mb-6">Skonfiguruj metody płatności. Klienci zobaczą tylko włączone opcje.</p>

        <div className="space-y-6">
          <PaymentGatewayCard
            name="Stripe"
            description="Karty kredytowe, BLIK, Apple Pay, Google Pay"
            icon={<CreditCard className="w-5 h-5" />}
            enabled={form.stripe_enabled}
            onToggle={(v) => setForm(p => ({ ...p, stripe_enabled: v }))}
          >
            {form.stripe_enabled && (
              <div className="space-y-3 mt-4">
                <input type="text" placeholder="Stripe Public Key (pk_live_...)"
                  value={form.stripe_public_key}
                  onChange={e => setForm(p => ({ ...p, stripe_public_key: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
                <input type="password" placeholder="Stripe Secret Key (sk_live_...)"
                  value={form.stripe_secret_key}
                  onChange={e => setForm(p => ({ ...p, stripe_secret_key: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
                <input type="password" placeholder="Webhook Secret (whsec_...)"
                  value={form.stripe_webhook_secret}
                  onChange={e => setForm(p => ({ ...p, stripe_webhook_secret: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
              </div>
            )}
          </PaymentGatewayCard>

          <PaymentGatewayCard
            name="PayPal"
            description="Płatności przez PayPal"
            icon={<PayIcon className="w-5 h-5" />}
            enabled={form.paypal_enabled}
            onToggle={(v) => setForm(p => ({ ...p, paypal_enabled: v }))}
          >
            {form.paypal_enabled && (
              <div className="space-y-3 mt-4">
                <input type="text" placeholder="PayPal Client ID"
                  value={form.paypal_client_id}
                  onChange={e => setForm(p => ({ ...p, paypal_client_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
                <input type="password" placeholder="PayPal Secret Key"
                  value={form.paypal_secret_key}
                  onChange={e => setForm(p => ({ ...p, paypal_secret_key: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
              </div>
            )}
          </PaymentGatewayCard>

          <PaymentGatewayCard
            name="Tpay"
            description="Polska bramka płatności (przelewy, BLIK, karty)"
            icon={<Banknote className="w-5 h-5" />}
            enabled={form.tpay_enabled}
            onToggle={(v) => setForm(p => ({ ...p, tpay_enabled: v }))}
          >
            {form.tpay_enabled && (
              <div className="space-y-3 mt-4">
                <input type="text" placeholder="Tpay Client ID"
                  value={form.tpay_client_id}
                  onChange={e => setForm(p => ({ ...p, tpay_client_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
                <input type="password" placeholder="Tpay Secret Key"
                  value={form.tpay_secret_key}
                  onChange={e => setForm(p => ({ ...p, tpay_secret_key: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
              </div>
            )}
          </PaymentGatewayCard>

          <PaymentGatewayCard
            name="BLIK"
            description="Płatności BLIK (przez Stripe)"
            icon={<Phone className="w-5 h-5" />}
            enabled={form.blik_enabled}
            onToggle={(v) => setForm(p => ({ ...p, blik_enabled: v }))}
          />

          <PaymentGatewayCard
            name="Przelew bankowy"
            description="Tradycyjny przelew na konto"
            icon={<Banknote className="w-5 h-5" />}
            enabled={form.transfer_enabled}
            onToggle={(v) => setForm(p => ({ ...p, transfer_enabled: v }))}
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <Button onClick={handleSave} disabled={saving} className="bg-cyan-500 hover:bg-cyan-600">
          {saving ? 'Zapisywanie...' : 'Zapisz ustawienia'}
        </Button>
      </div>
    </div>
  )
}

function PaymentGatewayCard({ name, description, icon, enabled, onToggle, children }: {
  name: string
  description: string
  icon: React.ReactNode
  enabled: boolean
  onToggle: (v: boolean) => void
  children?: React.ReactNode
}) {
  return (
    <div className={`border rounded-xl p-4 transition-colors ${enabled ? 'border-cyan-200 bg-cyan-50/30' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${enabled ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-400'}`}>
            {icon}
          </div>
          <div>
            <p className="font-medium text-gray-900">{name}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <button
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-cyan-500' : 'bg-gray-300'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
      {children}
    </div>
  )
}

function ShippingMethodCard({ name, description, icon, enabled, onToggle, price, onPriceChange, label, onLabelChange, color, isPickup }: {
  name: string
  description: string
  icon: React.ReactNode
  enabled: boolean
  onToggle: (v: boolean) => void
  price: number
  onPriceChange: (v: number) => void
  label?: string
  onLabelChange?: (v: string) => void
  color: string
  isPickup?: boolean
}) {
  return (
    <div className={`border rounded-xl p-4 transition-colors ${enabled ? 'border-cyan-200 bg-cyan-50/30' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${enabled ? color : 'bg-gray-100 text-gray-400'}`}>
            {icon}
          </div>
          <div>
            <p className="font-medium text-gray-900">{name}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <button
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-cyan-500' : 'bg-gray-300'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
      {enabled && (
        <div className="mt-4 flex items-center gap-4">
          {!isPickup && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Cena:</span>
              <input type="number" min="0" step="0.01" value={price}
                onChange={e => onPriceChange(parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              <span className="text-sm text-gray-400">PLN</span>
            </div>
          )}
          {isPickup && label !== undefined && onLabelChange && (
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-600">Etykieta:</span>
              <input type="text" value={label}
                onChange={e => onLabelChange(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Odbiór osobisty" />
            </div>
          )}
          {!isPickup && price === 0 && (
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Darmowa</span>
          )}
        </div>
      )}
    </div>
  )
}
