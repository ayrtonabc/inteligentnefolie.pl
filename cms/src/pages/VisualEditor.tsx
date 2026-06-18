import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Search, FileText, Edit3, ArrowLeft, RefreshCw, Check, Type, Image as ImageIcon, Link2, X
} from 'lucide-react'
import { useToast } from '@/components/Toast'
import { pb, TENANT_ID, getTenantFilter } from '@/lib/pocketbase'
import { triggerRevalidation } from '@/lib/revalidate'
import { getLocalSiteFallback, resolveSiteUrlFromDb } from '@/lib/siteUrl'

function MediaLibrary({ onSelect }: { onSelect: (url: string) => void }) {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFiles() {
      try {
        const records = await pb.collection('media').getFullList({
          filter: getTenantFilter(),
          sort: '-created',
          $autoCancel: false,
        })
        setFiles(records.map(r => ({
          ...r,
          url: pb.files.getURL(r, r.file)
        })))
      } catch (err) {
        console.error('Media fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchFiles()
  }, [])

  if (loading) return <div className="p-8 flex justify-center"><RefreshCw className="animate-spin text-blue-500" size={24} /></div>
  
  return (
    <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200 custom-scrollbar">
      {files.map(f => (
        <button 
          key={f.id} 
          onClick={() => onSelect(f.url)}
          className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-colors"
        >
          <img src={f.url} alt="" className="w-full h-full object-cover" />
        </button>
      ))}
      {files.length === 0 && <div className="col-span-3 text-center text-sm text-gray-500 py-4">Brak obrazów. Przejdź do zakładki Media, aby dodać.</div>}
    </div>
  )
}

interface ContentItem {
  id: string
  section_key: string
  content_type: string
  content_value: any
  page_path: string
}

const typeIcons: Record<string, any> = { text: Type, image: ImageIcon, json: Link2, html: FileText }
const typeLabels: Record<string, string> = { text: 'Tekst', image: 'Obraz', json: 'Przycisk', html: 'HTML' }
const SITE_REVALIDATE_PATHS = ['/', '/inteligentne-folie', '/montaz-folii-inteligentnej', '/realizacje', '/blog', '/kontakt']

const LANG_FLAGS: Record<string, string> = {
  pl: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><rect width="3" height="2" fill="#ffffff"/><rect width="3" height="1" y="1" fill="#dc143c"/></svg>`,
  en: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 30"><rect width="50" height="30" fill="#012169"/><path d="M0,0 L50,30 M50,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L50,30 M50,0 L0,30" stroke="#C8102E" stroke-width="4"/><path d="M25,0 v30 M0,15 h50" stroke="#fff" stroke-width="10"/><path d="M25,0 v30 M0,15 h50" stroke="#C8102E" stroke-width="6"/></svg>`,
  de: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3"><rect width="5" height="3" y="0" fill="#000000"/><rect width="5" height="2" y="1" fill="#dd0000"/><rect width="5" height="1" y="2" fill="#ffce00"/></svg>`,
  es: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 500"><rect width="750" height="500" fill="#c60b1e"/><rect width="750" height="250" y="125" fill="#ffc400"/></svg>`,
  uk: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><rect width="3" height="2" fill="#0057b7"/><rect width="3" height="1" y="1" fill="#ffd700"/></svg>`,
  cz: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><rect width="3" height="2" fill="#ffffff"/><rect width="3" height="1" y="1" fill="#d7141a"/><polygon points="0,0 1.5,1 0,2" fill="#11457e"/></svg>`,
  cs: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><rect width="3" height="2" fill="#ffffff"/><rect width="3" height="1" y="1" fill="#d7141a"/><polygon points="0,0 1.5,1 0,2" fill="#11457e"/></svg>`,
}

const LANG_NAMES: Record<string, string> = {
  pl: 'Polski',
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  uk: 'Українська',
  cs: 'Čeština',
}

export default function VisualEditor() {
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()
  const toast = useToast()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [siteUrl, setSiteUrl] = useState(getLocalSiteFallback())
  const pagePath = slug === 'home' ? '/' : `/${slug}`
  const displayUrl = `${siteUrl}${pagePath}`

  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingInIframe, setEditingInIframe] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [iframeLoading, setIframeLoading] = useState(true)
  const [currentLang, setCurrentLang] = useState('pl')
  const [scale, setScale] = useState(1)
  const [editingImage, setEditingImage] = useState<ContentItem | null>(null)
  const [showGallery, setShowGallery] = useState(false)
  const [availableLangs, setAvailableLangs] = useState<string[]>(['pl'])
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLangs() {
      try {
        const contentRecords = await pb.collection('site_content').getFullList({
          filter: `website_id = "${TENANT_ID}"`,
          fields: 'language_code',
          requestKey: null,
          $autoCancel: false,
        })
        
        const codes = Array.from(new Set(contentRecords.map(r => r.language_code))).filter(Boolean)
        
        if (codes.length > 0) {
          codes.sort((a, b) => {
            if (a === 'pl') return -1
            if (b === 'pl') return 1
            return a.localeCompare(b)
          })
          setAvailableLangs(codes)
          setCurrentLang('pl')
        } else {
          setAvailableLangs(['pl'])
        }
      } catch (err) {
        console.error('Langs fetch error:', err)
        setAvailableLangs(['pl'])
      }
    }
    fetchLangs()
  }, [])

  useEffect(() => {
    const updateScale = () => {
      const container = document.getElementById('iframe-container')
      if (container) {
        const newScale = Math.min(container.offsetWidth / 1280, 1)
        setScale(newScale)
      }
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  const previewUrl = useMemo(() => {
    return `${siteUrl}${pagePath}?visual_edit=true&lang=${currentLang}&v=${refreshKey}`
  }, [siteUrl, pagePath, currentLang, refreshKey])

  useEffect(() => {
    resolveSiteUrlFromDb().then((resolved) => {
      if (resolved) setSiteUrl(resolved)
    }).catch(() => {
      setSiteUrl(getLocalSiteFallback())
    })
  }, [])

  const fetchContent = useCallback(async () => {
    console.log('[VisualEditor] Fetching content for:', pagePath)
    setLoading(true)
    try {
      // PocketBase filter
      const records = await pb.collection('site_content').getFullList({
        filter: `website_id = "${TENANT_ID}" && (page_path = "${pagePath}" || page_path = "common") && language_code = "${currentLang}"`,
        sort: '-page_path, order_index',
        $autoCancel: false,
      })

      console.log(`[VisualEditor] Successfully fetched ${records.length} items`)
      
      const visibleItems = records.filter(r => {
        const key = r.section_key || ''
        return !key.startsWith('_') && !key.startsWith('meta_') && !key.startsWith('og_') && !key.startsWith('calculator_')
      })
      
      setContentItems(visibleItems.map(r => ({
        id: r.id,
        section_key: r.section_key,
        content_type: r.content_type,
        content_value: r.content_value,
        page_path: r.page_path,
      })))
    } catch (error) {
      console.error('[VisualEditor] PocketBase Error:', error)
    } finally {
      setLoading(false)
    }
  }, [pagePath, currentLang])

  useEffect(() => { fetchContent() }, [fetchContent])

  // When content is loaded, send to iframe
  useEffect(() => {
    if (contentItems.length > 0 && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'cms:content',
        items: contentItems,
        selectedId,
        token: pb.authStore.token, // Pass auth token
        model: pb.authStore.model, // Pass auth model to prevent clearing in shared localStorage
      }, '*')
    }
  }, [contentItems, selectedId, refreshKey])

  // Listen for messages from iframe
  useEffect(() => {
    const handler = async (e: MessageEvent) => {
      if (e.data?.type === 'cms:iframe-ready') {
        // 1. Enviar ACK inmediato para detener los retries del Iframe
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({ type: 'cms:bridge-ack' }, '*');
        }
        // 2. Enviar contenido si ya está cargado
        if (contentItems.length > 0 && iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'cms:content',
            items: contentItems,
            selectedId,
            token: pb.authStore.token,
            model: pb.authStore.model,
          }, '*')
        }
      }

      if (e.data?.type === 'cms:element-selected') {
        const item = contentItems.find(c =>
          c.id === e.data.cmsId ||
          c.section_key === e.data.sectionKey ||
          c.section_key === e.data.cmsId
        )
        if (item) setSelectedId(item.id)
      }

      if (e.data?.type === 'cms:saved') {
        const { sectionKey } = e.data
        toast.success(`✅ Zapisano "${sectionKey}"`)
        // Refrescar contenido local
        await fetchContent()
        // Forzar recarga de iframe para ver el ISR actualizado
        setRefreshKey(k => k + 1)
      }

      if (e.data?.type === 'cms:save') {
        const { sectionKey, newValue } = e.data
        const item = contentItems.find(c => c.section_key === sectionKey)
        if (!item) return

        try {
          let valueToSave: any = newValue
          if (item.content_type === 'json') {
            try { valueToSave = JSON.parse(newValue) } catch {}
          }
          
          await pb.collection('site_content').update(item.id, {
            content_value: valueToSave,
            language_code: currentLang // Ensure we save to the current language
          })

          toast.success(`✅ Zapisano "${item.section_key}"`)
          await triggerRevalidation(item.page_path === 'common' ? SITE_REVALIDATE_PATHS : [item.page_path])
          await fetchContent()
          setEditingInIframe(false)

          // Re-send updated content to iframe
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
              type: 'cms:content',
              items: contentItems,
              selectedId: null,
            }, '*')
          }
        } catch {
          toast.error('❌ Błąd zapisu')
        }
      }

      if (e.data?.type === 'cms:cancel-edit') {
        setEditingInIframe(false)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [contentItems, selectedId, toast, fetchContent])

  const selectElement = (item: ContentItem) => {
    setSelectedId(item.id)
    if (item.content_type === 'image') {
      setEditingImage(item)
      setShowGallery(false)
    } else {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'cms:select',
          sectionKey: item.section_key,
        }, '*')
        iframeRef.current.contentWindow.postMessage({
          type: 'cms:start-edit',
          sectionKey: item.section_key,
          recordId: item.id,
        }, '*')
      }
    }
  }

  const saveImage = async (newUrl: string) => {
    if (!editingImage) return
    try {
      await pb.collection('site_content').update(editingImage.id, {
        content_value: newUrl,
        language_code: currentLang
      })
      toast.success('✅ Zapisano obraz')
      setEditingImage(null)
      await fetchContent()
      setRefreshKey(k => k + 1)
      await triggerRevalidation(editingImage.page_path === 'common' ? SITE_REVALIDATE_PATHS : [editingImage.page_path])
    } catch {
      toast.error('❌ Błąd zapisu')
    }
  }

  const filteredItems = useMemo(() => {
    let items = contentItems
    
    // Filtro por tipo siempre
    if (activeFilter) {
      items = items.filter(item => item.content_type === activeFilter)
    }
    
    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      items = items.filter(item => {
        const contentStr = typeof item.content_value === 'string' 
          ? item.content_value 
          : JSON.stringify(item.content_value)
        return contentStr.toLowerCase().includes(q)
      })
    }
    
    return items
  }, [contentItems, searchQuery, activeFilter])

  const groupedItems = useMemo(() => {
    const groups: Record<string, ContentItem[]> = { text: [], image: [], json: [], other: [] }
    filteredItems.forEach(item => {
      if (item.content_type === 'text') groups.text.push(item)
      else if (item.content_type === 'image') groups.image.push(item)
      else if (item.content_type === 'json') groups.json.push(item)
      else groups.other.push(item)
    })
    return groups
  }, [filteredItems])

  const pageLabels: Record<string, string> = { home: 'Strona główna', 'inteligentne-folie': 'Inteligentne Folie', 'montaz-folii-inteligentnej': 'Montaż folii', realizacje: 'Realizacje', kontakt: 'Kontakt', blog: 'Blog' }
  const pageName = pageLabels[slug || ''] || slug || ''

  function IframeSkeleton() {
    return (
      <div className="absolute inset-0 bg-white z-50 flex flex-col p-8 overflow-hidden animate-pulse">
        {/* Fake Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="w-32 h-8 bg-gray-100 rounded-lg" />
          <div className="flex gap-6">
            <div className="w-16 h-4 bg-gray-50 rounded" />
            <div className="w-16 h-4 bg-gray-50 rounded" />
            <div className="w-16 h-4 bg-gray-50 rounded" />
          </div>
          <div className="w-24 h-10 bg-gray-100 rounded-full" />
        </div>
        
        {/* Fake Hero */}
        <div className="flex flex-col items-center text-center space-y-6 pt-12">
          <div className="w-3/4 h-16 bg-gray-100 rounded-xl" />
          <div className="w-1/2 h-16 bg-gray-100 rounded-xl" />
          <div className="w-2/3 h-6 bg-gray-50 rounded-lg" />
          <div className="flex gap-4 pt-4">
            <div className="w-32 h-12 bg-gray-100 rounded-lg" />
            <div className="w-32 h-12 bg-gray-50 rounded-lg" />
          </div>
        </div>

        {/* Fake Grid */}
        <div className="grid grid-cols-3 gap-8 mt-24">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-4">
              <div className="w-full h-48 bg-gray-50 rounded-2xl" />
              <div className="w-3/4 h-6 bg-gray-100 rounded" />
              <div className="w-1/2 h-4 bg-gray-50 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-64px)] flex bg-gray-50">
      {/* LEFT SIDEBAR - Element List (navigation only) */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0 shadow-sm z-10">
        <div className="p-6 border-b border-gray-100">
          <button onClick={() => navigate('/pages')} className="flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-blue-600 mb-4 transition-colors uppercase tracking-widest group">
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Wróć do listy stron
          </button>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Edytor wizualny</h2>
        </div>

        {/* Language Selector - Siempre mostrar si hay idiomas disponibles */}
        {availableLangs.length > 0 && (
          <div className="px-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Język:</span>
              <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                {availableLangs.map(lang => (
                  <button
                    key={lang}
                    onClick={() => setCurrentLang(lang)}
                    className={`p-1.5 rounded-lg transition-all ${currentLang === lang ? 'bg-blue-600 shadow-md' : 'hover:bg-gray-200'}`}
                    title={LANG_NAMES[lang] || lang}
                  >
                    <img 
                      src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(LANG_FLAGS[lang])}`}
                      alt={lang}
                      className="w-7 h-5 rounded-sm"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveFilter('text')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all flex items-center gap-1.5 ${
                activeFilter === 'text' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <Type size={12} /> Tekst ({contentItems.filter(i => i.content_type === 'text').length})
            </button>
            <button
              onClick={() => setActiveFilter('image')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all flex items-center gap-1.5 ${
                activeFilter === 'image' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <ImageIcon size={12} /> Obrazy ({contentItems.filter(i => i.content_type === 'image').length})
            </button>
            <button
              onClick={() => setActiveFilter('json')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all flex items-center gap-1.5 ${
                activeFilter === 'json' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <Link2 size={12} /> Przyciski ({contentItems.filter(i => i.content_type === 'json').length})
            </button>
          </div>
          <div className="relative mt-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj po treści..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
          {loading ? (
            <div className="p-8 text-center flex flex-col items-center gap-3">
              <RefreshCw className="animate-spin text-blue-500" size={24} />
              <p className="text-xs text-gray-400 font-medium">Ładowanie elementów...</p>
            </div>
          ) : !activeFilter && !searchQuery.trim() ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-xs">Użyj wyszukiwarki lub filtrów powyżej</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-xs">Brak wyników dla "{searchQuery}"</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map(item => {
                const isSelected = selectedId === item.id
                const preview = typeof item.content_value === 'string'
                  ? item.content_value.replace(/^"|"$/g, '').substring(0, 60)
                  : JSON.stringify(item.content_value).substring(0, 60)
                return (
                  <button
                    key={item.id}
                    onClick={() => selectElement(item)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all border ${
                      isSelected 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' 
                        : 'hover:bg-gray-50 border-transparent text-gray-700 hover:border-gray-200'
                    }`}
                  >
                    <div className={`font-bold truncate text-[11px] tracking-tight ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                      {item.section_key}
                    </div>
                    <div className={`text-[10px] truncate mt-0.5 opacity-80 ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                      {preview}
                    </div>
                    {isSelected && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="p-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-green-50 rounded-md border border-green-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-semibold text-green-700">Kliknij element na stronie aby edytować</span>
          </div>
        </div>
      </div>

      {/* RIGHT - Iframe Preview (editable) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#e5e7eb]">
        {/* Browser Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm z-10">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          
          <div className="flex-1 max-w-xl mx-12 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1">
            <span className="text-[10px] text-gray-400 truncate">
              {displayUrl}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => { setRefreshKey(k => k + 1) }}
              className="text-gray-400 hover:text-blue-600 transition-colors"
            >
              <RefreshCw size={14} />
            </button>
            <div className="flex items-center gap-2 text-blue-600 cursor-pointer group">
              <Edit3 size={14} />
              <span className="text-[10px] font-black uppercase tracking-wider">Tryb Edycji</span>
            </div>
          </div>
        </div>

        {/* Iframe - forces desktop viewport (1280px) scaled to fit */}
        <div className="flex-1 overflow-hidden bg-gray-100 relative" id="iframe-container">
          {iframeLoading && <IframeSkeleton />}
          <div 
            style={{ 
              width: '1280px', 
              height: `${100 / scale}%`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              transition: 'transform 0.1s linear'
            }}
          >
            <iframe
              ref={iframeRef}
              key={refreshKey}
              src={previewUrl}
              onLoad={() => setIframeLoading(false)}
              className="w-full h-full border-0"
              title="Edytor wizualny"
            />
          </div>
        </div>
      </div>

      {/* MODAL EDYCJI OBRAZU */}
      {editingImage && (
        <div className="fixed inset-0 z-[999999] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="font-bold text-gray-900">{editingImage.section_key}</h3>
                <p className="text-xs text-gray-500 font-mono">Typ: Obraz</p>
              </div>
              <button onClick={() => setEditingImage(null)} className="p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 bg-white">
              {!showGallery ? (
                <div className="space-y-4">
                  <div className="aspect-video bg-gray-100 rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center relative">
                    <img src={editingImage.content_value} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Aktualny URL</label>
                    <input type="text" readOnly value={editingImage.content_value} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500 font-mono" />
                  </div>
                  <button 
                    onClick={() => setShowGallery(true)}
                    className="w-full py-3 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ImageIcon size={18} />
                    Zmień obraz z biblioteki
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">Wybierz nowy obraz</span>
                    <button onClick={() => setShowGallery(false)} className="text-xs font-bold text-gray-500 hover:text-gray-900 cursor-pointer">Wróć do podglądu</button>
                  </div>
                  <MediaLibrary onSelect={(url) => saveImage(url)} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
