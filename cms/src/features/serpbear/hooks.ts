import { useCallback, useEffect, useState } from 'react'
import {
  listKeywords,
  addKeyword,
  deleteKeyword,
  getKeywordWithHistory,
  getKeywordStats,
  checkKeywordPosition,
  getSeoSummary,
  getGoogleAppearances,
  getDeviceComparison,
  getPositionChanges,
  getLostOpportunities,
  getCompetitors,
  isGoogleConnected,
  syncFromGsc,
  type SeoSummary,
  type GoogleAppearance,
  type DeviceComparison,
  type PositionChange,
  type LostOpportunity,
  type Competitor,
} from './seo-api'
import type { SerpBearKeyword, SerpBearKeywordWithHistory, AddKeywordFormData } from './types'

export function useSerpBear(websiteId: string | null) {
  const [keywords, setKeywords] = useState<SerpBearKeyword[]>([])
  const [selectedKeyword, setSelectedKeyword] = useState<SerpBearKeywordWithHistory | null>(null)
  const [stats, setStats] = useState<{
    totalKeywords: number
    top10Count: number
    top50Count: number
    notFoundCount: number
    averagePosition: number | null
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [seoSummary, setSeoSummary] = useState<SeoSummary | null>(null)
  const [googleAppearances, setGoogleAppearances] = useState<GoogleAppearance[]>([])
  const [deviceComparison, setDeviceComparison] = useState<DeviceComparison[]>([])
  const [positionChanges, setPositionChanges] = useState<PositionChange[]>([])
  const [lostOpportunities, setLostOpportunities] = useState<LostOpportunity[]>([])
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [syncing, setSyncing] = useState(false)

  const refresh = useCallback(async () => {
    if (!websiteId) return
    setLoading(true)
    setError(null)
    try {
      const [keywordsData, statsData, connected, summary, appearances, devices, changes, opportunities, comps] = await Promise.all([
        listKeywords(websiteId),
        getKeywordStats(websiteId),
        isGoogleConnected(websiteId),
        getSeoSummary(websiteId),
        getGoogleAppearances(websiteId),
        getDeviceComparison(websiteId),
        getPositionChanges(websiteId),
        getLostOpportunities(websiteId),
        getCompetitors(websiteId),
      ])
      setKeywords(keywordsData)
      setStats(statsData)
      setIsConnected(connected)
      setSeoSummary(summary)
      setGoogleAppearances(appearances)
      setDeviceComparison(devices)
      setPositionChanges(changes)
      setLostOpportunities(opportunities)
      setCompetitors(comps)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Błąd ładowania'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [websiteId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addNewKeyword = useCallback(
    async (data: AddKeywordFormData) => {
      if (!websiteId) throw new Error('Brak websiteId')
      const keyword = await addKeyword(websiteId, data)
      setKeywords((prev) => [keyword, ...prev])
      return keyword
    },
    [websiteId]
  )

  const removeKeyword = useCallback(
    async (keywordId: string) => {
      await deleteKeyword(keywordId)
      setKeywords((prev) => prev.filter((k) => k.id !== keywordId))
      if (selectedKeyword?.id === keywordId) {
        setSelectedKeyword(null)
      }
    },
    [selectedKeyword]
  )

  const selectKeyword = useCallback(async (keywordId: string) => {
    setLoading(true)
    try {
      const keyword = await getKeywordWithHistory(keywordId)
      setSelectedKeyword(keyword)
    } finally {
      setLoading(false)
    }
  }, [])

  const checkPosition = useCallback(
    async (keywordId: string) => {
      const keyword = keywords.find((k) => k.id === keywordId)
      if (!keyword) return

      setChecking(true)
      setError(null)
      try {
        const result = await checkKeywordPosition(websiteId!, keywordId, {
          keyword: keyword.keyword,
          domain: keyword.domain,
          device: keyword.device,
          location: keyword.location,
        })

        // Actualizar el keyword con la nueva posición
        setKeywords((prev) =>
          prev.map((k) =>
            k.id === keywordId
              ? {
                  ...k,
                  lastPosition: result.position,
                  lastCheck: new Date().toISOString(),
                }
              : k
          )
        )

        // Actualizar selectedKeyword si está seleccionado
        if (selectedKeyword?.id === keywordId) {
          const updated = await getKeywordWithHistory(keywordId)
          setSelectedKeyword(updated)
        }

        // Refrescar estadísticas
        await refresh()
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Błąd sprawdzania'
        setError(msg)
      } finally {
        setChecking(false)
      }
    },
    [keywords, websiteId, selectedKeyword, refresh]
  )

  const checkAllPositions = useCallback(async () => {
    if (keywords.length === 0) return

    setChecking(true)
    setError(null)
    try {
      for (const keyword of keywords) {
        await checkPosition(keyword.id)
        // Pequeña pausa entre verificaciones
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Błąd sprawdzania'
      setError(msg)
    } finally {
      setChecking(false)
    }
  }, [keywords, checkPosition])

  const syncWithGoogle = useCallback(async () => {
    if (!websiteId) return
    setSyncing(true)
    try {
      await syncFromGsc(websiteId)
      await refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Błąd synchronizacji'
      setError(msg)
    } finally {
      setSyncing(false)
    }
  }, [websiteId, refresh])

  return {
    keywords,
    selectedKeyword,
    stats,
    loading,
    checking,
    error,
    isConnected,
    syncing,
    seoSummary,
    googleAppearances,
    deviceComparison,
    positionChanges,
    lostOpportunities,
    competitors,
    refresh,
    addNewKeyword,
    removeKeyword,
    selectKeyword,
    checkPosition,
    checkAllPositions,
    setSelectedKeyword,
    syncWithGoogle,
  }
}
