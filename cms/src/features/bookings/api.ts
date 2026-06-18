import { pb, TENANT_ID } from '@/lib/pocketbase'
import type {
  BookingService,
  BookingServiceFormData,
  BookingSchedule,
  BookingScheduleFormData,
  BookingScheduleException,
  BookingScheduleExceptionFormData,
  BookingClient,
  BookingClientFormData,
  Booking,
  BookingFormData,
  BookingFilters,
  BookingStats,
  BookingSlot,
} from './types'

export async function getWebsiteId(): Promise<string> {
  return TENANT_ID
}

function escapePbFilterValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

export class BookingServicesAPI {
  async getServices(websiteId: string): Promise<BookingService[]> {
    const records = await pb.collection('booking_services').getFullList({
      filter: `website_id = "${escapePbFilterValue(websiteId)}"`,
      sort: 'name',
      requestKey: null,
    })
    return records as unknown as BookingService[]
  }

  async getService(id: string): Promise<BookingService | null> {
    try {
      const record = await pb.collection('booking_services').getOne(id)
      return record as unknown as BookingService
    } catch {
      return null
    }
  }

  async createService(websiteId: string, data: BookingServiceFormData): Promise<BookingService> {
    const record = await pb.collection('booking_services').create({
      website_id: websiteId,
      name: data.name,
      description: data.description || '',
      duration_minutes: data.duration_minutes || 60,
      price: data.price || 0,
      currency: data.currency || 'PLN',
      is_active: data.is_active ?? true,
      color: data.color || '#3B82F6',
      max_bookings_per_slot: data.max_bookings_per_slot || 1,
      buffer_before_minutes: data.buffer_before_minutes || 0,
      buffer_after_minutes: data.buffer_after_minutes || 0,
    })
    return record as unknown as BookingService
  }

  async updateService(id: string, updates: Partial<BookingServiceFormData>): Promise<BookingService> {
    const payload: Record<string, unknown> = {}
    if (updates.name !== undefined) payload.name = updates.name
    if (updates.description !== undefined) payload.description = updates.description
    if (updates.duration_minutes !== undefined) payload.duration_minutes = updates.duration_minutes
    if (updates.price !== undefined) payload.price = updates.price
    if (updates.currency !== undefined) payload.currency = updates.currency
    if (updates.is_active !== undefined) payload.is_active = updates.is_active
    if (updates.color !== undefined) payload.color = updates.color
    if (updates.max_bookings_per_slot !== undefined) payload.max_bookings_per_slot = updates.max_bookings_per_slot

    const record = await pb.collection('booking_services').update(id, payload)
    return record as unknown as BookingService
  }

  async deleteService(id: string): Promise<void> {
    await pb.collection('booking_services').delete(id)
  }
}

export class BookingSchedulesAPI {
  async getSchedules(websiteId: string): Promise<BookingSchedule[]> {
    const records = await pb.collection('booking_schedules').getFullList({
      filter: `website_id = "${escapePbFilterValue(websiteId)}"`,
      sort: 'day_of_week,start_time',
      requestKey: null,
    })
    return records as unknown as BookingSchedule[]
  }

  async getSchedulesForService(websiteId: string, serviceId: string): Promise<BookingSchedule[]> {
    const records = await pb.collection('booking_schedules').getFullList({
      filter: `website_id = "${escapePbFilterValue(websiteId)}" && (service_id = "${serviceId}" || service_id = "")`,
      sort: 'day_of_week,start_time',
      requestKey: null,
    })
    return records as unknown as BookingSchedule[]
  }

  async createSchedule(websiteId: string, data: BookingScheduleFormData): Promise<BookingSchedule> {
    const record = await pb.collection('booking_schedules').create({
      website_id: websiteId,
      service_id: data.service_id || null,
      day_of_week: data.day_of_week,
      start_time: data.start_time,
      end_time: data.end_time,
      is_active: data.is_active ?? true,
      specific_date: data.specific_date || null,
    })
    return record as unknown as BookingSchedule
  }

  async updateSchedule(id: string, updates: Partial<BookingScheduleFormData>): Promise<BookingSchedule> {
    const payload: Record<string, unknown> = {}
    if (updates.service_id !== undefined) payload.service_id = updates.service_id
    if (updates.day_of_week !== undefined) payload.day_of_week = updates.day_of_week
    if (updates.start_time !== undefined) payload.start_time = updates.start_time
    if (updates.end_time !== undefined) payload.end_time = updates.end_time
    if (updates.is_active !== undefined) payload.is_active = updates.is_active
    if (updates.specific_date !== undefined) payload.specific_date = updates.specific_date

    const record = await pb.collection('booking_schedules').update(id, payload)
    return record as unknown as BookingSchedule
  }

  async deleteSchedule(id: string): Promise<void> {
    await pb.collection('booking_schedules').delete(id)
  }

