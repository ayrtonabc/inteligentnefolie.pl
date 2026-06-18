import { useEffect, useState } from 'react'
import { useToast } from '@/components/Toast'
import { getSitemap, listCmsPages, setSitemap } from './api'
import { generateSitemapXml } from './openrouter'
import { useSettings } from '@/features/settings/hooks'
import { Wand2, Loader2, FileText, Save } from 'lucide-react'

export default function SitemapSection({ websiteId }: { websiteId: string }) {
  const toast = useToast()
  const { data: settings } = useSettings(websiteId)
  const [loading, setLoading] = useState(true)
  const [pages, setPages] = useState<{ path: string; title?: string; language_code?: string; updated_at: string }[]>([])
  const [status, setStatusState] = useState<{ status: string | null; last_generated: string | null }>({
    status: null,
    last_generated: null,
  })
  const [xmlContent, setXmlContent] = useState('')
  const [runningAi, setRunningAi] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const [s, p] = await Promise.all([getSitemap(websiteId), listCmsPages()])
        if (mounted) {
          setStatusState({
            status: s?.status || null,
            last_generated: s?.last_generated || null,
          })
          setXmlContent(s?.xml_content || '')
          setPages(p.map((x) => ({ 
            path: x.path, 
            title: x.title, 
            language_code: x.language_code,
            updated_at: x.updated_at 
          })))
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [websiteId])

  const generateWithAi = async () => {
    const url = settings?.website_url
    if (!url) {
      toast.error('Brak URL strony w Ustawieniach. Dodaj go najpierw.')
      return
    }

    setRunningAi(true)
    try {
      const result = await generateSitemapXml(pages, url)
      setXmlContent(result.xml)
      toast.success(`Wygenerowano sitemap z ${result.urls.length} URL`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Błąd generowania')
    } finally {
      setRunningAi(false)
    }
  }

  const saveSitemap = async () => {
    if (!xmlContent) {
      toast.error('Najpierw wygeneruj sitemap przez AI')
      return
    }
    try {
      await setSitemap(websiteId, 'generated', xmlContent)
      setStatusState({ status: 'generated', last_generated: new Date().toISOString() })
      toast.success('Zapisano sitemap')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Błąd zapisywania')
    }
  }

  const pingGoogle = async () => {
    try {
      const base = (import.meta.env.VITE_SITE_URL as string | undefined) || 'https://example.com'
      const url = `https://www.google.com/ping?sitemap=${encodeURIComponent(base.replace(/\/+$/, '') + '/sitemap.xml')}`
      await fetch(url, { mode: 'no-cors' })
      toast.success('Powiadomiono Google')
    } catch {
      toast.error('Nie udało się powiadomić Google')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 space-y-3">
        <div className="text-sm font-semibold text-gray-900">Status</div>
        <div className="text-sm text-gray-700">
          {status.status ? `Sitemap: ${status.status}` : 'Nie wygenerowano'}
        </div>
        <div className="text-xs text-gray-500">
          {status.last_generated ? `Ostatnia generacja: ${new Date(status.last_generated).toLocaleString('pl-PL')}` : '—'}
        </div>
        <div className="pt-2 space-y-2">
          <button
            className="btn btn-primary w-full flex items-center justify-center gap-2"
            onClick={generateWithAi}
            disabled={runningAi || loading || !settings?.website_url}
          >
            {runningAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {runningAi ? 'Generowanie...' : 'Generuj z AI'}
          </button>
          <button
            className="btn btn-secondary w-full flex items-center justify-center gap-2"
            onClick={saveSitemap}
            disabled={!xmlContent}
          >
            <Save className="w-4 h-4" />
            Zapisz sitemap
          </button>
          <button
            className="btn btn-outline w-full flex items-center justify-center gap-2"
            onClick={pingGoogle}
            disabled={loading}
          >
            Powiadom Google
          </button>
        </div>
        {!settings?.website_url && (
          <p className="text-xs text-amber-600 mt-2">
            Dodaj URL strony w Ustawieniach, aby wygenerować sitemap.
          </p>
        )}
      </div>
      <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Podgląd sitemap.xml
          </div>
          {pages.length > 0 && (
            <span className="text-xs text-gray-500">{pages.length} stron</span>
          )}
        </div>
        <textarea
          className="w-full font-mono text-xs p-3 border border-gray-200 rounded-xl h-64 bg-gray-50"
          readOnly
          value={xmlContent || '// Kliknij "Generuj z AI" aby utworzyć sitemap'}
          placeholder="// Kliknij 'Generuj z AI' aby utworzyć sitemap"
        />
      </div>
    </div>
  )
}
