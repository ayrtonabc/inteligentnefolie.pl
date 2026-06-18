// @ts-nocheck
import React, { CSSProperties, useEffect, useMemo, useState } from 'react'

export type DesignConfig = {
  template_id: string
  styles?: {
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
  assets?: {
    imageUrl?: string
    logoUrl?: string
  }
  upstream?: {
    size?: string
    position?: number
  }
  version?: number
}

type PopupContent = {
  title?: string
  body?: string
  button_text?: string
  button_url?: string
}

type SmartPopupRendererProps = {
  content: PopupContent
  design_config: DesignConfig
  onClose: () => void
  onAction?: (action: 'click' | 'close') => void
}

const MODAL_MAP: Record<string, number> = {
  classic: 0,
  minimal: 1,
}

const modalModules = import.meta.glob('@/vendor/popupsmart-modal-creator-upstream/components/Modals/Modal*.tsx')

export default function SmartPopupRenderer(props: SmartPopupRendererProps) {
  const selected = props.design_config?.template_id || 'classic'
  const modalId = (() => {
    if (selected.startsWith('modal_')) {
      const n = Number(selected.replace('modal_', ''))
      return Number.isFinite(n) ? n : 0
    }
    return MODAL_MAP[selected] ?? 0
  })()
  const [Template, setTemplate] = useState<React.ComponentType<any> | null>(null)
  const [MainProvider, setMainProvider] = useState<React.ComponentType<{ children: React.ReactNode }> | null>(null)
  const [MainContext, setMainContext] = useState<any>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const providerMod = await import('@/vendor/popupsmart-modal-creator-upstream/context/mainContext')
      const key = `@/vendor/popupsmart-modal-creator-upstream/components/Modals/Modal${modalId}.tsx`
      const loader = modalModules[key] as undefined | (() => Promise<any>)
      const modalMod = loader ? await loader() : null
      if (!mounted) return
      setMainProvider(() => providerMod.MainProvider as any)
      setMainContext(providerMod.MainContext as any)
      setTemplate(() => (modalMod?.default || (() => null)) as React.ComponentType<any>)
    })()
    return () => { mounted = false }
  }, [modalId])

  const styleVars = useMemo<CSSProperties>(() => {
    const s = props.design_config?.styles || {}
    return {
      '--popup-bg': s.palette?.background || '#ffffff',
      '--popup-text': s.palette?.text || '#111827',
      '--popup-btn-bg': s.palette?.buttonBg || '#0ea5e9',
      '--popup-btn-text': s.palette?.buttonText || '#ffffff',
      '--popup-br': `${s.borderRadius ?? 16}px`,
      '--popup-overlay': String(s.overlayOpacity ?? 0.5),
      '--popup-px': `${s.spacing?.paddingX ?? 24}px`,
      '--popup-py': `${s.spacing?.paddingY ?? 20}px`,
    } as CSSProperties
  }, [props.design_config])

  if (!Template || !MainProvider || !MainContext) return null

  const Bridge = () => {
    const ctx = React.useContext<any>(MainContext)
    useEffect(() => {
      ctx.setModalID(modalId)
      ctx.setSize(props.design_config?.upstream?.size || 'medium')
      ctx.setPosition(props.design_config?.upstream?.position ?? 4)
      const pal = props.design_config?.styles?.palette || {}
      ctx.setColors({
        color1: pal.background || '#ffffff',
        color2: pal.text || '#111827',
        color3: pal.buttonBg || '#0ea5e9'
      })
      const contentsFromDesign = (props.design_config as any)?.contents
      if (contentsFromDesign && typeof contentsFromDesign === 'object') {
        ctx.setContents(contentsFromDesign)
      } else {
        const contents: Record<string, string> = {}
        if (props.content.title) contents.content1 = props.content.title
        if (props.content.body) contents.content2 = props.content.body
        if (props.content.button_text) contents.content5 = props.content.button_text
        ctx.setContents(contents)
      }
      const assets = props.design_config?.assets || {}
      if (assets.logoUrl) ctx.setLogo(assets.logoUrl)
      if (assets.imageUrl) ctx.setImage(assets.imageUrl)
    }, [
      ctx,
      modalId,
      props.design_config?.styles?.palette?.background,
      props.design_config?.styles?.palette?.text,
      props.design_config?.styles?.palette?.buttonBg,
      props.design_config?.assets?.logoUrl,
      props.design_config?.assets?.imageUrl,
      (props.design_config as any)?.contents,
      props.design_config?.upstream?.size,
      props.design_config?.upstream?.position,
      props.content.title,
      props.content.body,
      props.content.button_text
    ])
    return null
  }

  return (
    <div
      style={styleVars}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: Number((styleVars as any)['--popup-overlay']) }}
        onClick={() => { props.onClose(); props.onAction?.('close') }}
      />
      <div
        className="relative"
        style={{
          background: String((styleVars as any)['--popup-bg']),
          color: String((styleVars as any)['--popup-text']),
          borderRadius: String((styleVars as any)['--popup-br']),
          boxShadow: props.design_config?.styles?.shadow || '0 10px 30px rgba(0,0,0,0.15)',
          padding: `${(styleVars as any)['--popup-py']} ${(styleVars as any)['--popup-px']}`,
        }}
      >
        <MainProvider>
          <Bridge />
          <Template />
        </MainProvider>
      </div>
    </div>
  )
}
