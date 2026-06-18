import { useState, useEffect, useCallback } from 'react'
import { useSite, Website } from '@/context/SiteContext'
import { pb } from '@/lib/pocketbase'
import { useToast } from '@/components/Toast'
import { useAuth } from '@/context/AuthContext'
import { Plus, Globe, Edit3, Trash2, Check, X, ExternalLink, Copy } from 'lucide-react'

interface SiteFormData {
  name: string
  domain: string
  status: 'active' | 'draft' | 'maintenance'
  plan: 'free' | 'starter' | 'pro' | 'enterprise'
}

export default function SitesSettings() {
  const { websites, currentSite, selectSite, refreshSites } = useSite()
  const { user } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSite, setEditingSite] = useState<Website | null>(null)
  const [formData, setFormData] = useState<SiteFormData>({
    name: '',
    domain: '',
    status: 'draft',
    plan: 'free'
  })

  const fetchSites = useCallback(async () => {
    setLoading(true)
    await refreshSites()
    setLoading(false)
  }, [refreshSites])

  useEffect(() => {
    fetchSites()
  }, [fetchSites])

  const openCreateForm = () => {
    setEditingSite(null)
    setFormData({ name: '', domain: '', status: 'draft', plan: 'free' })
    setShowForm(true)
  }

  const openEditForm = (site: Website) => {
    setEditingSite(site)
    setFormData({
      name: site.name,
      domain: site.domain || '',
      status: site.status,
      plan: site.plan
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Nazwa strony jest wymagana')
      return
    }

    try {
      if (editingSite) {
        await pb.collection('tenants').update(editingSite.id, formData)
        toast.success('Zaktualizowano stronę')
      } else {
        await pb.collection('tenants').create({
          ...formData,
          user_id: user?.id
        })
        toast.success('Utworzono stronę')
      }

      setShowForm(false)
      await refreshSites()
    } catch (error) {
      toast.error(editingSite ? 'Błąd aktualizacji strony' : 'Błąd tworzenia strony')
      console.error(error)
    }
  }

  const handleDelete = async (site: Website) => {
    if (!confirm(`Na pewno usunąć "${site.name}"? Tej operacji nie można cofnąć.`)) {
      return
    }

    try {
      await pb.collection('tenants').delete(site.id)
      toast.success('Usunięto stronę')
      await refreshSites()
    } catch (error) {
      toast.error('Błąd usuwania strony')
      console.error(error)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      maintenance: 'bg-amber-100 text-amber-700',
      draft: 'bg-gray-100 text-gray-600'
    }
    const labels: Record<string, string> = {
      active: 'Aktywna',
      maintenance: 'Konserwacja',
      draft: 'Szkic'
    }
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${styles[status] || styles.draft}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${
          status === 'active' ? 'bg-green-500' : status === 'maintenance' ? 'bg-amber-500' : 'bg-gray-400'
        }`} />
        {labels[status] || status}
      </span>
    )
  }

  const getPlanBadge = (plan: string) => {
    const styles: Record<string, string> = {
      enterprise: 'bg-purple-100 text-purple-700',
      pro: 'bg-blue-100 text-blue-700',
      starter: 'bg-green-100 text-green-700',
      free: 'bg-gray-100 text-gray-600'
    }
    return (
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[plan] || styles.free}`}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Ładowanie...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Zarządzanie stronami</h1>
          <p className="text-sm text-gray-500 mt-1">Dodawaj i konfiguruj strony klientów</p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus size={18} />
          Dodaj stronę
        </button>
      </div>

      {/* Sites List */}
      {websites.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Globe size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak stron</h3>
          <p className="text-sm text-gray-500 mb-6">Dodaj swoją pierwszą stronę, aby rozpocząć</p>
          <button
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Plus size={18} />
            Dodaj stronę
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Nazwa strony</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Plan</div>
              <div className="col-span-2">Domena</div>
              <div className="col-span-2 text-right">Akcje</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-50">
            {websites.map((site) => (
              <div key={site.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Globe size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{site.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(site.created).toLocaleDateString('pl-PL')}
                      </p>
                    </div>
                    {currentSite?.id === site.id && (
                      <span className="text-[10px] font-medium px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        Aktywna
                      </span>
                    )}
                  </div>
                  <div className="col-span-2">
                    {getStatusBadge(site.status)}
                  </div>
                  <div className="col-span-2">
                    {getPlanBadge(site.plan)}
                  </div>
                  <div className="col-span-2">
                    {site.domain ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 font-mono truncate">{site.domain}</span>
                        <button
                          onClick={() => window.open(`https://${site.domain}`, '_blank')}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Otwórz stronę"
                        >
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditForm(site)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edytuj"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(site)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Usuń"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingSite ? 'Edytuj stronę' : 'Nowa strona'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nazwa strony *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="np. Moja Strona"
                  required
                />
              </div>

              {/* Domain */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Domena
                </label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="np. example.com"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['active', 'draft', 'maintenance'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData({ ...formData, status })}
                      className={`px-4 py-2.5 border-2 rounded-xl text-sm font-medium transition-all ${
                        formData.status === status
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {status === 'active' ? 'Aktywna' : status === 'draft' ? 'Szkic' : 'Konserwacja'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Plan
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['free', 'starter', 'pro', 'enterprise'] as const).map((plan) => (
                    <button
                      key={plan}
                      type="button"
                      onClick={() => setFormData({ ...formData, plan })}
                      className={`px-3 py-2.5 border-2 rounded-xl text-xs font-medium transition-all ${
                        formData.plan === plan
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {plan.charAt(0).toUpperCase() + plan.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  {editingSite ? 'Zapisz zmiany' : 'Utwórz stronę'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
