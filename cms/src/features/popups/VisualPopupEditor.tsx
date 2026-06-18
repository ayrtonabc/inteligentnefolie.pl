// @ts-nocheck
import React, { Suspense, lazy, useCallback, useMemo, useState } from 'react'
import { pb, TENANT_ID } from '@/lib/pocketbase'
import { MainContext, MainProvider } from '@/vendor/popupsmart-modal-creator-upstream/context/mainContext'
import type { MainContextInterface } from '@/vendor/popupsmart-modal-creator-upstream/context/@types.main'

export type DesignConfig = {
  template_id: string
  styles: {
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
  assets: {
    imageUrl?: string
    logoUrl?: string
  }
  contents?: Record<string, any>
  upstream?: {
    size?: string
    position?: number
  }
  version: number
}

export type EditorContentPayload = {
  title?: string
  body?: string
  button_text?: string
  button_url?: string
}

type VisualPopupEditorProps = {
  websiteId: string
  initialTemplateId?: string
  initialDesignConfig?: Partial<DesignConfig>
  initialContent?: EditorContentPayload
  onSave: (payload: { design_config: DesignConfig; content: EditorContentPayload }) => void
  onCancel?: () => void
}

const UpstreamContainer = lazy(() => import('@/vendor/popupsmart-modal-creator-upstream/components/Container').then(m => ({ default: m.default })))

export default function VisualPopupEditor(props: VisualPopupEditorProps) {
  const initialModalId = useMemo(() => {
    const tid = props.initialDesignConfig?.template_id || props.initialTemplateId || 'modal_0'
    if (typeof tid === 'string' && tid.startsWith('modal_')) {
      const n = Number(tid.replace('modal_', ''))
      return Number.isFinite(n) ? n : 0
    }
    if (tid === 'minimal') return 1
    return 0
  }, [props.initialDesignConfig?.template_id, props.initialTemplateId])

  const [buttonUrl, setButtonUrl] = useState(props.initialContent?.button_url || '')

  const uploadImage = useCallback(async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', file.name)
    formData.append('website_id', pb.authStore.model?.website_id || TENANT_ID)
    formData.append('bucket_name', 'popup-assets')
    const record = await pb.collection('media').create(formData)
    return pb.files.getURL(record, record.file)
  }, [])

  const uploader = useMemo(() => ({
    uploadImage: async (file: File, kind: 'image' | 'logo') => {
      const url = await uploadImage(file)
      return url
    }
  }), [uploadImage])

  const SaveBar = () => {
    const ctx = React.useContext(MainContext) as MainContextInterface
    const handleSave = () => {
      const colors = (ctx.colors || {}) as any
      const contents = (ctx.contents || {}) as any
      const design_config: DesignConfig = {
        template_id: `modal_${ctx.modalID}`,
        styles: {
          palette: {
            background: colors.color1 || '#ffffff',
            text: colors.color2 || '#111827',
            buttonBg: colors.color3 || '#0ea5e9',
            buttonText: '#ffffff'
          }
        },
        assets: {
          logoUrl: ctx.logo && ctx.logo !== 'default' ? ctx.logo : undefined,
          imageUrl: ctx.image || undefined
        },
        contents,
        upstream: {
          size: ctx.size,
          position: ctx.position
        },
        version: 1
      }

      const content: EditorContentPayload = {
        title: contents.content1 || '',
        body: contents.content2 || '',
        button_text: contents.content5 || '',
        button_url: buttonUrl || ''
      }

      props.onSave({ design_config, content })
    }

    return (
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
        <div className="text-sm font-semibold">Editor visual (Popupsmart)</div>
        <div className="flex items-center gap-2">
          <input
            value={buttonUrl}
            onChange={(e) => setButtonUrl(e.target.value)}
            placeholder="URL del botón (opcional)"
            className="h-9 w-72 border rounded-md px-3 text-sm"
          />
          <button onClick={props.onCancel} className="h-9 px-3 border rounded-md text-sm">
            Anuluj
          </button>
          <button onClick={handleSave} className="h-9 px-3 bg-sky-600 text-white rounded-md text-sm">
            Zapisz
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex">
      <div className="m-auto bg-white w-[95vw] h-[90vh] rounded-xl overflow-hidden shadow-2xl flex flex-col">
        <MainProvider
          assetUpload={async (file, kind) => uploader.uploadImage(file, kind)}
          initial={{
            modalID: initialModalId,
            size: props.initialDesignConfig?.upstream?.size || 'medium',
            position: props.initialDesignConfig?.upstream?.position ?? 4,
            logo: props.initialDesignConfig?.assets?.logoUrl || '',
            image: props.initialDesignConfig?.assets?.imageUrl || '',
            colors: {
              color1: props.initialDesignConfig?.styles?.palette?.background || '#ffffff',
              color2: props.initialDesignConfig?.styles?.palette?.text || '#111827',
              color3: props.initialDesignConfig?.styles?.palette?.buttonBg || '#0ea5e9'
            },
            contents: props.initialDesignConfig?.contents || {
              content1: props.initialContent?.title || '',
              content2: props.initialContent?.body || '',
              content5: props.initialContent?.button_text || ''
            }
          }}
        >
          <SaveBar />
          <div className="flex-1 overflow-auto">
            <Suspense fallback={<div className="p-6">Cargando…</div>}>
              <UpstreamContainer />
            </Suspense>
          </div>
        </MainProvider>
      </div>
    </div>
  )
}