  async getExceptions(websiteId: string): Promise<BookingScheduleException[]> {
    const records = await pb.collection('booking_exceptions').getFullList({
      filter: `website_id = "${escapePbFilterValue(websiteId)}"`,
      sort: 'exception_date',
      requestKey: null,
    })
    return records as unknown as BookingScheduleException[]
  }
}

export class BookingScheduleExceptionsAPI {
  async getExceptions(websiteId: string): Promise<BookingScheduleException[]> {
    const records = await pb.collection('booking_exceptions').getFullList({
      filter: `website_id = "${escapePbFilterValue(websiteId)}"`,
      sort: 'exception_date',
      requestKey: null,
    })
    return records as unknown as BookingScheduleException[]
  }

  async createException(websiteId: string, data: BookingScheduleExceptionFormData): Promise<BookingScheduleException> {
    const record = await pb.collection('booking_exceptions').create({
      website_id: websiteId,
      exception_date: data.exception_date,
      exception_type: data.exception_type || 'closed',
      start_time: data.start_time || null,
      end_time: data.end_time || null,
      description: data.description || '',
    })
    return record as unknown as BookingScheduleException
  }

  async deleteException(id: string): Promise<void> {
    await pb.collection('booking_exceptions').delete(id)
  }
}

export class BookingClientsAPI {
  async getClients(websiteId: string): Promise<BookingClient[]> {
    const records = await pb.collection('booking_clients').getFullList({
      filter: `website_id = "${escapePbFilterValue(websiteId)}"`,
      sort: '-created',
      requestKey: null,
    })
    return records as unknown as BookingClient[]
  }

  async getClient(id: string): Promise<BookingClient | null> {
    try {
      const record = await pb.collection('booking_clients').getOne(id)
      return record as unknown as BookingClient
    } catch {
      return null
    }
  }

  async createClient(websiteId: string, data: BookingClientFormData): Promise<BookingClient> {
    const record = await pb.collection('booking_clients').create({
      website_id: websiteId,
      first_name: data.first_name,
      last_name: data.last_name || null,
      email: data.email || null,
      phone: data.phone || null,
      notes: data.notes || '',
    })
    return record as unknown as BookingClient
  }

  async updateClient(id: string, updates: Partial<BookingClientFormData>): Promise<BookingClient> {
    const payload: Record<string, unknown> = {}
    if (updates.first_name !== undefined) payload.first_name = updates.first_name
    if (updates.last_name !== undefined) payload.last_name = updates.last_name
    if (updates.email !== undefined) payload.email = updates.email
    if (updates.phone !== undefined) payload.phone = updates.phone
    if (updates.notes !== undefined) payload.notes = updates.notes

    const record = await pb.collection('booking_clients').update(id, payload)
    return record as unknown as BookingClient
  }

  async deleteClient(id: string): Promise<void> {
    await pb.collection('booking_clients').delete(id)
  }
}

export class BookingsAPI {
  async getBookings(websiteId: string, filters?: BookingFilters): Promise<Booking[]> {
    const filterParts: string[] = [`website_id = "${escapePbFilterValue(websiteId)}"`]
    
    if (filters?.status) {
      const statusValue = Array.isArray(filters.status) ? filters.status[0] : filters.status
      filterParts.push(`status = "${statusValue}"`)
    }
    if (filters?.service_id) {
      filterParts.push(`service_id = "${filters.service_id}"`)
    }
    if (filters?.date_from) {
      filterParts.push(`booking_date >= "${filters.date_from}"`)
    }
    if (filters?.date_to) {
      filterParts.push(`booking_date <= "${filters.date_to}"`)
    }

    const records = await pb.collection('bookings').getFullList({
      filter: filterParts.join(' && '),
      sort: '-booking_date',
      requestKey: null,
    })
    return records as unknown as Booking[]
  }

  async getBookingsForDate(websiteId: string, date: string): Promise<Booking[]> {
    const records = await pb.collection('bookings').getFullList({
      filter: `website_id = "${escapePbFilterValue(websiteId)}" && booking_date = "${date}"`,
      sort: 'start_time',
      requestKey: null,
    })
    return records as unknown as Booking[]
  }

  async getBooking(id: string): Promise<Booking | null> {
    try {
      const record = await pb.collection('bookings').getOne(id)
      return record as unknown as Booking
    } catch {
      return null
    }
  }

  async createBooking(websiteId: string, data: BookingFormData): Promise<Booking> {
    const record = await pb.collection('bookings').create({
      website_id: websiteId,
      service_id: data.service_id,
      client_id: data.client_id,
      booking_date: data.booking_date,
      start_time: data.start_time,
      end_time: data.end_time,
      status: data.status || 'pending',
      payment_status: data.payment_status || 'pending',
      payment_amount: data.payment_amount || 0,
      client_notes: data.client_notes || '',
      staff_notes: data.staff_notes || '',
      source: data.source || 'website',
    })
    return record as unknown as Booking
  }

