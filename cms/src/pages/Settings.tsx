import { useState, useCallback, useEffect } from 'react'
import { 
  Settings as SettingsIcon, 
  Settings2,
  X,
  Globe, 
  Eye, 
  Plug, 
  Search, 
  Cog, 
  Save, 
  ShieldCheck,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Code,
  Clock,
  Calendar,
  Sparkles,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useWebsiteId, useSettings, useUpdateSettings, settingsToFormData, useToggleMaintenance, useUploadSEOImage } from '@/features/settings/hooks'
import { LANGUAGE_OPTIONS, TIMEZONE_OPTIONS, DATE_FORMAT_OPTIONS } from '@/features/settings/types'
import type { SettingsSection, WebsiteSettingsFormData } from '@/features/settings/types'
import { GDPRSection } from './GDPRSection'

// ============================================
// COMPONENTE: SECCIÓN GENERAL
// ============================================// ============================================
// COMPONENTE: SECCIÓN VISIBILIDAD
// ============================================
function VisibilitySection({ 
  data, 
  onChange,
  onToggleMaintenance,
  isToggling
}: { 
  data: WebsiteSettingsFormData
  onChange: (field: keyof WebsiteSettingsFormData, value: unknown) => void
  onToggleMaintenance: (enabled: boolean) => void
  isToggling: boolean
}) {
  return (
    <div className="space-y-6">
      {/* Modo Mantenimiento Toggle */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Tryb konserwacji</h3>
            <p className="text-sm text-gray-600 mb-4">
              Gdy aktywny, strona będzie niedostępna dla odwiedzających.
              Przydatne podczas aktualizacji.
            </p>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleMaintenance(!data.maintenance_mode)}
                disabled={isToggling}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  data.maintenance_mode ? 'bg-yellow-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    data.maintenance_mode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`font-medium ${data.maintenance_mode ? 'text-yellow-700' : 'text-gray-600'}`}>
                {isToggling ? 'Przetwarzanie...' : (data.maintenance_mode ? 'Włączone' : 'Wyłączone')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de mantenimiento */}
      {data.maintenance_mode && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Komunikat konserwacji
          </label>
          <textarea
            value={data.maintenance_message}
            onChange={(e) => onChange('maintenance_message', e.target.value)}
            placeholder="np. Pracujemy nad ulepszeniami. Wracamy o 14:00."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Wyświetlany odwiedzającym podczas konserwacji
          </p>
        </div>
      )}

      {/* Allow Admin Access */}
      <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
        <input
          type="checkbox"
          id="allow_admin"
          checked={data.maintenance_allow_admin}
          onChange={(e) => onChange('maintenance_allow_admin', e.target.checked)}
          className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300"
        />
        <div>
          <label htmlFor="allow_admin" className="text-sm font-medium text-gray-900 cursor-pointer">
            Pozwól administratorowi na podgląd strony
          </label>
          <p className="text-xs text-gray-500">
            Gdy zalogowany, administrator może widzieć stronę normalnie
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// COMPONENTE: INTEGRATION MODAL
// ============================================
function IntegrationModal({
  isOpen,
  onClose,
  title,
  icon,
  value,
  onSave,
  placeholder,
  validation,
  helpText,
  type = 'text'
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  icon: React.ReactNode
  value: string
  onSave: (value: string) => void
  placeholder: string
  validation: (val: string) => boolean
  helpText?: string
  type?: 'text' | 'textarea'
}) {
  const [inputValue, setInputValue] = useState(value)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSave = () => {
    if (!validation(inputValue)) {
      setError('Nieprawidłowy format')
      return
    }
    onSave(inputValue)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {icon}
            <h3 className="font-semibold text-gray-900">{title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {type === 'textarea' ? (
            <textarea
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                setError(null)
              }}
              placeholder={placeholder}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          ) : (
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                setError(null)
              }}
              placeholder={placeholder}
              className={`w-full ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
          )}
          
          {error && (
            <p className="text-xs text-red-500 mt-2">{error}</p>
          )}
          
          {helpText && (
            <p className="text-xs text-gray-500 mt-2">{helpText}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose}>Anuluj</Button>
          <Button onClick={handleSave}>Zapisz</Button>
        </div>
      </div>
    </div>
  )
}

function ServerCard({
  title,
  icon,
  iconBg,
  isConnected,
  onConfigure
}: {
  title: string
  icon: React.ReactNode
  iconBg: string
  isConnected: boolean
  onConfigure: () => void
}) {
  return (
    <div className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${isConnected ? 'border-gray-200' : 'border-gray-200 bg-gray-50/50'}`} onClick={onConfigure}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isConnected ? iconBg : 'bg-gray-200'}`}>
          <div className={isConnected ? '' : 'grayscale opacity-50'}>
            {icon}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium text-sm truncate ${isConnected ? 'text-gray-900' : 'text-gray-500'}`}>{title}</h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isConnected ? (
              <>
                <div className="relative flex items-end gap-0.5 h-3">
                  <div className="w-0.5 h-2 bg-green-500 rounded-sm animate-pulse" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-0.5 h-3 bg-green-500 rounded-sm animate-pulse" style={{ animationDelay: '100ms' }}></div>
                  <div className="w-0.5 h-1.5 bg-green-500 rounded-sm animate-pulse" style={{ animationDelay: '200ms' }}></div>
                </div>
                <span className="text-xs text-green-600 font-medium">Połączono</span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                <span className="text-xs text-gray-400">Nieskonfigurowane</span>
              </>
            )}
          </div>
        </div>
        
        <button
          onClick={(e) => { e.stopPropagation(); onConfigure(); }}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Konfiguruj"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function IntegrationsSection({ 
  data, 
  onChange
}: { 
  data: WebsiteSettingsFormData
  onChange: (field: keyof WebsiteSettingsFormData, value: unknown) => void
}) {
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [isAiProcessing, setIsAiProcessing] = useState(false)

  const isValidAnalytics = (id: string) => /^G-[A-Z0-9]{10,}$/.test(id)
  const isValidPixel = (id: string) => /^\d{15,18}$/.test(id)
  const isValidSearchConsole = (code: string) => code.includes('google-site-verification') || code.length > 20

  const handleAiAssist = async () => {
    const snippet = prompt('Wklej tutaj kod otrzymany od Google o Meta (np. skrypt Analytics o tag Meta):');
    if (!snippet || snippet.trim().length < 10) return;

    setIsAiProcessing(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { 
              role: 'system', 
              content: 'Jesteś asystentem technicznym. Twoim zadaniem jest wyodrębnienie identyfikatorów śledzenia z fragmentów kodu. Zwróć TYLKO czysty obiekt JSON bez formatowania markdown: {"analytics_id": "G-XXXXX", "pixel_id": "12345", "search_console": "google-site-verification=...", "is_valid": true}. Jeśli nie znajdziesz danego klucza, zostaw go pustym.' 
            },
            { role: 'user', content: `Wyodrębnij ID z tego kodu: ${snippet}` }
          ]
        })
      });

      const result = await response.json();
      const aiText = result.response;
      
      let jsonStr = aiText;
      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
      }
      
      const parsed = JSON.parse(jsonStr);
      
      if (parsed.analytics_id) onChange('analytics_id', parsed.analytics_id);
      if (parsed.pixel_id) onChange('pixel_id', parsed.pixel_id);
      if (parsed.search_console) onChange('search_console_code', parsed.search_console);
      
      if (parsed.analytics_id || parsed.pixel_id || parsed.search_console) {
        alert('AI pomyślnie wyodrębniło i uzupełniło dane!');
      } else {
        alert('AI nie znalazło żadnych znanych identyfikatorów w podanym tekście.');
      }
    } catch (error) {
      console.error('AI Integration Error:', error);
      alert('Wystąpił błąd podczas analizy kodu przez AI.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  const integrations = [
    {
      key: 'analytics',
      title: 'Google Analytics 4',
      icon: (
        <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      iconBg: 'bg-blue-100',
      isConnected: isValidAnalytics(data.analytics_id),
      value: data.analytics_id,
      placeholder: 'np. G-XXXXXXXXXX',
      helpText: 'Format: G-ABC123DEF0 (znajdziesz w panelu Google Analytics)',
      validation: isValidAnalytics
    },
    {
      key: 'search_console',
      title: 'Google Search Console',
      icon: <Search className="w-5 h-5 text-green-600" />,
      iconBg: 'bg-green-100',
      isConnected: isValidSearchConsole(data.search_console_code),
      value: data.search_console_code,
      placeholder: '<meta name="google-site-verification" content="..." />',
      helpText: 'Wklej cały tag meta lub sam kod weryfikacyjny',
      validation: isValidSearchConsole,
      type: 'textarea' as const
    },
    {
      key: 'pixel',
      title: 'Meta (Facebook) Pixel',
      icon: (
        <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      iconBg: 'bg-purple-100',
      isConnected: isValidPixel(data.pixel_id),
      value: data.pixel_id,
      placeholder: 'np. 123456789012345',
      helpText: 'Znajdziesz go w Meta Events Manager (15-18 cyfr)',
      validation: isValidPixel
    },
    {
      key: 'custom_scripts',
      title: 'Skrypty niestandardowe',
      icon: <Code className="w-5 h-5 text-gray-600" />,
      iconBg: 'bg-gray-100',
      isConnected: !!data.custom_scripts && data.custom_scripts.trim().length > 0,
      value: data.custom_scripts,
      placeholder: '<!-- Wklej tutaj dodatkowe kody -->',
      helpText: 'Dodatkowe kody (Hotjar, Chat, itp.)',
      validation: () => true,
      type: 'textarea' as const
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          Kliknij kartę aby skonfigurować integrację ręcznie
        </p>
        <button
          onClick={handleAiAssist}
          disabled={isAiProcessing}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-xs font-bold rounded-full hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          {isAiProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          ASYSTENT IA (AUTO-KONFIGURACJA)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {integrations.map((integration) => (
          <ServerCard
            key={integration.key}
            title={integration.title}
            icon={integration.icon}
            iconBg={integration.iconBg}
            isConnected={integration.isConnected}
            onConfigure={() => setActiveModal(integration.key)}
          />
        ))}
      </div>

      {integrations.map((integration) => (
        <IntegrationModal
          key={integration.key}
          isOpen={activeModal === integration.key}
          onClose={() => setActiveModal(null)}
          title={integration.title}
          icon={integration.icon}
          value={integration.value}
          onSave={(value) => {
            const fieldMap: Record<string, keyof WebsiteSettingsFormData> = {
              'analytics': 'analytics_id',
              'search_console': 'search_console_code',
              'pixel': 'pixel_id',
              'custom_scripts': 'custom_scripts'
            }
            onChange(fieldMap[integration.key], value)
          }}
          placeholder={integration.placeholder}
          validation={integration.validation}
          helpText={integration.helpText}
          type={integration.type || 'text'}
        />
      ))}
    </div>
  )
}

// ============================================
// COMPONENTE: SECCIÓN SEO
// ============================================


// ============================================
// COMPONENTE: SECCIÓN AVANZADA
// ============================================
function AdvancedSection({ 
  data, 
  onChange 
}: { 
  data: WebsiteSettingsFormData
  onChange: (field: keyof WebsiteSettingsFormData, value: unknown) => void
}) {
  return (
    <div className="space-y-6">
      {/* Idioma */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Globe className="w-4 h-4 inline mr-2" />
          Język główny
        </label>
        <select
          value={data.language}
          onChange={(e) => onChange('language', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {LANGUAGE_OPTIONS.map(lang => (
            <option key={lang.value} value={lang.value}>
              {lang.flag} {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Zona horaria */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Clock className="w-4 h-4 inline mr-2" />
          Strefa czasowa
        </label>
        <select
          value={data.timezone}
          onChange={(e) => onChange('timezone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {TIMEZONE_OPTIONS.map(tz => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      {/* Formato de fecha */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-2" />
          Format daty
        </label>
        <select
          value={data.date_format}
          onChange={(e) => onChange('date_format', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {DATE_FORMAT_OPTIONS.map(fmt => (
            <option key={fmt.value} value={fmt.value}>
              {fmt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

// ============================================
// COMPONENTE PRINCIPAL: SETTINGSPAGE
// ============================================
export default function Settings() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('privacy')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  
  const { data: websiteId } = useWebsiteId()
  const { data: settings, isLoading } = useSettings(websiteId || '')
  const updateSettings = useUpdateSettings(websiteId || '')
  const toggleMaintenance = useToggleMaintenance(websiteId || '')
  const uploadSEOImage = useUploadSEOImage(websiteId || '')
  
  // Form state
  const [formData, setFormData] = useState<WebsiteSettingsFormData>(settingsToFormData(null))
  
  // Sync form data when settings load or change
  useEffect(() => {
    if (settings) {
      console.log('Syncing form data with settings:', settings)
      setFormData(settingsToFormData(settings))
    }
  }, [settings])
  
  const handleChange = useCallback((field: keyof WebsiteSettingsFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])
  
  const handleSave = async () => {
    try {
      console.log('Saving settings:', formData)
      await updateSettings.mutateAsync(formData)
      setSaveMessage('Zapisano pomyślnie!')
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error: any) {
      console.error('Save error:', error)
      setSaveMessage(`Błąd: ${error.message || 'Nieznany błąd'}`)
    }
  }
  
  const handleToggleMaintenance = async (enabled: boolean) => {
    try {
      await toggleMaintenance.mutateAsync(enabled)
      setFormData(prev => ({ ...prev, maintenance_mode: enabled }))
    } catch (error) {
      alert('Błąd podczas zmiany trybu konserwacji')
    }
  }
  
  const handleSEOImageUpload = async (file: File) => {
    try {
      console.log('Uploading SEO image...')
      const url: string = await uploadSEOImage.mutateAsync(file)
      console.log('SEO image uploaded:', url)
      setFormData(prev => ({ ...prev, seo_image_url: url }))
    } catch (error: any) {
      console.error('SEO image upload error:', error)
      alert(`Błąd obrazu SEO: ${error.message || 'Nieznany błąd'}`)
    }
  }
  
  const sections: { id: SettingsSection; label: string; icon: typeof SettingsIcon }[] = [
    { id: 'privacy', label: 'Prywatność i cookies', icon: ShieldCheck },

    { id: 'visibility', label: 'Widoczność', icon: Eye },
    { id: 'integrations', label: 'Integracje', icon: Plug },
    { id: 'advanced', label: 'Zaawansowane', icon: Cog },
  ]
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ustawienia strony</h1>
          <p className="text-gray-600 mt-1">Skonfiguruj podstawowe parametry swojej witryny</p>
        </div>
        
        {/* Save Button */}
        <div className="flex items-center gap-3">
          {saveMessage && (
            <span className={`text-sm flex items-center gap-1 ${saveMessage.includes('Błąd') ? 'text-red-600' : 'text-green-600'}`}>
              {saveMessage.includes('Błąd') ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              {saveMessage}
            </span>
          )}
          <Button 
            onClick={handleSave}
            disabled={updateSettings.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {updateSettings.isPending ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </Button>
        </div>
      </div>
      
      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {sections.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="font-medium">{section.label}</span>
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              {sections.find(s => s.id === activeSection)?.label}
            </h2>
            
            {activeSection === 'visibility' && (
              <VisibilitySection
                data={formData}
                onChange={handleChange}
                onToggleMaintenance={handleToggleMaintenance}
                isToggling={toggleMaintenance.isPending}
              />
            )}
            
            {activeSection === 'integrations' && (
              <IntegrationsSection
                data={formData}
                onChange={handleChange}
              />
            )}
            

            
            {activeSection === 'advanced' && (
              <AdvancedSection
                data={formData}
                onChange={handleChange}
              />
            )}
            {activeSection === 'privacy' && (
              <GDPRSection />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
