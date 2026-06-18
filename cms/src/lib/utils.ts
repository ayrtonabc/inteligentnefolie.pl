import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'PLN'): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100);
}

export function slugify(input: string): string {
  return generateSlug(input);
}

export function generateOrderNumber(): string {
  const prefix = 'ZAM';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Product status
    draft: 'bg-gray-100 text-gray-700',
    active: 'bg-green-100 text-green-700',
    archived: 'bg-red-100 text-red-700',
    
    // Order status
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-cyan-100 text-cyan-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-700',
    
    // Payment status
    authorized: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    partially_paid: 'bg-yellow-100 text-yellow-700',
    partially_refunded: 'bg-orange-100 text-orange-700',
    failed: 'bg-red-100 text-red-700',
    
    // Fulfillment status
    unfulfilled: 'bg-yellow-100 text-yellow-700',
    partial: 'bg-blue-100 text-blue-700',
    fulfilled: 'bg-green-100 text-green-700',
  };
  
  return colors[status] || 'bg-gray-100 text-gray-700';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    // Product status
    draft: 'Wersja robocza',
    active: 'Aktywny',
    archived: 'Zarchiwizowany',
    
    // Order status
    pending: 'Oczekujące',
    confirmed: 'Potwierdzone',
    processing: 'W realizacji',
    shipped: 'Wysłane',
    delivered: 'Dostarczone',
    cancelled: 'Anulowane',
    refunded: 'Zwrócone',
    
    // Payment status
    authorized: 'Autoryzowana',
    paid: 'Opłacone',
    partially_paid: 'Częściowo opłacone',
    partially_refunded: 'Częściowo zwrócone',
    failed: 'Nieudane',
    
    // Fulfillment status
    unfulfilled: 'Niewysłane',
    partial: 'Częściowe',
    fulfilled: 'Zrealizowane',
  };
  
  return labels[status] || status;
}
