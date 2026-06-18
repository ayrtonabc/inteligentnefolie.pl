import { useState } from 'react'
import { 
  Plus, 
  Trash2, 
  Edit2, 
  ShieldCheck,
  Cookie,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  Code,
  Save,
  Settings2,
  BarChart3,
  Megaphone,
  Lock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useWebsiteId, useSettings, useUpdateSettings } from '@/features/settings/hooks'
import { useEffect } from 'react'

type CookieCategory = 'necessary' | 'analytics' | 'marketing'
type BannerPosition = 'bottom' | 'top'
type Theme = 'light' | 'dark'
type PrivacySubsection = 'overview' | 'config' | 'categories' | 'scripts' | 'policy'

interface CookieScript {
  id: string
  name: string
  category: CookieCategory
  content: string
  isActive: boolean
}

interface CookieCategoryConfig {
  enabled: boolean
  label: string
  description: string
  locked?: boolean
}

interface CookieSettings {
  isEnabled: boolean
  bannerText: string
  bannerPosition: BannerPosition
  theme: Theme
  privacyPolicy: string
  categories: {
    necessary: CookieCategoryConfig
    analytics: CookieCategoryConfig
    marketing: CookieCategoryConfig
  }
  scripts: CookieScript[]
}

const defaultSettings: CookieSettings = {
  isEnabled: true,
  bannerText: 'Ta strona używa plików cookie, aby zapewnić najlepsze doświadczenie. Wybierz, które kategorie plików cookie chcesz zaakceptować.',
  bannerPosition: 'bottom',
  theme: 'light',
  privacyPolicy: '## Polityka Prywatności\n\nNiniejsza polityka określa zasady przetwarzania i ochrony danych osobowych...',
  categories: {
    necessary: {
      enabled: true,
      label: 'Niezbędne',
      description: 'Wymagane do prawidłowego działania strony. Nie można wyłączyć.',
      locked: true
    },
    analytics: {
      enabled: false,
      label: 'Analityczne',
      description: 'Pomagają nam zrozumieć, jak użytkownicy korzystają ze strony.'
    },
    marketing: {
      enabled: false,
      label: 'Marketingowe',
      description: 'Używane do personalizacji reklam i treści marketingowych.'
    }
  },
  scripts: []
}

