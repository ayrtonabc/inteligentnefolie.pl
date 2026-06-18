import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Edit2,
  Trash2,
  FileText,
  Search,
  RefreshCw,
  LayoutList,
  Grid3X3,
  Filter,
  ChevronDown,
  MoreVertical,
  User,
  ChevronRight,
  Eye,
  Settings,
  Tag,
  UserPlus,
  Download,
  TrendingUp
} from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'
import { usePosts } from '@/features/blog/hooks'
import { type BlogPost } from '@/features/blog/api'

type PostListItem = BlogPost & {
  blog_categories: { name: string } | null
  author?: { name: string; avatar?: string }
  featured_image?: string
  updated_at?: string
}

export default function BlogList() {
  const { posts, loading, error, refetch, remove } = usePosts()
  const toast = useToast()
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error]) // eslint-disable-line react-hooks/exhaustive-deps

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts
      .filter((p) => {
        if (statusFilter === 'published') return !!p.published_at
        if (statusFilter === 'draft') return !p.published_at
        if (statusFilter === 'scheduled') return !!p.scheduled_at && !p.published_at
        return true
      })
      .filter((p) => {
        if (!q) return true
        const haystack = `${p.title} ${p.slug} ${p.expand?.blog_categories?.name ?? ''}`.toLowerCase()
        return haystack.includes(q)
      })
  }, [posts, query, statusFilter])

  const publishedCount = posts.filter(p => p.status === 'published' || !!p.published_at).length
  const draftCount = posts.filter(p => p.status !== 'published' && !p.published_at).length

  const handleExportCSV = () => {
    const headers = ['ID', 'Tytuł', 'Slug', 'Kategoria', 'Status', 'Data utworzenia']
    const rows = filteredPosts.map(p => [
      p.id,
      p.title,
      p.slug,
      p.expand?.blog_categories?.name || 'Bez kategorii',
      p.published_at ? 'Opublikowany' : 'Szkic',
      new Date(p.created_at).toLocaleDateString('pl-PL')
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `blog-posts-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast.success('Wyeksportowano do CSV')
  }

  const handleDelete = async () => {
    if (!confirmId) return
    try {
      await remove(confirmId)
      toast.success('Usunięto wpis')
      refetch()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error'
      toast.error(msg)
    } finally {
      setConfirmId(null)
    }
  }

  const getStatusBadge = (post: BlogPost) => {
    if (post.status === 'published' || post.published_at) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          Opublikowany
        </span>
      )
    }
    if (post.scheduled_at) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
          <div className="w-1.5 h-1.5 bg-sky-500 rounded-full" />
          Zaplanowany
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
        Szkic
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>Redakcja</span>
            <ChevronRight size={16} />
            <span className="text-sky-600 font-medium">Zarządzanie blogiem</span>
          </div>

          {/* Title & View Toggle */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Artykuły i analizy</h1>
              <p className="text-gray-600 max-w-xl">
                Kreuj głos swojej marki. Zarządzaj cyklami wersji roboczych, planuj przyszłe publikacje i monitoruj wydajność redakcyjną.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-gray-100/80 rounded-full p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    viewMode === 'list' 
                      ? 'bg-white text-sky-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <LayoutList size={16} />
                  Widok listy
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-sky-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid3X3 size={16} />
                  Widok siatki
                </button>
              </div>
              <Link 
                to="/blog/new"
                className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-full transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Utwórz nowy
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Total Posts */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center">
                    <FileText size={24} className="text-sky-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Wszystkie wpisy</p>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold text-gray-900">{posts.length.toLocaleString('pl-PL')}</span>
                      <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
                        <TrendingUp size={12} />
                        +{posts.length > 0 ? Math.round((posts.length / (posts.length - 1 || 1)) * 10) : 0}%
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400">{publishedCount} opublikowanych, {draftCount} szkiców</p>
                  </div>
                </div>

                {/* Total Views */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center">
                    <Eye size={24} className="text-violet-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Wyświetlenia</p>
                    <p className="text-2xl font-bold text-gray-900">—</p>
                    <p className="text-[10px] text-gray-400">Podłącz Google Analytics</p>
                  </div>
                </div>

                {/* Active Authors */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <User size={24} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Aktywni autorzy</p>
                    <p className="text-lg font-bold text-gray-900">—</p>
                    <p className="text-xs text-gray-500">Brak danych</p>
                  </div>
                </div>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Filtry:</span>
              <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    statusFilter === 'all' 
                      ? 'bg-sky-500 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Wszystkie wpisy
                </button>
                <button
                  onClick={() => setStatusFilter('published')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    statusFilter === 'published' 
                      ? 'bg-sky-500 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Opublikowane
                </button>
                <button
                  onClick={() => setStatusFilter('draft')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    statusFilter === 'draft' 
                      ? 'bg-sky-500 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Szkice
                </button>
                <button
                  onClick={() => setStatusFilter('scheduled')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    statusFilter === 'scheduled' 
                      ? 'bg-sky-500 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Zaplanowane
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Sortuj: Najnowsze
                <ChevronDown size={14} />
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter size={14} />
                ZAAWANSOWANE
              </button>
            </div>
          </div>

          {/* Articles Content */}
          {viewMode === 'list' ? (
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden mb-8">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50/50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-4">Tytuł</div>
                <div className="col-span-2">Autor</div>
                <div className="col-span-2">Kategoria</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Ostatnia modyfikacja</div>
                <div className="col-span-1 text-right">Akcje</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-gray-100">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">Ładowanie...</div>
                ) : filteredPosts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    Brak artykułów
                  </div>
                ) : (
                  filteredPosts.map((post: PostListItem) => (
                    <div key={post.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50/50 transition-colors">
                      {/* Title with thumbnail */}
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {post.featured_image ? (
                            <img src={post.featured_image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <FileText size={18} className="text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                          <p className="text-[11px] text-gray-500 truncate">{post.slug}</p>
                        </div>
                      </div>

                      {/* Author */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                            <User size={12} className="text-gray-500" />
                          </div>
                          <span className="text-sm text-gray-700">{post.author?.name || 'Autor'}</span>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="col-span-2">
                        <span className="inline-block px-2 py-1 bg-sky-50 text-sky-600 text-xs font-medium rounded-full">
                          {post.blog_categories?.name || 'Bez kategorii'}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        {getStatusBadge(post)}
                      </div>

                      {/* Last Modified */}
                      <div className="col-span-1">
                        <span className="text-sm text-gray-500">
                          {new Date(post.updated_at || post.created_at).toLocaleDateString('pl-PL', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            to={`/blog/${post.id}`}
                            className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={() => setConfirmId(post.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Łącznie {posts.length} artykułów
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Ładowanie...</div>
              ) : filteredPosts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Brak artykułów</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPosts.map((post: PostListItem) => (
                    <div key={post.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden group hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-300">
                      <div className="aspect-video bg-gray-100 relative overflow-hidden">
                        {post.featured_image ? (
                          <img src={post.featured_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <FileText size={48} />
                          </div>
                        )}
                        <div className="absolute top-4 right-4">
                          {getStatusBadge(post)}
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest bg-sky-50 px-2 py-0.5 rounded">
                            {post.blog_categories?.name || 'Inne'}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(post.created_at).toLocaleDateString('pl-PL')}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-sky-600 transition-colors">
                          {post.title}
                        </h3>
                        <div className="flex items-center justify-between mt-6">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center">
                              <User size={12} className="text-sky-600" />
                            </div>
                            <span className="text-xs text-gray-500 font-medium">{post.author?.name || 'Admin'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Link 
                              to={`/blog/${post.id}`}
                              className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-full transition-all"
                            >
                              <Edit2 size={16} />
                            </Link>
                            <button
                              onClick={() => setConfirmId(post.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bottom Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Settings size={18} className="text-sky-600" />
                <h3 className="text-sm font-semibold text-gray-900">Szybkie akcje</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/blog/categories" className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Tag size={16} className="text-gray-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Dodaj kategorię</span>
                </Link>
                <button className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <UserPlus size={16} className="text-gray-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Zaproś autora</span>
                </button>
                <button 
                  onClick={handleExportCSV}
                  className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Download size={16} className="text-gray-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Eksport CSV</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Settings size={16} className="text-gray-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Konfiguracja</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <ConfirmDialog
        isOpen={!!confirmId}
        title="Potwierdź usunięcie"
        message="Ta akcja jest nieodwracalna."
        danger
        onCancel={() => setConfirmId(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
