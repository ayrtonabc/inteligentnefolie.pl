import { useState } from 'react'
import {
  Tag, Percent, Zap, Gift, Clock, X, Check, Copy,
  Plus, Trash2, Edit2, ChevronDown, AlertCircle
} from 'lucide-react'
import type { ShopCoupon, ShopFlashSale, ShopBundle, ShopProduct, ShopCategory } from '@/features/shop/types'

type OffersTab = 'coupons' | 'flash-sales' | 'bundles'

interface OffersSectionProps {
  coupons: ShopCoupon[]
  flashSales: ShopFlashSale[]
  bundles: ShopBundle[]
  products: ShopProduct[]
  categories: ShopCategory[]
  onCreateCoupon: (data: Partial<ShopCoupon>) => Promise<void>
  onUpdateCoupon: (id: string, data: Partial<ShopCoupon>) => Promise<void>
  onDeleteCoupon: (id: string) => Promise<void>
  onCreateFlashSale: (data: Partial<ShopFlashSale>) => Promise<void>
  onUpdateFlashSale: (id: string, data: Partial<ShopFlashSale>) => Promise<void>
  onDeleteFlashSale: (id: string) => Promise<void>
  onCreateBundle: (data: Partial<ShopBundle>) => Promise<void>
  onUpdateBundle: (id: string, data: Partial<ShopBundle>) => Promise<void>
  onDeleteBundle: (id: string) => Promise<void>
}

