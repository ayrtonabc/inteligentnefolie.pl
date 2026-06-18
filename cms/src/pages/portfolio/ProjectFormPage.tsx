import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  ArrowLeft, 
  Save, 
  ImageIcon, 
  Plus,
  Trash2,
  Star,
  Globe,
  Github,
  Upload,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  useWebsiteId,
  useProject,
  useCreateProject,
  useUpdateProject,
  useProjectCategories,
  useCreateProjectImage,
  useDeleteProjectImage,
  useSetPrimaryImage
} from '@/features/projects/hooks'
import type { ProjectFormData, ProjectImageFormData } from '@/features/projects/types'

export function ProjectFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id

  const { data: websiteId } = useWebsiteId()
  const { data: project } = useProject(id || '')
  const { data: categories = [] } = useProjectCategories(websiteId || '')
  const createProject = useCreateProject(websiteId || '')
  const updateProject = useUpdateProject(id || '')
  const createImage = useCreateProjectImage(id || '')
  const deleteImage = useDeleteProjectImage()
  const setPrimary = useSetPrimaryImage()

  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    slug: '',
    short_description: '',
    description: '',
    content: '',
    category_id: '',
    client_name: '',
    completion_date: '',
    project_url: '',
    repository_url: '',
    status: 'draft',
    is_featured: false,
    layout: 'standard',
    image_single: '',
    image_before: '',
    image_after: '',
    video_url: '',
    media_type: 'before_after',
  })

  const [newImageUrl, setNewImageUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const beforeInputRef = useRef<HTMLInputElement>(null)
  const afterInputRef = useRef<HTMLInputElement>(null)
  const singleImageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'image_single' | 'image_before' | 'image_after' | 'video_url') => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, [field]: file })
    }
  }

  const getPreviewUrl = (value: string | File | undefined) => {
    if (!value) return ''
    if (value instanceof File) return URL.createObjectURL(value)
    return value
  }

  useEffect(() => {
    if (project) {
      let mediaType: 'single' | 'before_after' | 'video' = 'before_after'
      if (project.video_url && project.video_url.startsWith('http')) {
        mediaType = 'video'
      } else if (!project.image_before && !project.image_after && project.image_single) {
        mediaType = 'single'
      }

      setFormData({
        title: project.title || '',
        slug: project.slug || '',
        short_description: project.short_description || '',
        description: project.description || '',
        content: project.content || '',
        category_id: project.category_id || '',
        client_name: project.client_name || '',
        completion_date: project.completion_date || '',
        project_url: project.project_url || '',
        repository_url: project.repository_url || '',
        status: project.status || 'draft',
        is_featured: project.is_featured || false,
        layout: project.layout || 'standard',
        image_single: project.image_single || '',
        image_before: project.image_before || '',
        image_after: project.image_after || '',
        video_url: project.video_url || '',
        media_type: mediaType,
      })
    }
  }, [project])

  const saveProject = async (nextData: ProjectFormData) => {
    if (!websiteId) {
      alert('Nie udało się ustalić strony. Spróbuj ponownie za chwilę.')
      return
    }

    if (!nextData.title.trim()) {
      alert('Tytuł jest wymagany')
      return
    }

    // Auto-generate slug if missing
    if (!nextData.slug?.trim()) {
      nextData.slug = nextData.title.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
    }

    setIsSaving(true)
    try {
      if (isEditing) {
        await updateProject.mutateAsync(nextData)
        alert('Projekt został zaktualizowany')
      } else {
        const newProject = await createProject.mutateAsync(nextData)
        if (newProject?.id) {
          navigate(`/portfolio/${newProject.id}/edit`, { replace: true })
        } else {
          navigate('/portfolio')
        }
        return
      }
      navigate('/portfolio')
    } catch (error) {
      console.error('Error saving project:', error)
      alert('Błąd podczas zapisywania projektu: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault()
    await saveProject(formData)
  }

  const handlePublish = async () => {
    const nextData = { ...formData, status: 'published' as const }
    setFormData(nextData)
    await saveProject(nextData)
  }

  const handleAddImage = async () => {
    if (!newImageUrl.trim() || !id) return
    try {
      await createImage.mutateAsync({
        url: newImageUrl,
        alt_text: formData.title,
      })
      setNewImageUrl('')
    } catch (error) {
      alert('Błąd podczas dodawania zdjęcia')
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Usunąć to zdjęcie?')) return
    try {
      await deleteImage.mutateAsync(imageId)
    } catch (error) {
      alert('Błąd podczas usuwania zdjęcia')
    }
  }

  const handleSetPrimary = async (imageId: string) => {
    if (!id) return
    try {
      await setPrimary.mutateAsync({ projectId: id, imageId })
    } catch (error) {
      alert('Błąd podczas ustawiania zdjęcia głównego')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/portfolio')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Wróć
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edytuj projekt' : 'Nowy projekt'}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              type="button"
              onClick={handlePublish}
              disabled={isSaving || !websiteId}
            >
              {formData.status === 'published' ? 'Opublikuj ponownie' : 'Opublikuj'}
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isSaving || !websiteId}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Zapisywanie...' : 'Zapisz'}
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informacje podstawowe */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className={`w-5 h-5 ${formData.is_featured ? 'text-yellow-500' : 'text-gray-400'}`} />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Projekt wyróżniony</span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tytuł *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nazwa projektu"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategoria</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Brak kategorii</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Układ</label>
                  <select
                    value={formData.layout}
                    onChange={(e) => setFormData({ ...formData, layout: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="standard">Standard</option>
                    <option value="fullscreen">Pełny ekran</option>
                    <option value="minimal">Minimalny</option>
                    <option value="gallery">Galeria</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Krótki opis</label>
                <Input
                  value={formData.short_description || ''}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="Krótki opis do list"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opis</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Szczegółowy opis projektu"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Szczegóły projektu */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Szczegóły</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Klient</label>
                <Input
                  value={formData.client_name || ''}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  placeholder="Nazwa klienta"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data zakończenia</label>
                <Input
                  type="date"
                  value={formData.completion_date || ''}
                  onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  URL projektu
                </label>
                <Input
                  type="url"
                  value={formData.project_url || ''}
                  onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                  placeholder="https://przyklad.pl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Github className="w-4 h-4" />
                  Repozytorium
                </label>
                <Input
                  type="url"
                  value={formData.repository_url || ''}
                  onChange={(e) => setFormData({ ...formData, repository_url: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>
            </div>
          </div>

          {/* Zdjęcia */}
          {isEditing && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Zdjęcia
              </h2>

              {/* Dodaj zdjęcie */}
              <div className="flex gap-2 mb-4">
                <Input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="URL zdjęcia"
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddImage}>
                  <Plus className="w-4 h-4 mr-2" />
                  Dodaj
                </Button>
              </div>

              {/* Lista de imágenes */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {project?.images?.map((image) => (
                  <div 
                    key={image.id} 
                    className={`relative rounded-lg overflow-hidden border-2 ${
                      image.is_primary ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img 
                      src={image.url} 
                      alt={image.alt_text || ''}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                      <div className="flex gap-1">
                        {!image.is_primary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(image.id)}
                            className="p-1 bg-white rounded text-blue-600"
                            title="Ustaw jako główny"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(image.id)}
                          className="p-1 bg-white rounded text-red-600"
                          title="Usuń"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {image.is_primary && (
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                        Główne
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Multimedia selector */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Multimedia</h2>
            
            <div className="flex gap-2 mb-6">
              <button type="button" onClick={() => setFormData({ ...formData, media_type: 'single', video_url: '' })} className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${formData.media_type === 'single' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>
                <ImageIcon className="w-5 h-5" />
                <span className="font-medium">Imagen</span>
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, media_type: 'before_after', video_url: '' })} className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${formData.media_type === 'before_after' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                <span className="font-medium">Antes y Después</span>
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, media_type: 'video' })} className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${formData.media_type === 'video' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                <span className="font-medium">Video</span>
              </button>
            </div>

            {formData.media_type === 'single' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zdjęcie główne</label>
                <div className="flex gap-2 mb-2">
                  <Input value={formData.image_single instanceof File ? formData.image_single.name : (formData.image_single || '')} onChange={(e) => setFormData({ ...formData, image_single: e.target.value })} placeholder="URL lub wgraj plik" className="flex-1" />
                  <input type="file" ref={singleImageInputRef} onChange={(e) => handleFileChange(e, 'image_single')} className="hidden" accept="image/*" />
                  <Button type="button" variant="outline" size="sm" onClick={() => singleImageInputRef.current?.click()}><Upload className="w-4 h-4" /></Button>
                </div>
                {formData.image_single && <img src={getPreviewUrl(formData.image_single)} className="mt-2 w-full aspect-video object-cover rounded-lg border" alt="Glówne" />}
              </div>
            )}

            {formData.media_type === 'before_after' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zdjęcie „Przed"</label>
                  <div className="flex gap-2 mb-2">
                    <Input value={formData.image_before instanceof File ? formData.image_before.name : (formData.image_before || '')} onChange={(e) => setFormData({ ...formData, image_before: e.target.value })} placeholder="URL lub wgraj plik" className="flex-1" />
                    <input type="file" ref={beforeInputRef} onChange={(e) => handleFileChange(e, 'image_before')} className="hidden" accept="image/*" />
                    <Button type="button" variant="outline" size="sm" onClick={() => beforeInputRef.current?.click()}><Upload className="w-4 h-4" /></Button>
                  </div>
                  {formData.image_before && <img src={getPreviewUrl(formData.image_before)} className="mt-2 w-full aspect-video object-cover rounded-lg border" alt="Przed" />}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zdjęcie „Po"</label>
                  <div className="flex gap-2 mb-2">
                    <Input value={formData.image_after instanceof File ? formData.image_after.name : (formData.image_after || '')} onChange={(e) => setFormData({ ...formData, image_after: e.target.value })} placeholder="URL lub wgraj plik" className="flex-1" />
                    <input type="file" ref={afterInputRef} onChange={(e) => handleFileChange(e, 'image_after')} className="hidden" accept="image/*" />
                    <Button type="button" variant="outline" size="sm" onClick={() => afterInputRef.current?.click()}><Upload className="w-4 h-4" /></Button>
                  </div>
                  {formData.image_after && <img src={getPreviewUrl(formData.image_after)} className="mt-2 w-full aspect-video object-cover rounded-lg border" alt="Po" />}
                </div>
              </div>
            )}

            {formData.media_type === 'video' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL wideo (lub wgraj plik)</label>
                <div className="flex gap-2 mb-2">
                  <Input value={formData.video_url instanceof File ? formData.video_url.name : (formData.video_url || '')} onChange={(e) => setFormData({ ...formData, video_url: e.target.value })} placeholder="https://.../video.mp4" className="flex-1" />
                  <input type="file" ref={videoInputRef} onChange={(e) => handleFileChange(e, 'video_url')} className="hidden" accept="video/*" />
                  <Button type="button" variant="outline" size="sm" onClick={() => videoInputRef.current?.click()}><Upload className="w-4 h-4" /></Button>
                </div>
                {formData.video_url && <div className="mt-2 rounded-lg overflow-hidden border bg-black"><video src={getPreviewUrl(formData.video_url)} autoPlay muted loop playsInline className="w-full aspect-video object-contain" /></div>}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
