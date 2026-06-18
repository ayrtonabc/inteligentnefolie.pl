import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  Plus, Search, Edit, Trash2, Eye, ChevronRight, X,
  BookOpen, Users, DollarSign, Star, TrendingUp, Play,
  BarChart3, Trophy, Upload, Video, ImageIcon, GripVertical,
  MessageSquare, CreditCard, Grid3X3, CheckCircle, XCircle,
  ChevronUp, ChevronDown, Link, ExternalLink, FileText
} from 'lucide-react'
import { useCourses, useCourse, useCourseStats } from '@/features/courses/hooks'
import { formatPrice, getLevelLabel, getLevelColor, getCategoryLabel, DEFAULT_THUMBNAIL } from '@/features/courses/types'
import {
  uploadCourseThumbnail, uploadLectureVideo, uploadMaterial,
  createCourse, updateCourse, deleteCourse, togglePublishCourse,
  createChapter, updateChapter, deleteChapter, reorderChapters,
  createLecture, updateLecture, deleteLecture,
  createUser, updateUser, deleteUser,
  createCategory, updateCategory, deleteCategory,
  approveReview, deleteReview,
  getQuizzes, createQuiz, updateQuiz, deleteQuiz,
  uploadMaterial as uploadMat, getMaterials, deleteMaterial,
} from '@/features/courses/api'
import type { Course, Chapter, Lecture, CourseUser, CourseCategory, CourseReview, Transaction, Quiz, Material } from '@/features/courses/types'
import { getUsers, getCategories, getReviews, getTransactions } from '@/features/courses/types'
import type { CourseCategory as CourseCategoryType } from '@/features/courses/types'

type TabType = 'overview' | 'courses' | 'users' | 'categories' | 'reviews' | 'transactions'

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

