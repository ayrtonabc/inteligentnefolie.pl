import React from 'react'

type Styles = {
  borderRadius?: number
  shadow?: string
  overlayOpacity?: number
  palette?: {
    background?: string
    text?: string
    buttonBg?: string
    buttonText?: string
  }
  spacing?: {
    paddingX?: number
    paddingY?: number
  }
}

type Content = {
  title?: string
  body?: string
  button_text?: string
  button_url?: string
}

type Assets = {
  imageUrl?: string
  logoUrl?: string
}

type EditorProps = {
  templateId: string
  content: Content
  styles: Styles
  assets: Assets
  onChange: (change: { content?: Content; styles?: Styles }) => void
  uploader: { uploadImage: (file: File, kind: 'image' | 'logo') => Promise<string> }
}

export function Editor(props: EditorProps) {
  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Título</label>
        <input
          className="w-full rounded border px-3 py-2"
          value={props.content.title || ''}
          onChange={e => props.onChange({ content: { ...props.content, title: e.target.value } })}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Texto</label>
        <textarea
          className="w-full rounded border px-3 py-2 min-h-28"
          value={props.content.body || ''}
          onChange={e => props.onChange({ content: { ...props.content, body: e.target.value } })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Texto botón</label>
          <input
            className="w-full rounded border px-3 py-2"
            value={props.content.button_text || ''}
            onChange={e => props.onChange({ content: { ...props.content, button_text: e.target.value } })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">URL botón</label>
          <input
            className="w-full rounded border px-3 py-2"
            value={props.content.button_url || ''}
            onChange={e => props.onChange({ content: { ...props.content, button_url: e.target.value } })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Fondo</label>
          <input
            type="color"
            className="h-10 w-full rounded border"
            value={props.styles.palette?.background || '#ffffff'}
            onChange={e => props.onChange({
              styles: { ...props.styles, palette: { ...(props.styles.palette || {}), background: e.target.value } }
            })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Texto</label>
          <input
            type="color"
            className="h-10 w-full rounded border"
            value={props.styles.palette?.text || '#111827'}
            onChange={e => props.onChange({
              styles: { ...props.styles, palette: { ...(props.styles.palette || {}), text: e.target.value } }
            })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Botón fondo</label>
          <input
            type="color"
            className="h-10 w-full rounded border"
            value={props.styles.palette?.buttonBg || '#0ea5e9'}
            onChange={e => props.onChange({
              styles: { ...props.styles, palette: { ...(props.styles.palette || {}), buttonBg: e.target.value } }
            })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Botón texto</label>
          <input
            type="color"
            className="h-10 w-full rounded border"
            value={props.styles.palette?.buttonText || '#ffffff'}
            onChange={e => props.onChange({
              styles: { ...props.styles, palette: { ...(props.styles.palette || {}), buttonText: e.target.value } }
            })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Radio borde</label>
          <input
            type="number"
            className="w-full rounded border px-3 py-2"
            value={props.styles.borderRadius ?? 16}
            onChange={e => props.onChange({ styles: { ...props.styles, borderRadius: Number(e.target.value) } })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Opacidad overlay</label>
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            className="w-full rounded border px-3 py-2"
            value={props.styles.overlayOpacity ?? 0.5}
            onChange={e => props.onChange({ styles: { ...props.styles, overlayOpacity: Number(e.target.value) } })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Imagen</label>
          <input
            type="file"
            accept="image/*"
            onChange={async e => {
              const file = e.target.files?.[0]
              if (file) await props.uploader.uploadImage(file, 'image')
            }}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={async e => {
              const file = e.target.files?.[0]
              if (file) await props.uploader.uploadImage(file, 'logo')
            }}
          />
        </div>
      </div>
    </div>
  )
}

