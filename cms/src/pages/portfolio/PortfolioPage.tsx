import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Plus, Search, Edit, Trash2, Eye, X,
  FolderOpen, ImageIcon,
  Star, Upload, Grid3X3, CheckCircle, XCircle
} from 'lucide-react'
import {
  useWebsiteId, useProjects, useProjectCategories, useProjectStats,
  useCreateProject, useUpdateProject, useDeleteProject
} from '@/features/projects/hooks'
import type { Project, ProjectStatus, ProjectFormData } from '@/features/projects/types'
import { pb } from '@/lib/pocketbase'
import { optimizeVideo } from '@/lib/videoUtils'

type TabType = 'overview' | 'projects' | 'categories'

interface SimpleCategory {
  id: string
  name: string
  color: string
}

function StatCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: any }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
      <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center">
        <Icon size={24} className="text-sky-600" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

function ProjectModal({ project, onSave, onClose, websiteId }: { project?: Project | null; onSave: (d: Partial<ProjectFormData>) => void; onClose: () => void; websiteId: string }) {
  const [categories, setCategories] = useState<SimpleCategory[]>([])
  const [showCatModal, setShowCatModal] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('#3B82F6')
  const [savingCat, setSavingCat] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [mediaType, setMediaType] = useState<'single' | 'before_after' | 'video'>(
    project?.video_url ? 'video' : (project?.image_before && project?.image_after ? 'before_after' : 'single')
  )
  const singleInputRef = useRef<HTMLInputElement>(null)
  const beforeInputRef = useRef<HTMLInputElement>(null)
  const afterInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [f, setF] = useState({
    title: project?.title || '',
    short_description: project?.short_description || '',
    description: project?.description || '',
    image_single: project?.image_url || project?.primary_image?.url || '',
    image_before: project?.image_before || '',
    image_after: project?.image_after || '',
    video_url: project?.video_url || '',
    category_id: project?.category_id || '',
    status: project?.status || 'draft' as ProjectStatus,
    is_featured: project?.is_featured ?? false,
  })

  useEffect(() => {
    const loadCats = async () => {
      if (!websiteId) return
      try {
        const records = await pb.collection('project_categories').getList(1, 100, { filter: `website_id = "${websiteId}"` })
        setCategories(records.items.map((r: any) => ({ id: r.id, name: r.name, color: r.color })))
      } catch (e) { console.error('Failed to load categories:', e) }
    }
    loadCats()
  }, [websiteId])

  const handleImageUpload = async (file: File) => {
    setUploadingImg(true)
    try {
      if (project?.id) {
        const formData = new FormData()
        formData.append('image', file)
        await pb.collection('projects').update(project.id, formData)
        const updated = await pb.collection('projects').getOne(project.id)
        setF(p => ({ ...p, image_url: pb.files.getURL(updated, updated.image) as string }))
      }
    } catch (e) { console.error(e) }
    setUploadingImg(false)
  }

  const uploadToMedia = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', file.name)
    formData.append('original_filename', file.name)
    formData.append('mime_type', file.type)
    formData.append('size', String(file.size))
    formData.append('website_id', websiteId)
    
    try {
      const record = await pb.collection('media').create(formData)
      if (record?.id && record?.file) {
        return `https://pb.fullwork.pl/api/files/${record.collectionId}/${record.id}/${record.file}`
      }
    } catch (e) { console.error('Media upload error:', e) }
    return ''
  }

  const optimizeImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxW = 1920
        let w = img.width, h = img.height
        if (w > maxW) { h = (h * maxW) / w; w = maxW }
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, w, h)
        canvas.toBlob(blob => {
          if (blob) resolve(new File([blob], file.name.replace(/\.\w+$/, '.webp'), { type: 'image/webp' }))
          else resolve(file)
        }, 'image/webp', 0.85)
      }
      img.onerror = () => resolve(file)
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileUpload = async (field: 'image_single' | 'image_before' | 'image_after' | 'video_url', file: File) => {
    setUploadingImg(true)
    try {
      let url = ''
      const isVideo = field === 'video_url' || file.type.startsWith('video/')
      if (isVideo) {
        const optimizedVideo = await optimizeVideo(file)
        const videoForm = new FormData()
        videoForm.append('file', optimizedVideo)
        videoForm.append('name', file.name)
        videoForm.append('original_filename', file.name)
        videoForm.append('mime_type', 'video/mp4')
        videoForm.append('size', String(optimizedVideo.size))
        videoForm.append('website_id', websiteId)
        const record = await pb.collection('media').create(videoForm)
        if (record?.id && record?.file) {
          url = `https://pb.fullwork.pl/api/files/${record.collectionId}/${record.id}/${record.file}`
        }
      } else {
        const optimized = await optimizeImage(file)
        url = await uploadToMedia(optimized)
      }
      if (url) setF(p => ({ ...p, [field]: url }))
    } catch (e) { console.error(e) }
    setUploadingImg(false)
  }

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return
    setSavingCat(true)
    try {
      await pb.collection('project_categories').create({
        website_id: websiteId,
        name: newCatName.trim(),
        color: newCatColor,
        slug: newCatName.toLowerCase().replace(/\s+/g, '-'),
      })
      const records = await pb.collection('project_categories').getList(1, 100, { filter: `website_id = "${websiteId}"` })
      setCategories(records.items.map((r: any) => ({ id: r.id, name: r.name, color: r.color })))
      setShowCatModal(false)
      setNewCatName('')
      setNewCatColor('#3B82F6')
    } catch (e) { console.error(e) }
    setSavingCat(false)
  }

  const save = async () => {
    if (!f.title.trim()) {
      alert('Tytuł jest wymagany')
      return
    }
    setUploadingImg(true)
    try {
      await onSave({
        title: f.title,
        short_description: f.short_description,
        description: f.description,
        category_id: f.category_id || undefined,
        is_featured: f.is_featured,
        image_single: mediaType === 'single' ? f.image_single : undefined,
        image_before: mediaType === 'before_after' ? f.image_before : undefined,
        image_after: mediaType === 'before_after' ? f.image_after : undefined,
        video_url: mediaType === 'video' ? f.video_url : undefined,
      })
    } finally {
      setUploadingImg(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div><h2 className="text-xl font-bold text-gray-900">{project ? 'Edytuj projekt' : 'Nowy projekt'}</h2><p className="text-sm text-gray-500 mt-1">Zarządzaj swoimi projektami portfolio</p></div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Multimedia</label>
            <div className="flex gap-2 mb-4">
              <button type="button" onClick={() => setMediaType('single')} className={`flex-1 py-2.5 px-3 rounded-lg border-2 transition-all font-medium text-sm ${mediaType === 'single' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 hover:border-gray-300'}`}>
                <ImageIcon className="w-4 h-4 inline mr-1" />1 Imagen
              </button>
              <button type="button" onClick={() => setMediaType('before_after')} className={`flex-1 py-2.5 px-3 rounded-lg border-2 transition-all font-medium text-sm ${mediaType === 'before_after' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 hover:border-gray-300'}`}>
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                Antes y Después
              </button>
              <button type="button" onClick={() => setMediaType('video')} className={`flex-1 py-2.5 px-3 rounded-lg border-2 transition-all font-medium text-sm ${mediaType === 'video' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 hover:border-gray-300'}`}>
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Video
              </button>
            </div>
            {mediaType === 'single' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    {f.image_single ? (
                      <img src={f.image_single} alt="" className="w-full aspect-video object-cover rounded-xl" />
                    ) : (
                      <div className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                        {uploadingImg ? <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" /> : <ImageIcon className="w-10 h-10" />}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center gap-2">
                    <input type="text" value={f.image_single} onChange={e => setF(p => ({ ...p, image_single: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm" placeholder="URL obrazu" />
                    <input type="file" ref={singleInputRef} accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload('image_single', f) }} />
                    <button type="button" onClick={() => singleInputRef.current?.click()} className="px-4 py-2 bg-sky-100 hover:bg-sky-200 text-sky-700 text-sm rounded-xl flex items-center gap-2">
                      <Upload className="w-4 h-4" />Wgraj
                    </button>
                  </div>
                </div>
              </div>
            )}
            {mediaType === 'before_after' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Przed</label>
                  {f.image_before ? <img src={f.image_before} alt="" className="w-full aspect-video object-cover rounded-xl" /> : <div className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">{uploadingImg ? <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" /> : <ImageIcon className="w-6 h-6" />}</div>}
                  <div className="flex gap-2">
                    <input type="text" value={f.image_before} onChange={e => setF(p => ({ ...p, image_before: e.target.value }))} className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs" placeholder="URL" />
                    <input type="file" ref={beforeInputRef} accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload('image_before', f) }} />
                    <button type="button" onClick={() => beforeInputRef.current?.click()} className="px-3 py-2 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-xl"><Upload className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Po</label>
                  {f.image_after ? <img src={f.image_after} alt="" className="w-full aspect-video object-cover rounded-xl" /> : <div className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">{uploadingImg ? <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" /> : <ImageIcon className="w-6 h-6" />}</div>}
                  <div className="flex gap-2">
                    <input type="text" value={f.image_after} onChange={e => setF(p => ({ ...p, image_after: e.target.value }))} className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs" placeholder="URL" />
                    <input type="file" ref={afterInputRef} accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload('image_after', f) }} />
                    <button type="button" onClick={() => afterInputRef.current?.click()} className="px-3 py-2 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-xl"><Upload className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            )}
            {mediaType === 'video' && (
              <div className="space-y-3">
                <div>
                  {f.video_url ? (
                    <div className="bg-black rounded-xl overflow-hidden">
                      <video src={f.video_url} autoPlay muted loop playsInline className="w-full aspect-video" />
                    </div>
                  ) : (
                    <div className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                      {uploadingImg ? <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" /> : <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={f.video_url} onChange={e => setF(p => ({ ...p, video_url: e.target.value }))} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm" placeholder="https://.../video.mp4" />
                  <input type="file" ref={videoInputRef} accept="video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload('video_url', f) }} />
                  <button type="button" onClick={() => videoInputRef.current?.click()} className="px-4 py-2 bg-sky-100 hover:bg-sky-200 text-sky-700 text-sm rounded-xl flex items-center gap-2">
                    <Upload className="w-4 h-4" />Wgraj
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-2">Tytuł *</label><input type="text" value={f.title} onChange={e => setF(p => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Nazwa projektu"/></div>
            <div className="col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-2">Krótki opis</label><textarea value={f.short_description || ''} onChange={e => setF(p => ({ ...p, short_description: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" rows={2} placeholder="Krótki opis wyświetlany w karcie projektu"/></div>
            <div className="col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-2">Opis</label><textarea value={f.description || ''} onChange={e => setF(p => ({ ...p, description: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" rows={4} placeholder="Pełny opis projektu"/></div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Kategoria</label>
                <button type="button" onClick={() => setShowCatModal(true)} className="text-xs text-sky-500 hover:text-sky-700 font-medium flex items-center gap-1"><Plus className="w-3 h-3"/>Nowa</button>
              </div>
              <select value={f.category_id || ''} onChange={e => setF(p => ({ ...p, category_id: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option value="">Wybierz kategorię</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl col-span-2">
              <input type="checkbox" checked={f.is_featured} onChange={e => setF(p => ({ ...p, is_featured: e.target.checked }))} className="w-5 h-5 rounded" />
              <div><p className="text-sm font-medium text-gray-700">Wyróżniony projekt</p><p className="text-xs text-gray-500">Projekt pojawi się na górze listy</p></div>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium text-sm rounded-xl hover:bg-gray-50">Anuluj</button>
            <button onClick={save} className="flex-1 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm rounded-xl">{project ? 'Zapisz' : 'Utwórz projekt'}</button>
          </div>
        </div>
      </div>

      {showCatModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Nowa kategoria</h3>
              <button onClick={() => setShowCatModal(false)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nazwa kategorii *</label>
              <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateCategory()} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="np. Realizacje"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Kolor</label>
              <div className="flex items-center gap-3">
                <input type="color" value={newCatColor} onChange={e => setNewCatColor(e.target.value)} className="w-12 h-10 rounded-lg cursor-pointer border border-gray-200"/>
                <div className="w-10 h-10 rounded-xl" style={{ backgroundColor: newCatColor }} />
                <span className="text-sm text-gray-500">{newCatColor}</span>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowCatModal(false)} className="px-4 py-2 border text-gray-600 text-sm rounded-xl hover:bg-gray-50">Anuluj</button>
              <button onClick={handleCreateCategory} disabled={!newCatName.trim() || savingCat} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm rounded-xl disabled:opacity-50 flex items-center gap-2">
                {savingCat ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Zapisywanie...</> : <><Plus className="w-4 h-4"/>Utwórz kategorię</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProjectDetailModal({ project, onClose, refetchAll }: { project: Project; onClose: () => void; refetchAll: () => void }) {
  const [subTab, setSubTab] = useState<'gallery' | 'info'>('gallery')
  const [newImageUrl, setNewImageUrl] = useState('')
  const [uploadingImg, setUploadingImg] = useState(false)
  const [images, setImages] = useState<Array<{ url: string; id: string }>>(
    project.images?.map((img: any) => ({ url: img.url, id: img.id })) || []
  )
  const [editingInfo, setEditingInfo] = useState(false)
  const [infoForm, setInfoForm] = useState({
    title: project.title,
    short_description: project.short_description || '',
    description: project.description || '',
  })

  const addImage = async () => {
    if (!newImageUrl.trim()) return
    setUploadingImg(true)
    try {
      const websiteId = localStorage.getItem('website_id') || ''
      const record = await pb.collection('project_images').create({
        project_id: project.id,
        website_id: websiteId,
        url: newImageUrl,
        is_primary: images.length === 0,
        is_featured: false,
        sort_order: images.length,
      })
      setImages([...images, { url: newImageUrl, id: record.id }])
      setNewImageUrl('')
    } catch (e) { console.error(e) }
    setUploadingImg(false)
  }

  const deleteImage = async (id: string) => {
    try {
      await pb.collection('project_images').delete(id)
      setImages(images.filter(img => img.id !== id))
    } catch (e) { console.error(e) }
  }

  const saveInfo = async () => {
    try {
      await pb.collection('projects').update(project.id, {
        title: infoForm.title,
        short_description: infoForm.short_description,
        description: infoForm.description,
      })
      setEditingInfo(false)
      refetchAll()
    } catch (e) { console.error(e) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div><h2 className="text-xl font-bold text-gray-900">{project.title}</h2><p className="text-sm text-gray-500">{images.length} zdjęć</p></div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5"/></button>
        </div>
        <div className="flex items-center gap-1 bg-gray-100/80 rounded-full p-1 mx-6 mt-4 w-fit">
          <button onClick={() => setSubTab('gallery')} className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${subTab === 'gallery' ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Galeria ({images.length})</button>
          <button onClick={() => setSubTab('info')} className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${subTab === 'info' ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Informacje</button>
        </div>
        <div className="p-6 space-y-4">
          {subTab === 'gallery' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input type="text" placeholder="URL obrazu" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addImage()} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500" />
                <button onClick={addImage} disabled={!newImageUrl.trim() || uploadingImg} className="px-4 py-2.5 bg-sky-500 text-white text-sm font-medium rounded-xl hover:bg-sky-600 disabled:opacity-50 flex items-center gap-2">
                  {uploadingImg ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Dodawanie...</> : <><Plus className="w-4 h-4"/>Dodaj</>}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, i) => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-video bg-gray-100">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => deleteImage(img.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><Trash2 className="w-4 h-4"/></button>
                    </div>
                    <span className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded">#{i + 1}</span>
                  </div>
                ))}
                {images.length === 0 && <div className="col-span-3 text-center py-12 text-gray-400"><ImageIcon className="w-12 h-12 mx-auto mb-3" /><p>Dodaj zdjęcia do galerii powyżej</p></div>}
              </div>
            </div>
          )}
          {subTab === 'info' && (
            <div className="space-y-4">
              {editingInfo ? (
                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  <div><label className="block text-sm font-semibold text-gray-700 mb-2">Tytuł</label><input type="text" value={infoForm.title} onChange={e => setInfoForm(p => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" /></div>
                  <div><label className="block text-sm font-semibold text-gray-700 mb-2">Krótki opis</label><textarea value={infoForm.short_description} onChange={e => setInfoForm(p => ({ ...p, short_description: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl resize-none" rows={2} /></div>
                  <div><label className="block text-sm font-semibold text-gray-700 mb-2">Opis</label><textarea value={infoForm.description} onChange={e => setInfoForm(p => ({ ...p, description: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl resize-none" rows={4} /></div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingInfo(false)} className="px-4 py-2 border text-gray-600 text-sm rounded-xl">Anuluj</button>
                    <button onClick={saveInfo} className="px-4 py-2 bg-sky-500 text-white text-sm rounded-xl">Zapisz zmiany</button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Tytuł</p>
                      <p className="text-sm font-medium text-gray-900">{project.title}</p>
                    </div>
                    <button onClick={() => setEditingInfo(true)} className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg"><Edit className="w-4 h-4"/></button>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Krótki opis</p>
                    <p className="text-sm text-gray-700">{project.short_description || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Opis</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{project.description || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</p>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${project.status === 'published' ? 'bg-emerald-100 text-emerald-700' : project.status === 'archived' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>
                      {project.status === 'published' ? <><CheckCircle className="w-3 h-3"/>Opublikowany</> : project.status === 'archived' ? <><XCircle className="w-3 h-3"/>Zarchiwizowany</> : <><Edit className="w-3 h-3"/>Robocza</>}
                    </span>
                  </div>
                  {project.is_featured && (
                    <div>
                      <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3"/>Wyróżniony projekt
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function PortfolioPage() {
  const [tab, setTab] = useState<TabType>('overview')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [detailProject, setDetailProject] = useState<Project | null>(null)

  const { data: websiteId } = useWebsiteId()
  const wid = websiteId || ''
  const { data: projects = [], isLoading, refetch } = useProjects(wid)
  const { data: categories = [] } = useProjectCategories(wid)
  const { data: stats } = useProjectStats(wid)
  const createProject = useCreateProject(wid)
  const updateProject = useUpdateProject(editingProject?.id || '')
  const deleteProject = useDeleteProject()

  const filteredProjects = projects.filter(p => {
    if (!search) return true
    const s = search.toLowerCase()
    return p.title?.toLowerCase().includes(s) || p.short_description?.toLowerCase().includes(s) || p.category?.name?.toLowerCase().includes(s)
  })

  const handleSave = async (data: Partial<ProjectFormData>) => {
    try {
      if (editingProject) {
        await updateProject.mutateAsync({ ...data })
      } else {
        await createProject.mutateAsync(data as ProjectFormData)
      }
      setShowModal(false)
      setEditingProject(null)
      refetch()
    } catch (e) { console.error(e) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten projekt?')) return
    try {
      await deleteProject.mutateAsync(id)
      refetch()
    } catch (e) { console.error(e) }
  }

  const refetchAll = useCallback(() => { refetch() }, [refetch])

  if (isLoading && tab !== 'overview') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio</h1>
          <p className="text-gray-600 max-w-xl">Zarządzaj swoimi projektami i realizacjami w eleganckim portfolio.</p>
        </div>
        <button onClick={() => { setEditingProject(null); setShowModal(true) }} className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm rounded-xl flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />Nowy projekt
        </button>
      </div>

      <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-full p-1 w-fit">
        <button onClick={() => setTab('overview')} className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${tab === 'overview' ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Przegląd</button>
        <button onClick={() => setTab('categories')} className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${tab === 'categories' ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Kategorie</button>
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard title="Wszystkie projekty" value={stats?.total_projects || 0} icon={FolderOpen} />
            <StatCard title="Wyróżnione" value={stats?.featured_projects || 0} icon={Star} />
            <StatCard title="Kategorie" value={categories.length} icon={Grid3X3} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {projects.slice(0, 6).map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden group hover:shadow-lg transition-all">
                <div className="aspect-square bg-gray-100 relative">
                  {p.video_url ? (
                    <video src={p.video_url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                  ) : p.image_url || p.primary_image?.url ? (
                    <img src={p.image_url || p.primary_image?.url} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon className="w-12 h-12" /></div>
                  )}
                  {p.is_featured && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />Wyróżniony
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button onClick={() => { setEditingProject(p); setShowModal(true) }} className="p-3 bg-white rounded-full text-gray-700 hover:text-sky-600 shadow-lg"><Edit className="w-5 h-5" /></button>
                    <button onClick={() => setDetailProject(p)} className="p-3 bg-white rounded-full text-gray-700 hover:text-sky-600 shadow-lg"><Eye className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-3 bg-white rounded-full text-gray-700 hover:text-red-600 shadow-lg"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="p-4">
                  {p.category && <p className="text-xs font-semibold text-sky-600 uppercase mb-1">{p.category.name}</p>}
                  <h3 className="font-bold text-gray-900 mb-1 truncate">{p.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{p.short_description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{categories.length} kategorii</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(c => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: (c.color || '#3B82F6') + '20' }}>
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: c.color || '#3B82F6' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{c.name}</h3>
                  <p className="text-sm text-gray-400">{projects.filter(p => p.category?.id === c.id).length} projektów</p>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="col-span-3 text-center py-12 text-gray-400">
                <Grid3X3 className="w-12 h-12 mx-auto mb-3" />
                <p>Brak kategorii. Utwórz pierwszą podczas dodawania projektu.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <ProjectModal
          project={editingProject}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingProject(null) }}
          websiteId={wid}
        />
      )}

      {detailProject && (
        <ProjectDetailModal
          project={detailProject}
          onClose={() => setDetailProject(null)}
          refetchAll={refetchAll}
        />
      )}
    </div>
  )
}