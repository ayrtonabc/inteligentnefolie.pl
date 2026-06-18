import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  LayoutGrid,
  List,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Image as ImageIcon,
  Video,
  FileText,
  Trash2,
  Folder,
  Search,
  MoreVertical,
  X,
  Upload,
  RefreshCw,
  Copy,
  Download,
  ExternalLink,
  Music,
  File,
  HardDrive,
  Loader2,
} from 'lucide-react'
import { useToast } from '@/components/Toast'
import { getAllFiles, getAllBuckets, deleteFile, getStorageStats, MediaFile, StorageBucket } from '@/features/media/api'
import { optimizeImage, formatBytes } from '../../../lib/imageOptimizer'

type FilterType = 'all' | 'images' | 'videos' | 'documents' | 'audio' | 'other'
type ViewMode = 'grid' | 'list'

function getAssetIcon(type: string, format: string) {
  const icons: Record<string, { icon: any; color: string; bgColor: string }> = {
    image: { icon: ImageIcon, color: 'text-blue-500', bgColor: 'bg-blue-100' },
    video: { icon: Video, color: 'text-purple-500', bgColor: 'bg-purple-100' },
    document: { icon: FileText, color: 'text-red-500', bgColor: 'bg-red-100' },
    audio: { icon: Music, color: 'text-green-500', bgColor: 'bg-green-100' },
    other: { icon: File, color: 'text-gray-500', bgColor: 'bg-gray-100' },
  }
  return icons[type] || icons.other
}

function formatAssetInfo(file: MediaFile): string {
  const parts = [file.sizeFormatted]
  if (file.metadata?.width && file.metadata?.height) {
    parts.push(`${file.metadata.width} × ${file.metadata.height}`)
  }
  return parts.join(' • ')
}

