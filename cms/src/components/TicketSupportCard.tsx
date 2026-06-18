import { useState, useEffect } from 'react'
import { Bug, MessageSquare, Send, X, CheckCircle, AlertCircle, FileText } from 'lucide-react'

interface TicketFormData {
  type: 'bug' | 'feature' | 'support'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
}

interface TicketSupportCardProps {
  inline?: boolean
}

export function TicketSupportCard({ inline = true }: TicketSupportCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState<TicketFormData>({
    type: 'bug',
    title: '',
    description: '',
    priority: 'medium'
  })

  // Escuchar evento desde el Sidebar
  useEffect(() => {
    console.log('TicketSupportCard: montado, escuchando evento...')
    const handleOpenTicketModal = () => {
      console.log('TicketSupportCard: evento open-ticket-modal recibido!')
      setIsModalOpen(true)
    }
    window.addEventListener('open-ticket-modal', handleOpenTicketModal)
    return () => {
      console.log('TicketSupportCard: desmontado, eliminando listener')
      window.removeEventListener('open-ticket-modal', handleOpenTicketModal)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí se enviaría el ticket al backend
    console.log('Ticket enviado:', formData)
    setIsSubmitted(true)
    
    // Reset después de 3 segundos
    setTimeout(() => {
      setIsSubmitted(false)
      setIsModalOpen(false)
      setFormData({ type: 'bug', title: '', description: '', priority: 'medium' })
    }, 3000)
  }

  return (
    <>
      {/* Card en el dashboard - solo cuando inline=true */}
      {inline && (
        <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl p-6 relative border border-rose-100">
          <div className="absolute top-4 right-4">
            <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center shadow-lg">
              <Bug className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-rose-600" />
            <h3 className="font-semibold text-gray-900">Zgłoś problem</h3>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Znalazłeś błąd lub masz sugestię? Nasz zespół developerski pomoże Ci rozwiązać problem.
          </p>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-sm font-medium text-rose-600 hover:text-rose-700 underline"
          >
            Utwórz zgłoszenie
          </button>
        </div>
      )}

      {/* Modal del formulario */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                  <Bug className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Nowe zgłoszenie</h3>
                  <p className="text-sm text-gray-500">Opisz problem, który napotkałeś</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Formulario */}
            {isSubmitted ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Zgłoszenie wysłane!</h4>
                <p className="text-sm text-gray-600">
                  Dziękujemy za informację. Nasz zespół zweryfikuje zgłoszenie i skontaktuje się z Tobą.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Tipo de ticket */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Typ zgłoszenia
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'bug', label: 'Błąd', icon: Bug },
                      { key: 'feature', label: 'Sugestia', icon: FileText },
                      { key: 'support', label: 'Pomoc', icon: MessageSquare }
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: key as TicketFormData['type'] })}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          formData.type === key
                            ? 'border-rose-500 bg-rose-50 text-rose-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prioridad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorytet
                  </label>
                  <div className="flex gap-2">
                    {[
                      { key: 'low', label: 'Niski', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                      { key: 'medium', label: 'Średni', color: 'bg-amber-100 text-amber-700 border-amber-200' },
                      { key: 'high', label: 'Wysoki', color: 'bg-rose-100 text-rose-700 border-rose-200' }
                    ].map(({ key, label, color }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: key as TicketFormData['priority'] })}
                        className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          formData.priority === key
                            ? color
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tytuł <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Krótki opis problemu"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opis <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Opisz szczegółowo: co się stało, jakie były kroki, co oczekiwałeś..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    <AlertCircle className="w-3 h-3 inline mr-1" />
                    Im więcej szczegółów, tym szybciej rozwiążemy problem
                  </p>
                </div>

                {/* Botones */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Wyślij zgłoszenie
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
