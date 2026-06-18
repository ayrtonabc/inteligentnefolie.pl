import { useCallback, useEffect, useState } from 'react'
import { z } from 'zod'
import {
  getWebsiteId,
  listPosts,
  removePost,
  getPost,
  listCategories,
  savePost,
  uploadCoverToStorage,
  type BlogPost,
  type BlogCategory,
} from './api'
import { pb } from '@/lib/pocketbase'

export function usePosts() {
  const [websiteId, setWebsiteId] = useState<string | null>(null)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const wid = await getWebsiteId()
      setWebsiteId(wid)
      const data = await listPosts(wid)
      setPosts(data)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  const remove = useCallback(
    async (id: string) => {
      await removePost(id)
      setPosts((prev) => prev.filter((p) => p.id !== id))
    },
    [setPosts],
  )

  return { websiteId, posts, loading, error, refetch: fetch, remove }
}

export const postSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().optional().default(''),
  excerpt: z.string().optional().default(''),
  meta_title: z.string().optional().default(''),
  meta_description: z.string().optional().default(''),
  cover_image_url: z.string().optional().or(z.literal('')),
  category_id: z.string().optional().or(z.literal('')),
  status: z.string().optional().default('published'),
  scheduled_at: z.string().optional().nullable(),
  published_at: z.string().optional().nullable(),
})

export function usePostForm(id: string | null) {
  const [websiteId, setWebsiteId] = useState<string | null>(null)
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(() => Boolean(id))
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null)
  const [values, setValues] = useState<z.infer<typeof postSchema>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    meta_title: '',
    meta_description: '',
    cover_image_url: '',
    category_id: '',
    status: 'published',
    scheduled_at: null,
    published_at: null,
  })

  useEffect(() => {
    getWebsiteId()
      .then((wid) => {
        setWebsiteId(wid)
        return listCategories(wid)
      })
      .then(setCategories)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    setLoading(true)
    getPost(id)
      .then((data) => {
        setValues({
          title: data.title || '',
          slug: data.slug || '',
          content: data.content || '',
          excerpt: data.excerpt || '',
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
          cover_image_url: data.cover_image_url || '',
          category_id: data.category_id || '',
          status: data.status || 'published',
          scheduled_at: data.scheduled_at || null,
          published_at: data.published_at || null,
        })
      })
      .finally(() => setLoading(false))
  }, [id])

  const validate = useCallback(
    (overrides?: Partial<z.infer<typeof postSchema>>) => postSchema.safeParse({ ...values, ...overrides }),
    [values],
  )

  const save = useCallback(async (overrides?: Partial<z.infer<typeof postSchema>>) => {
    const parsed = validate(overrides)
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((i) => i.message).join(', '))
    }
    if (!websiteId) throw new Error('Brak website_id')
    
    const isScheduled = !!parsed.data.scheduled_at
    const isPublished = !!parsed.data.published_at
    
    const payload = {
      ...parsed.data,
      website_id: websiteId,
      category_id: parsed.data.category_id || null,
      status: parsed.data.status || 'published',
      published_at: isPublished ? (parsed.data.published_at || new Date().toISOString()) : null,
      language_code: 'pl', // Default language
    }
    const newId = await savePost(id, payload)
    setValues((prev) => ({ ...prev, ...parsed.data }))
    if (pendingCoverFile) {
      const coverUrl = await uploadCoverToStorage(pendingCoverFile, newId)
      setPendingCoverFile(null)
      setValues((prev) => ({ ...prev, cover_image_url: coverUrl }))
    }
    return newId
  }, [id, pendingCoverFile, validate, websiteId])

  const uploadCover = useCallback(async (file: File) => {
    if (!id) {
      const previewUrl = URL.createObjectURL(file)
      setPendingCoverFile(file)
      setValues((prev) => ({ ...prev, cover_image_url: previewUrl }))
      return previewUrl
    }

    const url = await uploadCoverToStorage(file, id)
    setPendingCoverFile(null)
    setValues((prev) => ({ ...prev, cover_image_url: url }))
    return url
  }, [id])

  return {
    websiteId,
    categories,
    loading,
    values,
    setValues,
    save,
    validate,
    uploadCover,
  }
}
