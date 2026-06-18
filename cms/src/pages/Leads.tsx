import { useMemo, useState, useEffect, useCallback } from 'react'
import {
  Filter,
  Download,
  X,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Plus
} from 'lucide-react'
import { pb, TENANT_ID } from '@/lib/pocketbase'
import { useToast } from '@/components/Toast'

interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  message: string
  source: string
  status: string
  priority: string
  created: string
  updated: string
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const toast = useToast()

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true)
      
      // Get the correct website ID for the current user
      const websiteId = pb.authStore.model?.website_id || TENANT_ID;
      
      console.log('[Leads] Fetching leads for website:', websiteId);
      
      const data = await pb.collection('leads').getFullList<Lead>({
        filter: `website_id = "${websiteId}"`,
        sort: '-created'
      })
      setLeads(data || [])
    } catch (error) {
      console.error('Error fetching leads:', error)
      toast.error('Błąd ładowania leadów')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const selectedLead = useMemo(() => {
    if (!selectedId) return null
    return leads.find((l) => l.id === selectedId) || null
  }, [leads, selectedId])

  const filteredLeads = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return leads
    return leads.filter((l) => 
      l.name.toLowerCase().includes(q) || 
      l.email.toLowerCase().includes(q) || 
      (l.source || '').toLowerCase().includes(q)
    )
  }, [leads, searchTerm])

  // Stats
  const totalLeads = leads.length
  const newInquiries = leads.filter(l => l.status === 'new').length
  const conversionRate = leads.length > 0 ? Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100) : 0
  const activeFollowups = leads.filter(l => l.status === 'follow-up').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500 text-white">
            Nowy
          </span>
        )
      case 'read':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            Przeczytane
          </span>
        )
      case 'follow-up':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            Follow-up
          </span>
        )
      case 'converted':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            Skonwertowany
          </span>
        )
      case 'closed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            Zamknięty
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            {status}
          </span>
        )
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-sky-100 text-sky-600',
      'bg-emerald-100 text-emerald-600',
      'bg-violet-100 text-violet-600',
      'bg-amber-100 text-amber-600',
      'bg-rose-100 text-rose-600',
      'bg-cyan-100 text-cyan-600'
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Source', 'Status', 'Date']
    const rows = filteredLeads.map(l => [
      l.id,
      l.name,
      l.email,
      l.phone || '',
      l.source || 'Formularz kontaktowy',
      l.status,
      new Date(l.created).toLocaleDateString('pl-PL')
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast.success('Wyeksportowano do CSV')
  }

  const handleMarkAsRead = async (leadId: string) => {
    try {
      await pb.collection('leads').update(leadId, { status: 'read' })
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'read' } : l))
      toast.success('Oznaczono jako przeczytane')
      setDetailOpen(false)
    } catch (error) {
      console.error('Error marking lead as read:', error)
      toast.error('Błąd aktualizacji')
    }
  }

  const openLead = useCallback((lead: Lead) => {
    setSelectedId(lead.id)
    setDetailOpen(true)
  }, [])

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - Título y botones a la derecha */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Przegląd leadów</h1>
            <p className="text-gray-600 max-w-xl">
              Zarządzaj i śledź przychodzące zapytania oraz potencjalne możliwości biznesowe ze wszystkich kanałów.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-sky-100 text-sky-700 rounded-xl text-sm font-medium hover:bg-sky-200 transition-colors"
            >
              <Download size={18} />
              Eksportuj
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter size={18} />
              Filtry
            </button>
          </div>
        </div>

        {/* Leads Table - Diseño fiel al mockup */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden mb-8">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-3">Nazwa</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Źródło</div>
            <div className="col-span-2">Data otrzymania</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-right">Akcja</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Ładowanie...</div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Brak leadów
              </div>
            ) : (
              filteredLeads.map((lead) => (
                <div 
                  key={lead.id} 
                  onClick={() => openLead(lead)}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors cursor-pointer"
                >
                  {/* Name - con subtítulo de cargo como en mockup */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${getAvatarColor(lead.name)}`}>
                      {getInitials(lead.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{lead.name}</p>
                      <p className="text-xs text-gray-500">{lead.phone || 'Real Estate Agent'}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="col-span-3">
                    <p className="text-sm text-gray-600 truncate">{lead.email}</p>
                  </div>

                  {/* Source - pill style como mockup */}
                  <div className="col-span-2">
                    <span className="inline-block px-3 py-1 bg-sky-100 text-sky-700 text-xs font-medium rounded-full">
                      {lead.source || 'Formularz kontaktowy'}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-2">
                    <span className="text-sm text-gray-600">
                      {new Date(lead.created).toLocaleDateString('pl-PL', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Status - badges con colores específicos */}
                  <div className="col-span-1">
                    {getStatusBadge(lead.status)}
                  </div>

                  {/* Action - tres puntos verticales */}
                  <div className="col-span-1 text-right">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination - estilo mockup */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Pokazano 1-{filteredLeads.length} z {leads.length} leadów
            </p>
            <div className="flex items-center gap-2">
              <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-40" disabled>
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center text-sm font-bold bg-sky-600 text-white rounded-lg">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                2
              </button>
              <button className="w-8 h-8 flex items-center justify-center text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                3
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Cards - Estilo anterior */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Lead Score Intelligence */}
          <div className="relative bg-sky-600 rounded-2xl p-6 overflow-hidden text-white">
            <div className="relative z-10">
              <h3 className="text-xl font-semibold mb-2">Inteligencja oceny leadów</h3>
              <p className="text-sm text-sky-100 mb-4 max-w-md">
                Nasz nowy system oceny oparty na AI identyfikuje wysokiej wartości leady na podstawie historii zaangażowania i danych firmograficznych. Zacznij priorytetyzować swój dzień lepiej.
              </p>
              <button className="px-4 py-2 bg-white text-sky-600 rounded-full text-sm font-medium hover:bg-sky-50 transition-colors">
                Zobacz szczegóły
              </button>
            </div>
          </div>

          {/* Automated Responses */}
          <div className="bg-orange-100 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Sparkles size={20} className="text-orange-500" />
              </div>
              <button className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white hover:bg-sky-600 transition-colors">
                <Plus size={20} />
              </button>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Automatyczne odpowiedzi</h3>
            <p className="text-sm text-gray-600 mb-4">
              Zmniejsz czas odpowiedzi do zera. Skonfiguruj automatyczne przepływy email dla nowych zapisów na newsletter.
            </p>
            <button className="text-sm font-medium text-gray-900 flex items-center gap-1 hover:gap-2 transition-all">
              Konfiguruj automatyzacje
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {detailOpen && selectedLead && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDetailOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl border-l border-gray-200 overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${getAvatarColor(selectedLead.name)}`}>
                  {getInitials(selectedLead.name)}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedLead.name}</h2>
                  <p className="text-sm text-gray-500">{selectedLead.email}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Telefon</p>
                  <p className="text-sm font-medium text-gray-900">{selectedLead.phone || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Źródło</p>
                  <p className="text-sm font-medium text-gray-900">{selectedLead.source || 'Formularz kontaktowy'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedLead.status)}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Data</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(selectedLead.created).toLocaleString('pl-PL')}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-2">Wiadomość</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedLead.message || '—'}</p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDetailOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                >
                  Zamknij
                </button>
                {selectedLead.status === 'new' && (
                  <button 
                    onClick={() => handleMarkAsRead(selectedLead.id)}
                    className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors"
                  >
                    Oznacz jako przeczytane
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

