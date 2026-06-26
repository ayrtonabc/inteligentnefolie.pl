'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface Popup {
  id: string
  name: string
  trigger_type: 'time' | 'exit' | 'click' | 'scroll'
  trigger_value: number
  popup_type: 'newsletter' | 'flash_sale' | 'feedback' | 'custom'
  title?: string
  content?: string
  button_text?: string
  button_url?: string
  background_color: string
  text_color: string
  button_color: string
  target_pages: string[]
  target_intentions: string[]
  priority: number
}

interface PopupContextType {
  sessionId: string
  trackConversion: (popupId: string) => Promise<void>
  dismissedPopups: Set<string>
  dismissPopup: (popupId: string) => void
}

const PopupContext = createContext<PopupContextType>({
  sessionId: '',
  trackConversion: async () => {},
  dismissedPopups: new Set(),
  dismissPopup: () => {},
})

export const usePopupContext = () => useContext(PopupContext)

interface PopupProviderProps {
  children: ReactNode
  websiteId: string
}

export function PopupProvider({ children, websiteId }: PopupProviderProps) {
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      let id = sessionStorage.getItem('popup_session_id')
      if (!id) {
        id = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('popup_session_id', id)
      }
      return id
    }
    return ''
  })

  const [dismissedPopups, setDismissedPopups] = useState<Set<string>>(new Set())

  const trackConversion = useCallback(async (popupId: string) => {
    try {
      await fetch('/api/popups/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          popupId,
          sessionId,
          action: 'convert'
        })
      })
    } catch (err) {
      console.error('Error tracking conversion:', err)
    }
  }, [sessionId])

  const dismissPopup = useCallback((popupId: string) => {
    setDismissedPopups(prev => {
      const next = new Set(prev)
      next.add(popupId)
      return next
    })
    if (typeof window !== 'undefined') {
      const dismissed = JSON.parse(localStorage.getItem('dismissed_popups') || '[]')
      dismissed.push({ id: popupId, until: Date.now() + 24 * 60 * 60 * 1000 })
      localStorage.setItem('dismissed_popups', JSON.stringify(dismissed))
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('dismissed_popups') || '[]')
      const now = Date.now()
      const valid = stored.filter((d: any) => d.until > now)
      if (valid.length !== stored.length) {
        localStorage.setItem('dismissed_popups', JSON.stringify(valid))
      }
      setDismissedPopups(new Set(valid.map((d: any) => d.id)))
    }
  }, [])

  return (
    <PopupContext.Provider value={{ sessionId, trackConversion, dismissedPopups, dismissPopup }}>
      {children}
    </PopupContext.Provider>
  )
}
