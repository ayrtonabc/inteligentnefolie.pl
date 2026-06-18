import { useState, useCallback, useMemo } from 'react'
import {
  Plus, Search, Bell, Eye, MousePointerClick, Mail, Copy, Trash2, Pencil,
  X, ChevronLeft, ChevronRight, Globe, Monitor, Smartphone, Tablet, Wand2,
  CheckCircle2, AlertCircle, Clock, Pause, Play, LayoutGrid, List, Settings,
  Target, Zap, BarChart3, ArrowLeft
} from 'lucide-react'
import { useToast } from '@/components/Toast'
import { usePopups, usePopupStats } from '@/features/popups/hooks'
import { useSite } from '@/context/SiteContext'
import { TextInput, ColorPicker, ImageUpload } from '@/components/popups/EditorInputs'
import {
  TemplateSelector, POPUP_TEMPLATES,
  OfferTemplatePreview, EmailTemplatePreview, ContactTemplatePreview, CustomTemplatePreview
} from '@/components/popups/PopupTemplates'
import type { PopupData, PopupTemplate, PopupTrigger, PopupDisplayFrequency } from '@/features/popups/types'

const CITIES = [
  { name: 'Białystok', slug: 'bialystok' },
  { name: 'Biłgoraj', slug: 'bilgoraj' },
  { name: 'Gdańsk', slug: 'gdansk' },
  { name: 'Kielce', slug: 'kielce' },
  { name: 'Kraków', slug: 'krakow' },
  { name: 'Łódź', slug: 'lodz' },
  { name: 'Mysłowice', slug: 'myslowice' },
  { name: 'Opole', slug: 'opole' },
  { name: 'Poznań', slug: 'poznan' },
  { name: 'Rzeszów', slug: 'rzeszow' },
  { name: 'Szczecin', slug: 'szczecin' },
  { name: 'Tarnobrzeg', slug: 'tarnobrzeg' },
  { name: 'Warszawa', slug: 'warszawa' },
  { name: 'Wrocław', slug: 'wroclaw' },
]

const PUBLIC_TARGET_PAGES = [
  { path: '/', label: 'Strona główna' },
  { path: '/inteligentne-folie', label: 'Inteligentne Folie' },
  { path: '/montaz-folii-inteligentnej', label: 'Montaż i Serwis' },
  { path: '/realizacje', label: 'Realizacje' },
  { path: '/blog', label: 'Blog' },
  { path: '/kontakt', label: 'Kontakt' },
  ...CITIES.map(city => ({ 
    path: `/folia-inteligentna-${city.slug}`, 
    label: `📍 Folia ${city.name}` 
  })),
]

// ============================================================================
// EMPTY POPUP FACTORY
// ============================================================================

