'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { PopupProvider, usePopupContext } from './PopupProvider'
import PopupDisplay from './PopupDisplay'
import { TENANT_ID } from '@/lib/pocketbase'

function PopupHandler() {
  const pathname = usePathname()
  const { sessionId, dismissedPopups, dismissPopup, trackConversion } = usePopupContext()
  const websiteId = process.env.NEXT_PUBLIC_WEBSITE_ID || TENANT_ID || 'default'

  // Check if we're in visual edit mode (from URL ?visual_edit=true)
  const isEditing = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('visual_edit') === 'true'

  // Block all link clicks in edit mode
  useEffect(() => {
    if (isEditing) {
      const handleLinkClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        const link = target.closest('a')
        if (link) {
          e.preventDefault()
          e.stopPropagation()
        }
      }
      
      document.addEventListener('click', handleLinkClick, true)
      return () => document.removeEventListener('click', handleLinkClick, true)
    }
  }, [isEditing])

  return (
    <PopupDisplay
      websiteId={websiteId}
      currentPath={pathname}
      sessionId={sessionId}
      dismissedPopups={dismissedPopups}
      isEditing={isEditing}
      onDismiss={dismissPopup}
      onConvert={trackConversion}
    />
  )
}

export default function PopupWrapper({ children }: { children: React.ReactNode }) {
  const websiteId = process.env.NEXT_PUBLIC_WEBSITE_ID || TENANT_ID || 'default'

  return (
    <PopupProvider websiteId={websiteId}>
      {children}
      <PopupHandler />
    </PopupProvider>
  )
}
