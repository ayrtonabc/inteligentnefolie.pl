import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Copy, Save, Wand2, FileText, Image as ImageIcon, Braces } from 'lucide-react'
import { useToast } from '@/components/Toast'
import { ContentEditor } from '@/components/ContentEditor'
import { computeSeoScore, normalizePath, usePageEditor } from '@/features/pages/hooks'

type SiteContentItem = {
  id: string
  section_key: string
  content_type: string
  content_value: unknown
  page_path?: string
}

function stringifyContentValue(value: unknown): string {
  if (typeof value === 'string') return value
  if (value === null || value === undefined) return ''
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function getFieldPreview(item: SiteContentItem): string {
  const raw = stringifyContentValue(item.content_value).replace(/\s+/g, ' ').trim()
  if (!raw) return item.content_type
  return raw.length > 60 ? `${raw.slice(0, 60)}...` : raw
}

function getFieldIcon(contentType: string) {
  if (contentType === 'image') return ImageIcon
  if (contentType === 'json') return Braces
  return FileText
}

export default function PageEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const { page, loading, saving, seo, setSeo, save, siteContent, setSiteContent } = usePageEditor(id ?? null)
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [lang, setLang] = useState(page?.language_code ?? 'pl')

  const selectedIndex = useMemo(() => {
    if (!selectedId) return siteContent.length ? 0 : -1
    const i = siteContent.findIndex((item) => item.id === selectedId)
    return i === -1 ? (siteContent.length ? 0 : -1) : i
  }, [siteContent, selectedId])

  const selected = selectedIndex >= 0 ? siteContent[selectedIndex] : null
  const seoScore = computeSeoScore(seo)

  const updateContentItem = (id: string, newValue: string) => {
    setSiteContent((prev) =>
      prev.map((item) => (item.id === id ? { ...item, content_value: newValue } : item)),
    )
  }

  if (loading) {
    return <div className="p-8 text-sm text-gray-500">Ładowanie…</div>
  }

  if (!page) {
    return (
      <div className="p-8">
        <div className="text-sm text-gray-700">Nie znaleziono strony.</div>
        <button className="btn btn-secondary mt-4" onClick={() => navigate('/pages')}>
          Wróć
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/pages" className="p-2 rounded-lg hover:bg-gray-50 border border-gray-200 bg-white">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="text-sm font-semibold text-gray-900">{page.title}</div>
            <div className="text-xs text-gray-500">{page.path}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            title="Język"
          >
            <option value="pl">PL</option>
            <option value="en">EN</option>
          </select>
          <button
            type="button"
            onClick={() => {
              if (selected) {
                if (selected.content_type === 'text' && selected.section_key.includes('title')) {
                  const base = page.title || 'Twoja strona'
                  updateContentItem(selected.id, base)
                } else if (selected.content_type === 'text') {
                  updateContentItem(selected.id, 'Dodaj krótki opis sekcji, aby zwiększyć konwersję.')
                } else if (selected.content_type === 'json') {
                  updateContentItem(
                    selected.id,
                    JSON.stringify({
                      text: page.title || 'Poznaj ofertę',
                      href: page.path === '/' ? '/kontakt' : page.path,
                    }),
                  )
                }
              } else {
                if (!seo.metaTitle) setSeo((prev) => ({ ...prev, metaTitle: `${page.title} | ${location.hostname}` }))
              }
            }}
            className="btn btn-secondary flex items-center gap-2"
            title="Ayuda IA"
          >
            <Wand2 size={16} />
            Ayuda IA
          </button>
          <div className="bg-white border border-gray-200 rounded-xl p-1 flex">
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'content' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Pola CMS
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('seo')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'seo' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              SEO
            </button>
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(page.path)
                toast.success('Skopiowano ścieżkę')
              } catch {
                toast.error('Nie udało się skopiować')
              }
            }}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Copy size={16} />
            Kopiuj
          </button>

          <button
            type="button"
            onClick={async () => {
              try {
                await save({ path: normalizePath(page.path), language_code: lang })
                toast.success('Zapisano zmiany')
              } catch (e) {
                const msg = e instanceof Error ? e.message : 'Błąd zapisu'
                toast.error(msg)
              }
            }}
            className="btn btn-primary flex items-center gap-2"
            disabled={saving}
          >
            <Save size={16} />
            {saving ? 'Zapisywanie…' : 'Zapisz zmiany'}
          </button>
        </div>
      </div>

      {activeTab === 'content' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Campos reales de la ruta</div>
                  <div className="text-xs text-gray-500">Edytujesz bezpośrednio rekordy zapisane w `site_content`.</div>
                </div>
              </div>

              <div className="p-3 space-y-2">
                {siteContent.length === 0 ? (
                  <div className="text-sm text-gray-500 py-6 text-center">Brak zapisanej treści dla tej ścieżki.</div>
                ) : (
                  siteContent.map((item, idx) => {
                    const active = selectedId ? item.id === selectedId : idx === 0
                    const Icon = getFieldIcon(item.content_type)
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={`w-full text-left border rounded-xl p-3 flex items-center justify-between gap-3 transition-colors ${
                          active ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Icon size={14} className="text-gray-500" />
                              <div className="text-sm font-semibold text-gray-900 truncate">{item.section_key}</div>
                            </div>
                            <div className="text-xs text-gray-500 truncate">{getFieldPreview(item)}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          {item.content_type}
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div className="p-4 border-b border-gray-100">
                <div className="text-sm font-semibold text-gray-900">Ustawienia</div>
                <div className="text-xs text-gray-500">Edytuj wybraną sekcję</div>
              </div>

              {!selected ? (
                <div className="p-4 text-sm text-gray-500">Selecciona un campo de la izquierda.</div>
              ) : (
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Clave CMS</label>
                    <input
                      className="input bg-gray-50 w-full"
                      value={selected.section_key}
                      readOnly
                    />
                  </div>

                  <ContentEditor
                    sectionKey={selected.section_key}
                    contentType={selected.content_type || 'text'}
                    value={stringifyContentValue(selected.content_value)}
                    onChange={(newValue) => updateContentItem(selected.id, newValue)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">SEO</div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                Score {seoScore}/100
              </span>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Meta title</label>
                <input
                  className="input"
                  value={seo.metaTitle}
                  onChange={(e) => setSeo((prev) => ({ ...prev, metaTitle: e.target.value }))}
                />
                <div className="text-xs text-gray-400 mt-1">{seo.metaTitle.trim().length} znaków</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Meta description</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-sm min-h-[120px]"
                  value={seo.metaDescription}
                  onChange={(e) => setSeo((prev) => ({ ...prev, metaDescription: e.target.value }))}
                />
                <div className="text-xs text-gray-400 mt-1">{seo.metaDescription.trim().length} znaków</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Canonical</label>
                <input
                  className="input font-mono text-sm"
                  value={seo.canonical}
                  onChange={(e) => setSeo((prev) => ({ ...prev, canonical: e.target.value }))}
                />
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={seo.indexable}
                  onChange={(e) => setSeo((prev) => ({ ...prev, indexable: e.target.checked }))}
                />
                <span className="text-sm text-gray-700 font-semibold">Indexable</span>
              </label>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 space-y-4">
            <div className="text-sm font-semibold text-gray-900">Wskazówki</div>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>Meta title: 30–60 znaków.</li>
              <li>Meta description: 120–160 znaków.</li>
              <li>Canonical zalecany dla każdej strony.</li>
              <li>Wyłącz “Indexable” tylko dla stron prywatnych.</li>
            </ul>

            <div className="border-t border-gray-100 pt-4">
              <div className="text-xs text-gray-500">Język</div>
              <div className="mt-1">
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="pl">PL</option>
                  <option value="en">EN</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

