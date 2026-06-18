import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PageHeader from '@/components/PageHeader'
import { pb, TENANT_ID } from '@/lib/pocketbase'
import { Briefcase } from 'lucide-react'
import { PortfolioPage } from './portfolio/PortfolioPage'
import { ProjectFormPage } from './portfolio/ProjectFormPage'
import { ProjectCategoriesPage } from './portfolio/ProjectCategoriesPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

async function getWebsiteId() {
  return TENANT_ID
}

export default function Portfolio() {
  const [active, setActive] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const wid = await getWebsiteId()
        const record = await pb.collection('website_addons').getFirstListItem(
          `website_id = "${wid}" && addon_key = "portfolio"`
        ).catch(() => null)
        
        if (!cancelled) setActive(!!record?.is_active)
      } catch {
        if (!cancelled) setActive(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (active === false) {
    return (
      <div className="page px-6 py-6">
        <PageHeader
          title="Portfolio"
          subtitle="Pokaż swoje projekty i realizacje."
          icon={<Briefcase className="w-6 h-6 text-primary-600" />}
        />
        <div className="mt-4 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-900">Moduł portfolio jest nieaktywny</div>
            <div className="text-sm text-gray-600">Aktywuj go w sekcji „Add-ons”, aby zarządzać portfolio.</div>
            <Link to="/addons" className="btn btn-primary inline-flex">Przejdź do Add-ons</Link>
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
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<PortfolioPage />} />
        <Route path="/new" element={<ProjectFormPage />} />
        <Route path="/:id/edit" element={<ProjectFormPage />} />
        <Route path="/categories" element={<ProjectCategoriesPage />} />
        <Route path="*" element={<Navigate to="/portfolio" replace />} />
      </Routes>
    </QueryClientProvider>
  )
}
