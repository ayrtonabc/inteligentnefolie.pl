import React from 'react'

type Styles = {
  palette?: {
    background?: string
    text?: string
    buttonBg?: string
    buttonText?: string
  }
}

type Content = {
  title?: string
  body?: string
  button_text?: string
}

type Assets = {
  imageUrl?: string
  logoUrl?: string
}

type PreviewProps = {
  templateId: string
  content: Content
  styles: Styles
  assets: Assets
}

export function Preview(props: PreviewProps) {
  return (
    <div className="h-full w-full flex items-center justify-center p-8">
      <div
        className="max-w-md w-full rounded-xl shadow-xl p-6"
        style={{
          background: props.styles.palette?.background || '#ffffff',
          color: props.styles.palette?.text || '#111827',
        }}
      >
        {props.assets.logoUrl && (
          <img src={props.assets.logoUrl} alt="" className="h-8 mb-4 object-contain" />
        )}
        {props.assets.imageUrl && (
          <img src={props.assets.imageUrl} alt="" className="w-full h-40 object-cover rounded-lg mb-4" />
        )}
        <h3 className="text-lg font-bold mb-2">{props.content.title || 'Título de ejemplo'}</h3>
        <p className="text-sm opacity-80 mb-4">{props.content.body || 'Texto del popup...'}</p>
        <button
          className="h-10 px-4 rounded-md"
          style={{
            background: props.styles.palette?.buttonBg || '#0ea5e9',
            color: props.styles.palette?.buttonText || '#ffffff'
          }}
        >
          {props.content.button_text || 'Aceptar'}
        </button>
      </div>
    </div>
  )
}