  async updateBooking(id: string, updates: Partial<BookingFormData>): Promise<Booking> {
    const payload: Record<string, unknown> = {}
    if (updates.service_id !== undefined) payload.service_id = updates.service_id
    if (updates.client_id !== undefined) payload.client_id = updates.client_id
    if (updates.booking_date !== undefined) payload.booking_date = updates.booking_date
    if (updates.start_time !== undefined) payload.start_time = updates.start_time
    if (updates.end_time !== undefined) payload.end_time = updates.end_time
    if (updates.status !== undefined) payload.status = updates.status
    if (updates.payment_status !== undefined) payload.payment_status = updates.payment_status
    if (updates.payment_amount !== undefined) payload.payment_amount = updates.payment_amount
    if (updates.client_notes !== undefined) payload.client_notes = updates.client_notes
    if (updates.staff_notes !== undefined) payload.staff_notes = updates.staff_notes

    const record = await pb.collection('bookings').update(id, payload)
    return record as unknown as Booking
  }

  async updateStatus(id: string, status: string, reason?: string): Promise<void> {
    const payload: Record<string, unknown> = { status }
    if (status === 'cancelled' && reason) {
      payload.cancellation_reason = reason
    }
    await pb.collection('bookings').update(id, payload)
  }

  async deleteBooking(id: string): Promise<void> {
    await pb.collection('bookings').delete(id)
  }
}

export async function getBookingStats(websiteId: string): Promise<BookingStats> {
  const today = new Date().toISOString().split('T')[0]
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const monthStart = new Date()
  monthStart.setDate(1)
  const monthStartStr = monthStart.toISOString().split('T')[0]
  
  const bookings = await pb.collection('bookings').getFullList({
    filter: `website_id = "${escapePbFilterValue(websiteId)}"`,
    fields: 'id,status,booking_date,payment_status,payment_amount',
    requestKey: null,
  }) as unknown as Array<{ status: string; booking_date: string; payment_status: string; payment_amount: number }>

  const totalBookings = bookings.length
  const pendingBookings = bookings.filter(b => b.status === 'pending').length
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length
  const completedBookings = bookings.filter(b => b.status === 'completed').length
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length
  const todayBookings = bookings.filter(b => b.booking_date === today).length
  const thisWeekBookings = bookings.filter(b => b.booking_date >= weekStartStr).length
  const thisMonthBookings = bookings.filter(b => b.booking_date >= monthStartStr).length

  const paidBookings = bookings.filter(b => b.payment_status === 'paid')
  const pendingPaymentBookings = bookings.filter(b => b.payment_status === 'pending')
  
  const totalRevenue = completedBookings + paidBookings.length > 0
    ? paidBookings.reduce((sum, b) => sum + (b.payment_amount || 0), 0)
    : 0
  const paidRevenue = totalRevenue
  const pendingRevenue = pendingPaymentBookings.reduce((sum, b) => sum + (b.payment_amount || 0), 0)

  return {
    total_bookings: totalBookings,
    pending_bookings: pendingBookings,
    confirmed_bookings: confirmedBookings,
    completed_bookings: completedBookings,
    cancelled_bookings: cancelledBookings,
    today_bookings: todayBookings,
    this_week_bookings: thisWeekBookings,
    this_month_bookings: thisMonthBookings,
    total_revenue: totalRevenue,
    paid_revenue: paidRevenue,
    pending_revenue: pendingRevenue,
  }
}

export async function getAvailableSlots(
  websiteId: string,
  serviceId: string,
  date: string
): Promise<BookingSlot[]> {
  const bookings = await pb.collection('bookings').getFullList({
    filter: `website_id = "${escapePbFilterValue(websiteId)}" && booking_date = "${date}" && status != "cancelled"`,
    fields: 'start_time,end_time',
    requestKey: null,
  }) as unknown as Array<{ start_time: string; end_time: string }>

  const bookedTimes = bookings.map(b => ({
    start: b.start_time,
    end: b.end_time,
  }))

  return bookedTimes.map(slot => ({
    slot_start: slot.start,
    slot_end: slot.end,
    is_available: false,
  }))
}

export const bookingServicesAPI = new BookingServicesAPI()
export const bookingSchedulesAPI = new BookingSchedulesAPI()
export const bookingScheduleExceptionsAPI = new BookingScheduleExceptionsAPI()
export const bookingClientsAPI = new BookingClientsAPI()
export const bookingsAPI = new BookingsAPI()

export const bookingsApi = {
  services: bookingServicesAPI,
  schedules: bookingSchedulesAPI,
  exceptions: bookingScheduleExceptionsAPI,
  clients: bookingClientsAPI,
  bookings: bookingsAPI,
  getWebsiteId,
  getBookingStats,
  getAvailableSlots,
}