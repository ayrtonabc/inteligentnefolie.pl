import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  Globe, 
  MoreHorizontal,
  Grid3X3,
  Trash2,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { 
  useWebsiteId,
  useWebsiteLanguages,
  useTranslationProgress,
  useAddWebsiteLanguage,
  useRemoveWebsiteLanguage,
  useSetDefaultLanguage,
} from '@/features/languages/hooks'

const FLAGS: Record<string, string> = {
  pl: 'https://flagcdn.com/w40/pl.png',
  en: 'https://flagcdn.com/w40/gb.png',
  es: 'https://flagcdn.com/w40/es.png',
  de: 'https://flagcdn.com/w40/de.png',
  uk: 'https://flagcdn.com/w40/ua.png',
  cz: 'https://flagcdn.com/w40/cz.png',
  fr: 'https://flagcdn.com/w40/fr.png',
  it: 'https://flagcdn.com/w40/it.png',
  nl: 'https://flagcdn.com/w40/nl.png',
  ru: 'https://flagcdn.com/w40/ru.png',
}

function FlagCircle({ code, size = 'md' }: { code: string; size?: 'sm' | 'md' | 'lg' }) {
  const flagUrl = FLAGS[code.toLowerCase()] || `https://flagcdn.com/w40/un.png`
  const sizeClass = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10'
  return (
    <img 
      src={flagUrl} 
      alt={code}
      className={`${sizeClass} rounded-full object-cover border border-gray-200`}
    />
  )
}

function InstalledLanguageCard({ 
  progress, 
  onRemove, 
  onSetDefault,
  onContinue 
}: { 
  progress: any
  onRemove: () => void
  onSetDefault: () => void
  onContinue: () => void
}) {
  const navigate = useNavigate()
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <FlagCircle code={progress.language_code} size="lg" />
          <div>
            <h3 className="font-semibold text-gray-900">{progress.language_name}</h3>
            <p className="text-xs text-gray-500 uppercase">{progress.language_code}</p>
          </div>
        </div>
        {!progress.is_default && (
          <button 
            onClick={onRemove}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-500">Postęp tłumaczenia</span>
          <span className="font-semibold text-gray-900">{progress.progress_percentage}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-sky-600 rounded-full transition-all"
            style={{ width: `${progress.progress_percentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button 
          onClick={onContinue}
          className="text-sm font-medium text-sky-700 hover:text-sky-800 flex items-center gap-1 transition-colors"
        >
          Tłumacz z AI
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function AutoTranslateCard({ onTranslate }: { onTranslate: () => void }) {
  return (
    <div className="bg-sky-700 rounded-2xl p-6 text-white h-full flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-semibold mb-2">Auto-Tłumaczenie</h3>
        <p className="text-sky-100 text-sm leading-relaxed mb-4">
          Przetłumacz całą witrynę w kilka sekund przy użyciu AI.
        </p>
      </div>
      <button 
        onClick={onTranslate}
        className="w-full py-3 bg-white text-sky-700 font-semibold rounded-xl hover:bg-sky-50 transition-colors"
      >
        Uruchom teraz
      </button>
    </div>
  )
}

function AddLanguageModal({ 
  isOpen, 
  onClose, 
  onAdd 
}: { 
  isOpen: boolean
  onClose: () => void
  onAdd: (languageId: string) => void
}) {
  const { data: websiteLanguages = [] } = useWebsiteLanguages('' as any)
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Dodaj język</h2>
          <p className="text-gray-600 mt-1">Wybierz język do aktywacji na swojej stronie</p>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <div className="text-center py-8 text-gray-500">
            <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Użyj przycisku "Dodaj język" poniżej, aby aktywować nowy język.</p>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <Button variant="outline" onClick={onClose}>Zamknij</Button>
        </div>
      </div>
    </div>
  )
}

export function LanguagesPage() {
  const navigate = useNavigate()
  const { data: websiteId } = useWebsiteId()
  const { data: progress = [], isLoading } = useTranslationProgress(websiteId || '')
  const { data: websiteLanguages = [] } = useWebsiteLanguages(websiteId || '')
  
  const [showAddModal, setShowAddModal] = useState(false)
  
  const addLanguage = useAddWebsiteLanguage(websiteId || '')
  const removeLanguage = useRemoveWebsiteLanguage()
  const setDefault = useSetDefaultLanguage()

  const handleAddLanguage = async (languageId: string) => {
    try {
      await addLanguage.mutateAsync({
        language_id: languageId,
        is_active: true,
      })
      setShowAddModal(false)
    } catch (error) {
      alert('Błąd podczas dodawania języka')
    }
  }

  const handleRemove = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten język?')) return
    try {
      await removeLanguage.mutateAsync(id)
    } catch (error) {
      alert('Błąd podczas usuwania języka')
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await setDefault.mutateAsync({ id, websiteId: websiteId || '' })
    } catch (error) {
      alert('Błąd podczas ustawiania języka domyślnego')
    }
  }

  const handleAutoTranslate = () => {
    navigate('/languages/translate')
  }

  const mainLanguage = progress.find(p => p.language_code === 'pl') || progress.find(p => p.is_default);
  const additionalLanguages = progress.filter(p => !p.is_default)
  const additionalCount = additionalLanguages.length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-12 gap-6 mb-10">
        <div className="col-span-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 h-full">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-2">
                  GŁÓWNY JĘZYK
                </p>
                {mainLanguage ? (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <FlagCircle code={mainLanguage.language_code} size="lg" />
                      <h1 className="text-3xl font-bold text-gray-900">
                        {mainLanguage.language_name}
                      </h1>
                    </div>
                    <p className="text-gray-600">
                      Twoja witryna jest domyślnie wyświetlana w tym języku.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <FlagCircle code="pl" size="lg" />
                      <h1 className="text-3xl font-bold text-gray-900">Polski</h1>
                    </div>
                    <p className="text-gray-600">
                      Twoja witryna jest domyślnie wyświetlana w tym języku.
                    </p>
                  </>
                )}
              </div>
              
              
            </div>
          </div>
        </div>
        
        <div className="col-span-4">
          <AutoTranslateCard onTranslate={handleAutoTranslate} />
        </div>
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Zainstalowane języki</h2>
            <p className="text-gray-600">Zarządzaj statusami i edytuj poszczególne frazy.</p>
          </div>
        </div>
        
        {progress.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Brak aktywnych języków</h3>
            <p className="text-gray-500">Brak dostępnych języków do wyświetlenia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {progress.filter(p => !p.is_default && p.language_code !== 'pl').map((p) => (
              <InstalledLanguageCard
                key={p.language_code}
                progress={p}
                onRemove={() => {
                  const wl = websiteLanguages.find((w: any) => w.language?.code === p.language_code)
                  if (wl) handleRemove(wl.id)
                }}
                onSetDefault={() => {
                  const wl = websiteLanguages.find((w: any) => w.language?.code === p.language_code)
                  if (wl) handleSetDefault(wl.id)
                }}
                onContinue={() => navigate(`/languages/translate?lang=${p.language_code}`)}
              />
            ))}
          </div>
        )}
      </div>

      <AddLanguageModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onAdd={handleAddLanguage} 
      />
    </div>
  )
}