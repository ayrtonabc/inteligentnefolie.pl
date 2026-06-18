import { X, ExternalLink } from 'lucide-react'
import { Project } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface PreviewModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
}

export default function PreviewModal({ project, isOpen, onClose }: PreviewModalProps) {
  if (!isOpen) return null

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Aktywny',
      completed: 'Ukończony',
      pending: 'Oczekujący'
    }
    return labels[status as keyof typeof labels] || status
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-500',
      completed: 'bg-blue-500',
      pending: 'bg-yellow-500'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/70" onClick={onClose} />
        
        <div className="relative bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">Podgląd projektu</h2>
              <span className="text-sm text-gray-400">Tak będzie wyglądać na landing page</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`http://localhost:5173/projects/${project.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <ExternalLink size={16} />
                Otwórz na stronie
              </a>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Preview Content - Simula el diseño de la landing */}
          <div className="p-8">
            {/* Hero Image */}
            <div className="relative h-96 rounded-2xl overflow-hidden mb-8">
              <img
                src={project.image || '/images/imagen1.jpg'}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 left-6">
                <span className="bg-white/90 backdrop-blur-md text-slate-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  {project.category}
                </span>
              </div>
              <div className="absolute bottom-6 left-6">
                <span className={`${getStatusColor(project.status)} text-white px-4 py-2 rounded-full text-sm font-bold`}>
                  {getStatusLabel(project.status)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="text-white space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-4">{project.title}</h1>
                <p className="text-lg text-gray-300 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-800 rounded-xl">
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Budżet</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {formatCurrency(project.budget)}
                  </p>
                </div>
                <div className="text-center border-x border-slate-700">
                  <p className="text-sm text-gray-400 mb-2">Status</p>
                  <p className="text-2xl font-bold text-white">
                    {getStatusLabel(project.status)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Kategoria</p>
                  <p className="text-2xl font-bold text-white">
                    {project.category}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="flex gap-6 p-6 bg-slate-800 rounded-xl">
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">Data rozpoczęcia</p>
                  <p className="text-lg font-semibold text-white">
                    {new Date(project.startDate).toLocaleDateString('pl-PL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                {project.endDate && (
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">Data zakończenia</p>
                    <p className="text-lg font-semibold text-white">
                      {new Date(project.endDate).toLocaleDateString('pl-PL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="flex gap-4 pt-6">
                <button className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-all">
                  Zapytaj o projekt
                </button>
                <button className="px-8 py-4 border border-amber-500/60 text-amber-400 font-semibold rounded-lg hover:bg-amber-500/10 transition-colors">
                  Więcej informacji
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
