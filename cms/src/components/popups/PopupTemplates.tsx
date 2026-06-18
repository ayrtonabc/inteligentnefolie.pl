import { type PopupData } from '@/features/popups/types'
import { Copy, Check, X } from 'lucide-react'
import { useState } from 'react'

// ============================================================================
// PREVIEW TEMPLATES - Live preview of popups in the editor
// ============================================================================

export function OfferTemplatePreview({ data }: { data: Partial<PopupData> }) {
  return (
    <div className="p-6 text-center" style={{ backgroundColor: data.backgroundColor || '#ffffff', color: data.textColor || '#1f2937' }}>
      {data.image && <img src={data.image} alt="" className="w-16 h-16 mx-auto mb-4 rounded-xl object-cover" />}
      {data.discountAmount && (
        <div className="text-4xl font-black mb-2" style={{ color: data.accentColor || '#0ea5e9' }}>{data.discountAmount}</div>
      )}
      {data.title && <h3 className="text-xl font-bold mb-1">{data.title}</h3>}
      {data.discountCode && (
        <div className="inline-flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 my-3">
          <span className="font-mono font-bold text-sm">{data.discountCode}</span>
          <span className="text-xs text-gray-400">Kod zniżkowy</span>
        </div>
      )}
      {data.description && <p className="text-sm opacity-80 mb-4">{data.description}</p>}
      {data.buttonText && (
        <button className="w-full py-3 rounded-xl font-bold text-white text-sm transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: data.accentColor || '#0ea5e9' }}>
          {data.buttonText}
        </button>
      )}
    </div>
  )
}

export function EmailTemplatePreview({ data }: { data: Partial<PopupData> }) {
  return (
    <div className="p-6" style={{ backgroundColor: data.backgroundColor || '#ffffff', color: data.textColor || '#1f2937' }}>
      <div className="text-center">
        {data.image && <img src={data.image} alt="" className="w-20 h-20 mx-auto mb-4 rounded-full object-cover" />}
        {data.title && <h3 className="text-xl font-bold mb-1">{data.title}</h3>}
        {data.subtitle && <p className="text-sm font-medium mb-1" style={{ color: data.accentColor }}>{data.subtitle}</p>}
        {data.description && <p className="text-sm opacity-70 mb-4">{data.description}</p>}
      </div>
      <input type="email" placeholder={data.inputPlaceholder || 'Twój adres email...'}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm mb-3" readOnly />
      {data.buttonText && (
        <button className="w-full py-3 rounded-xl font-bold text-white text-sm transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: data.accentColor || '#0ea5e9' }}>
          {data.buttonText}
        </button>
      )}
      <p className="text-[10px] text-center opacity-50 mt-3">🔒 Bez spamu. Możesz wypisać się w każdej chwili.</p>
    </div>
  )
}

export function ContactTemplatePreview({ data }: { data: Partial<PopupData> }) {
  return (
    <div className="p-6" style={{ backgroundColor: data.backgroundColor || '#ffffff', color: data.textColor || '#1f2937' }}>
      {data.image && <img src={data.image} alt="" className="w-full h-24 mb-4 rounded-xl object-cover" />}
      {data.title && <h3 className="text-lg font-bold mb-1">{data.title}</h3>}
      {data.description && <p className="text-sm opacity-70 mb-4">{data.description}</p>}
      <div className="space-y-2 mb-4">
        {(data.customFields?.length ? data.customFields : [
          { id: '1', label: 'Imię', type: 'text' as const, required: true },
          { id: '2', label: 'Email', type: 'email' as const, required: true },
        ]).map((field) => (
          <input key={field.id} type={field.type} placeholder={field.label}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" readOnly />
        ))}
      </div>
      {data.buttonText && (
        <button className="w-full py-3 rounded-xl font-bold text-white text-sm transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: data.accentColor || '#0ea5e9' }}>
          {data.buttonText}
        </button>
      )}
    </div>
  )
}

