import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  bookingServicesAPI,
  bookingSchedulesAPI,
  bookingClientsAPI,
  bookingsAPI,
  getWebsiteId,
  getBookingStats,
  getAvailableSlots,
} from './api'
import type {
  BookingServiceFormData,
  BookingScheduleFormData,
  BookingScheduleExceptionFormData,
  BookingClientFormData,
  BookingFormData,
  BookingFilters,
} from './types'

// ============================================================================
// WEBSITE ID
// ============================================================================

export function useWebsiteId() {
  return useQuery({
    queryKey: ['websiteId'],
    queryFn: () => getWebsiteId(),
    staleTime: 1000 * 60 * 60,
  })
}

// ============================================================================
// HOOKS DE SERVICIOS
// ============================================================================

export function useBookingServices(websiteId: string) {
  return useQuery({
    queryKey: ['bookingServices', websiteId],
    queryFn: () => bookingServicesAPI.getServices(websiteId),
    enabled: !!websiteId,
  })
}

export function useBookingService(id: string) {
  return useQuery({
    queryKey: ['bookingService', id],
    queryFn: () => bookingServicesAPI.getService(id),
    enabled: !!id,
  })
}

export function useCreateBookingService(websiteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BookingServiceFormData) => bookingServicesAPI.createService(websiteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingServices', websiteId] })
    },
  })
}

export function useUpdateBookingService(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (updates: Partial<BookingServiceFormData>) => bookingServicesAPI.updateService(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingService', id] })
      queryClient.invalidateQueries({ queryKey: ['bookingServices'] })
    },
  })
}

export function useDeleteBookingService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bookingServicesAPI.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingServices'] })
    },
  })
}

// ============================================================================
// HOOKS DE HORARIOS
// ============================================================================

export function useBookingSchedules(websiteId: string) {
  return useQuery({
    queryKey: ['bookingSchedules', websiteId],
    queryFn: () => bookingSchedulesAPI.getSchedules(websiteId),
    enabled: !!websiteId,
  })
}

export function useCreateBookingSchedule(websiteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BookingScheduleFormData) => bookingSchedulesAPI.createSchedule(websiteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingSchedules', websiteId] })
    },
  })
}

export function useDeleteBookingSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bookingSchedulesAPI.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingSchedules'] })
    },
  })
}

export function useBookingExceptions(websiteId: string) {
  return useQuery({
    queryKey: ['bookingExceptions', websiteId],
    queryFn: () => bookingSchedulesAPI.getExceptions(websiteId),
    enabled: !!websiteId,
  })
}

// ============================================================================
// HOOKS DE CLIENTES
// ============================================================================

export function useBookingClients(websiteId: string) {
  return useQuery({
    queryKey: ['bookingClients', websiteId],
    queryFn: () => bookingClientsAPI.getClients(websiteId),
    enabled: !!websiteId,
  })
}

export function useBookingClient(id: string) {
  return useQuery({
    queryKey: ['bookingClient', id],
    queryFn: () => bookingClientsAPI.getClient(id),
    enabled: !!id,
  })
}

export function useCreateBookingClient(websiteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BookingClientFormData) => bookingClientsAPI.createClient(websiteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingClients', websiteId] })
    },
  })
}

export function useUpdateBookingClient(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (updates: Partial<BookingClientFormData>) => bookingClientsAPI.updateClient(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingClient', id] })
      queryClient.invalidateQueries({ queryKey: ['bookingClients'] })
    },
  })
}

// ============================================================================
// HOOKS DE RESERVAS
// ============================================================================

export function useBookings(websiteId: string, filters?: BookingFilters) {
  return useQuery({
    queryKey: ['bookings', websiteId, filters],
    queryFn: () => bookingsAPI.getBookings(websiteId, filters),
    enabled: !!websiteId,
  })
}

export function useBookingsForDate(websiteId: string, date: string) {
  return useQuery({
    queryKey: ['bookings', websiteId, 'date', date],
    queryFn: () => bookingsAPI.getBookingsForDate(websiteId, date),
    enabled: !!websiteId && !!date,
  })
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsAPI.getBooking(id),
    enabled: !!id,
  })
}

export function useCreateBooking(websiteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BookingFormData) => bookingsAPI.createBooking(websiteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', websiteId] })
      queryClient.invalidateQueries({ queryKey: ['bookingStats', websiteId] })
    },
  })
}

export function useUpdateBooking(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (updates: Partial<BookingFormData>) => bookingsAPI.updateBooking(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      bookingsAPI.updateStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['bookingStats'] })
    },
  })
}

export function useDeleteBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bookingsAPI.deleteBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['bookingStats'] })
    },
  })
}

export function useAvailableSlots(websiteId: string, serviceId: string, date: string) {
  return useQuery({
    queryKey: ['availableSlots', websiteId, serviceId, date],
    queryFn: () => getAvailableSlots(websiteId, serviceId, date),
    enabled: !!websiteId && !!serviceId && !!date,
  })
}

// ============================================================================
// STATS
// ============================================================================

export function useBookingStats(websiteId: string) {
  return useQuery({
    queryKey: ['bookingStats', websiteId],
    queryFn: () => getBookingStats(websiteId),
    enabled: !!websiteId,
  })
}
