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

export function MinimalModal(props: Props) {
  return (
    <div className="w-[320px] max-w-full">
      <div className="text-base font-semibold">{props.title}</div>
      <div className="text-sm opacity-80 mt-1">{props.body}</div>
      <div className="pt-3">
        <a
          href={props.buttonUrl || '#'}
          onClick={() => props.onAction?.('click')}
          className="inline-flex items-center justify-center h-9 px-3 rounded-md border border-gray-300"
          style={{ background: 'var(--popup-btn-bg)', color: 'var(--popup-btn-text)' }}
        >
          {props.buttonText || 'Continuar'}
        </a>
      </div>
    </div>
  )
}

