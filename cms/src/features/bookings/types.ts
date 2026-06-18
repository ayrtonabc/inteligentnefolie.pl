// ============================================================================
// TIPOS PARA SISTEMA DE RESERVAS
// ============================================================================

// Servicios
export interface BookingService {
  id: string
  website_id: string
  name: string
  description?: string
  duration_minutes: number
  price: number
  currency: string
  is_active: boolean
  color: string
  max_bookings_per_slot: number
  buffer_before_minutes: number
  buffer_after_minutes: number
  created_at: string
  updated_at: string
}

export interface BookingServiceFormData {
  name: string
  description?: string
  duration_minutes: number
  price: number
  currency?: string
  is_active?: boolean
  color?: string
  max_bookings_per_slot?: number
  buffer_before_minutes?: number
  buffer_after_minutes?: number
}

// Horarios
export interface BookingSchedule {
  id: string
  website_id: string
  service_id?: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
  specific_date?: string
  created_at: string
  updated_at: string
}

export interface BookingScheduleFormData {
  service_id?: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active?: boolean
  specific_date?: string
}

// Excepciones de horario
export interface BookingScheduleException {
  id: string
  website_id: string
  exception_date: string
  exception_type: 'closed' | 'special'
  start_time?: string
  end_time?: string
  description?: string
  created_at: string
}

export interface BookingScheduleExceptionFormData {
  exception_date: string
  exception_type: 'closed' | 'special'
  start_time?: string
  end_time?: string
  description?: string
}

// Clientes
export interface BookingClient {
  id: string
  website_id: string
  first_name: string
  last_name?: string
  email?: string
  phone?: string
  notes?: string
  total_bookings: number
  completed_bookings: number
  cancelled_bookings: number
  no_show_bookings: number
  created_at: string
  updated_at: string
  
  // Computado
  full_name?: string
}

export interface BookingClientFormData {
  first_name: string
  last_name?: string
  email?: string
  phone?: string
  notes?: string
}

// Reservas
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded'
export type BookingSource = 'website' | 'phone' | 'walk_in' | 'api' | 'import'

export interface Booking {
  id: string
  website_id: string
  service_id: string
  client_id: string
  booking_date: string
  start_time: string
  end_time: string
  status: BookingStatus
  payment_status: PaymentStatus
  payment_amount: number
  client_notes?: string
  staff_notes?: string
  source: BookingSource
  external_reference?: string
  reminder_sent: boolean
  reminder_sent_at?: string
  created_at: string
  updated_at: string
  created_by?: string
  cancelled_by?: string
  cancellation_reason?: string
  
  // Relaciones
  service?: BookingService
  client?: BookingClient
}

export interface BookingFormData {
  service_id: string
  client_id: string
  booking_date: string
  start_time: string
  end_time: string
  status?: BookingStatus
  payment_status?: PaymentStatus
  payment_amount?: number
  client_notes?: string
  staff_notes?: string
  source?: BookingSource
}

// Filtros
export interface BookingFilters {
  status?: BookingStatus | BookingStatus[]
  service_id?: string
  client_id?: string
  date_from?: string
  date_to?: string
  source?: BookingSource
  payment_status?: PaymentStatus
}

// Stats
export interface BookingStats {
  total_bookings: number
  pending_bookings: number
  confirmed_bookings: number
  completed_bookings: number
  cancelled_bookings: number
  today_bookings: number
  this_week_bookings: number
  this_month_bookings: number
  total_revenue: number
  paid_revenue: number
  pending_revenue: number
}

// Slot de disponibilidad
export interface BookingSlot {
  slot_start: string
  slot_end: string
  is_available: boolean
}

// Vista de calendario
export interface CalendarViewBooking extends Booking {
  // Propiedades computadas para el calendario
  display_time: string
  display_duration: string
  color_class: string
}
