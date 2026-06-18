import { pb, TENANT_ID } from '@/lib/pocketbase'

export type BlogPost = {
  id: string
  website_id?: string
  title: string
  slug: string
  created_at: string
  published_at?: string | null
  scheduled_at?: string | null
  category_id?: string | null
  content?: string
  excerpt?: string
  meta_title?: string
  meta_description?: string
  cover_image_url?: string
  status?: string
  language_code?: string
  original_id?: string
  expand?: {
    blog_categories?: {
      id: string
      name: string
      slug: string
    }
  }
}

export type BlogCategory = {
  id: string
  website_id?: string
  name: string
  slug: string
}

export async function getWebsiteId(): Promise<string> {
  if (pb.authStore.model?.website_id) {
    return pb.authStore.model.website_id;
  }
  return TENANT_ID;
}

export async function getCategories(websiteId: string): Promise<BlogCategory[]> {
  const filter = `website_id = "${websiteId}"`
  const data = await pb.collection('blog_categories').getFullList({
    filter,
    sort: 'name',
  })
  return data.map((r) => ({
    id: r.id,
    website_id: r.website_id,
    name: r.name,
    slug: r.slug,
  })) as BlogCategory[]
}

export async function listPosts(websiteId: string): Promise<BlogPost[]> {
  const filter = `website_id = "${websiteId}"`
  const data = await pb.collection('blog_posts').getFullList({
    filter,
    sort: '-created',
    expand: 'blog_categories',
  })
  return data.map((r) => ({
    id: r.id,
    website_id: r.website_id,
    title: r.title,
    slug: r.slug,
    created_at: r.created,
    published_at: r.published_at,
    scheduled_at: r.scheduled_at,
    category_id: r.category_id,
    content: r.content,
    excerpt: r.excerpt,
    meta_title: r.meta_title,
    meta_description: r.meta_description,
    cover_image_url: r.cover_image ? pb.files.getURL(r, r.cover_image, { thumb: '0x400' }) : '',
    status: r.status,
    language_code: r.language_code,
    original_id: r.original_id,
    expand: r.expand,
  })) as BlogPost[]
}

export async function listCategories(websiteId: string): Promise<BlogCategory[]> {
  return getCategories(websiteId)
}

export async function getPost(id: string): Promise<BlogPost> {
  const r = await pb.collection('blog_posts').getOne(id)
  const coverUrl = r.cover_image
    ? pb.files.getURL(r, r.cover_image, { thumb: '0x400' })
    : ''
  return {
    id: r.id,
    website_id: r.website_id,
    title: r.title,
    slug: r.slug,
    created_at: r.created,
    published_at: r.published_at,
    scheduled_at: r.scheduled_at,
    category_id: r.category_id,
    content: r.content,
    excerpt: r.excerpt,
    meta_title: r.meta_title,
    meta_description: r.meta_description,
    cover_image_url: coverUrl,
    status: r.status,
    language_code: r.language_code,
    original_id: r.original_id,
  }
}

export async function savePost(
  id: string | null,
  payload: Partial<BlogPost> & { published_at?: string | null },
) {
  // Build complete payload with ALL fields
  const cleanPayload: Record<string, any> = {};

  // Required fields
  cleanPayload.title = payload.title;
  cleanPayload.slug = payload.slug;
  cleanPayload.website_id = payload.website_id || TENANT_ID;

  // Optional fields - only add if they have value
  if (payload.content !== undefined) cleanPayload.content = payload.content;
  if (payload.excerpt !== undefined) cleanPayload.excerpt = payload.excerpt;
  if (payload.status !== undefined) cleanPayload.status = payload.status;
  if (payload.published_at !== undefined) cleanPayload.published_at = payload.published_at;
  if (payload.scheduled_at !== undefined) cleanPayload.scheduled_at = payload.scheduled_at || null;
  if (payload.category_id !== undefined) cleanPayload.category_id = payload.category_id || null;
  if (payload.meta_title !== undefined) cleanPayload.meta_title = payload.meta_title;
  if (payload.meta_description !== undefined) cleanPayload.meta_description = payload.meta_description;
  if (payload.language_code !== undefined) cleanPayload.language_code = payload.language_code;
  if (payload.original_id !== undefined) cleanPayload.original_id = payload.original_id;

  if (id) {
    await pb.collection('blog_posts').update(id, cleanPayload);
    return id;
  }

  try {
    const existing = await pb.collection('blog_posts').getFirstListItem(
      `slug="${cleanPayload.slug}" && website_id="${cleanPayload.website_id}"`
    );
    await pb.collection('blog_posts').update(existing.id, cleanPayload);
    return existing.id;
  } catch (e: any) {
    if (e.status === 404) {
      const record = await pb.collection('blog_posts').create(cleanPayload);
      return record.id;
    }
    throw e;
  }
}

