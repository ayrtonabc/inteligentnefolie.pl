// ============================================================================
// POPUP HOOKS
// ============================================================================

import { useCallback, useEffect, useState } from 'react'
import { listPopups, createPopup, updatePopup, deletePopup, duplicatePopup, getPopupStats } from './api'
import type { PopupData, PopupStats } from './types'

export function usePopups() {
  const [popups, setPopups] = useState<PopupData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listPopups()
      setPopups(data)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Błąd ładowania'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const createNew = useCallback(async (popup: Omit<PopupData, 'id' | 'created_at' | 'updated_at' | 'views' | 'clicks' | 'conversions'>) => {
    const created = await createPopup(popup)
    setPopups(prev => [created, ...prev])
    return created
  }, [])

  const updateExisting = useCallback(async (id: string, updates: Partial<PopupData>) => {
    const updated = await updatePopup(id, updates)
    setPopups(prev => prev.map(p => p.id === id ? updated : p))
    return updated
  }, [])

  const remove = useCallback(async (id: string) => {
    await deletePopup(id)
    setPopups(prev => prev.filter(p => p.id !== id))
  }, [])

  const duplicate = useCallback(async (id: string) => {
    const copy = await duplicatePopup(id)
    setPopups(prev => [copy, ...prev])
    return copy
  }, [])

  return { popups, loading, error, refresh, createNew, updateExisting, remove, duplicate }
}

export function usePopupStats() {
  const [stats, setStats] = useState<PopupStats>({ totalViews: 0, totalClicks: 0, totalConversions: 0, avgCtr: 0, avgConversionRate: 0 })
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getPopupStats()
      setStats(data)
    } catch (err) {
      console.warn('Popup stats error:', err)
    }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { stats, loading, refresh }
}
