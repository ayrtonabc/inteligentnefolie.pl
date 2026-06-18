import { useState, useEffect } from 'react'
import { 
  Brain, 
  Save, 
  Key, 
  Cpu, 
  Globe, 
  Zap, 
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { pb } from '@/lib/pocketbase'
import { useToast } from '@/components/Toast'

type AiProvider = 'openai' | 'anthropic' | 'google' | 'openrouter' | 'custom' | 'minimax' | 'minimax-pro'

interface AiConfig {
  provider: AiProvider
  apiKey: string
  model: string
  baseUrl?: string
  temperature: number
}

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', icon: Sparkles, color: 'text-emerald-500', url: 'https://platform.openai.com/' },
  { id: 'anthropic', name: 'Anthropic', icon: Brain, color: 'text-amber-600', url: 'https://console.anthropic.com/' },
  { id: 'google', name: 'Google Gemini', icon: Globe, color: 'text-blue-500', url: 'https://aistudio.google.com/' },
  { id: 'openrouter', name: 'OpenRouter', icon: Zap, color: 'text-violet-500', url: 'https://openrouter.ai/' },
  { id: 'minimax', name: 'MiniMax (Standard)', icon: Cpu, color: 'text-orange-500', url: 'https://www.minimaxi.com/' },
  { id: 'minimax-pro', name: 'MiniMax Pro (Token)', icon: Zap, color: 'text-pink-500', url: 'https://www.minimaxi.com/' },
  { id: 'custom', name: 'Custom (Local LLM)', icon: Cpu, color: 'text-slate-500', url: '' },
]

export default function AiSettings() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<AiConfig>({
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4o',
    temperature: 0.7
  })

  useEffect(() => {
    async function loadConfig() {
      try {
        const record = await pb.collection('site_settings').getFirstListItem('setting_key = "ai_config"')
        if (record?.setting_value) {
          setConfig(record.setting_value as unknown as AiConfig)
        }
      } catch (error) {
        console.error('Error loading AI config:', error)
      } finally {
        setLoading(false)
      }
    }
    loadConfig()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Find existing config
      let existingRecord;
      try {
        existingRecord = await pb.collection('site_settings').getFirstListItem('setting_key = "ai_config"');
      } catch (e) {
        // Not found
      }

      const data = {
        setting_key: 'ai_config',
        setting_value: config as any,
        setting_type: 'json',
        category: 'ai'
      };

      if (existingRecord) {
        await pb.collection('site_settings').update(existingRecord.id, data);
      } else {
        await pb.collection('site_settings').create(data);
      }

      toast.success('Konfiguracja AI zapisana pomyślnie')
    } catch (error: any) {
      toast.error(error.message || 'Błąd podczas zapisywania')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <span>Ustawienia</span>
        <ChevronRight size={14} />
        <span className="text-sky-600 font-medium">Mózg AI</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="text-sky-500" size={32} />
            Konfiguracja Inteligencji
          </h1>
          <p className="text-gray-500 mt-2">
            Zmień "mózg" swojego systemu. Podłącz preferowanego dostawcę AI i zarządzaj kluczami API.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white rounded-xl font-semibold transition-all shadow-lg shadow-sky-500/20"
        >
          {saving ? <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></div> : <Save size={18} />}
          Zapisz zmiany
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Providers */}
        <div className="md:col-span-1 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Dostawca AI</h3>
          {PROVIDERS.map((p) => {
            const Icon = p.icon
            const isActive = config.provider === p.id
            return (
              <button
                key={p.id}
                onClick={() => setConfig({ ...config, provider: p.id as AiProvider })}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                  isActive 
                    ? 'bg-white border-sky-500 shadow-md ring-1 ring-sky-500' 
                    : 'bg-gray-50 border-transparent hover:bg-white hover:border-gray-200'
                }`}
              >
                <div className={`p-2 rounded-xl ${isActive ? 'bg-sky-50' : 'bg-white'}`}>
                  <Icon size={20} className={isActive ? 'text-sky-500' : 'text-gray-400'} />
                </div>
                <div className="text-left">
                  <p className={`font-bold text-sm ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>{p.name}</p>
                </div>
                {isActive && <CheckCircle2 size={18} className="ml-auto text-sky-500" />}
              </button>
            )
          })}
        </div>

        {/* Right Column: Config */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="space-y-6">
              {/* API Key */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Key size={16} className="text-sky-500" />
                  Klucz API
                </label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-mono text-sm"
                  placeholder="sk-..."
                />
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[11px] text-gray-400">
                    Twój klucz jest przechowywany bezpiecznie i używany tylko do zapytań serwerowych.
                  </p>
                  {PROVIDERS.find(p => p.id === config.provider)?.url && (
                    <a 
                      href={PROVIDERS.find(p => p.id === config.provider)?.url} 
                      target="_blank" 
                      className="text-[11px] text-sky-500 hover:underline flex items-center gap-1"
                    >
                      Zdobądź klucz <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>

              {/* Model ID */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Cpu size={16} className="text-sky-500" />
                    Model ID
                  </label>
                  <input
                    type="text"
                    value={config.model}
                    onChange={(e) => setConfig({ ...config, model: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm"
                    placeholder={config.provider === 'openai' ? 'gpt-4o' : 'model-name'}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Zap size={16} className="text-sky-500" />
                    Temperatura
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={config.temperature}
                    onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Custom Base URL */}
              {config.provider === 'custom' && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Globe size={16} className="text-sky-500" />
                    Base URL (Endpoint)
                  </label>
                  <input
                    type="text"
                    value={config.baseUrl}
                    onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm"
                    placeholder="http://localhost:11434/v1"
                  />
                </div>
              )}

              {/* Info Box */}
              <div className="bg-sky-50 rounded-2xl p-5 flex items-start gap-4">
                <AlertCircle className="text-sky-500 shrink-0" size={20} />
                <div className="text-sm text-sky-800 leading-relaxed">
                  <p className="font-bold mb-1">Zalecenie:</p>
                  Dla najlepszej wydajności w języku polskim zalecamy modele <strong>GPT-4o</strong> (OpenAI) lub <strong>Claude 3.5 Sonnet</strong> (Anthropic).
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-3xl border border-amber-100 p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-amber-500">
              <Zap size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-900">Mózg jest gotowy</h4>
              <p className="text-xs text-amber-700 mt-1">
                Po zapisaniu, wszystkie funkcje AI (SEO, tłumaczenia, treści) będą korzystać z nowej konfiguracji.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