function CouponModal({ coupon, products, onSave, onClose }: {
  coupon?: ShopCoupon | null
  products: ShopProduct[]
  onSave: (data: Partial<ShopCoupon>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    code: coupon?.code || '',
    description: coupon?.description || '',
    discount_type: coupon?.discount_type || 'percentage',
    discount_value: coupon?.discount_value?.toString() || '',
    min_order_value: coupon?.min_order_value?.toString() || '',
    max_uses: coupon?.max_uses?.toString() || '',
    start_date: coupon?.start_date || '',
    end_date: coupon?.end_date || '',
    is_active: coupon?.is_active ?? true,
    applicable_products: coupon?.applicable_products || [],
    applicable_categories: coupon?.applicable_categories || [],
    first_time_only: coupon?.first_time_only ?? false,
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{coupon ? 'Edytuj kupon' : 'Nowy kupon rabatowy'}</h2>
          <p className="text-sm text-gray-500 mt-1">Utwórz kod rabatowy dla klientów</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Kod kuponu *</label>
              <div className="flex gap-2">
                <input type="text" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="NP. PROMOCJA20" />
                <button onClick={() => setForm(p => ({ ...p, code: 'PROMO' + Math.random().toString(36).substring(2, 6).toUpperCase() }))}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Typ rabatu</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'percentage', label: '% Procent', icon: <Percent className="w-4 h-4" /> },
                { value: 'fixed', label: 'PLN Kwota', icon: <Tag className="w-4 h-4" /> },
                { value: 'free_shipping', label: 'Darmowa dostawa', icon: <Gift className="w-4 h-4" /> },
              ].map(opt => (
                <button key={opt.value} onClick={() => setForm(p => ({ ...p, discount_type: opt.value as 'percentage' | 'fixed' | 'free_shipping' }))}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    form.discount_type === opt.value ? 'border-sky-500 bg-sky-50' : 'border-gray-100 hover:border-gray-200'
                  }`}>
                  {opt.icon}
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
          {form.discount_type !== 'free_shipping' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {form.discount_type === 'percentage' ? 'Procent rabatu (%)' : 'Kwota rabatu (PLN)'}
              </label>
              <input type="number" value={form.discount_value} onChange={e => setForm(p => ({ ...p, discount_value: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder={form.discount_type === 'percentage' ? '20' : '50'} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Min. wartość zamówienia (PLN)</label>
              <input type="number" value={form.min_order_value} onChange={e => setForm(p => ({ ...p, min_order_value: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Maks. użyć</label>
              <input type="number" value={form.max_uses} onChange={e => setForm(p => ({ ...p, max_uses: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Bez limitu" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Data rozpoczęcia</label>
              <input type="datetime-local" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Data zakończenia</label>
              <input type="datetime-local" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
              className="w-5 h-5 rounded" />
            <div>
              <p className="text-sm font-medium text-gray-700">Kupon aktywny</p>
              <p className="text-xs text-gray-500">Klienci mogą używać tego kuponu</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <input type="checkbox" checked={form.first_time_only} onChange={e => setForm(p => ({ ...p, first_time_only: e.target.checked }))}
              className="w-5 h-5 rounded" />
            <div>
              <p className="text-sm font-medium text-gray-700">Tylko dla nowych klientów</p>
              <p className="text-xs text-gray-500">Ogranicz do klientów składających pierwsze zamówienie</p>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium text-sm rounded-xl hover:bg-gray-50 transition-colors">
              Anuluj
            </button>
            <button onClick={() => onSave({
              ...form,
              discount_value: form.discount_type === 'free_shipping' ? null : parseFloat(form.discount_value) || null,
              min_order_value: parseFloat(form.min_order_value) || null,
              max_uses: form.max_uses ? parseInt(form.max_uses) : null,
            })} className="flex-1 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm rounded-xl transition-colors">
              {coupon ? 'Zapisz zmiany' : 'Utwórz kupon'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FlashSaleModal({ flashSale, products, categories, onSave, onClose }: {
  flashSale?: ShopFlashSale | null
  products: ShopProduct[]
  categories: ShopCategory[]
  onSave: (data: Partial<ShopFlashSale>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    name: flashSale?.name || '',
    discount_type: flashSale?.discount_type || 'percentage',
    discount_value: flashSale?.discount_value?.toString() || '20',
    start_date: flashSale?.start_date || '',
    end_date: flashSale?.end_date || '',
    is_active: flashSale?.is_active ?? true,
    message: flashSale?.message || '🔥 Wyprzedaż! Oferta ograniczona w czasie',
    products: flashSale?.products || [],
    categories: flashSale?.categories || [],
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{flashSale ? 'Edytuj wyprzedaż' : 'Nowa wyprzedaż błyskawiczna'}</h2>
          <p className="text-sm text-gray-500 mt-1">Utwórz ofertę promocyjną z odliczeniem czasu</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nazwa wyprzedaży *</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Sierpniowa wyprzedaż" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Wiadomość promocyjna</label>
            <input type="text" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="🔥 Wyprzedaż! Oferta ograniczona w czasie" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Typ rabatu</label>
              <select value={form.discount_type} onChange={e => setForm(p => ({ ...p, discount_type: e.target.value as 'percentage' | 'fixed' }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option value="percentage">% Procent</option>
                <option value="fixed">PLN Kwota</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {form.discount_type === 'percentage' ? 'Procent rabatu (%)' : 'Kwota rabatu (PLN)'}
              </label>
              <input type="number" value={form.discount_value} onChange={e => setForm(p => ({ ...p, discount_value: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Data rozpoczęcia</label>
              <input type="datetime-local" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Data zakończenia</label>
              <input type="datetime-local" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
              className="w-5 h-5 rounded" />
            <div>
              <p className="text-sm font-medium text-gray-700">Wyprzedaż aktywna</p>
              <p className="text-xs text-gray-500">Pokaż countdown na stronie sklepu</p>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium text-sm rounded-xl hover:bg-gray-50 transition-colors">
              Anuluj
            </button>
            <button onClick={() => onSave({
              ...form,
              discount_value: parseFloat(form.discount_value) || 0,
            })} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium text-sm rounded-xl transition-colors">
              <Zap className="w-4 h-4 inline mr-1" />{flashSale ? 'Zapisz zmiany' : 'Utwórz wyprzedaż'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function BundleModal({ bundle, products, onSave, onClose }: {
  bundle?: ShopBundle | null
  products: ShopProduct[]
  onSave: (data: Partial<ShopBundle>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    name: bundle?.name || '',
    description: bundle?.description || '',
    bundle_price: bundle?.bundle_price?.toString() || '',
    products: bundle?.products || [],
    is_active: bundle?.is_active ?? true,
    start_date: bundle?.start_date || '',
    end_date: bundle?.end_date || '',
  })
  const totalOriginal = form.products.reduce((sum, item) => {
    const product = products.find(p => p.id === item.product_id)
    return sum + (product ? product.price * item.quantity : 0)
  }, 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{bundle ? 'Edytuj zestaw' : 'Nowy zestaw produktów'}</h2>
          <p className="text-sm text-gray-500 mt-1">Pakiet produktów z ceną specjalną</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nazwa zestawu *</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Zestaw startowy" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Opis</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              rows={2} placeholder="Idealny zestaw na start..." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cena zestawu (GRATIS)</label>
            <input type="number" value={form.bundle_price} onChange={e => setForm(p => ({ ...p, bundle_price: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="9900" />
          </div>
          {form.products.length > 0 && (
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-green-700">
                <Gift className="w-4 h-4 inline mr-1" />
                Oszczędzasz: {Math.round((totalOriginal - parseFloat(form.bundle_price || '0')) / 100)} PLN
              </p>
            </div>
          )}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium text-sm rounded-xl hover:bg-gray-50 transition-colors">
              Anuluj
            </button>
            <button onClick={() => onSave({
              ...form,
              bundle_price: parseFloat(form.bundle_price) || 0,
            })} className="flex-1 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm rounded-xl transition-colors">
              {bundle ? 'Zapisz zmiany' : 'Utwórz zestaw'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OffersSection({ coupons, flashSales, bundles, products, categories, onCreateCoupon, onUpdateCoupon, onDeleteCoupon, onCreateFlashSale, onUpdateFlashSale, onDeleteFlashSale, onCreateBundle, onUpdateBundle, onDeleteBundle }: OffersSectionProps) {
  const [tab, setTab] = useState<OffersTab>('coupons')
  const [editingCoupon, setEditingCoupon] = useState<ShopCoupon | null | undefined>(undefined)
  const [editingFlashSale, setEditingFlashSale] = useState<ShopFlashSale | null | undefined>(undefined)
  const [editingBundle, setEditingBundle] = useState<ShopBundle | null | undefined>(undefined)

  const activeCoupons = coupons.filter(c => c.is_active)
  const activeFlashSales = flashSales.filter(f => f.is_active)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 bg-gray-100/80 rounded-full p-1 w-fit">
        {[
          { key: 'coupons' as OffersTab, label: `Kupony (${coupons.length})`, icon: <Tag className="w-4 h-4" /> },
          { key: 'flash-sales' as OffersTab, label: `Wyprzedaże (${flashSales.length})`, icon: <Zap className="w-4 h-4" /> },
          { key: 'bundles' as OffersTab, label: `Zestawy (${bundles.length})`, icon: <Gift className="w-4 h-4" /> },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-all rounded-full flex items-center gap-2 ${
              tab === t.key ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'coupons' && (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Kody rabatowe</h3>
              <p className="text-sm text-gray-500">{activeCoupons.length} aktywnych kuponów</p>
            </div>
            <button onClick={() => setEditingCoupon(null)} className="px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-full hover:bg-sky-600 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />Nowy kupon
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {coupons.length === 0 ? (
              <div className="p-12 text-center">
                <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Brak kuponów rabatowych</p>
                <button onClick={() => setEditingCoupon(null)} className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-full hover:bg-sky-600 transition-colors">
                  <Plus className="w-4 h-4" />Utwórz pierwszy kupon
                </button>
              </div>
            ) : coupons.map(coupon => (
              <div key={coupon.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${coupon.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Tag className={`w-6 h-6 ${coupon.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{coupon.code}</p>
                      {!coupon.is_active && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Nieaktywny</span>}
                    </div>
                    <p className="text-sm text-gray-500">
                      {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : coupon.discount_type === 'fixed' ? `${coupon.discount_value} PLN` : 'Darmowa dostawa'}
                      {coupon.min_order_value && ` od ${coupon.min_order_value / 100} PLN`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingCoupon(coupon)} className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDeleteCoupon(coupon.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'flash-sales' && (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Wyprzedaże błyskawiczne</h3>
              <p className="text-sm text-gray-500">{activeFlashSales.length} aktywnych wyprzedaży</p>
            </div>
            <button onClick={() => setEditingFlashSale(null)} className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-full hover:bg-red-600 transition-colors flex items-center gap-2">
              <Zap className="w-4 h-4" />Nowa wyprzedaż
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {flashSales.length === 0 ? (
              <div className="p-12 text-center">
                <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Brak aktywnych wyprzedaży</p>
                <button onClick={() => setEditingFlashSale(null)} className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-full hover:bg-red-600 transition-colors">
                  <Zap className="w-4 h-4" />Utwórz wyprzedaż
                </button>
              </div>
            ) : flashSales.map(sale => (
              <div key={sale.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${sale.is_active ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <Zap className={`w-6 h-6 ${sale.is_active ? 'text-red-500' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{sale.name}</p>
                      {sale.is_active && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" />Do wyczerpania</span>}
                    </div>
                    <p className="text-sm text-gray-500">-{sale.discount_value}% {sale.discount_type === 'percentage' ? '' : 'PLN'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingFlashSale(sale)} className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDeleteFlashSale(sale.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'bundles' && (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Zestawy produktów</h3>
              <p className="text-sm text-gray-500">{bundles.length} zestawów</p>
            </div>
            <button onClick={() => setEditingBundle(null)} className="px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-full hover:bg-sky-600 transition-colors flex items-center gap-2">
              <Gift className="w-4 h-4" />Nowy zestaw
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {bundles.length === 0 ? (
              <div className="col-span-full p-12 text-center">
                <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Brak zestawów produktów</p>
                <button onClick={() => setEditingBundle(null)} className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-full hover:bg-sky-600 transition-colors">
                  <Plus className="w-4 h-4" />Utwórz pierwszy zestaw
                </button>
              </div>
            ) : bundles.map(bundle => (
              <div key={bundle.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">{bundle.name}</p>
                  {!bundle.is_active && <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Nieaktywny</span>}
                </div>
                <p className="text-sm text-gray-500 mb-3">{bundle.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-sky-600">{formatPrice(bundle.bundle_price)}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingBundle(bundle)} className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-100 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteBundle(bundle.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editingCoupon !== undefined && (
        <CouponModal coupon={editingCoupon} products={products} onSave={async (data) => {
          if (editingCoupon) await onUpdateCoupon(editingCoupon.id, data)
          else await onCreateCoupon(data)
          setEditingCoupon(undefined)
        }} onClose={() => setEditingCoupon(undefined)} />
      )}
      {editingFlashSale !== undefined && (
        <FlashSaleModal flashSale={editingFlashSale} products={products} categories={categories} onSave={async (data) => {
          if (editingFlashSale) await onUpdateFlashSale(editingFlashSale.id, data)
          else await onCreateFlashSale(data)
          setEditingFlashSale(undefined)
        }} onClose={() => setEditingFlashSale(undefined)} />
      )}
      {editingBundle !== undefined && (
        <BundleModal bundle={editingBundle} products={products} onSave={async (data) => {
          if (editingBundle) await onUpdateBundle(editingBundle.id, data)
          else await onCreateBundle(data)
          setEditingBundle(undefined)
        }} onClose={() => setEditingBundle(undefined)} />
      )}
    </div>
  )
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 2,
  }).format(price / 100)
}