export default function Media() {
  const toast = useToast()
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedBucket, setSelectedBucket] = useState('website-assets')
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  
  const [files, setFiles] = useState<MediaFile[]>([])
  const [buckets, setBuckets] = useState<StorageBucket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ totalFiles: 0, totalSize: 0, sizeFormatted: '0 B' })
  
  const itemsPerPage = 24

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [filesData, statsData] = await Promise.all([
        getAllFiles(selectedBucket === 'all' ? undefined : selectedBucket),
        getStorageStats(),
      ])
      setFiles(filesData)
      setStats(statsData)
      
      const allBuckets = await getAllBuckets()
      setBuckets(allBuckets)
    } catch (err) {
      console.error('Error loading media:', err)
      toast.error('Błąd ładowania mediów')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedBucket])

  const filteredFiles = useMemo(() => {
    let filtered = files
    
    if (activeFilter !== 'all') {
      filtered = filtered.filter((f) => f.type === activeFilter)
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter((f) => f.name.toLowerCase().includes(q))
    }
    
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'size') return b.size - a.size
      return 0
    })
    
    return filtered
  }, [files, activeFilter, searchQuery, sortBy])

  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage)
  const paginatedFiles = filteredFiles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, filteredFiles.length)

  const filterCounts = useMemo(() => ({
    all: files.length,
    images: files.filter(f => f.type === 'image').length,
    videos: files.filter(f => f.type === 'video').length,
    documents: files.filter(f => f.type === 'document').length,
    audio: files.filter(f => f.type === 'audio').length,
    other: files.filter(f => f.type === 'other').length,
  }), [files])

  const filters = [
    { id: 'all', label: 'Wszystkie media', icon: LayoutGrid, count: filterCounts.all },
    { id: 'images', label: 'Zdjęcia', icon: ImageIcon, count: filterCounts.images },
    { id: 'videos', label: 'Wideo', icon: Video, count: filterCounts.videos },
    { id: 'documents', label: 'Dokumenty', icon: FileText, count: filterCounts.documents },
    { id: 'audio', label: 'Audio', icon: Music, count: filterCounts.audio },
  ]

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Czy na pewno chcesz usunąć "${file.name}"?`)) return
    
    const success = await deleteFile(file.bucket_name || 'media', file.id)
    if (success) {
      toast.success('Plik usunięty')
      loadData()
    } else {
      toast.error('Błąd usuwania pliku')
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL skopiowany do schowka')
  }

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedFiles)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedFiles(newSelected)
  }

  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = e.target.files
    if (!rawFiles || rawFiles.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    const MAX_IMAGE_SIZE = 15 * 1024 * 1024 // 15MB
    const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB
    const MAX_OTHER_SIZE = 50 * 1024 * 1024 // 50MB

    try {
      let totalOriginal = 0
      let totalNew = 0
      const processedFiles: File[] = []
      
      for (let i = 0; i < rawFiles.length; i++) {
        const rawFile = rawFiles[i]
        
        // 1. Validate size
        if (rawFile.type.startsWith('image/')) {
          if (rawFile.size > MAX_IMAGE_SIZE) {
            throw new Error(`Obraz ${rawFile.name} jest za duży. Maksymalny rozmiar to ${formatBytes(MAX_IMAGE_SIZE)}`);
          }
        } else if (rawFile.type.startsWith('video/')) {
          if (rawFile.size > MAX_VIDEO_SIZE) {
            throw new Error(`Wideo ${rawFile.name} przekracza limit 50MB. Dla większych plików użyj hostingu zewnętrznego (YouTube/Vimeo).`);
          }
        } else if (rawFile.size > MAX_OTHER_SIZE) {
          throw new Error(`Plik ${rawFile.name} jest za duży. Maksymalny rozmiar to ${formatBytes(MAX_OTHER_SIZE)}`);
        }

        totalOriginal += rawFile.size
        
        // 2. Optimize if it's an image
        if (rawFile.type.startsWith('image/') && rawFile.type !== 'image/svg+xml') {
          try {
            const result = await optimizeImage(rawFile)
            processedFiles.push(result.file)
            totalNew += result.newSize
          } catch (optErr) {
            console.warn('Image optimization failed, uploading original:', optErr)
            processedFiles.push(rawFile)
            totalNew += rawFile.size
          }
        } else {
          processedFiles.push(rawFile)
          totalNew += rawFile.size
        }
        
        setUploadProgress(Math.round(((i + 0.5) / rawFiles.length) * 100))
      }

      const { uploadFiles } = await import('@/features/media/api')
      const success = await uploadFiles(processedFiles, selectedBucket === 'all' ? 'media' : selectedBucket)

      if (success) {
        const savings = Math.round(((totalOriginal - totalNew) / totalOriginal) * 100)
        if (savings > 0) {
          toast.success(`✅ Przesłano ${rawFiles.length} plików. Zaoszczędzono ${formatBytes(totalOriginal - totalNew)} (${savings}%)!`)
        } else {
          toast.success(`✅ Przesłano ${rawFiles.length} plików`)
        }
      } else {
        toast.error('Błąd przesyłania plików')
      }
      
      setShowUpload(false)
      await loadData()
    } catch (err: any) {
      console.error('Upload error:', err)
      toast.error(err.message || 'Błąd przesyłania plików')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="h-[calc(100vh-64px)] flex bg-gray-50">
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4">
          <h2 className="text-lg font-bold text-gray-900">Biblioteka</h2>
          <p className="text-xs text-gray-500 mt-1">{stats.totalFiles} plików</p>
        </div>
        
        <div className="px-3 py-2 space-y-1">
          {filters.map((f) => {
            const Icon = f.icon
            const isActive = activeFilter === f.id
            return (
              <button 
                key={f.id} 
                onClick={() => { setActiveFilter(f.id as FilterType); setCurrentPage(1) }} 
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                  <span>{f.label}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                  {f.count}
                </span>
              </button>
            )
          })}
        </div>
        
        <div className="mt-6 px-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Buckets</p>
          <div className="space-y-1">
            <button 
              onClick={() => setSelectedBucket('all')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${selectedBucket === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <HardDrive size={18} className={selectedBucket === 'all' ? 'text-blue-600' : 'text-gray-400'} />
              <span className="flex-1 text-left">Wszystkie</span>
            </button>
            {buckets.map((bucket) => (
              <button 
                key={bucket.id}
                onClick={() => setSelectedBucket(bucket.name)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${selectedBucket === bucket.name ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <Folder size={18} className={selectedBucket === bucket.name ? 'text-blue-600' : 'text-amber-500'} />
                <span className="flex-1 text-left truncate">{bucket.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-auto p-4">
          <div className="bg-gray-100 rounded-2xl p-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">Wykorzystane miejsce</p>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '0%' }} />
            </div>
            <p className="text-xs text-gray-500 mt-2">{stats.sizeFormatted}</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button 
                  onClick={() => setViewMode('grid')} 
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('list')} 
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <List size={18} />
                </button>
              </div>
              
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                className="appearance-none bg-transparent text-sm font-medium text-gray-700 pr-8 pl-3 py-2 focus:outline-none cursor-pointer border border-gray-200 rounded-lg"
              >
                <option value="newest">Najnowsze</option>
                <option value="oldest">Najstarsze</option>
                <option value="name">Nazwa A-Z</option>
                <option value="size">Rozmiar</option>
              </select>
              
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Szukaj plików..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                  className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 w-64"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={loadData}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                title="Odśwież"
              >
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              </button>
              
              <p className="text-sm text-gray-500">
                {filteredFiles.length > 0 ? `${startItem}-${endItem} z ${filteredFiles.length}` : '0 plików'}
              </p>
              
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} 
                  disabled={currentPage === 1} 
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages || totalPages === 0} 
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {paginatedFiles.map((file) => {
                const { icon: Icon, color, bgColor } = getAssetIcon(file.type, file.format)
                const isSelected = selectedFiles.has(file.id)
                
                return (
                  <div 
                    key={file.id} 
                    className={`group cursor-pointer relative ${isSelected ? 'ring-2 ring-blue-500 rounded-3xl' : ''}`}
                    onClick={() => handleToggleSelect(file.id)}
                  >
                    {isSelected && (
                      <div className="absolute top-2 left-2 z-20 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    
                    <div className={`relative aspect-square rounded-3xl overflow-hidden border border-gray-100 ${bgColor} mb-3 group-hover:shadow-md transition-all`}>
                      <div className="absolute top-3 left-3 z-10">
                        <span className={`px-2 py-1 ${bgColor} ${color} text-[10px] font-bold uppercase tracking-wider rounded-lg`}>
                          {file.format}
                        </span>
                      </div>
                      
                      {file.type === 'image' ? (
                        <img src={file.publicUrl} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon size={48} className={color} />
                        </div>
                      )}
                      
                      {file.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px] border-transparent border-l-white ml-1" />
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                      
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all bg-black/50 flex items-center justify-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCopyUrl(file.publicUrl) }}
                          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-all"
                          title="Kopiuj URL"
                        >
                          <Copy size={16} className="text-gray-700" />
                        </button>
                        <a 
                          href={file.publicUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-all"
                          title="Otwórz"
                        >
                          <ExternalLink size={16} className="text-gray-700" />
                        </a>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(file) }}
                          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-all"
                          title="Usuń"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>{file.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatAssetInfo(file)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {paginatedFiles.map((file) => {
                const { icon: Icon, color } = getAssetIcon(file.type, file.format)
                const isSelected = selectedFiles.has(file.id)
                
                return (
                  <div 
                    key={file.id} 
                    className={`flex items-center gap-4 p-3 bg-white rounded-xl border transition-all cursor-pointer ${isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-100 hover:border-blue-200 hover:shadow-sm'}`}
                    onClick={() => handleToggleSelect(file.id)}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {file.type === 'image' ? (
                        <img src={file.publicUrl} alt={file.name} className="w-full h-full object-cover" />
                      ) : (
                        <Icon size={20} className={color} />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatAssetInfo(file)} • {file.bucket_name} • {new Date(file.created_at).toLocaleDateString('pl-PL')}
                      </p>
                    </div>
                    
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-lg ${color.replace('text-', 'bg-').replace('500', '100')} ${color}`}>
                      {file.format}
                    </span>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleCopyUrl(file.publicUrl) }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Kopiuj URL"
                      >
                        <Copy size={16} />
                      </button>
                      <a 
                        href={file.publicUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Otwórz"
                      >
                        <ExternalLink size={16} />
                      </a>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(file) }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg"
                        title="Usuń"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          
          {paginatedFiles.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Nie znaleziono plików</p>
              <p className="text-sm text-gray-400 mt-1">Prześlij pierwsze pliki lub zmień filtry</p>
            </div>
          )}
        </div>
      </div>
      
      <button 
        onClick={() => setShowUpload(true)} 
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all z-40"
      >
        <Plus size={24} />
      </button>
      
      {showUpload && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !uploading && setShowUpload(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Prześlij pliki</h2>
                <button onClick={() => !uploading && setShowUpload(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg" disabled={uploading}>
                  <X size={20} />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
                onChange={handleFilesUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  {uploading ? <Loader2 size={28} className="text-blue-600 animate-spin" /> : <Upload size={28} className="text-blue-600" />}
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {uploading ? 'Przesyłanie...' : 'Kliknij aby wybrać pliki'}
                </p>
                <p className="text-xs text-gray-500 mb-4">Zdjęcia do 15MB, Wideo do 100MB, Dokumenty do 50MB</p>
                {uploading && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
                {uploading && <p className="text-xs text-gray-600 font-medium">{uploadProgress}%</p>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
