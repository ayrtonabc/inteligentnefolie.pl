import { useState, useEffect } from 'react'
import { Link, Plus, Trash2, Edit2, Save, X, ExternalLink, Globe } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import PageHeader from '@/components/PageHeader'
import { useToast } from '@/components/Toast'
import { pb, TENANT_ID } from '@/lib/pocketbase'

interface MenuItem {
  id: string
  label: string
  href: string
  order: number
}

export default function Menus() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newItem, setNewItem] = useState<{ label: string, href: string }>({ label: '', href: '' })
  const [websiteId, setWebsiteId] = useState<string | null>(TENANT_ID)
  const toast = useToast()

  useEffect(() => {
    fetchWebsiteAndMenu()
  }, [])

  async function fetchWebsiteAndMenu() {
    setLoading(true)
    try {
      const wid = TENANT_ID
      setWebsiteId(wid)

      const setting = await pb.collection('site_settings').getFirstListItem(
        `website_id = "${wid}" && setting_key = "main_menu"`
      ).catch(() => null)

      if (setting?.setting_value) {
        setItems(setting.setting_value as MenuItem[])
      } else {
        setItems([])
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function saveMenu(newItems: MenuItem[]) {
    if (!websiteId) return
    try {
      const existing = await pb.collection('site_settings').getFirstListItem(
        `website_id = "${websiteId}" && setting_key = "main_menu"`
      ).catch(() => null)

      const data = {
        website_id: websiteId,
        setting_key: 'main_menu',
        setting_value: newItems,
      }

      if (existing) {
        await pb.collection('site_settings').update(existing.id, data)
      } else {
        await pb.collection('site_settings').create(data)
      }

      setItems(newItems)
      toast.success('Menu zostało zaktualizowane.')
    } catch (err: any) {
      toast.error('Błąd zapisu: ' + err.message)
    }
  }

  const handleAdd = () => {
    if (!newItem.label || !newItem.href) {
      toast.error('Podaj nazwę i adres linku.')
      return
    }
    const nextOrder = items.length > 0 ? Math.max(...items.map(i => i.order)) + 1 : 0
    const item: MenuItem = {
      id: crypto.randomUUID(),
      label: newItem.label,
      href: newItem.href,
      order: nextOrder
    }
    const updated = [...items, item]
    saveMenu(updated)
    setNewItem({ label: '', href: '' })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten element menu?')) return
    const updated = items.filter(i => i.id !== id)
    saveMenu(updated)
  }

  const handleUpdate = (id: string, label: string, href: string) => {
    const updated = items.map(i => i.id === id ? { ...i, label, href } : i)
    saveMenu(updated)
    setEditingId(null)
  }

  if (loading) return <div className="p-8 text-center">Ładowanie menu...</div>

  return (
    <div className="page px-6 py-6 max-w-4xl mx-auto">
      <PageHeader 
        title="Nawigacja" 
        subtitle="Zarządzaj linkami w górnym menu swojej strony."
        icon={<Globe className="w-6 h-6 text-primary-600" />}
      />

      <div className="grid gap-6 mt-6">
        {/* ADD NEW ITEM */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plus size={18} className="text-blue-600" /> Dodaj nowy link
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Etykieta</label>
              <Input 
                placeholder="np. O nas" 
                value={newItem.label} 
                onChange={e => setNewItem({ ...newItem, label: e.target.value })} 
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Adres (URL)</label>
              <Input 
                placeholder="np. /o-nas lub https://..." 
                value={newItem.href} 
                onChange={e => setNewItem({ ...newItem, href: e.target.value })} 
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAdd} className="w-full sm:w-auto">Dodaj</Button>
            </div>
          </div>
        </div>

        {/* LIST ITEMS */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Etykieta</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Adres URL</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">
                      Brak elementów w menu. Dodaj pierwszy powyżej.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        {editingId === item.id ? (
                          <Input 
                            value={item.label} 
                            onChange={e => {
                              const val = e.target.value
                              setItems(items.map(i => i.id === item.id ? { ...i, label: val } : i))
                            }} 
                          />
                        ) : (
                          <span className="font-semibold text-gray-900">{item.label}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === item.id ? (
                          <Input 
                            value={item.href} 
                            onChange={e => {
                              const val = e.target.value
                              setItems(items.map(i => i.id === item.id ? { ...i, href: val } : i))
                            }} 
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="truncate max-w-[150px]">{item.href}</span>
                            {item.href.startsWith('http') && <ExternalLink size={12} />}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {editingId === item.id ? (
                            <>
                              <button 
                                onClick={() => handleUpdate(item.id, item.label, item.href)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                title="Zapisz"
                              >
                                <Save size={18} />
                              </button>
                              <button 
                                onClick={() => setEditingId(null)}
                                className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
                                title="Anuluj"
                              >
                                <X size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => setEditingId(item.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Edytuj"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Usuń"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* HELP BOX */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <div className="flex gap-4">
            <div className="p-2 bg-blue-100 rounded-lg h-fit">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-blue-900 mb-1">Jak to działa?</h4>
              <p className="text-sm text-blue-700 leading-relaxed">
                Zmiany wprowadzone tutaj pojawią się natychmiastowo w menu głównym Twojej strony. 
                Możesz używać adresów wewnętrznych (np. <strong>/blog</strong>) lub pełnych linków (np. <strong>https://facebook.com</strong>).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