function ImagePreview({ src, onUpload, uploading }: { src: string; onUpload: (f: File) => void; uploading?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div className="relative">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = '' }} />
      <div onClick={() => inputRef.current?.click()} className="relative group cursor-pointer rounded-xl overflow-hidden border-2 border-gray-100 hover:border-sky-300 transition-colors">
        {src ? (
          <img src={src} alt="" className="w-full aspect-video object-cover" />
        ) : (
          <div className="w-full aspect-video bg-gray-100 flex flex-col items-center justify-center gap-2 text-gray-400">
            <ImageIcon className="w-10 h-10" />
            <span className="text-sm">Kliknij aby dodać obraz</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-white text-sm">Przesyłanie...</span>
            </div>
          ) : (
            <><Upload className="w-8 h-8 text-white" /><span className="text-white text-sm ml-2">Zmień obraz</span></>
          )}
        </div>
      </div>
      {src && (
        <button onClick={(e) => { e.stopPropagation(); onUpload(null as any) }} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

function CourseModal({ course, onSave, onClose }: { course?: Course | null; onSave: (d: Partial<Course>) => void; onClose: () => void }) {
  const [categories, setCategories] = useState<CourseCategoryType[]>([])
  const [showCatModal, setShowCatModal] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('#3B82F6')
  const [savingCat, setSavingCat] = useState(false)
  const durationStr = course?.estimated_duration ? String(course.estimated_duration) : ''
  const [f, setF] = useState({
    title: course?.title || '', description: course?.description || '',
    price: course?.price ? (course.price/100).toString() : '0',
    discount: course?.discount ? String(course.discount) : '0',
    thumbnail: course?.thumbnail || '', category: course?.category || '',
    level: course?.level || 'all', language: course?.language || 'Polski',
    estimated_duration: durationStr,
    requirements: course?.requirements?.join('\n') || '',
    what_you_will_learn: course?.what_you_will_learn?.join('\n') || '',
    tags: course?.tags?.join(', ') || '',
    is_published: course?.is_published ?? false,
  })
  const [uploadingImg, setUploadingImg] = useState(false)

  useEffect(() => { getCategories().then(setCategories).catch(() => {}) }, [])

  const handleThumbnailUpload = async (file: File) => {
    if (!course?.id) return
    setUploadingImg(true)
    try {
      const url = await uploadCourseThumbnail(file, course.id)
      setF(p => ({ ...p, thumbnail: url }))
    } catch (e) { console.error(e) }
    setUploadingImg(false)
  }

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return
    setSavingCat(true)
    try {
      const slug = newCatName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      await createCategory({ name: newCatName.trim(), slug, color: newCatColor, description: '', order_index: categories.length + 1, courses_count: 0 })
      const fresh = await getCategories()
      setCategories(fresh)
      setF(p => ({ ...p, category: slug }))
      setShowCatModal(false)
      setNewCatName('')
      setNewCatColor('#3B82F6')
    } catch (e) { console.error(e) }
    setSavingCat(false)
  }

  const save = () => onSave({
    title: f.title, description: f.description,
    price: Math.round(parseFloat(f.price||'0')*100),
    discount: parseInt(f.discount||'0'), thumbnail: f.thumbnail,
    category: f.category, level: f.level, language: f.language,
    estimated_duration: parseInt(f.estimated_duration||'0'),
    requirements: f.requirements.split('\n').filter(Boolean),
    what_you_will_learn: f.what_you_will_learn.split('\n').filter(Boolean),
    tags: f.tags.split(',').map(s=>s.trim()).filter(Boolean),
    is_published: f.is_published,
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div><h2 className="text-xl font-bold text-gray-900">{course?'Edytuj kurs':'Nowy kurs'}</h2><p className="text-sm text-gray-500 mt-1">Stwórz wartościowy kurs dla swoich uczniów</p></div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Miniaturka kursu *</label>
            <div className="flex gap-4">
              <div className="flex-1">
                <ImagePreview src={f.thumbnail} onUpload={handleThumbnailUpload} uploading={uploadingImg} />
              </div>
              <div className="flex flex-col justify-center gap-2">
                <p className="text-xs text-gray-500 mb-2">lub podaj URL obrazu:</p>
                <input type="text" value={f.thumbnail} onChange={e=>setF(p=>({...p,thumbnail:e.target.value}))} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm" placeholder="https://..." />
                <p className="text-[10px] text-gray-400">Zalecany format: 16:9, min. 1280x720px</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-2">Tytuł *</label><input type="text" value={f.title} onChange={e=>setF(p=>({...p,title:e.target.value}))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Nazwa kursu"/></div>
            <div className="col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-2">Opis</label><textarea value={f.description} onChange={e=>setF(p=>({...p,description:e.target.value}))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" rows={3} placeholder="Opisz czego nauczy się uczeń"/></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Cena (PLN)</label><input type="number" min="0" step="0.01" value={f.price} onChange={e=>setF(p=>({...p,price:e.target.value}))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"/></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Zniżka (%)</label><input type="number" min="0" max="100" value={f.discount} onChange={e=>setF(p=>({...p,discount:e.target.value}))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"/></div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Kategoria</label>
                <button type="button" onClick={() => setShowCatModal(true)} className="text-xs text-sky-500 hover:text-sky-700 font-medium flex items-center gap-1"><Plus className="w-3 h-3"/>Nowa</button>
              </div>
              <select value={f.category} onChange={e=>setF(p=>({...p,category:e.target.value}))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option value="">Wybierz kategorię</option>
                {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Poziom</label><select value={f.level} onChange={e=>setF(p=>({...p,level:e.target.value}))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"><option value="beginner">Początkujący</option><option value="intermediate">Średniozaawansowany</option><option value="advanced">Zaawansowany</option><option value="all">Wszystkie poziomy</option></select></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Język</label><select value={f.language} onChange={e=>setF(p=>({...p,language:e.target.value}))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"><option value="Polski">Polski</option><option value="English">English</option></select></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Czas (min)</label><input type="number" min="0" value={f.estimated_duration} onChange={e=>setF(p=>({...p,estimated_duration:e.target.value}))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"/></div>
            <div className="col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-2">Tagi (po przecinku)</label><input type="text" value={f.tags} onChange={e=>setF(p=>({...p,tags:e.target.value}))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="React, JavaScript, Frontend"/></div>
            <div className="col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-2">Czego się nauczą (jedna na linię)</label><textarea value={f.what_you_will_learn} onChange={e=>setF(p=>({...p,what_you_will_learn:e.target.value}))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" rows={3}/></div>
            <div className="col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-2">Wymagania (jedna na linię)</label><textarea value={f.requirements} onChange={e=>setF(p=>({...p,requirements:e.target.value}))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" rows={2}/></div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl col-span-2">
              <input type="checkbox" checked={f.is_published} onChange={e=>setF(p=>({...p,is_published:e.target.checked}))} className="w-5 h-5 rounded"/>
              <div><p className="text-sm font-medium text-gray-700">Opublikowany</p><p className="text-xs text-gray-500">Kurs widoczny dla uczniów</p></div>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium text-sm rounded-xl hover:bg-gray-50">Anuluj</button>
            <button onClick={save} className="flex-1 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm rounded-xl">{course?'Zapisz':'Utwórz kurs'}</button>
          </div>
        </div>
      </div>

      {showCatModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Nowa kategoria</h3>
              <button onClick={()=>setShowCatModal(false)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nazwa kategorii *</label>
              <input type="text" value={newCatName} onChange={e=>setNewCatName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleCreateCategory()} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="np. Sztuczna Inteligencja"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Kolor</label>
              <div className="flex items-center gap-3">
                <input type="color" value={newCatColor} onChange={e=>setNewCatColor(e.target.value)} className="w-12 h-10 rounded-lg cursor-pointer border border-gray-200"/>
                <div className="w-10 h-10 rounded-xl" style={{backgroundColor: newCatColor}}/>
                <span className="text-sm text-gray-500">{newCatColor}</span>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={()=>setShowCatModal(false)} className="px-4 py-2 border text-gray-600 text-sm rounded-xl hover:bg-gray-50">Anuluj</button>
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

function CourseDetailModal({ course, onClose, refetchAll }: { course: Course; onClose: () => void; refetchAll: () => void }) {
  const { chapters, lectures, loading, refetch } = useCourse(course.id)
  const [subTab, setSubTab] = useState<'chapters'|'lectures'|'quizzes'|'materials'>('chapters')
  const [newChTitle, setNewChTitle] = useState('')
  const [newLe, setNewLe] = useState({ chapterId:'', title:'', videoUrl:'', duration:'10:00', isPreview:false })
  const [editingLe, setEditingLe] = useState<Lecture|null>(null)
  const [editingCh, setEditingCh] = useState<Chapter|null>(null)
  const [uploadingVideo, setUploadingVideo] = useState<string|null>(null)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [selectedLectureId, setSelectedLectureId] = useState<string|null>(null)
  const [selectedLectureForQuiz, setSelectedLectureForQuiz] = useState<string>('')
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<Quiz|null>(null)
  const [quizForm, setQuizForm] = useState({ question: '', options: ['','','',''], correct_answer: 0, explanation: '' })
  const [showMatModal, setShowMatModal] = useState(false)
  const [matTitle, setMatTitle] = useState('')
  const [matDesc, setMatDesc] = useState('')
  const [matFile, setMatFile] = useState<File|null>(null)
  const [savingMat, setSavingMat] = useState(false)

  const addChapter = async () => {
    if(!newChTitle.trim()) return
    await createChapter({ course_id: course.id, chapter_title: newChTitle.trim(), order_index: chapters.length + 1 })
    setNewChTitle('')
    refetch()
    refetchAll()
  }

  const addLecture = async (file?: File) => {
    if(!newLe.chapterId || !newLe.title.trim()) return
    const chLe = lectures.filter(l => l.chapter_id === newLe.chapterId)
    if (file) {
      setUploadingVideo('new')
      try {
        const newLectureId = await createLecture({ course_id: course.id, chapter_id: newLe.chapterId, title: newLe.title, video_url: newLe.videoUrl, video_file: '', thumbnail: '', duration: newLe.duration, order_index: chLe.length + 1, is_preview: newLe.isPreview })
        if (newLectureId) {
          const videoFile = await uploadLectureVideo(file, newLectureId)
          await updateLecture(newLectureId, { video_file: videoFile })
        }
      } catch (e) { console.error(e) }
      setUploadingVideo(null)
    } else {
      await createLecture({ course_id: course.id, chapter_id: newLe.chapterId, title: newLe.title, video_url: newLe.videoUrl, video_file: '', thumbnail: '', duration: newLe.duration, order_index: chLe.length + 1, is_preview: newLe.isPreview })
    }
    setNewLe({ chapterId:'', title:'', videoUrl:'', duration:'10:00', isPreview:false })
    refetch()
    refetchAll()
  }

  const handleVideoUpload = async (file: File, lecture: Lecture) => {
    setUploadingVideo(lecture.id)
    try {
      const url = await uploadLectureVideo(file, lecture.id)
      await updateLecture(lecture.id, { video_file: url })
      refetch()
    } catch (e) { console.error(e) }
    setUploadingVideo(null)
  }

  const moveChapter = async (id: string, dir: 'up' | 'down') => {
    const idx = chapters.findIndex(ch => ch.id === id)
    if (idx < 0) return
    if (dir === 'up' && idx === 0) return
    if (dir === 'down' && idx === chapters.length - 1) return
    const newOrder = [...chapters]
    if (dir === 'up') [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]]
    else [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]]
    await reorderChapters(newOrder)
    refetch()
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-12 text-center">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Ładowanie...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div><h2 className="text-xl font-bold text-gray-900">{course.title}</h2><p className="text-sm text-gray-500">{chapters.length} rozdziałów · {lectures.length} lekcji</p></div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5"/></button>
        </div>
        <div className="flex items-center gap-1 bg-gray-100/80 rounded-full p-1 mx-6 mt-4 w-fit">
          <button onClick={() => setSubTab('chapters')} className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${subTab === 'chapters' ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Rozdziały ({chapters.length})</button>
          <button onClick={() => setSubTab('lectures')} className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${subTab === 'lectures' ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Lekcje ({lectures.length})</button>
          <button onClick={() => { setSubTab('quizzes'); setQuizzes([]); setSelectedLectureForQuiz(''); setQuizForm({ question: '', options: ['','','',''], correct_answer: 0, explanation: '' }); }} className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${subTab === 'quizzes' ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Cuestionarios</button>
          <button onClick={() => { setSubTab('materials'); setMaterials([]); }} className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${subTab === 'materials' ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Materialy</button>
        </div>
        <div className="p-6 space-y-4">
          {subTab === 'chapters' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input type="text" placeholder="Nazwa nowego rozdziału" value={newChTitle} onChange={e => setNewChTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addChapter()} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500" />
                <button onClick={addChapter} className="px-4 py-2.5 bg-sky-500 text-white text-sm font-medium rounded-xl hover:bg-sky-600 flex items-center gap-2"><Plus className="w-4 h-4"/>Dodaj</button>
              </div>
              {chapters.map((ch, i) => {
                const chLectures = lectures.filter(l => l.chapter_id === ch.id)
                return (
                  <div key={ch.id} className="bg-gray-50 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-0.5">
                          <button onClick={() => moveChapter(ch.id, 'up')} className="p-0.5 text-gray-400 hover:text-gray-600"><ChevronUp className="w-3 h-3"/></button>
                          <button onClick={() => moveChapter(ch.id, 'down')} className="p-0.5 text-gray-400 hover:text-gray-600"><ChevronDown className="w-3 h-3"/></button>
                        </div>
                        <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                        <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                        <span className="font-medium text-gray-900">{ch.chapter_title}</span>
                        <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">{chLectures.length} lekcji</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingCh(ch)} className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg"><Edit className="w-4 h-4"/></button>
                        <button onClick={async () => { await deleteChapter(ch.id); refetch(); refetchAll() }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </div>
                    {editingCh?.id === ch.id && (
                      <div className="p-4 bg-sky-50 border-t border-sky-100">
                        <div className="flex gap-2">
                          <input type="text" value={editingCh.chapter_title} onChange={e => setEditingCh(p => p ? ({ ...p, chapter_title: e.target.value }) : null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl" />
                          <button onClick={async () => { await updateChapter(editingCh.id, { chapter_title: editingCh.chapter_title }); setEditingCh(null); refetch() }} className="px-4 py-2 bg-sky-500 text-white text-sm rounded-xl">Zapisz</button>
                          <button onClick={() => setEditingCh(null)} className="px-4 py-2 border text-gray-600 text-sm rounded-xl">Anuluj</button>
                        </div>
                      </div>
                    )}
                    {chLectures.length > 0 && (
                      <div className="p-3 bg-white/50">
                        <div className="flex flex-col gap-1">
                          {chLectures.map((l, li) => (
                            <div key={l.id} className="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-white/80">
                              <Video className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-gray-400">#{li + 1}</span>
                              <span className="text-sm text-gray-700 flex-1 truncate">{l.title}</span>
                              {l.video_file && <span className="text-[10px] text-emerald-600 font-medium">Plik wgrany</span>}
                              {!l.video_file && l.video_url && <span title="Link zewnętrzny"><ExternalLink className="w-3 h-3 text-sky-400 flex-shrink-0" /></span>}
                              {l.is_preview && <span className="text-[10px] bg-sky-100 text-sky-600 px-1.5 py-0.5 rounded">Preview</span>}
                              <span className="text-xs text-gray-400">{l.duration}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              {chapters.length === 0 && <div className="text-center py-12 text-gray-400"><BookOpen className="w-12 h-12 mx-auto mb-3" /><p>Dodaj pierwszy rozdział powyżej</p></div>}
            </div>
          )}
          {subTab === 'lectures' && (
            <div className="space-y-4">
              <div className="bg-sky-50 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 text-sm">Dodaj nową lekcję</h3>
                <div className="grid grid-cols-2 gap-3">
                  <select value={newLe.chapterId} onChange={e => setNewLe(p => ({ ...p, chapterId: e.target.value }))} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm"><option value="">Wybierz rozdział</option>{chapters.map(ch => <option key={ch.id} value={ch.id}>{ch.chapter_title}</option>)}</select>
                  <input type="text" value={newLe.title} onChange={e => setNewLe(p => ({ ...p, title: e.target.value }))} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm" placeholder="Tytuł lekcji" />
                  <input type="text" value={newLe.videoUrl} onChange={e => setNewLe(p => ({ ...p, videoUrl: e.target.value }))} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm" placeholder="URL filmu (YouTube, Vimeo...)" />
                  <input type="text" value={newLe.duration} onChange={e => setNewLe(p => ({ ...p, duration: e.target.value }))} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm" placeholder="Czas (mm:ss)" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={newLe.isPreview} onChange={e => setNewLe(p => ({ ...p, isPreview: e.target.checked }))} className="w-4 h-4 rounded" />Dostępny jako preview</label>
                  <div className="flex gap-2">
                    <input type="file" accept="video/*" id="lecture-video-upload" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) addLecture(f); e.target.value = '' }} />
                    <label htmlFor="lecture-video-upload" className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-lg cursor-pointer flex items-center gap-1"><Upload className="w-4 h-4" />Wgraj video</label>
                    <button onClick={() => addLecture()} disabled={!newLe.chapterId || !newLe.title.trim()} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm rounded-xl disabled:opacity-50 flex items-center gap-2"><Plus className="w-4 h-4" />Dodaj z URL</button>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {chapters.map(ch => {
                  const chLectures = lectures.filter(l => l.chapter_id === ch.id)
                  if (chLectures.length === 0) return null
                  return (
                    <div key={ch.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2"><GripVertical className="w-4 h-4 text-gray-300 cursor-grab" /><span className="font-medium text-gray-900 text-sm">{ch.chapter_title}</span></div>
                        <span className="text-xs text-gray-400">{chLectures.length} lekcji</span>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {chLectures.map((l, li) => (
                          <div key={l.id} className="p-4 flex items-start gap-3">
                            <div className="w-20 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {l.video_file || l.video_url ? <Video className="w-5 h-5 text-gray-400" /> : <Video className="w-5 h-5 text-gray-300" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-gray-400 font-medium">#{li + 1}</span>
                                <span className="text-sm font-medium text-gray-900">{l.title}</span>
                                {l.is_preview && <span className="text-[10px] bg-sky-100 text-sky-600 px-1.5 py-0.5 rounded-full">Preview</span>}
                                {l.video_file && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full">Plik wgrany</span>}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-400">
                                {l.video_url && !l.video_file && <span className="flex items-center gap-1"><Link className="w-3 h-3"/>{l.video_url.length > 35 ? l.video_url.substring(0,35) + '...' : l.video_url}</span>}
                                <span>{l.duration}</span>
                              </div>
                              {l.video_file && (
                                <div className="mt-2">
                                  <input type="file" accept="video/*" id={`video-${l.id}`} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleVideoUpload(f, l); e.target.value = '' }} />
                                  <label htmlFor={`video-${l.id}`} className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 cursor-pointer">
                                    {uploadingVideo === l.id ? <><div className="w-3 h-3 border border-sky-400 border-t-transparent rounded-full animate-spin"/>Przesyłanie...</> : <><Upload className="w-3 h-3"/>Zmień plik wideo</>}
                                  </label>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button onClick={() => setEditingLe(l)} className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg"><Edit className="w-3.5 h-3.5"/></button>
                              <button onClick={async () => { await deleteLecture(l.id); refetch(); refetchAll() }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5"/></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
              {editingLe && (
                <div className="bg-white rounded-xl border-2 border-sky-200 p-5 space-y-4">
                  <h3 className="font-semibold text-gray-900">Edytuj lekcję</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Tytuł</label><input type="text" value={editingLe.title} onChange={e => setEditingLe(p => p ? { ...p, title: e.target.value } : null)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" /></div>
                    <div><label className="block text-xs text-gray-500 mb-1">URL filmu</label><input type="text" value={editingLe.video_url} onChange={e => setEditingLe(p => p ? { ...p, video_url: e.target.value } : null)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" /></div>
                    <div><label className="block text-xs text-gray-500 mb-1">Czas (mm:ss)</label><input type="text" value={editingLe.duration} onChange={e => setEditingLe(p => p ? { ...p, duration: e.target.value } : null)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" /></div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl col-span-2"><input type="checkbox" checked={editingLe.is_preview} onChange={e => setEditingLe(p => p ? { ...p, is_preview: e.target.checked } : null)} className="w-4 h-4 rounded" /><span className="text-sm text-gray-700">Lekcja dostępna jako preview (darmowy podgląd)</span></div>
                    {editingLe.video_file && (
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Plik wideo</label>
                        <input type="file" accept="video/*" id={`edit-video-${editingLe.id}`} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleVideoUpload(f, editingLe); e.target.value = '' }} />
                        <label htmlFor={`edit-video-${editingLe.id}`} className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg cursor-pointer"><Upload className="w-4 h-4" />Zmień plik wideo</label>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingLe(null)} className="px-4 py-2 border text-gray-600 text-sm rounded-xl">Anuluj</button>
                    <button onClick={async () => { await updateLecture(editingLe.id, editingLe); setEditingLe(null); refetch(); refetchAll() }} className="px-4 py-2 bg-sky-500 text-white text-sm rounded-xl">Zapisz zmiany</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {subTab === 'quizzes' && (
            <div className="space-y-4">
              <div className="bg-sky-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <select value={selectedLectureForQuiz} onChange={e => { setSelectedLectureForQuiz(e.target.value); getQuizzes(e.target.value).then(setQuizzes) }} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm">
                    <option value="">Wybierz lekcję dla cuestionario</option>
                    {lectures.map(l => <option key={l.id} value={l.id}>Lekcja: {l.title}</option>)}
                  </select>
                  <button onClick={() => { setShowQuizModal(true); setEditingQuiz(null); setQuizForm({ question: '', options: ['','','',''], correct_answer: 0, explanation: '' }) }} disabled={!selectedLectureForQuiz} className="px-4 py-2.5 bg-sky-500 text-white text-sm rounded-xl disabled:opacity-50 flex items-center gap-2"><Plus className="w-4 h-4"/>Dodaj pytanie</button>
                </div>
              </div>

              {selectedLectureForQuiz && <div className="space-y-3">
                {quizzes.length === 0 && <div className="text-center py-8 text-gray-400"><MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40"/><p className="text-sm">Brak cuestionarios dla tej lekcji</p></div>}
                {quizzes.map(q => (
                  <div key={q.id} className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{q.question}</p>
                        <div className="mt-2 space-y-1">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ${oi === q.correct_answer ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-600'}`}>
                              <span className="font-bold">{String.fromCharCode(65 + oi)}.</span>
                              <span>{opt}</span>
                              {oi === q.correct_answer && <span className="ml-auto text-green-600 font-medium">✓ Poprawna</span>}
                            </div>
                          ))}
                        </div>
                        {q.explanation && <p className="text-xs text-gray-500 mt-2 italic">💡 {q.explanation}</p>}
                      </div>
                      <div className="flex gap-1 ml-3">
                        <button onClick={() => { setEditingQuiz(q); setQuizForm({ question: q.question, options: q.options, correct_answer: q.correct_answer, explanation: q.explanation }); setShowQuizModal(true) }} className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg"><Edit className="w-4 h-4"/></button>
                        <button onClick={async () => { await deleteQuiz(q.id); getQuizzes(selectedLectureForQuiz).then(setQuizzes) }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>}

              {showQuizModal && (
                <div className="bg-white rounded-xl border-2 border-sky-200 p-5 space-y-4">
                  <h3 className="font-semibold text-gray-900">{editingQuiz ? 'Edytuj pytanie' : 'Nowe pytanie'}</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pytanie *</label>
                    <textarea value={quizForm.question} onChange={(e) => { setQuizForm(p => ({ ...p, question: e.target.value })); }} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" rows={2} placeholder="Treść pytania..."/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Opcje odpowiedzi (zaznacz poprawną)</label>
                    {quizForm.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2 mb-2">
                        <input type="radio" checked={quizForm.correct_answer === oi} onChange={() => { setQuizForm(p => ({ ...p, correct_answer: oi })); }} className="w-4 h-4"/>
                        <input type="text" value={opt} onChange={e => { const n = [...quizForm.options]; n[oi] = e.target.value; setQuizForm(p => ({ ...p, options: n })) }} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder={`Opcja ${String.fromCharCode(65 + oi)}`}/>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Wyjaśnienie (opcjonalne)</label>
                    <textarea value={quizForm.explanation} onChange={(e) => { setQuizForm(p => ({ ...p, explanation: e.target.value })); }} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" rows={2} placeholder="Wyjaśnienie odpowiedzi..."/>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => setShowQuizModal(false)} className="px-4 py-2 border text-gray-600 text-sm rounded-xl">Anuluj</button>
                    <button onClick={async () => {
                      if (!selectedLectureForQuiz || !quizForm.question.trim()) return
                      if (editingQuiz) { await updateQuiz(editingQuiz.id, { question: quizForm.question, options: quizForm.options, correct_answer: quizForm.correct_answer, explanation: quizForm.explanation })
                      } else { await createQuiz({ lecture_id: selectedLectureForQuiz, question: quizForm.question, options: quizForm.options, correct_answer: quizForm.correct_answer, explanation: quizForm.explanation, order_index: quizzes.length })
                      }
                      setShowQuizModal(false)
                      getQuizzes(selectedLectureForQuiz).then(setQuizzes)
                    }} className="px-4 py-2 bg-sky-500 text-white text-sm rounded-xl">{editingQuiz ? 'Zapisz' : 'Dodaj pytanie'}</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {subTab === 'materials' && (
            <div className="space-y-4">
              <div className="bg-amber-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <select value={selectedLectureId || ''} onChange={async e => { const val = e.target.value; setSelectedLectureId(val || null); if (val) { const data = await getMaterials(val); setMaterials(data); } else { setMaterials([]); } }} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm">
                    <option value="">Wybierz lekcję</option>
                    {lectures.map(l => <option key={l.id} value={l.id}>Lekcja: {l.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                {materials.length === 0 && <div className="text-center py-8 text-gray-400"><FileText className="w-10 h-10 mx-auto mb-2 opacity-40"/><p className="text-sm">Wybierz lekcję powyżej aby zobaczyć materiały</p></div>}
                {materials.map(m => (
                  <div key={m.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-amber-600"/></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{m.title}</p>
                      <p className="text-xs text-gray-400">{m.file_name} · {(m.file_size / 1024).toFixed(1)} KB</p>
                    </div>
                    {m.file && <a href={m.file} target="_blank" className="px-3 py-1.5 bg-sky-50 text-sky-600 text-xs rounded-lg flex items-center gap-1"><ExternalLink className="w-3 h-3"/>Otwórz</a>}
                    <button onClick={async () => { await deleteMaterial(m.id); getMaterials('').then(setMaterials) }} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input type="text" value={matTitle} onChange={e => setMatTitle(e.target.value)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm" placeholder="Nazwa materiału (np. Slajdy PDF, Ćwiczenia)" />
                </div>
                <div className="flex items-center gap-3">
                  <input type="file" accept=".pdf,.doc,.docx,.pptx,.xlsx,.zip,.rar" onChange={e => setMatFile(e.target.files?.[0] || null)} className="hidden" id="mat-file-upload"/>
                  <label htmlFor="mat-file-upload" className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg cursor-pointer">
                    <Upload className="w-4 h-4"/>{matFile ? matFile.name : 'Wybierz plik'}
                  </label>
                  <span className="text-xs text-gray-400">{matFile ? `${(matFile.size / 1024).toFixed(1)} KB` : 'PDF, DOCX, ZIP...'}</span>
                </div>
                <textarea value={matDesc} onChange={e => setMatDesc(e.target.value)} className="w-full mt-2 px-4 py-2 border border-gray-200 rounded-xl text-xs" rows={2} placeholder="Opis (opcjonalnie"/>
                <div className="flex gap-2 mt-3">
                  <button onClick={async () => {
                    const sel = lectures[0]?.id
                    if (!matFile || !sel) return
                    setSavingMat(true)
                    await uploadMat(matFile, sel, matTitle, matDesc)
                    setMatFile(null)
                    setMatTitle('')
                    setMatDesc('')
                    getMaterials(sel).then(setMaterials)
                    setSavingMat(false)
                  }} disabled={!matFile} className="px-4 py-2 bg-sky-500 text-white text-sm rounded-xl disabled:opacity-50 flex items-center gap-2">
                    <Upload className="w-4 h-4"/>{savingMat ? 'Przesyłanie...' : 'Prześlij materiał'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function UsersTab() {
  const [users, setUsers] = useState<CourseUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState<CourseUser | null>(null)
  const [search, setSearch] = useState('')
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'student' as const })

  const load = useCallback(async () => { setLoading(true); try { setUsers(await getUsers()) } catch {} finally { setLoading(false) } }, [])
  useEffect(() => { load() }, [load])

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/><input type="text" placeholder="Szukaj użytkowników..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"/></div>
        <button onClick={() => { setEditUser(null); setNewUser({ name: '', email: '', role: 'student' }); setShowModal(true) }} className="px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-xl hover:bg-sky-600 flex items-center gap-2"><Plus className="w-4 h-4"/>Dodaj użytkownika</button>
      </div>
      <div className="divide-y divide-gray-50">
        {loading ? <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-3"/><p className="text-sm text-gray-500">Ładowanie...</p></div>
        : filtered.length === 0 ? <div className="p-12 text-center"><Users className="w-12 h-12 text-gray-300 mx-auto mb-4"/><p className="text-gray-500">Brak użytkowników</p></div>
        : filtered.map(u => (
          <div key={u.id} className="flex items-center gap-4 p-4 hover:bg-gray-50/50">
            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-sm flex-shrink-0">{u.avatar ? <img src={u.avatar} className="w-full h-full rounded-full object-cover" /> : u.name.charAt(0).toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-50 text-purple-600' : u.role === 'instructor' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>{u.role}</span>
                {u.is_blocked && <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full">Zablokowany</span>}
              </div>
              <p className="text-xs text-gray-500">{u.email}</p>
            </div>
            <div className="text-right"><p className="text-sm font-medium text-gray-900">{u.enrolled_courses} kursów</p><p className="text-[10px] text-gray-400">Zapisany {new Date(u.created).toLocaleDateString('pl')}</p></div>
            <div className="flex items-center gap-1">
              <button onClick={() => { setEditUser(u); setShowModal(true) }} className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg"><Edit className="w-4 h-4"/></button>
              <button onClick={async () => { await updateUser(u.id, { is_blocked: !u.is_blocked }); load() }} className={`p-2 rounded-lg ${u.is_blocked ? 'text-emerald-500 hover:bg-emerald-50' : 'text-red-500 hover:bg-red-50'}`}>{u.is_blocked ? <CheckCircle className="w-4 h-4"/> : <XCircle className="w-4 h-4"/>}</button>
              <button onClick={async () => { await deleteUser(u.id); load() }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">{editUser ? 'Edytuj użytkownika' : 'Nowy użytkownik'}</h2>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Imię i nazwisko</label><input type="text" value={editUser ? editUser.name : newUser.name} onChange={e => editUser ? setEditUser(p => p ? { ...p, name: e.target.value } : null) : setNewUser(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={editUser ? editUser.email : newUser.email} onChange={e => editUser ? setEditUser(p => p ? { ...p, email: e.target.value } : null) : setNewUser(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Rola</label><select value={editUser ? editUser.role : newUser.role} onChange={e => editUser ? setEditUser(p => p ? { ...p, role: e.target.value as any } : null) : setNewUser(p => ({ ...p, role: e.target.value as any }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"><option value="student">Student</option><option value="instructor">Instructor</option><option value="admin">Admin</option></select></div>
            <div className="flex gap-3 justify-end pt-4">
              <button onClick={() => { setShowModal(false); setEditUser(null) }} className="px-4 py-2 border text-gray-600 text-sm rounded-xl">Anuluj</button>
              <button onClick={async () => { if (editUser) { await updateUser(editUser.id, { name: editUser.name, email: editUser.email, role: editUser.role }) } else { await createUser(newUser) }; setShowModal(false); setEditUser(null); load() }} className="px-4 py-2 bg-sky-500 text-white text-sm rounded-xl">{editUser ? 'Zapisz' : 'Utwórz'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CategoriesTab() {
  const [categories, setCategories] = useState<CourseCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editCat, setEditCat] = useState<CourseCategory | null>(null)
  const [newCat, setNewCat] = useState({ name: '', slug: '', description: '', icon: '', color: '#3B82F6', order_index: 0 })

  const load = useCallback(async () => { setLoading(true); try { setCategories(await getCategories()) } catch {} finally { setLoading(false) } }, [])
  useEffect(() => { load() }, [load])

  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-end">
        <button onClick={() => { setEditCat(null); setNewCat({ name: '', slug: '', description: '', icon: '', color: '#3B82F6', order_index: 0 }); setShowModal(true) }} className="px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-xl hover:bg-sky-600 flex items-center gap-2"><Plus className="w-4 h-4"/>Nowa kategoria</button>
      </div>
      <div className="divide-y divide-gray-50">
        {loading ? <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-3"/></div>
        : categories.length === 0 ? <div className="p-12 text-center"><Grid3X3 className="w-12 h-12 text-gray-300 mx-auto mb-4"/><p className="text-gray-500">Brak kategorii. Utwórz pierwszą.</p></div>
        : categories.map(c => (
          <div key={c.id} className="flex items-center gap-4 p-4 hover:bg-gray-50/50">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: c.color }}>{c.name.charAt(0)}</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900">{c.name}</p><p className="text-xs text-gray-500">{c.description || c.slug}</p></div>
            <div className="text-right"><p className="text-sm font-medium text-gray-900">{c.courses_count} kursów</p></div>
            <div className="flex items-center gap-1">
              <button onClick={() => { setEditCat(c); setShowModal(true) }} className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg"><Edit className="w-4 h-4"/></button>
              <button onClick={async () => { await deleteCategory(c.id); load() }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">{editCat ? 'Edytuj kategorię' : 'Nowa kategoria'}</h2>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nazwa</label><input type="text" value={editCat ? editCat.name : newCat.name} onChange={e => editCat ? setEditCat(p => p ? { ...p, name: e.target.value } : null) : setNewCat(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"/></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug</label><input type="text" value={editCat ? editCat.slug : newCat.slug} onChange={e => editCat ? setEditCat(p => p ? { ...p, slug: e.target.value } : null) : setNewCat(p => ({ ...p, slug: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"/></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Opis</label><input type="text" value={editCat ? editCat.description : newCat.description} onChange={e => editCat ? setEditCat(p => p ? { ...p, description: e.target.value } : null) : setNewCat(p => ({ ...p, description: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"/></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Kolor</label><input type="color" value={editCat ? editCat.color : newCat.color} onChange={e => editCat ? setEditCat(p => p ? { ...p, color: e.target.value } : null) : setNewCat(p => ({ ...p, color: e.target.value }))} className="w-12 h-10 rounded-lg cursor-pointer border border-gray-200"/></div>
            <div className="flex gap-3 justify-end pt-4">
              <button onClick={() => { setShowModal(false); setEditCat(null) }} className="px-4 py-2 border text-gray-600 text-sm rounded-xl">Anuluj</button>
              <button onClick={async () => { if (editCat) { await updateCategory(editCat.id, editCat) } else { await createCategory(newCat) }; setShowModal(false); setEditCat(null); load() }} className="px-4 py-2 bg-sky-500 text-white text-sm rounded-xl">{editCat ? 'Zapisz' : 'Utwórz'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ReviewsTab() {
  const [reviews, setReviews] = useState<CourseReview[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all')

  const load = useCallback(async () => { setLoading(true); try { setReviews(await getReviews()) } catch {} finally { setLoading(false) } }, [])
  useEffect(() => { load() }, [load])

  const filtered = reviews.filter(r => filter === 'all' ? true : filter === 'approved' ? r.is_approved : !r.is_approved)

  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center gap-4">
        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
          {[{ k: 'all' as const, l: 'Wszystkie' }, { k: 'pending' as const, l: 'Oczekujące' }, { k: 'approved' as const, l: 'Zaakceptowane' }].map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)} className={`px-4 py-1.5 text-xs font-medium rounded-full ${filter === f.k ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-500'}`}>{f.l}</button>
          ))}
        </div>
        <span className="text-sm text-gray-500">{filtered.length} opinii</span>
      </div>
      <div className="divide-y divide-gray-50">
        {loading ? <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-3"/></div>
        : filtered.length === 0 ? <div className="p-12 text-center"><MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4"/><p className="text-gray-500">Brak opinii</p></div>
        : filtered.map(r => (
          <div key={r.id} className="p-4 hover:bg-gray-50/50">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-sm flex-shrink-0">{r.user_name.charAt(0)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">{r.user_name}</span>
                  <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}/>)}</div>
                  {r.is_approved ? <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Zaakceptowana</span> : <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">Oczekuje</span>}
                </div>
                <p className="text-xs text-gray-500 mb-2">{r.course_title}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{r.review}</p>
                <p className="text-[10px] text-gray-400 mt-2">{new Date(r.created).toLocaleString('pl')}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3 justify-end">
              <button onClick={async () => { await approveReview(r.id, !r.is_approved); load() }} className={`px-3 py-1.5 text-xs rounded-lg ${r.is_approved ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-500 text-white hover:bg-green-600'}`}>{r.is_approved ? 'Cofnij akceptację' : 'Akceptuj'}</button>
              <button onClick={async () => { await deleteReview(r.id); load() }} className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100">Usuń</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TransactionsTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all')

  const load = useCallback(async () => { setLoading(true); try { setTransactions(await getTransactions()) } catch {} finally { setLoading(false) } }, [])
  useEffect(() => { load() }, [load])

  const filtered = transactions.filter(t => filter === 'all' ? true : t.status === filter)

  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-xl p-4 text-center"><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Wszystkie</p><p className="text-xl font-bold text-gray-900">{formatPrice(transactions.reduce((s, t) => s + t.amount, 0))}</p></div>
        <div className="bg-green-50 rounded-xl p-4 text-center"><p className="text-xs text-green-600 uppercase tracking-wider mb-1">Zrealizowane</p><p className="text-xl font-bold text-green-700">{formatPrice(transactions.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0))}</p></div>
        <div className="bg-amber-50 rounded-xl p-4 text-center"><p className="text-xs text-amber-600 uppercase tracking-wider mb-1">Oczekujące</p><p className="text-xl font-bold text-amber-700">{formatPrice(transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0))}</p></div>
        <div className="bg-red-50 rounded-xl p-4 text-center"><p className="text-xs text-red-600 uppercase tracking-wider mb-1">Zwroty</p><p className="text-xl font-bold text-red-700">{formatPrice(transactions.filter(t => t.status === 'refunded').reduce((s, t) => s + t.amount, 0))}</p></div>
      </div>
      <div className="p-4 border-b border-gray-100 flex items-center gap-4">
        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
          {[{ k: 'all' as const, l: 'Wszystkie' }, { k: 'completed' as const, l: 'Zrealizowane' }, { k: 'pending' as const, l: 'Oczekujące' }].map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)} className={`px-4 py-1.5 text-xs font-medium rounded-full ${filter === f.k ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-500'}`}>{f.l}</button>
          ))}
        </div>
        <span className="text-sm text-gray-500">{filtered.length} transakcji</span>
      </div>
      <div className="divide-y divide-gray-50">
        {loading ? <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-3"/></div>
        : filtered.length === 0 ? <div className="p-12 text-center"><CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4"/><p className="text-gray-500">Brak transakcji</p></div>
        : filtered.map(t => (
          <div key={t.id} className="flex items-center gap-4 p-4 hover:bg-gray-50/50">
            <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 flex-shrink-0"><CreditCard className="w-4 h-4" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">{t.student_name}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.status === 'completed' ? 'bg-green-50 text-green-600' : t.status === 'pending' ? 'bg-amber-50 text-amber-600' : t.status === 'refunded' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{t.status}</span>
              </div>
              <p className="text-xs text-gray-500">{t.course_title} · {t.student_email}</p>
              <p className="text-[10px] text-gray-400">{t.transaction_id ? `ID: ${t.transaction_id}` : ''} · {t.payment_method}</p>
            </div>
            <div className="text-right"><p className="text-sm font-bold text-gray-900">{formatPrice(t.amount)}</p><p className="text-[10px] text-gray-400">{new Date(t.created).toLocaleDateString('pl')}</p></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StudentsTab({ courses }: { courses: Course[] }) {
  const [selCourse, setSelCourse] = useState('')
  const { enrollments } = useCourse(selCourse || null)
  const courseEnrollments = selCourse ? enrollments : []
  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center gap-4">
        <select value={selCourse} onChange={e=>setSelCourse(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"><option value="">Wszystkie kursy</option>{courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select>
      </div>
      <div className="divide-y divide-gray-50">
        {courseEnrollments.length===0?<div className="p-12 text-center"><Users className="w-12 h-12 text-gray-300 mx-auto mb-4"/><p className="text-gray-500">Wybierz kurs aby zobaczyć studentów</p></div>:
        courseEnrollments.map(e=><div key={e.id} className="flex items-center gap-4 p-4 hover:bg-gray-50/50"><div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-sm flex-shrink-0">{e.student_name.charAt(0)}</div><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900">{e.student_name}</p><p className="text-xs text-gray-500">{e.student_email}</p></div><div className="w-32"><div className="flex items-center gap-2"><div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-sky-500 rounded-full" style={{width:`${e.progress_percent}%`}}/></div><span className="text-xs font-semibold text-gray-600">{e.progress_percent}%</span></div></div><div className="text-right"><p className="text-sm font-bold text-gray-900">{formatPrice(e.price_paid)}</p><p className="text-[10px] text-gray-400">{e.completed_date?'Ukończony':'W trakcie'}</p></div></div>)}
      </div>
    </div>
  )
}

function AnalyticsTab({ courses, stats }: { courses: Course[]; stats: any }) {
  const topCourses = useMemo(()=>[...courses].sort((a,b)=>b.enrolled_count-a.enrolled_count).slice(0,5), [courses])
  const maxEnrolled = Math.max(...topCourses.map(c=>c.enrolled_count), 1)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Przychód całkowity" value={formatPrice(stats?.totalRevenue||0)} icon={DollarSign}/>
        <StatCard title="Wszystkie zapisy" value={stats?.totalEnrollments||0} icon={Users}/>
        <StatCard title="Opublikowane" value={stats?.publishedCourses||0} icon={BookOpen}/>
        <StatCard title="Unikalni studenci" value={stats?.totalStudents||0} icon={Star}/>
        <StatCard title="Średnia ocena" value={`★ ${(stats?.avgRating||0).toFixed(1)}`} icon={TrendingUp}/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-sky-500"/>Top kursy wg zapisów</h3>
          </div>
          <div className="p-6 space-y-4">
            {topCourses.map((c, i) => {
              const pct = maxEnrolled > 0 ? (c.enrolled_count / maxEnrolled) * 100 : 0
              return (
                <div key={c.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 truncate max-w-[250px]">{c.title}</span>
                    <span className="font-bold text-gray-900">{c.enrolled_count}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full" style={{ width: `${pct}%` }}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2"><DollarSign className="w-5 h-5 text-emerald-500"/>Przychód z kursów</h3>
          </div>
          <div className="p-6 space-y-3">
            {topCourses.map((c, i) => {
              const revenue = c.price * (c.discount > 0 ? 1 - c.discount / 100 : 1) * c.enrolled_count
              return (
                <div key={c.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-bold text-gray-400">#{i + 1}</span>
                    <span className="text-sm text-gray-700 truncate max-w-[200px]">{c.title}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{formatPrice(revenue)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CoursesPage() {
  const { courses, loading: cLoading, refetch } = useCourses()
  const { stats, loading: sLoading } = useCourseStats()
  const [tab, setTab] = useState<TabType>('overview')
  const [search, setSearch] = useState('')
  const [editCourse, setEditCourse] = useState<Course|null|undefined>(undefined)
  const [detailCourse, setDetailCourse] = useState<Course|null>(null)
  const [confirmDel, setConfirmDel] = useState<Course|null>(null)

  const filtered = courses.filter(c=>c.title.toLowerCase().includes(search.toLowerCase()))
  const isLoading = cLoading || sLoading

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-3"/>
          <p className="text-sm text-gray-500 font-medium">Ładowanie kursów...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4"><span>Redakcja</span><ChevronRight size={16}/><span className="text-sky-600 font-medium">Centrum kursów</span></div>
          <div className="flex items-start justify-between mb-8">
            <div><h1 className="text-3xl font-bold text-gray-900 mb-2">Kursy online</h1><p className="text-gray-600 max-w-xl">Twórz i sprzedawaj kursy online. Zarządzaj treścią, studentami i analizuj wyniki.</p></div>
            <button onClick={()=>setEditCourse(null)} className="px-4 py-2.5 bg-sky-500 text-white text-sm font-medium rounded-full hover:bg-sky-600 flex items-center gap-2"><Plus className="w-4 h-4"/>Nowy kurs</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard title="Kursy" value={stats?.totalCourses||0} icon={BookOpen}/>
            <StatCard title="Studenci" value={stats?.totalStudents||0} icon={Users}/>
            <StatCard title="Przychód" value={formatPrice(stats?.totalRevenue||0)} icon={DollarSign}/>
            <StatCard title="Ocena" value={`★ ${(stats?.avgRating||0).toFixed(1)}`} icon={Star}/>
          </div>
          <div className="flex items-center gap-1 bg-gray-100/80 rounded-full p-1 mb-6 w-fit">
            {[
              { k: 'overview' as TabType, l: 'Przegląd' },
              { k: 'courses' as TabType, l: `Kursy (${courses.length})` },
              { k: 'users' as TabType, l: 'Użytkownicy' },
              { k: 'categories' as TabType, l: 'Kategorie' },
              { k: 'reviews' as TabType, l: 'Recenzje' },
              { k: 'transactions' as TabType, l: 'Transakcje' },
            ].map(t =>
              <button key={t.k} onClick={()=>setTab(t.k)} className={`px-4 py-2 text-sm font-medium rounded-full ${tab===t.k?'bg-white text-sky-600 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>{t.l}</button>
            )}
          </div>

          {tab==='overview'&&<div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100"><h3 className="text-base font-semibold text-gray-900">Ostatnie kursy</h3></div>
              <div className="divide-y divide-gray-50">
                {courses.slice(0,6).map(c=><div key={c.id} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 cursor-pointer" onClick={()=>setDetailCourse(c)}><div className="w-16 h-11 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"><img src={c.thumbnail||DEFAULT_THUMBNAIL} alt={c.title} className="w-full h-full object-cover"/></div><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900 truncate">{c.title}</p><div className="flex items-center gap-2 mt-1"><span className={`text-[10px] px-2 py-0.5 rounded-full ${getLevelColor(c.level)}`}>{getLevelLabel(c.level)}</span><span className={`text-[10px] px-2 py-0.5 rounded-full ${c.is_published?'bg-green-50 text-green-600':'bg-gray-100 text-gray-400'}`}>{c.is_published?'Opublikowany':'Szkic'}</span><span className="text-[10px] text-gray-400">{c.chapters_count} rozdz.</span></div></div><div className="text-right"><p className="text-sm font-bold text-gray-900">{c.discount>0?formatPrice(c.price*(1-c.discount/100)):formatPrice(c.price)}</p>{c.discount>0&&<p className="text-xs text-gray-400 line-through">{formatPrice(c.price)}</p>}<p className="text-[10px] text-gray-400">{c.enrolled_count} uczniów</p></div></div>)}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border border-gray-100 p-6"><h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-sky-500"/>Podsumowanie</h3><div className="space-y-4"><div className="flex justify-between"><span className="text-sm text-gray-500">Opublikowane kursy</span><span className="font-bold text-gray-900">{stats?.publishedCourses||0}</span></div><div className="flex justify-between"><span className="text-sm text-gray-500">Wszystkie zapisy</span><span className="font-bold text-gray-900">{stats?.totalEnrollments||0}</span></div><div className="flex justify-between"><span className="text-sm text-gray-500">Średnia ocena</span><span className="font-bold text-gray-900">★ {(stats?.avgRating||0).toFixed(1)}</span></div><div className="flex justify-between"><span className="text-sm text-gray-500">Unikalni studenci</span><span className="font-bold text-gray-900">{stats?.totalStudents||0}</span></div></div></div>
              <div className="bg-white rounded-3xl border border-gray-100 p-6"><h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500"/>Top kursy</h3><div className="space-y-3">{courses.sort((a,b)=>b.enrolled_count-a.enrolled_count).slice(0,4).map((c,i)=><div key={c.id} className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">{i+1}</span><span className="text-sm text-gray-700 truncate max-w-[200px]">{c.title}</span></div><span className="text-xs font-bold text-gray-900">{c.enrolled_count} ucz.</span></div>)}</div></div>
            </div>
          </div>}

          {tab==='courses'&&<div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-4"><div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/><input type="text" placeholder="Szukaj kursów..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"/></div></div>
            <div className="divide-y divide-gray-50">
              {filtered.length===0?<div className="p-12 text-center"><BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4"/><p className="text-gray-500 mb-4">Brak kursów</p><button onClick={()=>setEditCourse(null)} className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-full hover:bg-sky-600"><Plus className="w-4 h-4"/>Utwórz pierwszy kurs</button></div>:
              filtered.map(c=><div key={c.id} className="flex items-center gap-4 p-4 hover:bg-gray-50/50"><div className="w-20 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"><img src={c.thumbnail||DEFAULT_THUMBNAIL} alt={c.title} className="w-full h-full object-cover"/></div><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900 truncate">{c.title}</p><div className="flex items-center gap-2 mt-1 flex-wrap"><span className={`text-[10px] px-2 py-0.5 rounded-full ${getLevelColor(c.level)}`}>{getLevelLabel(c.level)}</span>{c.category&&<span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{getCategoryLabel(c.category)}</span>}<span className={`text-[10px] px-2 py-0.5 rounded-full ${c.is_published?'bg-green-50 text-green-600':'bg-gray-100 text-gray-400'}`}>{c.is_published?'Opublikowany':'Szkic'}</span><span className="text-[10px] text-gray-400">{c.chapters_count} rozdz.</span><span className="text-[10px] text-gray-400">★{c.avg_rating.toFixed(1)}</span></div></div><div className="text-right mr-4"><p className="text-sm font-bold text-gray-900">{c.discount>0?formatPrice(c.price*(1-c.discount/100)):formatPrice(c.price)}</p>{c.discount>0&&<p className="text-xs text-gray-400 line-through">{formatPrice(c.price)}</p>}<p className="text-[10px] text-gray-400">{c.enrolled_count} uczniów</p></div><div className="flex items-center gap-1"><button onClick={()=>setDetailCourse(c)} title="Rozdziały i lekcje" className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg"><Play className="w-4 h-4"/></button><button onClick={()=>setEditCourse(c)} className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg"><Edit className="w-4 h-4"/></button><button onClick={async()=>{await togglePublishCourse(c.id,!c.is_published);refetch()}} className={`p-2 rounded-lg ${c.is_published?'text-green-500 hover:bg-green-50':'text-gray-400 hover:text-green-500 hover:bg-green-50'}`}>{c.is_published?<Eye className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button><button onClick={()=>setConfirmDel(c)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button></div></div>)}
            </div>
          </div>}

          {tab==='users'&&<UsersTab/>}
          {tab==='categories'&&<CategoriesTab/>}
          {tab==='reviews'&&<ReviewsTab/>}
          {tab==='transactions'&&<TransactionsTab/>}
        </div>
      </div>
      {editCourse!==undefined&&<CourseModal course={editCourse} onSave={async(d)=>{if(editCourse)await updateCourse(editCourse.id,d);else await createCourse(d);setEditCourse(undefined);refetch()}} onClose={()=>setEditCourse(undefined)}/>}
      {detailCourse&&<CourseDetailModal course={detailCourse} refetchAll={refetch} onClose={()=>{setDetailCourse(null);refetch()}}/>}
      {confirmDel&&<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-xl max-w-sm w-full p-6"><div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center"><Trash2 className="w-6 h-6 text-red-500"/></div><div><h3 className="font-bold text-gray-900">Usuń kurs</h3><p className="text-sm text-gray-500"> Tej operacji nie można cofnąć</p></div></div><p className="text-gray-700 mb-6">Czy na pewno chcesz usunąć kurs <strong>"{confirmDel.title}"</strong>? Spowoduje to usunięcie wszystkich rozdziałów i lekcji.</p><div className="flex gap-3 justify-end"><button onClick={()=>setConfirmDel(null)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Anuluj</button><button onClick={async()=>{await deleteCourse(confirmDel.id);setConfirmDel(null);refetch()}} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">Usuń kurs</button></div></div></div>}
    </div>
  )
}