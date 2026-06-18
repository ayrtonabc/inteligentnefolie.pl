import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Save, 
  Search, 
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { pb } from '@/lib/pocketbase'

interface ContentItem {
  id: string
  path: string
  section_key: string
  content_value: any
  source_value?: any
  content_type: string
  language_code: string
}

export default function TranslationEditor() {
  const { code } = useParams()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [items, setItems] = useState<ContentItem[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'empty'>('all')

  console.log('TranslationEditor mounting for code:', code)

  useEffect(() => {
    let mounted = true
    async function loadContent() {
      if (!code) return
      setLoading(true)
      try {
        console.log('Fetching site_content for pl and', code)
        // 1. Get all source content (pl)
        const source = await pb.collection('site_content').getFullList({
          filter: `language_code = "pl"`,
        })
        
        // 2. Get existing translations for this language
        const translations = await pb.collection('site_content').getFullList({
          filter: `language_code = "${code}"`,
        })

        console.log('Fetched source items:', source?.length, 'translations:', translations?.length)

        const merged = (source || []).map(s => {
          const t = (translations || []).find(tr => tr.page_path === s.page_path && tr.section_key === s.section_key)
          return {
            id: t?.id || s.id,
            path: s.page_path,
            section_key: s.section_key,
            content_type: s.content_type,
            source_value: s.content_value,
            content_value: t ? t.content_value : '',
            language_code: code || ''
          }
        })

        if (mounted) {
          setItems(merged)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error loading content:', error)
        if (mounted) setLoading(false)
      }
    }
    loadContent()
    return () => { mounted = false }
  }, [code])

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const item of items) {
        // Find existing record for this language
        let existingRecord;
        try {
          existingRecord = await pb.collection('site_content').getFirstListItem(
            `page_path = "${item.path}" && section_key = "${item.section_key}" && language_code = "${code}"`
          );
        } catch (e) {
          // Record not found, we will create it
        }

        const data = {
          page_path: item.path,
          section_key: item.section_key,
          content_type: item.content_type,
          content_value: item.content_value,
          language_code: code,
          is_active: true
        };

        if (existingRecord) {
          await pb.collection('site_content').update(existingRecord.id, data);
        } else {
          await pb.collection('site_content').create(data);
        }
      }

      alert('Zapisano pomyślnie!')
    } catch (error: any) {
      alert('Błąd zapisu: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const filteredItems = items.filter(item => {
    try {
      const sKey = (item.section_key || '').toLowerCase()
      const sVal = String(item.source_value || '').toLowerCase()
      const query = search.toLowerCase()
      
      const matchesSearch = sKey.includes(query) || sVal.includes(query)
      const matchesFilter = filter === 'all' || !item.content_value
      return matchesSearch && matchesFilter
    } catch (e) {
      return false
    }
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 text-sky-600 animate-spin" />
        <p className="text-gray-500 animate-pulse">Ładowanie treści...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/languages')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Globe className="text-sky-500" size={24} />
              Edytor: {code?.toUpperCase()}
            </h1>
            <p className="text-sm text-gray-500">Tłumaczenie treści witryny z języka Polskiego</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/languages/translate')}>
            Użyj AI (Auto)
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Zapisz zmiany
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Szukaj fraz..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
          <select 
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
            className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none text-sm"
          >
            <option value="all">Wszystkie frazy</option>
            <option value="empty">Tylko brakujące</option>
          </select>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredItems.map((item, idx) => (
            <div key={`${item.path}-${item.section_key}-${idx}`} className="p-6 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded">
                  {item.path} / {item.section_key}
                </span>
                {item.content_value ? (
                  <CheckCircle2 className="text-emerald-500" size={16} />
                ) : (
                  <AlertCircle className="text-amber-500" size={16} />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Oryginał (PL)</label>
                  <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-700 border border-gray-100 italic">
                    {item.content_type === 'json' ? JSON.stringify(item.source_value) : String(item.source_value)}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-sky-600 mb-2 uppercase">Tłumaczenie ({code?.toUpperCase()})</label>
                  <textarea 
                    value={typeof item.content_value === 'object' ? JSON.stringify(item.content_value) : String(item.content_value || '')}
                    onChange={e => {
                      const newItems = [...items]
                      const index = items.findIndex(it => it.path === item.path && it.section_key === item.section_key)
                      if (index !== -1) {
                        newItems[index].content_value = e.target.value
                        setItems(newItems)
                      }
                    }}
                    rows={2}
                    className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm transition-all"
                    placeholder="Wpisz tłumaczenie..."
                  />
                </div>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              Nie znaleziono żadnych fraz.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
