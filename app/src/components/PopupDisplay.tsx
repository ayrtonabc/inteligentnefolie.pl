'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Tag, MessageSquare } from 'lucide-react'

interface Popup {
  id: string
  name: string
  trigger_type: string
  trigger_value: number
  title?: string
  content?: {
    description?: string
    popup_type?: string
    buttonText?: string
    buttonUrl?: string
    backgroundColor?: string
    textColor?: string
    accentColor?: string
    image?: string
    [key: string]: any
  }
}

interface PopupDisplayProps {
  websiteId: string
  currentPath: string
  sessionId: string
  dismissedPopups: Set<string>
  isEditing?: boolean
  onDismiss: (popupId: string) => void
  onConvert: (popupId: string) => void
}

export default function PopupDisplay({
  websiteId,
  currentPath,
  sessionId,
  dismissedPopups,
  isEditing = false,
  onDismiss,
  onConvert
}: PopupDisplayProps) {
  const [activePopup, setActivePopup] = useState<Popup | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasTrackedView, setHasTrackedView] = useState(false)
  const [email, setEmail] = useState('')

  // Don't show popups in editing mode
  if (isEditing) return null

  useEffect(() => {
    const fetchPopups = async () => {
      try {
        const res = await fetch(`/api/popups?websiteId=${websiteId}&path=${encodeURIComponent(currentPath)}&sessionId=${sessionId}`)
        const data = await res.json()

        if (data.popups && data.popups.length > 0) {
          const popup = data.popups[0]
          if (!dismissedPopups.has(popup.id)) {
            setActivePopup(popup)
          }
        }
      } catch {
        // Silently fail
      }
    }

    fetchPopups()
  }, [websiteId, currentPath, sessionId, dismissedPopups])

  useEffect(() => {
    if (!activePopup || isEditing) return

    const handleTrigger = () => {
      if (!isVisible && !hasTrackedView) {
        setIsVisible(true)
        trackView(activePopup.id)
      }
    }

    const trackView = async (popupId: string) => {
      try {
        await fetch('/api/popups/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ popupId, sessionId, action: 'view' })
        })
        setHasTrackedView(true)
      } catch {}
    }

    switch (activePopup.trigger_type) {
      case 'time':
        const timer = setTimeout(handleTrigger, (activePopup.trigger_value || 5) * 1000)
        return () => clearTimeout(timer)

      case 'exit':
        const handleExitIntent = (e: MouseEvent) => {
          if (e.clientY <= 0) handleTrigger()
        }
        document.addEventListener('mouseleave', handleExitIntent)
        return () => document.removeEventListener('mouseleave', handleExitIntent)

      case 'scroll':
        const handleScroll = () => {
          const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
          if (scrollPercent >= (activePopup.trigger_value || 50)) {
            handleTrigger()
          }
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)

      case 'click':
        break
    }
  }, [activePopup, isVisible, hasTrackedView, sessionId, isEditing])

  const handleClose = () => {
    setIsVisible(false)
    if (activePopup) onDismiss(activePopup.id)
  }

  const handleAction = () => {
    // Note: buttonUrl is derived below, but we can't easily access it here without re-parsing or moving this function down.
    // Since we need it, let's just parse it directly here for the action.
    const url = activePopup?.content?.buttonUrl || ''
    if (url) {
      if (url.startsWith('http')) {
        window.open(url, '_blank')
      } else {
        window.location.href = url
      }
    }
    if (activePopup) onConvert(activePopup.id)
    handleClose()
  }

  if (!activePopup || !isVisible) return null

  const popupContent = activePopup.content || {}
  
  const bgColor = popupContent.backgroundColor || '#ffffff'
  const textColor = popupContent.textColor || '#000000'
  const buttonColor = popupContent.accentColor || '#3b82f6'
  const description = popupContent.description || ''
  const buttonText = popupContent.buttonText || ''
  const buttonUrl = popupContent.buttonUrl || ''
  const imageUrl = popupContent.image || ''
  const rawPopupType = popupContent.popup_type || 'offer'

  // Normalize popup_type from CMS to frontend types
  const normalizedType = rawPopupType === 'email' ? 'newsletter' 
    : rawPopupType === 'offer' ? 'flash_sale'
    : rawPopupType === 'contact' ? 'feedback'
    : rawPopupType

  const size = popupContent.size || 'medium'
  const sizeClasses = {
    small: 'max-w-lg',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    'extra-large': 'max-w-6xl'
  }
  const currentSizeClass = sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.medium

  const hasImage = !!imageUrl
  const isCustomBanner = normalizedType === 'custom' && hasImage

  if (isCustomBanner) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
        <div className={`relative z-10 ${currentSizeClass} w-full max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.3s_ease-out]`}>
          <button onClick={handleClose} className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-20">
            <X size={20} className="text-white" />
          </button>
          <div className="relative cursor-pointer" onClick={handleAction}>
            <img 
              src={imageUrl} 
              alt="" 
              className="w-full h-auto object-contain max-h-[85vh]"
            />
            {buttonUrl && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <button className="px-8 py-3 rounded-full font-bold text-white text-base shadow-xl transition-all hover:scale-105 hover:shadow-2xl" style={{ backgroundColor: buttonColor }}>
                  {buttonText || 'Sprawdź ofertę'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      
      <div className={`relative z-10 ${currentSizeClass} w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.3s_ease-out]`}>
        <button onClick={handleClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white transition-colors z-20 shadow-md">
          <X size={18} className="text-gray-600" />
        </button>

        <div className={`flex flex-col ${hasImage ? 'lg:flex-row' : ''}`}>
          {hasImage && (
            <div className="relative w-full lg:w-[45%] aspect-[4/3] lg:aspect-auto overflow-hidden bg-gray-100">
              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          )}

          <div className={`flex flex-col justify-center p-8 lg:p-10 ${hasImage ? 'lg:w-[55%]' : 'w-full'}`}>
            {normalizedType === 'newsletter' && (
              <div className="text-center max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${buttonColor}15` }}>
                  <Mail size={28} style={{ color: buttonColor }} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: textColor }}>
                  {activePopup.title || 'Zapisz się do newslettera'}
                </h3>
                <p className="text-base mb-6 leading-relaxed" style={{ color: textColor, opacity: 0.7 }}>
                  {description || 'Otrzymuj najnowsze aktualizacje bezpośrednio na swój adres e-mail.'}
                </p>
                <form onSubmit={(e) => { e.preventDefault(); handleAction(); }} className="space-y-3">
                  <input
                    type="email"
                    placeholder="twoj@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                    style={{ focusRing: `${buttonColor}` }}
                    required
                  />
                  <button type="submit" className="w-full py-3.5 px-6 rounded-xl font-semibold text-white text-base transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]" style={{ backgroundColor: buttonColor }}>
                    {buttonText || 'Zapisz mnie'}
                  </button>
                </form>
              </div>
            )}

            {normalizedType === 'flash_sale' && (
              <div className="max-w-lg mx-auto">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: buttonColor }}>
                    <Tag size={24} className="text-white" />
                  </div>
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-2" style={{ backgroundColor: buttonColor }}>
                      OFERTA
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold" style={{ color: textColor }}>
                      {activePopup.title || 'Oferta specjalna!'}
                    </h3>
                  </div>
                </div>
                {popupContent.discountCode && (
                  <div className="inline-flex items-center gap-3 bg-gray-100 rounded-xl px-5 py-3 mb-4">
                    <span className="font-mono font-bold text-base">{popupContent.discountCode}</span>
                    <span className="text-xs text-gray-500">Kod rabatowy</span>
                  </div>
                )}
                <p className="text-base mb-6 leading-relaxed" style={{ color: textColor, opacity: 0.7 }}>
                  {description || 'Skorzystaj z tej oferty przez ograniczony czas.'}
                </p>
                {buttonUrl && (
                  <button onClick={handleAction} className="w-full py-3.5 px-6 rounded-xl font-semibold text-white text-base transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]" style={{ backgroundColor: buttonColor }}>
                    {buttonText || 'Skorzystaj z oferty'} →
                  </button>
                )}
              </div>
            )}

            {normalizedType === 'feedback' && (
              <div className="text-center max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${buttonColor}15` }}>
                  <MessageSquare size={28} style={{ color: buttonColor }} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: textColor }}>
                  {activePopup.title || 'Potrzebujesz pomocy?'}
                </h3>
                <p className="text-base mb-6 leading-relaxed" style={{ color: textColor, opacity: 0.7 }}>
                  {description || 'Skontaktuj się z nami, a odpowiemy tak szybko, jak to możliwe.'}
                </p>
                {buttonUrl && (
                  <button onClick={handleAction} className="w-full py-3.5 px-6 rounded-xl font-semibold text-white text-base transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]" style={{ backgroundColor: buttonColor }}>
                    {buttonText || 'Skontaktuj się'} →
                  </button>
                )}
              </div>
            )}

            {!['newsletter', 'flash_sale', 'feedback'].includes(normalizedType) && (
              <div className="text-center">
                {activePopup.title && (
                  <h3 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: textColor }}>
                    {activePopup.title}
                  </h3>
                )}
                {description && (
                  <p className="text-base mb-6 leading-relaxed" style={{ color: textColor, opacity: 0.7 }}>
                    {description}
                  </p>
                )}
                {buttonUrl && buttonText && (
                  <button onClick={handleAction} className="py-3.5 px-8 rounded-xl font-semibold text-white text-base transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]" style={{ backgroundColor: buttonColor }}>
                    {buttonText}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
