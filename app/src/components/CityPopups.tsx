'use client'

import { usePathname } from 'next/navigation'
import { PopupProvider, usePopupContext } from './PopupProvider'
import PopupDisplay from './PopupDisplay'

function PopupHandler() {
  const pathname = usePathname()
  const { sessionId, dismissedPopups, dismissPopup, trackConversion } = usePopupContext()
  const websiteId = process.env.NEXT_PUBLIC_WEBSITE_ID || 'dktsle4yev6syo4' || 'default'

  return (
    <PopupDisplay
      websiteId={websiteId}
      currentPath={pathname}
      sessionId={sessionId}
      dismissedPopups={dismissedPopups}
      isEditing={false}
      onDismiss={dismissPopup}
      onConvert={trackConversion}
    />
  )
}

export default function CityPopups() {
  return (
    <PopupProvider>
      <PopupHandler />
    </PopupProvider>
  )
}