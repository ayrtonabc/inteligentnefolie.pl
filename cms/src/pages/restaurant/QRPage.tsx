import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Download, 
  QrCode,
  Plus,
  Trash2,
  Users,
  StickyNote
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useWebsiteId, useTables, useCreateTable, useDeleteTable } from '@/features/restaurant/hooks'

export default function QRPage() {
  const { data: websiteId } = useWebsiteId()
  const { data: tables = [], refetch } = useTables(websiteId || '')
  const createTable = useCreateTable(websiteId || '')
  const deleteTable = useDeleteTable(websiteId || '')

  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [qrSize, setQrSize] = useState(200)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ number: '', capacity: 4, notes: '' })

  const getQrUrl = (tableId: string) => {
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    const url = base + '/menu?table=' + tableId
    return 'https://api.qrserver.com/v1/create-qr-code/?size=' + qrSize + 'x' + qrSize + '&data=' + encodeURIComponent(url)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.number.trim()) return
    try {
      await createTable.mutateAsync({ number: formData.number, capacity: formData.capacity, notes: formData.notes })
      setShowModal(false)
      setFormData({ number: '', capacity: 4, notes: '' })
      refetch()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Usunąć stolik?')) return
    try {
      await deleteTable.mutateAsync(id)
      if (selectedTable === id) setSelectedTable(null)
      refetch()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const selected = tables.find(t => t.id === selectedTable)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/restaurant">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">QR Stoliki</h1>
            <p className="text-sm text-gray-500">{tables.length} stolików</p>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Nowy stolik
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {tables.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <QrCode className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Brak stolików</p>
                  <p className="text-sm">Utwórz pierwszy stolik</p>
                </div>
              ) : tables.map(table => (
                <div 
                  key={table.id}
                  onClick={() => setSelectedTable(table.id)}
                  className={'p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors ' + (selectedTable === table.id ? 'bg-blue-50' : '')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <span className="font-bold text-blue-700">{table.number}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Stolik {table.number}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {table.capacity} osób
                        {table.notes && (
                          <>
                            <StickyNote className="w-3 h-3 ml-2" /> {table.notes}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(table.id) }}
                    className="p-2 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Kod QR</h2>
            </div>
            <div className="p-4">
              {selected ? (
                <div className="text-center space-y-4">
                  <img 
                    src={getQrUrl(selected.id)}
                    alt="QR"
                    className="mx-auto border rounded-lg"
                  />
                  <div className="flex justify-center gap-2">
                    {[150, 200, 250].map(s => (
                      <button 
                        key={s} 
                        onClick={() => setQrSize(s)} 
                        className={'px-3 py-1 rounded-lg text-sm ' + (qrSize === s ? 'bg-blue-100 text-blue-700' : 'bg-gray-100')}
                      >
                        {s}px
                      </button>
                    ))}
                  </div>
                  <a 
                    href={getQrUrl(selected.id)}
                    download={'stolik-' + selected.number + '.png'}
                    className="block w-full py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700"
                  >
                    <Download className="w-4 h-4 inline mr-2" />Pobierz PNG
                  </a>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <QrCode className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Wybierz stolik</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleCreate} className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Nowy stolik</h3>
            <Input
              value={formData.number}
              onChange={e => setFormData({ ...formData, number: e.target.value })}
              placeholder="Numer stolika (np. 1, A1, VIP)"
              autoFocus
            />
            <div>
              <label className="block text-sm text-gray-500 mb-1">Pojemność (osoby)</label>
              <Input
                type="number"
                min="1"
                value={formData.capacity}
                onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
              />
            </div>
            <Input
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notatka (opcjonalnie)"
            />
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">Anuluj</Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">Utwórz</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}