export async function removePost(id: string) {
  await pb.collection('blog_posts').delete(id)
}

async function retry<T>(operation: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 700))
      }
    }
  }

  throw lastError
}

export async function uploadCoverToStorage(file: File, postId: string): Promise<string> {
  if (!postId) {
    const mediaForm = new FormData()
    mediaForm.append('file', file)
    mediaForm.append('name', file.name)
    mediaForm.append('website_id', TENANT_ID)
    mediaForm.append('bucket_name', 'blog-images')
    const mediaRecord = await pb.collection('media').create(mediaForm)
    return pb.files.getURL(mediaRecord, mediaRecord.file)
  }

  await retry(async () => {
    const postForm = new FormData()
    postForm.append('cover_image', file)
    return pb.collection('blog_posts').update(postId, postForm)
  })

  return pb.files.getURL({ id: postId } as any, file.name)
}

function getFileType(filename: string): { type: string; format: string } {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  if (imageFormats.includes(ext)) return { type: 'image', format: ext.toUpperCase() };
  const videoFormats = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
  if (videoFormats.includes(ext)) return { type: 'video', format: ext.toUpperCase() };
  const audioFormats = ['mp3', 'wav', 'flac', 'aac'];
  if (audioFormats.includes(ext)) return { type: 'audio', format: ext.toUpperCase() };
  return { type: 'other', format: ext.toUpperCase() };
}

function getMimeTypeForFormat(format: string): string {
  if (['jpg', 'jpeg'].includes(format.toLowerCase())) return 'image/jpeg';
  if (format.toLowerCase() === 'png') return 'image/png';
  if (format.toLowerCase() === 'gif') return 'image/gif';
  if (format.toLowerCase() === 'webp') return 'image/webp';
  if (format.toLowerCase() === 'svg') return 'image/svg+xml';
  return 'application/octet-stream';
}

export async function uploadBlogImageToStorage(file: File, postId: string): Promise<string> {
  const tenantId = pb.authStore.model?.website_id || TENANT_ID;
  const { type, format } = getFileType(file.name);
  const mimeType = getMimeTypeForFormat(format);
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', file.name);
  formData.append('website_id', tenantId);
  formData.append('bucket_name', 'blog-images');
  formData.append('type', type);
  formData.append('format', format);
  formData.append('mime_type', mimeType);
  formData.append('size', file.size.toString());
  
  try {
    const record = await pb.collection('media').create(formData);
    return pb.files.getURL(record, record.file);
  } catch (error: any) {
    console.error('[uploadBlogImageToStorage] Error:', error.response?.data || error);
    throw new Error(`Błąd uploadu obrazu: ${error.message}`);
  }
}

export async function getBlogPostBySlug(slug: string, languageCode: string = 'pl') {
  const filter = `(website_id = "${TENANT_ID}" && slug = "${slug}" && language_code = "${languageCode}")`
  const data = await pb.collection('blog_posts').getFirstListItem(filter)
  const coverUrl = data.cover_image
    ? pb.files.getURL(data, data.cover_image, { thumb: '0x400' })
    : ''
  return {
    id: data.id,
    website_id: data.website_id,
    title: data.title,
    slug: data.slug,
    created: data.created,
    updated: data.updated,
    published_at: data.published_at,
    category_id: data.category_id,
    content: data.content,
    excerpt: data.excerpt,
    meta_title: data.meta_title,
    meta_description: data.meta_description,
    cover_image: coverUrl,
    status: data.status,
    language_code: data.language_code,
  }
}

export async function getBlogPosts(languageCode: string = 'pl', limit: number = 20) {
  const filter = `website_id = "${TENANT_ID}" && language_code = "${languageCode}" && status = "published"`
  const sort = '-published_at'
  
  try {
    const data = await pb.collection('blog_posts').getList(1, limit, {
      filter,
      sort,
    })
    
    return data.items.map((r) => {
      const coverUrl = r.cover_image
        ? pb.files.getURL(r, r.cover_image, { thumb: '800x600' })
        : ''
      return {
        id: r.id,
        website_id: r.website_id,
        title: r.title,
        slug: r.slug,
        published_at: r.published_at,
        excerpt: r.excerpt,
        cover_image_url: coverUrl,
        status: r.status,
        language_code: r.language_code,
      }
    })
  } catch (e) {
    console.error('Error fetching blog posts:', e)
    return []
  }
}