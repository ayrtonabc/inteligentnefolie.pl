import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  languagesAPI,
  websiteLanguagesAPI,
  translationGroupsAPI,
  translationKeysAPI,
  translationsAPI,
  translatedPagesAPI,
  getWebsiteId,
} from './api'
import type {
  WebsiteLanguageFormData,
  TranslationKeyFormData,
  TranslationFormData,
  TranslatedPageFormData,
  AutoTranslateRequest,
} from './types'

// ============================================================================
// WEBSITE ID
// ============================================================================

export function useWebsiteId() {
  return useQuery({
    queryKey: ['websiteId'],
    queryFn: () => getWebsiteId(),
    staleTime: 1000 * 60 * 60,
  })
}

// ============================================================================
// HOOKS DE IDIOMAS (Catálogo global)
// ============================================================================

export function useAllLanguages() {
  return useQuery({
    queryKey: ['allLanguages'],
    queryFn: () => languagesAPI.getAllLanguages(),
    staleTime: 1000 * 60 * 60,
  })
}

export function useLanguageByCode(code: string) {
  return useQuery({
    queryKey: ['language', code],
    queryFn: () => languagesAPI.getLanguageByCode(code),
    enabled: !!code,
  })
}

// ============================================================================
// HOOKS DE IDIOMAS DEL WEBSITE
// ============================================================================

export function useWebsiteLanguages(websiteId: string) {
  return useQuery({
    queryKey: ['websiteLanguages', websiteId],
    queryFn: () => websiteLanguagesAPI.getWebsiteLanguages(websiteId),
    enabled: !!websiteId,
  })
}

export function useTranslationProgress(websiteId: string) {
  return useQuery({
    queryKey: ['translationProgress', websiteId],
    queryFn: () => websiteLanguagesAPI.getProgress(websiteId),
    enabled: !!websiteId,
  })
}

export function useWebsiteLanguage(id: string) {
  return useQuery({
    queryKey: ['websiteLanguage', id],
    queryFn: () => websiteLanguagesAPI.getWebsiteLanguage(id),
    enabled: !!id,
  })
}

export function useAddWebsiteLanguage(websiteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: WebsiteLanguageFormData) => websiteLanguagesAPI.addLanguage(websiteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websiteLanguages', websiteId] })
      queryClient.invalidateQueries({ queryKey: ['translationProgress', websiteId] })
    },
  })
}

export function useUpdateWebsiteLanguage(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (updates: Partial<WebsiteLanguageFormData>) => 
      websiteLanguagesAPI.updateLanguage(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websiteLanguage', id] })
      queryClient.invalidateQueries({ queryKey: ['websiteLanguages'] })
      queryClient.invalidateQueries({ queryKey: ['translationProgress'] })
    },
  })
}

export function useRemoveWebsiteLanguage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => websiteLanguagesAPI.removeLanguage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websiteLanguages'] })
      queryClient.invalidateQueries({ queryKey: ['translationProgress'] })
    },
  })
}

export function useSetDefaultLanguage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, websiteId }: { id: string; websiteId: string }) => 
      websiteLanguagesAPI.setAsDefault(id, websiteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websiteLanguages'] })
      queryClient.invalidateQueries({ queryKey: ['translationProgress'] })
    },
  })
}

export function usePublishLanguage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => websiteLanguagesAPI.publishLanguage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websiteLanguages'] })
      queryClient.invalidateQueries({ queryKey: ['translationProgress'] })
    },
  })
}

// ============================================================================
// HOOKS DE GRUPOS DE TRADUCCIÓN
// ============================================================================

export function useTranslationGroups(websiteId: string) {
  return useQuery({
    queryKey: ['translationGroups', websiteId],
    queryFn: () => translationGroupsAPI.getGroups(websiteId),
    enabled: !!websiteId,
  })
}

// ============================================================================
// HOOKS DE CLAVES DE TRADUCCIÓN
// ============================================================================

export function useTranslationKeys(websiteId: string, filters?: { group_id?: string; search?: string }) {
  return useQuery({
    queryKey: ['translationKeys', websiteId, filters],
    queryFn: () => translationKeysAPI.getKeys(websiteId, filters),
    enabled: !!websiteId,
  })
}