function createEmptyPopup(templateId: string, siteId: string): Omit<PopupData, 'id' | 'created_at' | 'updated_at' | 'views' | 'clicks' | 'conversions'> {
  const template = POPUP_TEMPLATES.find(t => t.id === templateId)!
  return {
    website_id: siteId,
    name: `Nowy Pop-up ${template.name}`,
    template: templateId as PopupTemplate,
    status: 'draft',
    title: template.initialData.title || '',
    subtitle: template.initialData.subtitle || '',
    description: template.initialData.description || '',
    buttonText: template.initialData.buttonText || '',
    buttonUrl: template.initialData.buttonUrl || '',
    inputPlaceholder: template.initialData.inputPlaceholder || '',
    redirectUrl: template.initialData.redirectUrl || '',
    discountAmount: template.initialData.discountAmount || '',
    discountCode: template.initialData.discountCode || '',
    image: template.initialData.image || '',
    customFields: template.initialData.customFields || [],
    backgroundColor: template.initialData.backgroundColor || '#ffffff',
    accentColor: template.initialData.accentColor || '#0ea5e9',
    textColor: template.initialData.textColor || '#1f2937',
    targetPages: ['all'],
    excludePages: [],
    targetDevices: ['desktop', 'mobile', 'tablet'],
    trigger: template.initialData.trigger || 'time',
    triggerValue: template.initialData.triggerValue || 5,
    displayFrequency: template.initialData.displayFrequency || 'once',
    displayDelay: template.initialData.displayDelay || 0,
    maxDisplaysPerUser: template.initialData.maxDisplaysPerUser || 1,
    size: 'medium',
    scheduledStartsAt: null,
    scheduledEndsAt: null,
    deleted_at: null,
  }
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function Popups() {
  const toast = useToast()
  const { currentSite } = useSite()
  const { popups, loading, createNew, updateExisting, remove, duplicate } = usePopups()
  const { stats } = usePopupStats()

  // View state
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [editingPopup, setEditingPopup] = useState<PopupData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [editorTab, setEditorTab] = useState<'content' | 'appearance' | 'targeting' | 'triggers'>('content')
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  // Form state
  const [formData, setFormData] = useState<Partial<PopupData>>({})

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const startCreate = useCallback((templateId: string) => {
    setSelectedTemplate(templateId)
    const empty = createEmptyPopup(templateId, currentSite?.id || '')
    setFormData(empty)
    setEditorTab('content')
    setPreviewDevice('desktop')
    setView('edit')
  }, [currentSite?.id])

  const startEdit = useCallback((popup: PopupData) => {
    setEditingPopup(popup)
    setFormData(popup)
    setEditorTab('content')
    setPreviewDevice('desktop')
    setView('edit')
  }, [])

  const handleSave = useCallback(async () => {
    if (!formData.name?.trim()) { toast.error('Podaj nazwę pop-upu'); return }

    try {
      if (editingPopup) {
        await updateExisting(editingPopup.id, formData)
        toast.success('✅ Zaktualizowano pop-up')
      } else {
        await createNew(formData as any)
        toast.success('✅ Utworzono pop-up')
      }
      setView('list')
      setEditingPopup(null)
      setFormData({})
    } catch (err: any) {
      console.error('Popup save error:', err)
      const msg = err.data?.message || err.message || 'Błąd zapisu pop-upu'
      toast.error(msg)
    }
  }, [formData, editingPopup, createNew, updateExisting, toast])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Na pewno usunąć ten pop-up?')) return
    await remove(id)
    toast.success('Usunięto pop-up')
  }, [remove, toast])

  const handleDuplicate = useCallback(async (id: string) => {
    await duplicate(id)
    toast.success('Zduplikowano pop-up')
  }, [duplicate, toast])

  const updateField = useCallback(<K extends keyof PopupData>(key: K, value: PopupData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }, [])

  // ============================================================================
  // FILTERED LIST
  // ============================================================================

  const filteredPopups = useMemo(() => {
    return popups.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.template.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [popups, searchTerm, statusFilter])

  const statusCounts = useMemo(() => ({
    all: popups.length,
    active: popups.filter(p => p.status === 'active').length,
    draft: popups.filter(p => p.status === 'draft').length,
    paused: popups.filter(p => p.status === 'paused').length,
  }), [popups])

  // ============================================================================
  // RENDER
  // ============================================================================

  // ---- LIST VIEW ----
  if (view === 'list') {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pop-upy</h1>
            <p className="text-sm text-gray-500 mt-1">Twórz i zarządzaj okienkami pop-up na swojej stronie</p>
          </div>
          <button onClick={() => setView('create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">
            <Plus size={18} /> Nowy Pop-up
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Eye size={20} className="text-blue-600" /></div>
              <div><p className="text-xs text-gray-500">Wyświetlenia</p><p className="text-xl font-bold">{stats.totalViews.toLocaleString()}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><MousePointerClick size={20} className="text-green-600" /></div>
              <div><p className="text-xs text-gray-500">Kliknięcia</p><p className="text-xl font-bold">{stats.totalClicks.toLocaleString()}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center"><Mail size={20} className="text-purple-600" /></div>
              <div><p className="text-xs text-gray-500">Konwersje</p><p className="text-xl font-bold">{stats.totalConversions}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center"><BarChart3 size={20} className="text-amber-600" /></div>
              <div><p className="text-xs text-gray-500">Śr. CTR</p><p className="text-xl font-bold">{stats.avgCtr}%</p></div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Szukaj pop-upów..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1">
            {[
              { id: 'all', label: 'Wszystkie', count: statusCounts.all },
              { id: 'active', label: 'Aktywne', count: statusCounts.active },
              { id: 'draft', label: 'Szkice', count: statusCounts.draft },
              { id: 'paused', label: 'Wstrzymane', count: statusCounts.paused },
            ].map(f => (
              <button key={f.id} onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  statusFilter === f.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`}>
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-12"><div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" /><p className="text-sm text-gray-500">Ładowanie...</p></div>
        ) : filteredPopups.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Bell size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Brak pop-upów</h3>
            <p className="text-sm text-gray-500 mb-6">Stwórz swój pierwszy pop-up aby zacząć zbierać leady.</p>
            <button onClick={() => setView('create')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">
              Stwórz Pop-up
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {filteredPopups.map(popup => (
                <div key={popup.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      popup.status === 'active' ? 'bg-green-50 text-green-600' :
                      popup.status === 'draft' ? 'bg-gray-100 text-gray-500' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {popup.status === 'active' ? <Bell size={20} /> : popup.status === 'draft' ? <AlertCircle size={20} /> : <Pause size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{popup.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span className="capitalize">{popup.template === 'offer' ? 'Oferta' : popup.template === 'email' ? 'Newsletter' : popup.template === 'contact' ? 'Formularz' : 'Baner'}</span>
                        <span>•</span>
                        <span>{popup.views.toLocaleString()} wyświetleń</span>
                        {popup.clicks > 0 && <><span>•</span><span>{popup.clicks} kliknięć</span></>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      popup.status === 'active' ? 'bg-green-100 text-green-700' :
                      popup.status === 'draft' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {popup.status === 'active' ? 'Aktywny' : popup.status === 'draft' ? 'Szkic' : 'Wstrzymany'}
                    </span>
                    <button onClick={() => startEdit(popup)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edytuj">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDuplicate(popup.id)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Duplikuj">
                      <Copy size={16} />
                    </button>
                    <button onClick={() => handleDelete(popup.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Usuń">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ---- CREATE VIEW (Template Selection) ----
  if (view === 'create') {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <button onClick={() => setView('list')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft size={16} /> Wróć do listy
        </button>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Wybierz szablon Pop-upu</h1>
          <p className="text-gray-500">Każdy szablon można później dostosować do swoich potrzeb</p>
        </div>
        <TemplateSelector onSelect={startCreate} />
      </div>
    )
  }

  // ---- EDIT VIEW ----
  const template = POPUP_TEMPLATES.find(t => t.id === formData.template)
  
  const previewWidths = {
    small: { desktop: 'max-w-xs', tablet: 'w-64', mobile: 'w-60' },
    medium: { desktop: 'max-w-md', tablet: 'w-80', mobile: 'w-72' },
    large: { desktop: 'max-w-2xl', tablet: 'w-[500px]', mobile: 'w-80' },
    'extra-large': { desktop: 'max-w-4xl', tablet: 'w-[700px]', mobile: 'w-[90%]' },
  }
  
  const currentSize = formData.size || 'medium'
  const currentPreviewWidth = previewWidths[currentSize][previewDevice]

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* LEFT: Editor */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => { setView('list'); setEditingPopup(null); setFormData({}) }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {editingPopup ? 'Edytuj Pop-up' : 'Nowy Pop-up'}
                </h1>
                <p className="text-sm text-gray-500">{template?.icon} {template?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setView('list')} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Anuluj
              </button>
              <button onClick={handleSave}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
                <Wand2 size={16} /> Zapisz
              </button>
            </div>
          </div>

          {/* Popup Name */}
          <div className="mb-6">
            <TextInput label="Nazwa Pop-upu (wewnętrzna)" value={formData.name || ''}
              onChange={v => updateField('name', v)} placeholder="np. Newsletter - Strona główna" />
          </div>

          {/* Editor Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-6">
            {[
              { id: 'content' as const, label: 'Treść', icon: Pencil },
              { id: 'appearance' as const, label: 'Wygląd', icon: Wand2 },
              { id: 'targeting' as const, label: 'Targetowanie', icon: Target },
              { id: 'triggers' as const, label: 'Wyzwalacze', icon: Zap },
            ].map(tab => (
              <button key={tab.id} onClick={() => setEditorTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  editorTab === tab.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}>
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* CONTENT TAB */}
          {editorTab === 'content' && (
            <div className="space-y-4">
              {formData.template === 'offer' && (
                <>
                  <TextInput label="Tytuł" value={formData.title || ''} onChange={v => updateField('title', v)} placeholder="np. Oferta Specjalna!" />
                  <TextInput label="Podtytuł" value={formData.subtitle || ''} onChange={v => updateField('subtitle', v)} placeholder="np. Tylko dzisiaj!" />
                  <TextInput label="Kwota zniżki" value={formData.discountAmount || ''} onChange={v => updateField('discountAmount', v)} placeholder="np. 50%" helpText="Tekst wyświetlany dużą czcionką" />
                  <TextInput label="Kod zniżkowy" value={formData.discountCode || ''} onChange={v => updateField('discountCode', v)} placeholder="np. LUCKY50" />
                  <TextInput label="Opis" value={formData.description || ''} onChange={v => updateField('description', v)} placeholder="Dodatkowe informacje..." multiline />
                  <TextInput label="Tekst przycisku" value={formData.buttonText || ''} onChange={v => updateField('buttonText', v)} placeholder="np. Kupuję teraz!" />
                  <ImageUpload label="Obraz (opcjonalnie)" value={formData.image || ''} onChange={v => updateField('image', v)} aspectRatio="square" />
                </>
              )}
              {formData.template === 'email' && (
                <>
                  <TextInput label="Tytuł" value={formData.title || ''} onChange={v => updateField('title', v)} placeholder="np. Dołącz do Newslettera" />
                  <TextInput label="Podtytuł" value={formData.subtitle || ''} onChange={v => updateField('subtitle', v)} placeholder="np. Bądź na bieżąco!" />
                  <TextInput label="Opis" value={formData.description || ''} onChange={v => updateField('description', v)} placeholder="Dlaczego warto się zapisać?" multiline />
                  <TextInput label="Placeholder pola email" value={formData.inputPlaceholder || ''} onChange={v => updateField('inputPlaceholder', v)} placeholder="np. Twój adres email..." />
                  <TextInput label="Tekst przycisku" value={formData.buttonText || ''} onChange={v => updateField('buttonText', v)} placeholder="np. Subskrybuję!" />
                  <ImageUpload label="Obraz / Logo" value={formData.image || ''} onChange={v => updateField('image', v)} aspectRatio="square" />
                </>
              )}
              {formData.template === 'contact' && (
                <>
                  <TextInput label="Tytuł" value={formData.title || ''} onChange={v => updateField('title', v)} placeholder="np. Skontaktuj się z Nami" />
                  <TextInput label="Opis" value={formData.description || ''} onChange={v => updateField('description', v)} placeholder="Opis formularza..." multiline />
                  <TextInput label="Tekst przycisku" value={formData.buttonText || ''} onChange={v => updateField('buttonText', v)} placeholder="np. Wyślij wiadomość" />
                  <ImageUpload label="Obraz (opcjonalnie)" value={formData.image || ''} onChange={v => updateField('image', v)} aspectRatio="banner" />

                  {/* Custom Fields */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Pola formularza</label>
                    <div className="space-y-2">
                      {(formData.customFields || []).map((field, idx) => (
                        <div key={field.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                          <input type="text" value={field.label} onChange={e => {
                            const fields = [...(formData.customFields || [])]
                            fields[idx] = { ...fields[idx], label: e.target.value }
                            updateField('customFields', fields)
                          }} className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm" placeholder="Nazwa pola" />
                          <select value={field.type} onChange={e => {
                            const fields = [...(formData.customFields || [])]
                            fields[idx] = { ...fields[idx], type: e.target.value as any }
                            updateField('customFields', fields)
                          }} className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs">
                            <option value="text">Tekst</option>
                            <option value="email">Email</option>
                            <option value="tel">Telefon</option>
                            <option value="textarea">Tekst długi</option>
                          </select>
                          <button onClick={() => {
                            const fields = (formData.customFields || []).filter((_, i) => i !== idx)
                            updateField('customFields', fields)
                          }} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => {
                      const fields = [...(formData.customFields || []), { id: Date.now().toString(), label: 'Nowe pole', type: 'text' as const, required: false }]
                      updateField('customFields', fields)
                    }} className="mt-2 w-full py-2 border-2 border-dashed border-gray-200 text-gray-500 text-xs font-medium rounded-xl hover:border-blue-300 hover:text-blue-600 transition-colors">
                      + Dodaj pole
                    </button>
                  </div>
                </>
              )}
              {formData.template === 'custom' && (
                <>
                  <ImageUpload label="Obraz Banera" value={formData.image || ''} onChange={v => updateField('image', v)} aspectRatio="banner" />
                  <TextInput label="Tekst przycisku (opcjonalnie)" value={formData.buttonText || ''} onChange={v => updateField('buttonText', v)} placeholder="np. Dowiedz się więcej" />
                  <TextInput label="URL przekierowania" value={formData.redirectUrl || ''} onChange={v => updateField('redirectUrl', v)} placeholder="https://..." helpText="Gdzie przekierować po kliknięciu" />
                </>
              )}
            </div>
          )}

          {/* APPEARANCE TAB */}
          {editorTab === 'appearance' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Rozmiar Pop-upu</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['small', 'medium', 'large', 'extra-large'] as const).map(s => (
                    <button key={s} onClick={() => updateField('size', s)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border-2 transition-all ${
                        (formData.size || 'medium') === s ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'
                      }`}>
                      {s === 'small' ? 'Mały' : s === 'medium' ? 'Średni' : s === 'large' ? 'Duży' : 'B. Duży'}
                    </button>
                  ))}
                </div>
              </div>
              <ColorPicker label="Kolor tła" value={formData.backgroundColor || '#ffffff'} onChange={v => updateField('backgroundColor', v)} />
              <ColorPicker label="Kolor akcentu (przycisk)" value={formData.accentColor || '#0ea5e9'} onChange={v => updateField('accentColor', v)} />
              <ColorPicker label="Kolor tekstu" value={formData.textColor || '#1f2937'} onChange={v => updateField('textColor', v)} />
            </div>
          )}

          {/* TARGETING TAB */}
          {editorTab === 'targeting' && (
            <div className="space-y-5">
              {/* Pages */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Na których stronach wyświetlać?</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => updateField('targetPages', ['all'])}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      formData.targetPages?.includes('all') ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                    Na wszystkich stronach
                  </button>
                  {PUBLIC_TARGET_PAGES.map(({ path: page, label }) => (
                    <button key={page} onClick={() => {
                      const current = formData.targetPages || []
                      const next = current.includes('all') ? [page] : current.includes(page) ? current.filter(p => p !== page) : [...current, page]
                      updateField('targetPages', next.length ? next : ['all'])
                    }} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors font-mono ${
                      formData.targetPages?.includes(page) ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exclude pages */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Nigdy nie wyświetlaj na</label>
                <div className="flex flex-wrap gap-2">
                  {['/checkout', '/panel', '/thank-you'].map(page => (
                    <button key={page} onClick={() => {
                      const current = formData.excludePages || []
                      const next = current.includes(page) ? current.filter(p => p !== page) : [...current, page]
                      updateField('excludePages', next)
                    }} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors font-mono ${
                      formData.excludePages?.includes(page) ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {page === '/panel' ? 'Panel CMS' : page === '/checkout' ? 'Checkout' : 'Thank You'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Devices */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Urządzenia</label>
                <div className="flex gap-3">
                  {[
                    { id: 'desktop' as const, label: 'Komputer', icon: Monitor },
                    { id: 'tablet' as const, label: 'Tablet', icon: Tablet },
                    { id: 'mobile' as const, label: 'Telefon', icon: Smartphone },
                  ].map(device => {
                    const active = formData.targetDevices?.includes(device.id)
                    return (
                      <button key={device.id} onClick={() => {
                        const current = formData.targetDevices || []
                        const next = active ? current.filter(d => d !== device.id) : [...current, device.id]
                        updateField('targetDevices', next.length ? next : ['desktop', 'mobile', 'tablet'])
                      }} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                        active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}>
                        <device.icon size={20} />
                        <span className="text-xs font-medium">{device.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TRIGGERS TAB */}
          {editorTab === 'triggers' && (
            <div className="space-y-5">
              {/* Trigger Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Kiedy wyświetlić pop-up?</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'time' as const, label: 'Po czasie', icon: Clock, desc: 'Sekundy' },
                    { id: 'scroll' as const, label: 'Po scrollu', icon: ArrowLeft, desc: '% strony' },
                    { id: 'exit' as const, label: 'Przy wyjściu', icon: ArrowLeft, desc: 'Intencja wyjścia' },
                  ].map(trigger => (
                    <button key={trigger.id} onClick={() => updateField('trigger', trigger.id)}
                      className={`p-3 rounded-xl border-2 text-center transition-colors ${
                        formData.trigger === trigger.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <trigger.icon size={20} className={`mx-auto mb-1 ${formData.trigger === trigger.id ? 'text-blue-600' : 'text-gray-400'}`} />
                      <p className={`text-xs font-medium ${formData.trigger === trigger.id ? 'text-blue-700' : 'text-gray-600'}`}>{trigger.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trigger Value */}
              {formData.trigger === 'time' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Po ilu sekundach?</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={0} max={30} value={formData.triggerValue || 5}
                      onChange={e => updateField('triggerValue', parseInt(e.target.value))}
                      className="flex-1" />
                    <span className="text-sm font-bold bg-gray-100 px-3 py-1.5 rounded-lg w-16 text-center">
                      {formData.triggerValue || 5}s
                    </span>
                  </div>
                </div>
              )}
              {formData.trigger === 'scroll' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Po jakim procencie scrollu?</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={10} max={90} step={10} value={formData.triggerValue || 50}
                      onChange={e => updateField('triggerValue', parseInt(e.target.value))}
                      className="flex-1" />
                    <span className="text-sm font-bold bg-gray-100 px-3 py-1.5 rounded-lg w-16 text-center">
                      {formData.triggerValue || 50}%
                    </span>
                  </div>
                </div>
              )}

              {/* Display Frequency */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Jak często wyświetlać?</label>
                <div className="space-y-2">
                  {[
                    { id: 'once' as const, label: 'Tylko raz na użytkownika' },
                    { id: 'every_visit' as const, label: 'Przy każdej wizycie' },
                    { id: 'every_page' as const, label: 'Na każdej podstronie' },
                  ].map(freq => (
                    <button key={freq.id} onClick={() => updateField('displayFrequency', freq.id)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${
                        formData.displayFrequency === freq.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <p className={`text-sm font-medium ${formData.displayFrequency === freq.id ? 'text-blue-700' : 'text-gray-700'}`}>{freq.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Status</label>
                <div className="flex gap-2">
                  {[
                    { id: 'active' as const, label: 'Aktywny', icon: Play },
                    { id: 'draft' as const, label: 'Szkic', icon: AlertCircle },
                    { id: 'paused' as const, label: 'Wstrzymany', icon: Pause },
                  ].map(status => (
                    <button key={status.id} onClick={() => updateField('status', status.id)}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                        formData.status === status.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}>
                      <status.icon size={16} />
                      <span className="text-xs font-medium">{status.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Preview */}
      <div className="w-96 bg-gray-100 border-l border-gray-200 flex flex-col">
        {/* Preview Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Podgląd na żywo</p>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              {[
                { id: 'desktop' as const, icon: Monitor },
                { id: 'tablet' as const, icon: Tablet },
                { id: 'mobile' as const, icon: Smartphone },
              ].map(device => (
                <button key={device.id} onClick={() => setPreviewDevice(device.id)}
                  className={`p-1.5 rounded-md transition-colors ${
                    previewDevice === device.id ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`}>
                  <device.icon size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 flex items-center justify-center p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNkMWQ1ZGIiLz48L3N2Zz4=')] overflow-auto">
          <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${currentPreviewWidth}`}>
            {/* Popup Close Button */}
            <div className="relative">
              <button className="absolute top-2 right-2 w-6 h-6 bg-gray-200/80 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-300 z-10">
                <X size={12} />
              </button>
              {formData.template === 'offer' && <OfferTemplatePreview data={formData} />}
              {formData.template === 'email' && <EmailTemplatePreview data={formData} />}
              {formData.template === 'contact' && <ContactTemplatePreview data={formData} />}
              {formData.template === 'custom' && <CustomTemplatePreview data={formData} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
