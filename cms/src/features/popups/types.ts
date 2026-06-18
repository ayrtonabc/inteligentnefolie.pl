// ============================================================================
// POPUP TYPES - Sistema completo de gestión de pop-ups
// ============================================================================

export type PopupTemplate = 'offer' | 'email' | 'contact' | 'custom'
export type PopupStatus = 'active' | 'draft' | 'scheduled' | 'paused'
export type PopupTrigger = 'time' | 'scroll' | 'exit' | 'click' | 'idle'
export type PopupDisplayFrequency = 'once' | 'every_visit' | 'every_page'

export interface PopupCustomField {
  id: string
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea'
  required: boolean
}

export interface PopupData {
  // Base
  id: string
  website_id: string
  name: string
  template: PopupTemplate
  status: PopupStatus

  // Content
  title: string
  subtitle: string
  description: string
  buttonText: string
  buttonUrl: string
  inputPlaceholder: string
  redirectUrl: string
  discountAmount: string
  discountCode: string
  image: string
  customFields: PopupCustomField[]

  // Appearance
  backgroundColor: string
  accentColor: string
  textColor: string
  size?: 'small' | 'medium' | 'large' | 'extra-large'

  // Targeting
  targetPages: string[]  // ['all'] or ['/about', '/contact']
  excludePages: string[] // Pages where NOT to show
  targetDevices: ('desktop' | 'mobile' | 'tablet')[]

  // Triggers
  trigger: PopupTrigger
  triggerValue: number  // seconds for time, % for scroll
  displayFrequency: PopupDisplayFrequency
  displayDelay: number  // seconds
  maxDisplaysPerUser: number

  // Stats
  views: number
  clicks: number
  conversions: number

  // Scheduling
  scheduledStartsAt: string | null
  scheduledEndsAt: string | null

  // Metadata
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface PopupStats {
  totalViews: number
  totalClicks: number
  totalConversions: number
  avgCtr: number
  avgConversionRate: number
}

export interface PopupTemplateOption {
  id: PopupTemplate
  name: string
  description: string
  icon: string
  initialData: Partial<PopupData>
}