export function useTranslationKey(id: string) {
  return useQuery({
    queryKey: ['translationKey', id],
    queryFn: () => translationKeysAPI.getKey(id),
    enabled: !!id,
  })
}

export function useTranslationKeyStats(websiteId: string) {
  return useQuery({
    queryKey: ['translationKeyStats', websiteId],
    queryFn: () => translationKeysAPI.getStats(websiteId),
    enabled: !!websiteId,
  })
}

export function useCreateTranslationKey(websiteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TranslationKeyFormData) => translationKeysAPI.createKey(websiteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translationKeys', websiteId] })
      queryClient.invalidateQueries({ queryKey: ['translationKeyStats', websiteId] })
    },
  })
}

export function useUpdateTranslationKey(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (updates: Partial<TranslationKeyFormData>) => 
      translationKeysAPI.updateKey(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translationKey', id] })
      queryClient.invalidateQueries({ queryKey: ['translationKeys'] })
    },
  })
}

export function useDeleteTranslationKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => translationKeysAPI.deleteKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translationKeys'] })
      queryClient.invalidateQueries({ queryKey: ['translationKeyStats'] })
    },
  })
}

// ============================================================================
// HOOKS DE TRADUCCIONES
// ============================================================================

export function useTranslations(keyId: string) {
  return useQuery({
    queryKey: ['translations', keyId],
    queryFn: () => translationsAPI.getTranslations(keyId),
    enabled: !!keyId,
  })
}

export function useTranslationForLanguage(keyId: string, languageId: string) {
  return useQuery({
    queryKey: ['translation', keyId, languageId],
    queryFn: () => translationsAPI.getTranslationForLanguage(keyId, languageId),
    enabled: !!keyId && !!languageId,
  })
}

export function useUpdateTranslation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TranslationFormData) => translationsAPI.updateTranslation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations'] })
      queryClient.invalidateQueries({ queryKey: ['translation'] })
      queryClient.invalidateQueries({ queryKey: ['translationProgress'] })
    },
  })
}

export function useCreateTranslation(keyId: string, languageId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (translatedText: string) => 
      translationsAPI.createTranslation(keyId, languageId, translatedText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations', keyId] })
      queryClient.invalidateQueries({ queryKey: ['translationProgress'] })
    },
  })
}

export function useAutoTranslate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ websiteId, request }: { websiteId: string; request: AutoTranslateRequest }) => 
      translationsAPI.autoTranslate({ ...request, websiteId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translationKeys'] })
      queryClient.invalidateQueries({ queryKey: ['translations'] })
      queryClient.invalidateQueries({ queryKey: ['translationProgress'] })
      queryClient.invalidateQueries({ queryKey: ['websiteLanguages'] })
    },
  })
}

// ============================================================================
// HOOKS DE PÁGINAS TRADUCIDAS
// ============================================================================

export function useTranslatedPages(websiteId: string, languageId?: string) {
  return useQuery({
    queryKey: ['translatedPages', websiteId, languageId],
    queryFn: () => translatedPagesAPI.getPages(websiteId, languageId),
    enabled: !!websiteId,
  })
}

export function useTranslatedPage(id: string) {
  return useQuery({
    queryKey: ['translatedPage', id],
    queryFn: () => translatedPagesAPI.getPage(id),
    enabled: !!id,
  })
}

export function useCreateTranslatedPage(websiteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TranslatedPageFormData & { language_id: string }) => 
      translatedPagesAPI.createPage(websiteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translatedPages', websiteId] })
    },
  })
}

export function useUpdateTranslatedPage(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (updates: Partial<TranslatedPageFormData>) => 
      translatedPagesAPI.updatePage(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translatedPage', id] })
      queryClient.invalidateQueries({ queryKey: ['translatedPages'] })
    },
  })
}

export function usePublishTranslatedPage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => translatedPagesAPI.publishPage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translatedPages'] })
      queryClient.invalidateQueries({ queryKey: ['translatedPage'] })
    },
  })
}