// Estado del sistema Card
function StatusCard({ isEnabled, onToggle }: { isEnabled: boolean; onToggle: (v: boolean) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isEnabled ? 'bg-emerald-100' : 'bg-gray-100'}`}>
            <ShieldCheck className={`w-6 h-6 ${isEnabled ? 'text-emerald-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">System RODO / GDPR</h3>
            <p className="text-sm text-gray-500 max-w-md">
              {isEnabled 
                ? 'System zarządzania zgodami jest aktywny. Baner cookies jest wyświetlany odwiedzającym.'
                : 'System jest wyłączony. Odwiedzający nie widzą banera cookies.'
              }
            </p>
          </div>
        </div>
        
        <button
          onClick={() => onToggle(!isEnabled)}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            isEnabled ? 'bg-emerald-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      <div className="mt-4 flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
          isEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'
        }`}>
          {isEnabled ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          {isEnabled ? 'AKTYWNY' : 'WYŁĄCZONY'}
        </span>
      </div>
    </div>
  )
}

// Banner Preview Card
function BannerPreviewCard({ settings, onEdit }: { settings: CookieSettings; onEdit: () => void }) {
  const isLight = settings.theme === 'light'
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
            <Cookie className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Podgląd banera</h3>
            <p className="text-sm text-gray-500">Tak będzie wyglądał baner dla odwiedzających</p>
          </div>
        </div>
        <button 
          onClick={onEdit}
          className="px-4 py-2 text-sm font-medium text-sky-600 hover:bg-sky-50 rounded-full transition-colors"
        >
          Edytuj
        </button>
      </div>
      
      {/* Banner Mockup */}
      <div className={`rounded-xl p-4 border ${isLight ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-700'}`}>
        <div className="flex items-start gap-4">
          <Cookie className={`w-5 h-5 flex-shrink-0 ${isLight ? 'text-gray-600' : 'text-gray-300'}`} />
          <div className="flex-1">
            <p className={`text-sm mb-3 ${isLight ? 'text-gray-700' : 'text-gray-200'}`}>
              {settings.bannerText}
            </p>
            <div className="flex items-center gap-2">
              <button className={`px-4 py-2 rounded-lg text-sm font-medium ${
                isLight ? 'bg-sky-500 text-white' : 'bg-sky-600 text-white'
              }`}>
                Akceptuj wszystkie
              </button>
              <button className={`px-4 py-2 rounded-lg text-sm font-medium ${
                isLight ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
              }`}>
                Odrzuć
              </button>
              <button className={`px-4 py-2 rounded-lg text-sm font-medium ${
                isLight ? 'text-sky-600 hover:bg-sky-50' : 'text-sky-400 hover:bg-gray-800'
              }`}>
                Ustawienia
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Summary Card
function SummaryCard({ scripts, categories }: { scripts: CookieScript[]; categories: CookieSettings['categories'] }) {
  const activeScripts = scripts.filter(s => s.isActive).length
  const activeCategories = Object.values(categories).filter(c => c.enabled).length
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Podsumowanie</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Code className="w-4 h-4 text-gray-500" />
            <span className="text-2xl font-bold text-gray-900">{scripts.length}</span>
          </div>
          <p className="text-xs text-gray-500">Skryptów</p>
          <p className="text-xs text-emerald-600 mt-1">{activeScripts} aktywnych</p>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-gray-500" />
            <span className="text-2xl font-bold text-gray-900">{activeCategories}</span>
          </div>
          <p className="text-xs text-gray-500">Kategorii</p>
          <p className="text-xs text-gray-500 mt-1">z 3 możliwych</p>
        </div>
      </div>
    </div>
  )
}

// Config Section
function ConfigSection({ settings, onChange }: { settings: CookieSettings; onChange: (s: CookieSettings) => void }) {
  const updateField = <K extends keyof CookieSettings>(field: K, value: CookieSettings[K]) => {
    onChange({ ...settings, [field]: value })
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-sky-500" />
          Konfiguracja banera
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tekst banera
            </label>
            <textarea
              value={settings.bannerText}
              onChange={(e) => updateField('bannerText', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pozycja
              </label>
              <select
                value={settings.bannerPosition}
                onChange={(e) => updateField('bannerPosition', e.target.value as BannerPosition)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
              >
                <option value="bottom">Dolna (banner)</option>
                <option value="top">Górna (banner)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motyw
              </label>
              <select
                value={settings.theme}
                onChange={(e) => updateField('theme', e.target.value as Theme)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
              >
                <option value="light">Jasny</option>
                <option value="dark">Ciemny</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Categories Section
function CategoriesSection({ settings, onChange }: { settings: CookieSettings; onChange: (s: CookieSettings) => void }) {
  const updateCategory = (key: keyof CookieSettings['categories'], field: 'enabled' | 'label' | 'description', value: unknown) => {
    onChange({
      ...settings,
      categories: {
        ...settings.categories,
        [key]: {
          ...settings.categories[key],
          [field]: value
        }
      }
    })
  }
  
  const categoryIcons = {
    necessary: Lock,
    analytics: BarChart3,
    marketing: Megaphone
  }
  
  const categoryColors = {
    necessary: 'bg-emerald-100 text-emerald-600',
    analytics: 'bg-blue-100 text-blue-600',
    marketing: 'bg-purple-100 text-purple-600'
  }
  
  return (
    <div className="space-y-4">
      {(Object.keys(settings.categories) as CookieCategory[]).map((key) => {
        const cat = settings.categories[key]
        const Icon = categoryIcons[key]
        
        return (
          <div key={key} className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${categoryColors[key]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="text"
                      value={cat.label}
                      onChange={(e) => updateCategory(key, 'label', e.target.value)}
                      className="font-semibold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-sky-500 focus:outline-none"
                    />
                    {cat.locked && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        Wymagane
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={cat.description}
                    onChange={(e) => updateCategory(key, 'description', e.target.value)}
                    className="text-sm text-gray-500 w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <button
                onClick={() => !cat.locked && updateCategory(key, 'enabled', !cat.enabled)}
                disabled={cat.locked}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  cat.enabled ? 'bg-emerald-500' : 'bg-gray-300'
                } ${cat.locked ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    cat.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Scripts Section
function ScriptsSection({ settings, onChange }: { settings: CookieSettings; onChange: (s: CookieSettings) => void }) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newScript, setNewScript] = useState<Partial<CookieScript>>({
    name: '',
    category: 'analytics',
    content: '',
    isActive: true
  })
  
  const addScript = () => {
    if (!newScript.name || !newScript.content) return
    
    const script: CookieScript = {
      id: Date.now().toString(),
      name: newScript.name,
      category: newScript.category as CookieCategory,
      content: newScript.content,
      isActive: newScript.isActive ?? true
    }
    
    onChange({
      ...settings,
      scripts: [...settings.scripts, script]
    })
    
    setIsAdding(false)
    setNewScript({ name: '', category: 'analytics', content: '', isActive: true })
  }
  
  const deleteScript = (id: string) => {
    onChange({
      ...settings,
      scripts: settings.scripts.filter(s => s.id !== id)
    })
  }
  
  const updateScript = (id: string, updates: Partial<CookieScript>) => {
    onChange({
      ...settings,
      scripts: settings.scripts.map(s => s.id === id ? { ...s, ...updates } : s)
    })
  }
  
  return (
    <div className="space-y-4">
      {/* Add Button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50/30 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Dodaj skrypt
        </button>
      )}
      
      {/* Add Form */}
      {isAdding && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Nowy skrypt</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nazwa</label>
              <input
                type="text"
                value={newScript.name}
                onChange={(e) => setNewScript({ ...newScript, name: e.target.value })}
                placeholder="np. Google Analytics"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategoria</label>
              <select
                value={newScript.category}
                onChange={(e) => setNewScript({ ...newScript, category: e.target.value as CookieCategory })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
              >
                <option value="necessary">Niezbędne</option>
                <option value="analytics">Analityczne</option>
                <option value="marketing">Marketingowe</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kod skryptu</label>
              <textarea
                value={newScript.content}
                onChange={(e) => setNewScript({ ...newScript, content: e.target.value })}
                rows={4}
                placeholder="<!-- Wklej tutaj kod JavaScript -->"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm"
              />
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <Button onClick={addScript}>
                <Save className="w-4 h-4 mr-2" />
                Zapisz skrypt
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Anuluj
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Scripts List */}
      {settings.scripts.map((script) => (
        <div key={script.id} className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-semibold text-gray-900">{script.name}</h4>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  script.category === 'necessary' ? 'bg-emerald-100 text-emerald-600' :
                  script.category === 'analytics' ? 'bg-blue-100 text-blue-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {settings.categories[script.category].label}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  script.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {script.isActive ? 'Aktywny' : 'Nieaktywny'}
                </span>
              </div>
              
              {editingId === script.id ? (
                <textarea
                  value={script.content}
                  onChange={(e) => updateScript(script.id, { content: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-xs"
                />
              ) : (
                <code className="block bg-gray-50 rounded-lg p-3 text-xs text-gray-600 font-mono truncate">
                  {script.content}
                </code>
              )}
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => updateScript(script.id, { isActive: !script.isActive })}
                className={`p-2 rounded-lg transition-colors ${
                  script.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                {script.isActive ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setEditingId(editingId === script.id ? null : script.id)}
                className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => deleteScript(script.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {settings.scripts.length === 0 && !isAdding && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <Code className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Brak skryptów</p>
          <p className="text-sm text-gray-400">Dodaj pierwszy skrypt, aby zarządzać zgodami</p>
        </div>
      )}
    </div>
  )
}

// Policy Section
function PolicySection({ settings, onChange }: { settings: CookieSettings; onChange: (s: CookieSettings) => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Polityka prywatności</h3>
              <p className="text-sm text-gray-500">Treść wyświetlana w ustawieniach cookies</p>
            </div>
          </div>
        </div>
        
        <textarea
          value={settings.privacyPolicy}
          onChange={(e) => onChange({ ...settings, privacyPolicy: e.target.value })}
          rows={20}
          className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm"
        />
        
        <p className="text-xs text-gray-500 mt-3">
          Możesz użyć formatowania Markdown. Treść będzie widoczna dla użytkowników po kliknięciu "Więcej informacji".
        </p>
      </div>
    </div>
  )
}

// Main GDPR Section Component
export function GDPRSection() {
  const { data: websiteId } = useWebsiteId()
  const { data: globalSettings, isLoading } = useSettings(websiteId || '')
  const updateSettings = useUpdateSettings(websiteId || '')
  
  const [settings, setSettings] = useState<CookieSettings>(defaultSettings)
  const [activeTab, setActiveTab] = useState<PrivacySubsection>('overview')
  const [isSaving, setIsSaving] = useState(false)

  // Sync from DB
  useEffect(() => {
    if (globalSettings?.gdpr_settings) {
      setSettings(globalSettings.gdpr_settings)
    }
  }, [globalSettings])

  const handleSave = async () => {
    if (!websiteId) return
    setIsSaving(true)
    try {
      await updateSettings.mutateAsync({
        gdpr_settings: settings
      })
    } catch (err) {
      console.error('Error saving GDPR settings:', err)
      alert('Błąd podczas zapisywania ustawień')
    } finally {
      setIsSaving(false)
    }
  }
  
  const tabs: { id: PrivacySubsection; label: string; icon: any }[] = [
    { id: 'overview', label: 'Przegląd', icon: Eye },
    { id: 'config', label: 'Konfiguracja', icon: Settings2 },
    { id: 'categories', label: 'Kategorie', icon: ShieldCheck },
    { id: 'scripts', label: 'Skrypty', icon: Code },
    { id: 'policy', label: 'Polityka', icon: FileText },
  ]
  
  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-100 rounded w-1/4"></div>
      <div className="h-32 bg-gray-100 rounded"></div>
    </div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Prywatność i cookies</h2>
          <p className="text-gray-600">Zarządzaj zgodnością z RODO i plikami cookies</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="shadow-md"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Zapisywanie...' : 'Zapisz sekcję'}
        </Button>
      </div>
      
      {/* Sub-navigation */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-sky-50 text-sky-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>
      
      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            <StatusCard 
              isEnabled={settings.isEnabled} 
              onToggle={(v) => setSettings({ ...settings, isEnabled: v })} 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BannerPreviewCard 
                settings={settings} 
                onEdit={() => setActiveTab('config')} 
              />
              <SummaryCard 
                scripts={settings.scripts} 
                categories={settings.categories} 
              />
            </div>
          </>
        )}
        
        {activeTab === 'config' && (
          <ConfigSection settings={settings} onChange={setSettings} />
        )}
        
        {activeTab === 'categories' && (
          <CategoriesSection settings={settings} onChange={setSettings} />
        )}
        
        {activeTab === 'scripts' && (
          <ScriptsSection settings={settings} onChange={setSettings} />
        )}
        
        {activeTab === 'policy' && (
          <PolicySection settings={settings} onChange={setSettings} />
        )}
      </div>
    </div>
  )
}
