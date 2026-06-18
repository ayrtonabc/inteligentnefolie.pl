import { useCallback, useEffect, useMemo, useState } from 'react'
import { Save, RefreshCw } from 'lucide-react'
import { pb } from '@/lib/pocketbase'
import { useToast } from '@/components/Toast'

type ContentRow = {
  id: string
  content_key: string
  content_value: string
  is_active: boolean
  path: string
  language_code: string
}

const language_code = 'pl'
const path = '/'

const defaultFields = [
  { key: 'hero_h1', label: 'Hero - H1' },
  { key: 'hero_p', label: 'Hero - Opis' },
  { key: 'services_intro', label: 'Usługi - Wstęp' },
  { key: 'about_h2', label: 'Dlaczego my - Tytuł' },
  { key: 'about_p1', label: 'Dlaczego my - Akapit 1' },
  { key: 'pricing_intro', label: 'Cennik - Wstęp' },
  { key: 'contact_h2', label: 'Kontakt - Tytuł' },
  { key: 'contact_p', label: 'Kontakt - Opis' },
]

export default function SiteContent() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rows, setRows] = useState<Record<string, ContentRow>>({})
  const [values, setValues] = useState<Record<string, { value: string; active: boolean }>>({})

  const keys = useMemo(() => defaultFields.map((f) => f.key), [])

  const fetchContent = useCallback(async () => {
    setLoading(true)
    try {
      // Filter keys list for PocketBase query
      const keysFilter = keys.map(k => `content_key = "${k}"`).join(' || ')
      const records = await pb.collection('site_custom_content').getFullList<any>({
        filter: `language_code = "${language_code}" && path = "${path}" && (${keysFilter})`,
      })

      const map: Record<string, ContentRow> = {}
      const val: Record<string, { value: string; active: boolean }> = {}
      
      records.forEach((r) => {
        const row: ContentRow = {
          id: r.id,
          content_key: r.content_key,
          content_value: r.content_value,
          is_active: r.is_active,
          path: r.path,
          language_code: r.language_code
        }
        map[row.content_key] = row
        val[row.content_key] = { value: row.content_value, active: row.is_active }
      })

      keys.forEach((k) => {
        if (!val[k]) val[k] = { value: '', active: true }
      })

      setRows(map)
      setValues(val)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error fetching content'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [keys, toast])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const field of defaultFields) {
        const current = values[field.key]
        const existing = rows[field.key]

        if (existing) {
          await pb.collection('site_custom_content').update(existing.id, {
            content_value: current.value,
            is_active: current.active
          })
        } else {
          await pb.collection('site_custom_content').create({
            content_key: field.key,
            content_value: current.value,
            is_active: current.active,
            path,
            language_code,
          })
        }
      }

      toast.success('Zapisano treści')
      await fetchContent()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Błąd'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Treści strony</h2>
          <p className="text-gray-600 text-sm mt-1">Edytuj kluczowe teksty na stronie głównej.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={fetchContent}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Odśwież
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? 'Zapisywanie...' : 'Zapisz'}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {defaultFields.map((field) => (
          <div key={field.key} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="font-semibold text-gray-900">{field.label}</div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={values[field.key]?.active ?? true}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      [field.key]: { value: prev[field.key]?.value ?? '', active: e.target.checked },
                    }))
                  }
                />
                Aktywny
              </label>
            </div>
            <textarea
              rows={4}
              value={values[field.key]?.value ?? ''}
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  [field.key]: { value: e.target.value, active: prev[field.key]?.active ?? true },
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all resize-y"
              placeholder="Treść..."
            />
          </div>
        ))}
      </div>
    </div>
  )
}
