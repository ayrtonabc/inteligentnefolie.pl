import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PageHeader from '@/components/PageHeader'
import { pb } from '@/lib/pocketbase'
import { CalendarClock } from 'lucide-react'
import { BookingsCalendarPage } from './bookings/BookingsCalendarPage'
import { BookingsListPage } from './bookings/BookingsListPage'
import { BookingFormPage } from './bookings/BookingFormPage'
import { ServicesPage } from './bookings/ServicesPage'
import { ClientsPage } from './bookings/ClientsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

export default function Bookings() {
  const [active, setActive] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const record = await pb.collection('website_addons').getFirstListItem('addon_key = "bookings"')
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
          title="Rezerwacje"
          subtitle="Terminy, zgłoszenia, potwierdzenia."
          icon={<CalendarClock className="w-6 h-6 text-primary-600" />}
        />
        <div className="mt-4 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-900">Moduł jest nieaktywny</div>
            <div className="text-sm text-gray-600">Aktywuj go w “Dodatki”, aby odblokować rezerwacje.</div>
            <Link to="/addons" className="btn btn-primary inline-flex">Przejdź do Dodatków</Link>
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
        <Route path="/" element={<BookingsCalendarPage />} />
        <Route path="/list" element={<BookingsListPage />} />
        <Route path="/new" element={<BookingFormPage />} />
        <Route path="/:id/edit" element={<BookingFormPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="*" element={<Navigate to="/panel/bookings" replace />} />
      </Routes>
    </QueryClientProvider>
  )
}
