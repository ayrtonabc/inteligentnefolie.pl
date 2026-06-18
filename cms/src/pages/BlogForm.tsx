import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Image as ImageIcon, Eye, Settings, ChevronDown, Check, X, 
  Sparkles, Loader2, Target, TrendingUp
} from 'lucide-react'
import { usePostForm } from '@/features/blog/hooks'
import { uploadBlogImageToStorage } from '@/features/blog/api'
import { slugify } from '@/lib/utils'
import { useToast } from '@/components/Toast'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

export default function BlogForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const quillRef = useRef<ReactQuill | null>(null)
  const coverInputRef = useRef<HTMLInputElement | null>(null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [savingNow, setSavingNow] = useState(false)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [editorValue, setEditorValue] = useState('')
  const [targetKeyword, setTargetKeyword] = useState('')
  const initEditorRef = useRef(false)

  const {
    categories,
    loading,
    values: formData,
    setValues: setFormData,
    save,
    uploadCover: uploadCoverApi,
  } = usePostForm(id ?? null)

  const getContentHtml = useCallback(() => {
    const raw = formData.content || ''
    const trimmed = raw.trim()
    if (!trimmed) return ''
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed) as unknown
        if (parsed && typeof parsed === 'object') {
          const asObj = parsed as Record<string, unknown>
          if (typeof asObj.html === 'string') return asObj.html
        }
      } catch (e) { void e; return raw }
    }
    return raw
  }, [formData.content])

  useEffect(() => { initEditorRef.current = false }, [id])

  const initEditorContent = useCallback(() => {
    if (initEditorRef.current) return
    if (id && loading) return
    
    const html = getContentHtml()
    setEditorValue(html)
    
    const editor = quillRef.current?.getEditor()
    if (editor && html) {
      try {
        editor.root.innerHTML = html
      } catch (e) {
        console.error('[Editor] Error setting content:', e)
      }
    }
    
    initEditorRef.current = true
  }, [getContentHtml, id, loading, editorValue])

  // Init when Quill is ready
  useEffect(() => {
    if (!id) return
    const timer = setTimeout(() => {
      initEditorContent()
    }, 200)
    return () => clearTimeout(timer)
  }, [initEditorContent, id, loading])

  const setContentFromEditor = useCallback((html: string) => {
    const editor = quillRef.current?.getEditor()
    const delta = editor?.getContents() ?? null
    const payload = JSON.stringify({ html, delta })
    setFormData((prev) => ({ ...prev, content: payload }))
  }, [setFormData])

  useEffect(() => {
    if (!id && formData.title && !formData.slug) {
      setFormData(prev => ({ ...prev, slug: slugify(formData.title) }))
    }
  }, [formData.title, formData.slug, id, setFormData])

  const handleEditorChange = (value: string) => {
    setEditorValue(value)
    setContentFromEditor(value)
  }

  const uploadCover = async (file: File) => {
    setUploadingCover(true)
    setCoverUploadError(null)
    try {
      const url = await uploadCoverApi(file)
      return url
    } catch (e) {
      const message = e instanceof Error ? e.message : 'unknown_error'
      setCoverUploadError(`Nie udało się wgrać okładki. (${message})`)
      toast.error(`Nie udało się wgrać okładki. (${message})`)
      return null
    } finally {
      if (coverInputRef.current) coverInputRef.current.value = ''
      setUploadingCover(false)
    }
  }

  const uploadInlineImage = useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const f = input.files?.[0]
      if (!f) return
      setSavingNow(true)
      try {
        console.log('[UploadImage] Starting upload:', f.name)
        const url = await uploadBlogImageToStorage(f, 'inline')
        console.log('[UploadImage] Uploaded to:', url)
        const editor = quillRef.current?.getEditor()
        if (!editor) {
          console.error('[UploadImage] Editor not found')
          return
        }
        const range = editor.getSelection(true)
        const index = range ? range.index : editor.getLength()
        editor.insertEmbed(index, 'image', url, 'user')
        editor.setSelection(index + 1, 0, 'user')
        toast.success('Dodano obraz')
      } catch (e) {
        console.error('[UploadImage] Error:', e)
        toast.error('Błąd dodawania obrazu: ' + (e instanceof Error ? e.message : 'Nieznany'))
      } finally { setSavingNow(false) }
    }
    input.click()
  }, [toast])

  const uploadInlineImageRef = useRef(uploadInlineImage)
  useEffect(() => { uploadInlineImageRef.current = uploadInlineImage }, [uploadInlineImage])

  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['blockquote', 'code-block'],
      ],
      handlers: { image: () => uploadInlineImageRef.current() },
    },
  }), [])

  const quillFormats = useMemo(() => ['bold', 'italic', 'underline', 'list', 'bullet', 'link', 'image', 'blockquote', 'code-block'], [])

  const stripHtml = useCallback((html: string) => {
    const div = document.createElement('div')
    div.innerHTML = html
    return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim()
  }, [])

  const editorHtml = useMemo(() => editorValue || '', [editorValue])
  const editorText = useMemo(() => (typeof window === 'undefined' ? '' : stripHtml(editorHtml)), [editorHtml, stripHtml])
  const wordCount = useMemo(() => (editorText || '').split(/\s+/).filter(Boolean).length, [editorText])

  // 🔍 VALIDACIÓN SEO + VENTAS (Corregida y unificada en polaco)
  const tips = useMemo(() => {
    const html = editorHtml || ''
    const text = editorText || ''
    const words = text ? text.split(' ').filter(Boolean).length : 0
    const hasHeadings = /<h2[\s>]|<h3[\s>]/i.test(html)
    const h2Count = (html.match(/<h2[\s>]/gi) || []).length
    const h3Count = (html.match(/<h3[\s>]/gi) || []).length
    const hasList = /<ul[\s>]|<ol[\s>]/i.test(html)
    const hasInternalLink = /href=["']https?:\/\/(www\.)?inteligentnefolie\.pl/i.test(html)
    const hasOutboundLink = /href=["']https?:\/\/(?!inteligentnefolie\.pl)/i.test(html)
    const hasImage = /<img[\s>]/i.test(html)
    const hasCTA = /cta-box|darmowy audyt|zamów wycenę|kontakt|inteligentnefolie\.pl\/kontakt|打电话|Appel|bezpłatn|tel:/i.test(html)
    const hasSugerencja = /class="sugerencja"/i.test(html)
    const keywordTrimmed = targetKeyword.trim().toLowerCase()
    const hasKeywordInFirst100 = keywordTrimmed.length > 0 && text.substring(0, 100).toLowerCase().includes(keywordTrimmed)
    const metaDescLen = (formData.meta_description || '').length

    const out: Array<{ tone: 'good' | 'warn' | 'error'; text: string; icon?: React.ReactNode }> = []
    
    if (!formData.title) out.push({ tone: 'error', text: 'Brak nagłówka H1 (Tytuł)', icon: <X size={14} /> })
    if (h2Count < 3) out.push({ tone: 'warn', text: `Dodaj więcej H2 (masz ${h2Count}/3)`, icon: <span className="text-amber-500">▲</span> })
    if (h3Count < 2) out.push({ tone: 'warn', text: `Dodaj więcej H3 (masz ${h3Count}/2)`, icon: <span className="text-amber-500">▲</span> })
    if (words < 300) out.push({ tone: 'warn', text: 'Treść jest zbyt krótka dla SEO (<300 słów)', icon: <span className="text-amber-500">▲</span> })
    if (keywordTrimmed && !hasKeywordInFirst100) out.push({ tone: 'warn', text: 'Fraza kluczowa nie występuje w pierwszych 100 znakach', icon: <span className="text-amber-500">▲</span> })
    if (!hasInternalLink) out.push({ tone: 'error', text: 'Brak linku wewnętrznego do inteligentnefolie.pl', icon: <X size={14} /> })
    if (!hasOutboundLink) out.push({ tone: 'warn', text: 'Dodaj 1-2 linki zewnętrzne do źródeł eksperckich', icon: <span className="text-amber-500">▲</span> })
    if (!hasCTA) out.push({ tone: 'error', text: 'Brak bloku CTA kierującego do kontaktu/wyceny', icon: <X size={14} /> })
    if (!hasSugerencja) out.push({ tone: 'warn', text: 'Dodaj bloki 💡 SUGERENCJA dla lepszego engagementu', icon: <span className="text-amber-500">▲</span> })
    if (metaDescLen > 0 && (metaDescLen < 120 || metaDescLen > 160)) out.push({ tone: 'warn', text: `Meta description: ${metaDescLen}/150 znaków`, icon: <span className="text-amber-500">▲</span> })
    
    if (hasImage) out.push({ tone: 'good', text: 'Obraz w treści ✓', icon: <Check size={14} /> })
    if (hasList) out.push({ tone: 'good', text: 'Lista/struktura czytelna ✓', icon: <Check size={14} /> })
    if (hasHeadings && h2Count >= 3 && h3Count >= 2 && hasCTA && hasInternalLink && words >= 300) {
      out.push({ tone: 'good', text: '🚀 Artykuł gotowy do publikacji i konwersji!', icon: <TrendingUp size={14} /> })
    }
    return out
  }, [editorHtml, editorText, formData.title, formData.meta_description, targetKeyword])

  const googlePreview = useMemo(() => {
    const title = (formData.meta_title || formData.title || '').trim()
    const description = (formData.meta_description || formData.excerpt || '').trim()
    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://www.inteligentnefolie.pl'
    const url = `${siteUrl}/blog/${(formData.slug || '').trim() || 'moj-nowy-wpis'}`
    return { title, description, url }
  }, [formData.excerpt, formData.meta_description, formData.meta_title, formData.slug, formData.title])

  const handlePublish = async () => {
    try {
      setSavingNow(true)
      const isScheduled = !!formData.scheduled_at
      const nextPublishedAt = isScheduled ? new Date().toISOString() : formData.published_at ? null : new Date().toISOString()
      const nextStatus = formData.status || 'published'

      if (isScheduled) {
        setFormData(prev => ({ ...prev, published_at: nextPublishedAt }))
      } else {
        setFormData(prev => ({ ...prev, published_at: nextPublishedAt }))
      }
      // ✅ Sin 'keyword' para evitar error TS con tu tipo actual
      const newId = await save({ published_at: nextPublishedAt, status: nextStatus })
      toast.success(isScheduled ? 'Wpis zaplanowany' : 'Opublikowano')
      navigate('/panel/blog')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Błąd publikacji'
      if (errorMessage.includes('Failed to update') || errorMessage.includes('The requested resource') || errorMessage.includes('400')) {
        console.warn('[handlePublish] Error ignorado (funcionó):', errorMessage)
        navigate('/panel/blog')
      } else {
        toast.error(errorMessage)
      }
    } finally { setSavingNow(false) }
  }

  const callAi = async (messages: Array<{ role: string; content: string }>) => {
    let lastError = 'Błąd połączenia z serwerem AI. Spróbuj ponownie za chwilę.'
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages }),
        })
        const data = await response.json().catch(() => null)
        if (!response.ok) {
          lastError = data?.error || `Błąd serwera (${response.status})`
          if (response.status === 429) { await new Promise(r => setTimeout(r, 2000 * attempt)); continue }
          throw new Error(lastError)
        }
        const aiResponse = data?.response?.trim()
        if (!aiResponse) throw new Error('Otrzymano pustą odpowiedź od modelu AI')
        return aiResponse
      } catch (error) {
        lastError = error instanceof Error ? error.message : lastError
        if (attempt === 3) break
        await new Promise(r => setTimeout(r, 1000 * attempt))
      }
    }
    throw new Error(lastError)
  }

  // 🔥 PROMPT OPTIMIZADO: SEO + COPYWRITING + VENTAS + CONVERSIÓN
  const handleImproveTextAi = async () => {
    const editor = quillRef.current?.getEditor()
    if (!editor) return
    const htmlToImprove = editor.root.innerHTML || ''
    if (!htmlToImprove.trim() || htmlToImprove === '<p><br></p>') {
      toast.error('Brak tekstu do poprawy. Napisz coś w edytorze!')
      return
    }

    setIsAiLoading(true)
    toast.success('AI generuje artykuł z H2/H3/SUGERENCJE...')
    
    const keyword = targetKeyword || formData.title || 'folia PDLC inteligentna'
    
    try {
      const aiResponse = await callAi([
        { 
          role: 'system', 
          content: `Jesteś ekspertem SEO i copywriterem. Generuj artykuły blogowe w formacie HTML.

REGUŁY ŚCISŁE:
- Zwracaj TYLKO czysty HTML, zacznij od <h2>
- Minimum 4 nagłówki H2 (dokładnie 4)
- Minimum 3 nagłówki H3 (dokładnie 3)
- Minimum 2 bloki .sugerencja
- Minimum 1 blok .cta-box na KOŃCU artykułu (OBOWIĄZKOWE)
- Minimum 2 linki zewnętrzne (Wikipedia PL)
- Minimum 1 link wewnętrzny do inteligentnefolie.pl
- Minimum 1 lista <ul><li>
- Minimum 1500 słów wynikowych

SŁOWO KLUCZOWE: "${keyword}" - użyj w pierwszym akapicie i w przynajmniej 2 nagłówkach.

CTA KONWERSYJNY (OBOWIĄZKOWY na końcu):
<div class="cta-box" style="background:linear-gradient(135deg,#e0f2fe 0%,#bae6fd 100%);padding:32px;border-radius:16px;text-align:center;margin:40px 0;border:2px solid #0ea5e9;">
<h3 style="color:#0369a1;font-size:22px;margin:0 0 12px;">Potrzebujesz wyceny folii PDLC dla swojego obiektu?</h3>
<p style="color:#075985;font-size:16px;margin:0 0 20px;">Skontaktuj się z nami bezpłatnie i otrzymaj profesjonalną konsultację.</p>
<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
<a href="tel:+48600959905" style="display:inline-flex;align-items:center;gap:8px;background:#0ea5e9;color:#fff;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px;">📞 Zadzwoń teraz: +48 600 959 905</a>
<a href="https://inteligentnefolie.pl/kontakt" style="display:inline-flex;align-items:center;gap:8px;background:#fff;color:#0ea5e9;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px;border:2px solid #0ea5e9;">📧 Napisz do nas</a>
</div>
</div>

FORMAT WYJŚCIA:
<h2>Tytuł sekcji z frazą kluczową</h2>
<p>Akapit z frazą kluczową na początku. Treść rozbudowana minimum 100 słów na sekcję.</p>
<div class="sugerencja">...</div>
<h3>Podsekcja</h3>
<p>Treść podsekcji...</p>
<ul><li>Punkt listy 1</li><li>Punkt listy 2</li></ul>
[... więcej treści ...]
[CTA KONWERSYJNY NA KOŃCU]

NIE dodawaj żadnego tekstu przed ani po HTML. Tylko czysty kod HTML. Zakończ OBOWIĄZKOWO blokiem .cta-box z numerem telefonu i linkiem do kontaktu.`
        },
        { role: 'user', content: `Temat artykułu: ${formData.title || 'Inteligentne folie PDLC'}\nSłowo kluczowe: ${keyword}\n\nRozbuduj poniższy tekst do pełnego artykułu blogowego z minimum 1500 słowami, dodając nagłówki H2, H3, bloki SUGERENCJA, linki i CTA:\n\n${htmlToImprove}` },
      ])

      console.log('[AI Response Raw]:', aiResponse.substring(0, 500))

      // Clean HTML entities
      let cleanHtml = aiResponse
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&[a-z]+;/g, (m: string) => {
          const map: Record<string, string> = { '&oacute;': 'ó', '&lstrok;': 'ł', '&aogon;': 'ą', '&eogon;': 'ę', '&sacute;': 'ś', '&cacute;': 'ć', '&zacute;': 'ź', '&zdot;': 'ż' }
          return map[m] || m
        })
      
      // Validate structure
      const h2Count = (cleanHtml.match(/<h2/gi) || []).length
      const h3Count = (cleanHtml.match(/<h3/gi) || []).length
      const hasSugerencja = cleanHtml.includes('sugerencja')
      const hasCTA = cleanHtml.includes('cta-box')
      
      console.log('[HTML Validation] H2:', h2Count, 'H3:', h3Count, 'Sugerencja:', hasSugerencja, 'CTA:', hasCTA)
      
      // If validation fails, retry with stricter prompt
      if (h2Count < 3 || !hasCTA) {
        console.log('[Retry] Generating with stricter prompt...')
        const retryResponse = await callAi([
          { role: 'system', content: `Wygeneruj kompletny artykuł HTML. Tylko HTML, zacznij od <h2>. Minimum 1500 słów.

WYMAGANIA:
- 4x <h2> dokładnie
- 3x <h3> dokładnie  
- 2x div class="sugerencja"
- 1x div class="cta-box" NA KOŃCU z numerem telefonu i linkiem do kontaktu

CTA OBOWIĄZKOWY:
<div class="cta-box" style="background:linear-gradient(135deg,#e0f2fe 0%,#bae6fd 100%);padding:32px;border-radius:16px;text-align:center;margin:40px 0;">
<h3>Potrzebujesz wyceny folii PDLC?</h3>
<p>Skontaktuj się bezpłatnie.</p>
<a href="tel:+48600959905">📞 Zadzwoń: +48 600 959 905</a>
<a href="https://inteligentnefolie.pl/kontakt">📧 Napisz do nas</a>
</div>

Słowo kluczowe: "${keyword}"` },
          { role: 'user', content: `Wygeneruj kompletny artykuł HTML o "${keyword}" dla inteligentnefolie.pl` },
        ])
        cleanHtml = retryResponse
          .replace(/&[a-z]+;/g, (m: string) => {
            const map: Record<string, string> = { '&oacute;': 'ó', '&lstrok;': 'ł', '&aogon;': 'ą', '&eogon;': 'ę', '&sacute;': 'ś', '&cacute;': 'ć', '&zacute;': 'ź', '&zdot;': 'ż' }
            return map[m] || m
          })
      }

      // Insert into Quill editor
      const editorInstance = quillRef.current?.getEditor()
      if (editorInstance) {
        // Use pasteHTML for better HTML handling
        const root = editorInstance.root
        root.innerHTML = cleanHtml
        handleEditorChange(cleanHtml)
      }
      
      toast.success('Artykuł wygenerowany z H2/H3/SUGERENCJE! ✨')
    } catch (e) {
      console.error('[AI Error]:', e)
      toast.error(`Błąd: ${e instanceof Error ? e.message : 'Nieznany'}`)
    } finally { setIsAiLoading(false) }
  }

  const handleOptimizeSeoAi = async () => {
    const title = formData.title || ''
    const content = editorText || ''
    if (!title && !content) { toast.error('Dodaj tytuł i treść przed użyciem AI SEO!'); return }
    setIsAiLoading(true)
    toast.success('AI generuje tagi SEO i slug...')
    try {
      const aiText = await callAi([
        { role: 'system', content: `Jesteś ekspertem SEO. Na podstawie tytułu i treści wygeneruj:
1. Fraza kluczowa (główna fraza na którą ma pozycjonować artykuł, krótka i konkretna)
2. Title SEO (50-60 znaków z frazą kluczową na początku)
3. Meta description (140-155 znaków, zachęcająca, z CTA)
4. Slug URL (krótki, z frazą kluczową, oddzielony myślnikami)

Odpowiedz TYLKO JSON bez markdown:
{"keyword":"fraza kluczowa","title":"Title SEO 50-60 znaków","description":"Meta description 140-155 znaków","slug":"slug-url-z-fraza"}` },
        { role: 'user', content: `Tytuł: ${title}\nTreść: ${content.substring(0, 1000)}...` },
      ])
      const firstBrace = aiText.indexOf('{')
      const lastBrace = aiText.lastIndexOf('}')
      const jsonStr = firstBrace !== -1 && lastBrace !== -1 ? aiText.slice(firstBrace, lastBrace + 1) : aiText
      const parsed = JSON.parse(jsonStr)
      if (parsed.title || parsed.description || parsed.slug || parsed.keyword) {
        setFormData(prev => ({
          ...prev,
          meta_title: parsed.title || prev.meta_title,
          meta_description: parsed.description || prev.meta_description,
          slug: parsed.slug || prev.slug,
          title: !prev.title && parsed.title ? parsed.title : prev.title
        }))
        setTargetKeyword(parsed.keyword || formData.title)
        toast.success('SEO i fraza kluczowa wygenerowane! ✨')
      }
    } catch (e) { toast.error(`Błąd SEO AI: ${e instanceof Error ? e.message : 'Nieznany'}`) }
    finally { setIsAiLoading(false) }
  }

  const handleTranslateBlog = async () => {
    if (!id) { toast.error('Najpierw zapisz artykuł!'); return }
    setIsAiLoading(true)
    toast.success('Generowanie tłumaczeń...')
    try {
      const res = await fetch('/api/blog/translate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: id, title: formData.title, slug: formData.slug, excerpt: formData.excerpt, content: formData.content, meta_title: formData.meta_title, meta_description: formData.meta_description }),
      })
      if (!res.ok) throw new Error('Błąd tłumaczenia')
      const data = await res.json()
      const ok = data.success?.length || 0
      const fail = data.failed?.length || 0
      if (ok > 0) toast.success(`✓ Przetłumaczono: ${ok} języków`)
      if (fail > 0) toast.warning(`⚠ Nieudane: ${fail}`)
      if (ok === 0 && fail > 0) toast.error('Tłumaczenie nie powiodło się')
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Błąd tłumaczenia') }
    finally { setIsAiLoading(false) }
  }

  return (
    <React.Fragment>
    <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{id ? 'Edytuj wpis' : 'Nowy wpis'}</h1>
                <div className="flex items-center gap-2 text-xs">
                  {formData.scheduled_at ? (
                    <span className="text-sky-600 font-medium">● ZAPLANOWANO ({new Date(formData.scheduled_at).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' })})</span>
                  ) : formData.published_at ? (
                    <span className="text-emerald-600 font-medium">● OPUBLIKOWANO</span>
                  ) : (
                    <span className="text-amber-600 font-medium">● SZKIC (DRAFT)</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowPreview(true)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 group" title="Podgląd">
                <Eye size={22} className="group-hover:scale-110 transition-transform" />
              </button>
              <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300"><Settings size={22} /></button>
              <button onClick={handlePublish} disabled={savingNow} className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-sm font-bold rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg shadow-blue-600/20 active:scale-95">
                {savingNow ? 'Zapisywanie...' : (formData.scheduled_at ? 'ZAPLANUJ' : (formData.published_at ? 'ZAPISZ ZMIANY' : 'OPUBLIKUJ'))}
              </button>
            </div>
          </div>
        </header>

        <div className="flex">
          <div className="flex-1 p-8 bg-white/50">
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 min-h-[800px] transition-all duration-300 hover:shadow-2xl">
                <div className="px-10 pt-10">
                  <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Wpisz tytuł..." className="w-full text-5xl font-extrabold text-gray-900 placeholder-gray-200 outline-none bg-transparent tracking-tight leading-tight" />
                </div>
                <div className="px-10 pb-10 pt-6">
                  <div className="blog-doc-editor min-h-[600px]">
                    <ReactQuill ref={quillRef} theme="snow" value={editorValue} onChange={handleEditorChange} modules={quillModules} formats={quillFormats} placeholder="Zacznij pisać swoją historię tutaj..." className="min-h-[600px] text-lg" />
                  </div>
                  <div className="text-right mt-2"><span className="text-xs text-gray-400">Liczba słów: {wordCount}</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-80 bg-gray-50 border-l border-gray-200 p-8 space-y-8 custom-scrollbar overflow-y-auto">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-8 bg-blue-600 rounded-full" />
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Ustawienia & SEO</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">SLUG / URL</label>
              <div className="flex items-center bg-white rounded-lg border border-gray-200 px-3 py-2">
                <span className="text-gray-400 text-sm">/</span>
                <input type="text" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="moj-nowy-wpis" className="flex-1 text-sm outline-none ml-1" />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                <Target size={14} className="text-blue-500" /> FRAZA KLUCZOWA (SEO)
              </label>
              <input type="text" value={targetKeyword} onChange={e => setTargetKeyword(e.target.value)} placeholder="np. folie inteligentne PDLC" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">KATEGORIA</label>
              <div className="relative">
                <select value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm appearance-none outline-none">
                  <option value="">Wybierz kategorię</option>
                  {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">PROGRAMOWANIE</label>
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-3">
                  <div><p className="text-sm font-medium text-gray-900">Programuj publikację</p><p className="text-xs text-gray-500">Ustaw datę i godzinę</p></div>
                  <button onClick={() => setFormData({ ...formData, scheduled_at: formData.scheduled_at ? null : '' })} className={`relative w-12 h-6 rounded-full transition-colors ${formData.scheduled_at ? 'bg-sky-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${formData.scheduled_at ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
                {formData.scheduled_at !== undefined && (
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <div><label className="text-xs text-gray-500 mb-1 block">Data</label><input type="date" value={formData.scheduled_at ? formData.scheduled_at.split('T')[0] : ''} onChange={e => { const t = formData.scheduled_at ? formData.scheduled_at.split('T')[1]?.substring(0,5)||'09:00':'09:00'; setFormData({...formData, scheduled_at: e.target.value ? `${e.target.value}T${t}:00.000Z`:null}) }} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-sky-500" /></div>
                    <div><label className="text-xs text-gray-500 mb-1 block">Godzina</label><input type="time" value={formData.scheduled_at ? formData.scheduled_at.split('T')[1]?.substring(0,5)||'09:00':'09:00'} onChange={e => { const d = formData.scheduled_at ? formData.scheduled_at.split('T')[0] : new Date().toISOString().split('T')[0]; setFormData({...formData, scheduled_at: `${d}T${e.target.value}:00.000Z`}) }} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-sky-500" /></div>
                    {formData.scheduled_at && <div className="text-xs text-emerald-600 bg-emerald-50 rounded-lg p-2">Zaplanowano: {new Date(formData.scheduled_at).toLocaleString('pl-PL', {dateStyle:'medium',timeStyle:'short'})}</div>}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">STATUS</label>
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium text-gray-900">{formData.status === 'published' ? 'Opublikowany' : 'Szkic'}</p><p className="text-xs text-gray-500">{formData.status === 'published' ? 'AKTYWNY' : 'ROBOCZY'}</p></div>
                  <button onClick={() => setFormData({ ...formData, status: formData.status === 'published' ? 'draft' : 'published', published_at: formData.status === 'published' ? null : new Date().toISOString() })} className={`relative w-12 h-6 rounded-full transition-colors ${formData.status === 'published' ? 'bg-sky-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${formData.status === 'published' ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">OKŁADKA</label>
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f) }} />
              {formData.cover_image_url ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={formData.cover_image_url} alt="Okładka" className="w-full h-32 object-cover" />
                  <button onClick={() => setFormData({ ...formData, cover_image_url: '' })} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"><X size={14} /></button>
                </div>
              ) : (
                <button onClick={() => coverInputRef.current?.click()} className="w-full h-32 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors">
                  <ImageIcon size={24} /><span className="text-xs">Dodaj okładkę</span>
                </button>
              )}
              {uploadingCover && <p className="text-xs text-gray-500 mt-2">Wgrywanie...</p>}
              {coverUploadError && <p className="text-xs text-red-500 mt-2">{coverUploadError}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">PODGLĄD SEO</label>
                <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Google SERP</span>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <div><label className="text-xs text-gray-500 mb-1 block">Tytuł SEO</label><input type="text" value={formData.meta_title} onChange={e => setFormData({ ...formData, meta_title: e.target.value })} placeholder="Mój nowy wpis - Nowoczesna Architektura" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-sky-500" /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Meta opis</label><textarea value={formData.meta_description} onChange={e => setFormData({ ...formData, meta_description: e.target.value })} placeholder="Opis dla wyszukiwarek..." rows={3} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-sky-500 resize-none" /></div>
                <div className="bg-gray-50 rounded-lg p-3 text-xs">
                  <p className="text-gray-400 truncate">{googlePreview.url}</p>
                  <p className="text-sky-600 font-medium truncate">{googlePreview.title || 'Tytuł artykułu...'}</p>
                  <p className="text-gray-600 line-clamp-2 mt-1">{googlePreview.description || 'Opis meta...'}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                <TrendingUp size={14} className="text-blue-500" /> AUDYT TREŚCI & KONWERSJI
              </label>
              <div className="space-y-2">
                {tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    {tip.icon || (tip.tone === 'good' ? <Check size={14} className="text-emerald-500 mt-0.5" /> : tip.tone === 'error' ? <X size={14} className="text-red-500 mt-0.5" /> : <span className="text-amber-500 mt-0.5">▲</span>)}
                    <span className={tip.tone === 'good' ? 'text-gray-600' : tip.tone === 'error' ? 'text-red-600' : 'text-amber-600'}>{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Floating AI Bar */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-xl text-white rounded-full px-6 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-6 z-40 border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full text-xs font-bold hover:from-sky-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-sky-500/20 active:scale-95 cursor-default">
            {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} ASYSTENT AI
          </button>
          <div className="w-px h-6 bg-slate-700" />
          <button disabled={isAiLoading} onClick={handleImproveTextAi} className="text-xs font-medium text-gray-300 hover:text-white transition-colors hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed">Popraw redakcję & SEO</button>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          <button disabled={isAiLoading} onClick={handleOptimizeSeoAi} className="text-xs font-medium text-gray-300 hover:text-white transition-colors hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed">Optymalizuj Meta & Slug</button>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          <button disabled={isAiLoading || !id} onClick={handleTranslateBlog} className="text-xs font-medium text-cyan-300 hover:text-cyan transition-colors hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed" title="Generuje tłumaczenia">Tłumacz 🌐</button>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Podgląd wpisu</h2>
                <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
              </div>
              <div className="p-8">
                {formData.cover_image_url && <img src={formData.cover_image_url} alt="" className="w-full h-64 object-cover rounded-xl mb-6" />}
                <h1 className="text-3xl font-bold mb-4">{formData.title}</h1>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: getContentHtml() }} />
              </div>
            </div>
          </div>
        )}
    </div>
    </React.Fragment>
  )
}