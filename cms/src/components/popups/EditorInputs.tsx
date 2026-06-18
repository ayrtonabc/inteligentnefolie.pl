import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'

// ============================================================================
// TEXT INPUT
// ============================================================================

export function TextInput({
  label, value, onChange, multiline = false, placeholder, helpText, className = ''
}: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; placeholder?: string; helpText?: string; className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      )}
      {helpText && <p className="text-[10px] text-gray-400 mt-1">{helpText}</p>}
    </div>
  )
}

// ============================================================================
// COLOR PICKER
// ============================================================================

const PRESET_COLORS = [
  '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#1e293b', '#0f172a',
  '#3b82f6', '#0ea5e9', '#06b6d4', '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b',
  '#ef4444', '#f97316', '#ec4899', '#a855f7', '#8b5cf6', '#6366f1',
]

export function ColorPicker({
  label, value, onChange
}: {
  label: string; value: string; onChange: (v: string) => void
}) {
  const [showNative, setShowNative] = useState(false)

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <div className="flex flex-wrap gap-1">
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              onClick={() => { onChange(color); setShowNative(false) }}
              className={`w-6 h-6 rounded-lg border-2 transition-all hover:scale-110 ${
                value.toLowerCase() === color.toLowerCase() ? 'border-blue-500 scale-110' : 'border-gray-200'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button onClick={() => setShowNative(!showNative)}
            className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all overflow-hidden"
            style={{ backgroundColor: value }} title="Niestandardowy kolor">
            <input type="color" value={value} onChange={e => onChange(e.target.value)}
              className="w-12 h-12 -m-2 cursor-pointer opacity-0" />
          </button>
          <input type="text" value={value} onChange={e => onChange(e.target.value)}
            className="w-20 px-2 py-1.5 text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="#000000" />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// IMAGE UPLOAD
// ============================================================================

export function ImageUpload({
  label, value, onChange, aspectRatio = 'video'
}: {
  label: string; value: string; onChange: (v: string) => void; aspectRatio?: 'square' | 'video' | 'banner'
}) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    banner: 'aspect-[2/1]'
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      alert('Wybrany plik nie jest obrazem')
      return
    }

    setUploading(true)
    try {
      // Import dynamiczny optymalizatora obrazów
      const { optimizeImage } = await import('../../lib/imageOptimizer')
      
      const result = await optimizeImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        format: 'image/webp'
      })

      const reader = new FileReader()
      reader.onloadend = () => {
        onChange(reader.result as string)
        setUploading(false)
      }
      reader.readAsDataURL(result.file)
    } catch (err) {
      console.error('Błąd optymalizacji obrazu:', err)
      // Fallback: spróbuj wczytać oryginał jeśli optymalizacja zawiedzie
      const reader = new FileReader()
      reader.onloadend = () => {
        onChange(reader.result as string)
        setUploading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className={`relative ${aspectClasses[aspectRatio]} bg-gray-100 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden group`}>
        {value ? (
          <>
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50">
                Zmień
              </button>
              <button onClick={() => onChange('')}
                className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 flex items-center gap-1">
                <X size={12} /> Usuń
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 transition-colors cursor-pointer w-full h-full"
          >
            <ImageIcon size={32} className="mb-2" />
            <p className="text-xs font-medium mb-1">Kliknij aby dodać obraz</p>
            <p className="text-[10px]">PNG, JPG, GIF do 10MB</p>
          </button>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <Loader2 size={24} className="text-blue-500 animate-spin" />
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
      </div>
      {value && !value.startsWith('http') && (
        <p className="text-[10px] text-amber-600 mt-1">⚠️ Obraz jako base64. Dla lepszej wydajności użyj URL obrazu.</p>
      )}
    </div>
  )
}
