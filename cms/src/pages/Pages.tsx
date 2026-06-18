import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Search,
  FileText,
  Edit3,
  MoreVertical,
  Copy,
  Trash2,
  Activity,
  Clock,
  Shield,
  Layout,
} from 'lucide-react'
import { useToast } from '@/components/Toast'
import { normalizePath, usePages } from '@/features/pages/hooks'
import { createPage, type CmsPage } from '@/features/pages/api'
import { pb } from '@/lib/pocketbase'
import { triggerRevalidation } from '@/lib/revalidate'
import VisualEditor from './VisualEditor'

type FilterType = 'all' | 'published' | 'draft' | 'private'

function getPageStatus(page: any) {
  return { label: 'Opublikowana', color: 'text-green-600', bgColor: 'bg-green-100' }
}

function getPageIcon(page: any) {
  return { icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100' }
}

function formatDate(date: string | undefined | null) {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: 'short', year: 'numeric' })
}
export default function Pages() {
  const navigate = useNavigate()
  const toast = useToast()
  const { rows, loading, refetch } = usePages()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'primary' | 'city'>('primary')
  const [sortBy, setSortBy] = useState<'latest' | 'name-asc' | 'name-desc'>('latest')
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  const filteredPages = useMemo(() => {
    const MAIN_PATHS = ['/', '/inteligentne-folie', '/montaz-folii-inteligentnej', '/realizacje', '/blog', '/kontakt', '/o-nas']
    
    return rows.filter(page => {
      // Only show Polish language pages
      if (page.language_code !== 'pl') return false
      
      if (activeFilter === 'primary') {
        if (!MAIN_PATHS.includes(page.path)) return false
      } else if (activeFilter === 'city') {
        if (!page.path.startsWith('/folia-inteligentna-')) return false
      }
      
      if (searchQuery && !page.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    }).sort((a, b) => {
      if (sortBy === 'name-asc') return a.title.localeCompare(b.title)
      if (sortBy === 'name-desc') return b.title.localeCompare(a.title)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [rows, searchQuery, sortBy, activeFilter])

  const mainCount = rows.filter(p => ['/', '/inteligentne-folie', '/montaz-folii-inteligentnej', '/realizacje', '/blog', '/kontakt'].includes(p.path) && p.language_code === 'pl').length
  const cityCount = rows.filter(p => p.path.startsWith('/folia-inteligentna-') && p.language_code === 'pl').length
  const [visitCount, setVisitCount] = useState<number | null>(null)

  useEffect(() => {
    async function fetchVisits() {
      try {
        const result = await pb.collection('website_visits').getList(1, 1, {
          requestKey: null,
        })
        setVisitCount(result.totalItems || 0)
      } catch (error) {
        console.error('Error fetching visits:', error)
        setVisitCount(0)
      }
    }
    fetchVisits()
  }, [])

  const handleDuplicate = async (page: Pick<CmsPage, 'id' | 'title' | 'path' | 'language_code'>) => {
    try {
      await createPage({
        title: `${page.title} (kopia)`,
        path: normalizePath(`${page.path}-kopia`),
        language_code: page.language_code || 'pl',
      })
      toast.success('Zduplikowano stronę')
      refetch()
    } catch (e) {
      toast.error('Nie udało się zduplikować')
    }
  }

  const handleDelete = async (page: Pick<CmsPage, 'id' | 'path'>) => {
    if (!confirm('Czy na pewno chcesz usunąć tę stronę?')) return
    try {
      // 1. Delete from site_content
      const rows = await pb.collection('site_content').getFullList({
        filter: `page_path = "${page.path}"`,
      })
      
      for (const row of rows) {
        await pb.collection('site_content').delete(row.id)
      }

      // 2. Delete from cms_pages
      await pb.collection('cms_pages').delete(page.id)

      await triggerRevalidation([page.path])
      toast.success('Usunięto stronę')
      refetch()
    } catch (e) {
      console.error('Error deleting page:', e)
      toast.error('Nie udało się usunąć strony')
    }
  }

  const filters: { id: 'primary' | 'city'; label: string }[] = [
    { id: 'primary', label: `Główne (${mainCount})` },
    { id: 'city', label: `Lokalne (${cityCount})` },
  ]

  const isVisualCms = window.location.pathname.includes('visual-cms')

  if (isVisualCms) {
    return <VisualEditor />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Zarządzanie stronami</h1>
          <p className="text-sm text-gray-500 mt-1">
            Zarządzaj architekturą cyfrową i hierarchią treści.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === f.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Szukaj stron..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="latest">Sortuj: Ostatnie</option>
              <option value="name-asc">Sortuj: Nazwa A-Z</option>
              <option value="name-desc">Sortuj: Nazwa Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pages List */}
      <div className="max-w-7xl mx-auto mb-8">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Ładowanie stron...</div>
        ) : filteredPages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Layout size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500">Nie znaleziono stron do wyświetlenia.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPages.map((page) => {
              const status = getPageStatus(page)
              const { icon: Icon, color, bgColor } = getPageIcon(page)
              
              return (
                <div
                  key={page.id}
                  className="group bg-white rounded-2xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon size={20} className={color} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {page.title}
                        </h3>
                        <span className={`px-2.5 py-1 ${status.bgColor} ${status.color} text-xs font-medium rounded-full`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-400 font-mono">{page.path}</span>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="hidden sm:flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Zmodyfikowano</p>
                        <p className="text-sm text-gray-600 font-medium">{formatDate(page.updated_at)}</p>
                      </div>
                      
                      {/* Mock user avatar */}
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        AR
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          const slug = page.path === '/' ? 'home' : page.path.replace(/^\//, '')
                          navigate(`/visual-cms/${slug}`)
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edytuj wizualnie"
                      >
                        <Edit3 size={18} />
                      </button>
                      
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpenId(menuOpenId === page.id ? null : page.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        {menuOpenId === page.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setMenuOpenId(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1">
                              <button
                                onClick={() => {
                                  handleDuplicate(page)
                                  setMenuOpenId(null)
                                }}
                                className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-left"
                              >
                                <Copy size={14} />
                                Duplikuj
                              </button>
                              <button
                                onClick={() => {
                                  handleDelete(page)
                                  setMenuOpenId(null)
                                }}
                                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 text-left"
                              >
                                <Trash2 size={14} />
                                Usuń
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Traffic */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Wizyty ogółem</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {visitCount === null ? '...' : visitCount > 999 ? `${(visitCount / 1000).toFixed(1)}k` : visitCount}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Activity size={20} className="text-blue-600" />
              </div>
            </div>
          </div>

          {/* Load Time */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Śr. czas ładowania</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0.8s</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Clock size={20} className="text-gray-600" />
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-amber-700 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Zdrowie systemu</p>
                <p className="text-lg font-semibold mt-1">Optymalna wydajność</p>
                <p className="text-xs text-white/60 mt-0.5">Wszystkie węzły operacyjne</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield size={20} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