export function CustomTemplatePreview({ data }: { data: Partial<PopupData> }) {
  if (data.image) {
    return (
      <div className="relative cursor-pointer" style={{ backgroundColor: data.backgroundColor || '#ffffff' }}>
        <img src={data.image} alt="" className="w-full object-cover" />
        {data.buttonText && (
          <div className="absolute bottom-4 left-4 right-4">
            <button className="w-full py-3 rounded-xl font-bold text-white text-sm shadow-lg"
              style={{ backgroundColor: data.accentColor || '#0ea5e9' }}>
              {data.buttonText}
            </button>
          </div>
        )}
      </div>
    )
  }
  return (
    <div className="p-8 text-center text-gray-400">
      <p className="text-sm">Dodaj obraz aby zobaczyć podgląd</p>
    </div>
  )
}

// ============================================================================
// TEMPLATE SELECTOR
// ============================================================================

export const POPUP_TEMPLATES: Array<{
  id: string; name: string; description: string; icon: string;
  initialData: Partial<PopupData>
}> = [
  {
    id: 'offer', name: 'Oferta / Zniżka', description: 'Pop-up z kodem rabatowym i licznikiem', icon: '🏷️',
    initialData: {
      title: 'Oferta Specjalna!', subtitle: 'Tylko dzisiaj!', discountAmount: '50%',
      discountCode: 'LUCKY50', description: 'Użyj kodu przy zakupie',
      buttonText: 'Kupuję teraz!', backgroundColor: '#ffffff', accentColor: '#0ea5e9', textColor: '#1f2937',
      targetPages: ['all'], targetDevices: ['desktop', 'mobile', 'tablet'],
      trigger: 'time', triggerValue: 5, displayFrequency: 'once', displayDelay: 0, maxDisplaysPerUser: 1,
      customFields: [],
    }
  },
  {
    id: 'email', name: 'Newsletter', description: 'Zbieraj emaile i buduj listę', icon: '📧',
    initialData: {
      title: 'Dołącz do Newslettera', subtitle: 'Bądź na bieżąco!',
      description: 'Otrzymuj najlepsze oferty i porady prosto na email.',
      buttonText: 'Subskrybuję!', inputPlaceholder: 'Twój adres email...',
      backgroundColor: '#ffffff', accentColor: '#10b981', textColor: '#1f2937',
      targetPages: ['all'], targetDevices: ['desktop', 'mobile', 'tablet'],
      trigger: 'exit', triggerValue: 0, displayFrequency: 'once', displayDelay: 0, maxDisplaysPerUser: 1,
      customFields: [],
    }
  },
  {
    id: 'contact', name: 'Formularz Kontaktowy', description: 'Wielopolowy formularz kontaktowy', icon: '📝',
    initialData: {
      title: 'Skontaktuj się z Nami', description: 'Wypełnij formularz, odezwiemy się szybko.',
      buttonText: 'Wyślij wiadomość',
      backgroundColor: '#ffffff', accentColor: '#8b5cf6', textColor: '#1f2937',
      targetPages: ['all'], targetDevices: ['desktop', 'mobile', 'tablet'],
      trigger: 'scroll', triggerValue: 50, displayFrequency: 'once', displayDelay: 0, maxDisplaysPerUser: 1,
      customFields: [
        { id: '1', label: 'Imię i Nazwisko', type: 'text', required: true },
        { id: '2', label: 'Adres Email', type: 'email', required: true },
        { id: '3', label: 'Numer Telefonu', type: 'tel', required: false },
      ],
    }
  },
  {
    id: 'custom', name: 'Własny Baner', description: 'Prosty baner z obrazkiem i linkiem', icon: '🖼️',
    initialData: {
      buttonText: 'Dowiedz się więcej', redirectUrl: '',
      backgroundColor: '#ffffff', accentColor: '#f59e0b', textColor: '#1f2937',
      targetPages: ['all'], targetDevices: ['desktop', 'mobile', 'tablet'],
      trigger: 'time', triggerValue: 3, displayFrequency: 'once', displayDelay: 0, maxDisplaysPerUser: 1,
      customFields: [],
    }
  },
]

export function TemplateSelector({ onSelect }: { onSelect: (templateId: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {POPUP_TEMPLATES.map(template => (
        <button key={template.id} onClick={() => onSelect(template.id)}
          className="p-5 bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all text-left group">
          <div className="text-3xl mb-3">{template.icon}</div>
          <h4 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{template.name}</h4>
          <p className="text-xs text-gray-500">{template.description}</p>
        </button>
      ))}
    </div>
  )
}
