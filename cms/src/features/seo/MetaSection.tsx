import { useEffect, useMemo, useState } from 'react'
import { useToast } from '@/components/Toast'
import { improveMetaTags } from '@/features/seo/openrouter'
import { getSeoMeta, upsertSeoMeta } from './api'
import { SettingsAPI } from '@/features/settings/api'
import { useSettings } from '@/features/settings/hooks'
import { Globe, Share2, Wand2, AlertCircle, CheckCircle2, ImageIcon, Upload, Loader2 } from 'lucide-react'

export default function MetaSection({ websiteId }: { websiteId: string }) {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [runningMetaAi, setRunningMetaAi] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    og_title: '',
    og_description: '',
    og_image: '',
  })

  const { data: settings } = useSettings(websiteId)

  const googlePreview = useMemo(() => {
    return {
      title: form.title || 'Twoja strona',
      description: form.description || 'Opis strony',
    }
  }, [form.description, form.title])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const data = await getSeoMeta(websiteId)
        if (mounted && data) {
          setForm({
            title: data.title || '',
            description: data.description || '',
            og_title: data.og_title || '',
            og_description: data.og_description || '',
            og_image: data.og_image || '',
          })
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [websiteId])

  const save = async () => {
    setSaving(true)
    try {
      await upsertSeoMeta(websiteId, {
        title: form.title,
        description: form.description,
        og_title: form.og_title,
        og_description: form.og_description,
        og_image: form.og_image,
      })
      toast.success('Zapisano zmiany')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Błąd'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleImproveWithAI = async () => {
    const url = settings?.website_url
    if (!url) {
      toast.error('Brak URL strony w Ustawieniach. Dodaj go najpierw.')
      return
    }
    
    setRunningMetaAi(true)
    try {
      const result = await improveMetaTags(
        form.title,
        form.description,
        url
      )
      
      setForm(prev => ({
        ...prev,
        title: result.title,
        description: result.description,
        og_title: result.og_title,
        og_description: result.og_description,
      }))
      
      toast.success('AI poprawiło meta tagi! Sprawdź wyniki i zapisz.')
    } catch (e) {
      console.error('AI Meta Tags Improvement failed:', e);
      const msg = e instanceof Error ? e.message : 'Błąd AI'
      toast.error(`❌ ${msg}`)
    } finally {
      setRunningMetaAi(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    try {
      const url: string = await SettingsAPI.uploadSEOImage(file, websiteId)
      setForm(prev => ({ ...prev, og_image: url }))
      toast.success('Obraz został wgrany!')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Błąd uploadu'
      toast.error(msg)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file)
    }
  }

  const titleLength = form.title.length
  const descLength = form.description.length
  const titleValid = titleLength >= 30 && titleLength <= 60
  const descValid = descLength >= 120 && descLength <= 160

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Jak Cię widzą w wyszukiwarkach</h2>
        <p className="text-gray-600 mt-1">
          Ustaw tytuł i opis, które pojawiają się w Google i przy udostępnianiu w mediach społecznościowych
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Google Section */}
          <section className="bg-white border border-gray-200 rounded-lg">
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <h3 className="font-medium text-gray-900">Wyniki wyszukiwania Google</h3>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {/* Title Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tytuł w Google
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Np. Twoja Firma | Profesjonalne usługi w Warszawie"
                  maxLength={70}
                />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-gray-500">
                    Pojawia się jako niebieski link w wynikach wyszukiwania
                  </span>
                  <span className={`text-xs ${titleValid ? 'text-green-600' : 'text-gray-400'}`}>
                    {titleLength}/60 znaków
                  </span>
                </div>
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Opis pod tytułem
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Krótki opis zachęcający do kliknięcia. Powinien zawierać słowa kluczowe i wezwanie do działania."
                  maxLength={170}
                />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-gray-500">
                    To szary tekst pod tytułem - ma zachęcić do wizyty
                  </span>
                  <span className={`text-xs ${descValid ? 'text-green-600' : 'text-gray-400'}`}>
                    {descLength}/160 znaków
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Social Sharing Section */}
          <section className="bg-white border border-gray-200 rounded-lg">
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-gray-500" />
                <h3 className="font-medium text-gray-900">Udostępnianie w mediach społecznościowych</h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Facebook, LinkedIn, Twitter - kiedy ktoś udostępni Twój link
              </p>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tytuł przy udostępnianiu
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={form.og_title}
                    onChange={(e) => setForm((p) => ({ ...p, og_title: e.target.value }))}
                    placeholder={form.title || 'Tytuł'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Jeśli pusty, użyje tytułu z Google
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Opis przy udostępnianiu
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={form.og_description}
                    onChange={(e) => setForm((p) => ({ ...p, og_description: e.target.value }))}
                    placeholder={form.description || 'Opis'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Jeśli pusty, użyje opisu z Google
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Obraz przy udostępnianiu
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('og-image-upload')?.click()}
                  onDrop={handleImageDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <input
                    type="file"
                    id="og-image-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file)
                    }}
                  />
                  {uploadingImage ? (
                    <div className="flex items-center justify-center gap-2 text-blue-600">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Wgrywanie...</span>
                    </div>
                  ) : form.og_image ? (
                    <div className="space-y-2">
                      <img
                        src={form.og_image}
                        alt="OG Preview"
                        className="max-h-32 mx-auto rounded"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setForm(p => ({ ...p, og_image: '' }))
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Usuń obraz
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">Kliknij lub przeciągnij obraz tutaj</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG do 5MB</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Zalecany rozmiar: 1200×630 pikseli (poziomy obraz)
                </p>
              </div>
            </div>
          </section>

          {/* AI Improve Section */}
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <Wand2 className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Popraw meta tagi z AI</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Na podstawie Twoich wpisanych danych i strony internetowej, AI zoptymalizuje tagi dla lepszego pozycjonowania.
            </p>
            <button
              type="button"
              onClick={handleImproveWithAI}
              disabled={runningMetaAi || loading || !settings?.website_url}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md text-sm font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {runningMetaAi ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI analizuje i poprawia...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Popraw tagi z AI
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Wpisz najpierw dane, potem kliknij przycisk
            </p>
          </section>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button 
              onClick={save} 
              disabled={saving || loading}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </button>
          </div>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Podgląd</h3>
            
            {/* Google Preview */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500 uppercase tracking-wide">Wynik Google</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-md">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-gray-500">G</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-800 mb-0.5">
                      {(() => {
                        const url = settings?.website_url
                        if (!url) return 'twojadomena.pl'
                        let cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '')
                        const slashIndex = cleanUrl.indexOf('/')
                        if (slashIndex > 0) {
                          cleanUrl = cleanUrl.substring(0, slashIndex)
                        }
                        return cleanUrl || 'twojadomena.pl'
                      })()} › strona
                    </div>
                    <h4 className="text-lg text-blue-700 hover:underline cursor-pointer truncate leading-tight">
                      {googlePreview.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      {googlePreview.description}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Tak wygląda Twój wynik w wyszukiwarce Google
              </p>
            </div>

            {/* Social Preview */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Share2 className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500 uppercase tracking-wide">Udostępnianie</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-w-sm">
                {form.og_image ? (
                  <div className="aspect-[1200/630] bg-gray-100">
                    <img 
                      src={form.og_image} 
                      alt="" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-[1200/630] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                      <span className="text-xs text-gray-400">Brak obrazu</span>
                    </div>
                  </div>
                )}
                <div className="p-3">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    {(() => {
                      const url = settings?.website_url
                      if (!url) return 'TWOJADOMENA.PL'
                      const cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
                      return cleanUrl ? cleanUrl.toUpperCase() : 'TWOJADOMENA.PL'
                    })()}
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                    {form.og_title || form.title || 'Tytuł strony'}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {form.og_description || form.description || 'Opis strony pojawiający się przy udostępnianiu w mediach społecznościowych.'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Tak będzie wyglądać przy udostępnianiu na Facebooku lub LinkedIn
              </p>
            </div>

            {/* Validation */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Status</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {titleValid ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  )}
                  <span className={titleValid ? 'text-gray-700' : 'text-gray-600'}>
                    Tytuł {titleValid ? 'w odpowiedniej długości' : `za ${titleLength < 30 ? 'krótki' : 'długi'}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {descValid ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  )}
                  <span className={descValid ? 'text-gray-700' : 'text-gray-600'}>
                    Opis {descValid ? 'w odpowiedniej długości' : `za ${descLength < 120 ? 'krótki' : 'długi'}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {form.og_image ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={form.og_image ? 'text-gray-700' : 'text-gray-500'}>
                    Obraz {form.og_image ? 'ustawiony' : 'nie jest wymagany'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
