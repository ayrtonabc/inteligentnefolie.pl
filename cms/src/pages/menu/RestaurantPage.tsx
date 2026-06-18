import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PageHeader from '@/components/PageHeader'
import { pb, TENANT_ID } from '@/lib/pocketbase'
import { UtensilsCrossed, Settings } from 'lucide-react'
import RestaurantDashboard from './MenuPage'
import ProductFormPage from './ProductFormPage'
import MenuProductListPage from './MenuProductListPage'
import CategoryFormPage from './CategoryFormPage'
import QRPage from '../restaurant/QRPage'
import OrderDetailPage from '../restaurant/OrderDetailPage'
import SettingsPage from '../restaurant/SettingsPage'
import KitchenDisplayPage from '../restaurant/KitchenDisplayPage'
import MenuPreviewCustomizer from './MenuPreviewCustomizer'
import UsersPage from '../restaurant/UsersPage'

const restaurantQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

export default function Restaurant() {
  const [active, setActive] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const wid = TENANT_ID
        const record = await pb.collection('website_addons').getFirstListItem(
          `website_id = "${wid}" && addon_key = "restaurant"`
        ).catch(() => null)
        
        if (!cancelled) setActive(!!record?.is_active)
      } catch {
        if (!cancelled) setActive(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  if (active === false) {
    return (
      <div className="page px-6 py-6">
        <PageHeader
          title="Restauracja"
          subtitle="System zarządzania restauracją z menu QR."
          icon={<UtensilsCrossed className="w-6 h-6 text-primary-600" />}
        />
        <div className="mt-4 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Moduł restauracji jest nieaktywny</h3>
            <p className="text-gray-600 mb-4">Aktywuj go w "Dodatkach", aby zarządzać zamówieniami i menu.</p>
            <Link to="/addons" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Settings className="w-4 h-4" />
              Przejdź do Dodatków
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (active === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={restaurantQueryClient}>
      <Routes>
        <Route path="/" element={<RestaurantDashboard />} />
        <Route path="/products" element={<MenuProductListPage />} />
        <Route path="/products/new" element={<ProductFormPage />} />
        <Route path="/products/:id/edit" element={<ProductFormPage />} />
        <Route path="/categories/new" element={<CategoryFormPage />} />
        <Route path="/preview" element={<MenuPreviewCustomizer />} />
        <Route path="/qr" element={<QRPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/kitchen" element={<KitchenDisplayPage />} />
        <Route path="*" element={<Navigate to="/restaurant" replace />} />
      </Routes>
    </QueryClientProvider>
  )
}

