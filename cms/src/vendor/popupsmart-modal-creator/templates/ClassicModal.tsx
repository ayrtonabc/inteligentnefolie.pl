import React from 'react'

type Assets = { imageUrl?: string; logoUrl?: string }

type Props = {
  title?: string
  body?: string
  buttonText?: string
  buttonUrl?: string
  assets?: Assets
  onAction?: (a: 'click' | 'close') => void
}

export function ClassicModal(props: Props) {
  return (
    <div className="w-[380px] max-w-full">
      {props.assets?.logoUrl && (
        <img src={props.assets.logoUrl} alt="" className="h-8 mb-3 object-contain" />
      )}
      {props.assets?.imageUrl && (
        <img src={props.assets.imageUrl} alt="" className="w-full h-40 object-cover rounded-lg mb-4" />
      )}
      <div className="space-y-2">
        <div className="text-lg font-bold">{props.title}</div>
        <div className="text-sm opacity-80">{props.body}</div>
        <div className="pt-2">
          <a
            href={props.buttonUrl || '#'}
            onClick={() => props.onAction?.('click')}
            className="inline-flex items-center justify-center h-10 px-4 rounded-md"
            style={{ background: 'var(--popup-btn-bg)', color: 'var(--popup-btn-text)' }}
          >
            {props.buttonText || 'Aceptar'}
          </a>
        </div>
      </div>
    </div>
  )
}

