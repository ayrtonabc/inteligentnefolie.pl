import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Save, 
  CreditCard, 
  Banknote, 
  Smartphone,
  QrCode,
  Check,
  AlertCircle,
  Store
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { pb, TENANT_ID } from '@/lib/pocketbase'

interface PaymentSettings {
  id?: string
  website_id: string
  cash_enabled: boolean
  card_enabled: boolean
  transfer_enabled: boolean
  qr_payment_enabled: boolean
  restaurant_name: string
}

export default function RestaurantSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>({
    website_id: TENANT_ID,
    cash_enabled: true,
    card_enabled: true,
    transfer_enabled: false,
    qr_payment_enabled: false,
    restaurant_name: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const records = await pb.collection('restaurant_settings').getFullList({
          filter: `website_id = "${TENANT_ID}"`,
          requestKey: null
        })
        if (records.length > 0) {
          setSettings(records[0] as unknown as PaymentSettings)
        }
      } catch (err) {
        console.log('Settings not found')
      } finally {
        setIsLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      const existing = await pb.collection('restaurant_settings').getFullList({
        filter: `website_id = "${TENANT_ID}"`,
        requestKey: null
      })
      
      if (existing.length > 0) {
        await pb.collection('restaurant_settings').update(existing[0].id, settings)
      } else {
        await pb.collection('restaurant_settings').create(settings)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError('Błąd zapisu')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const PaymentToggle = ({ 
    enabled, 
    onClick, 
    icon: Icon, 
    title, 
    description,
    color 
  }: { 
    enabled: boolean
    onClick: () => void
    icon: any
    title: string
    description: string
    color: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
        enabled 
          ? `bg-${color}-50 border-${color}-300` 
          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${enabled ? `bg-${color}-100` : 'bg-gray-100'}`}>
          <Icon className={`w-5 h-5 ${enabled ? `text-${color}-600` : 'text-gray-400'}`} />
        </div>
        <div className="text-left">
          <p className={`font-medium ${enabled ? 'text-gray-900' : 'text-gray-500'}`}>{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
        enabled 
          ? `bg-${color}-500 border-${color}-500` 
          : 'border-gray-300'
      }`}>
        {enabled && <Check className="w-4 h-4 text-white" />}
      </div>
    </button>
  )

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
            <h1 className="text-xl font-bold text-gray-900">Ustawienia</h1>
            <p className="text-sm text-gray-500">Konfiguracja restauracji</p>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className={saved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Zapisywanie...' : saved ? 'Zapisano!' : 'Zapisz'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600" />
            Informacje
          </h2>
        </div>
        <div className="p-4">
          <Input
            value={settings.restaurant_name}
            onChange={(e) => setSettings({ ...settings, restaurant_name: e.target.value })}
            placeholder="Nazwa restauracji..."
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Metody płatności
          </h2>
        </div>
        <div className="p-4 space-y-3">
          <PaymentToggle
            enabled={settings.cash_enabled}
            onClick={() => setSettings({ ...settings, cash_enabled: !settings.cash_enabled })}
            icon={Banknote}
            title="Gotówka"
            description="Płatność przy odbiorze"
            color="amber"
          />
          <PaymentToggle
            enabled={settings.card_enabled}
            onClick={() => setSettings({ ...settings, card_enabled: !settings.card_enabled })}
            icon={CreditCard}
            title="Karta"
            description="Terminal płatniczy"
            color="blue"
          />
          <PaymentToggle
            enabled={settings.transfer_enabled}
            onClick={() => setSettings({ ...settings, transfer_enabled: !settings.transfer_enabled })}
            icon={Smartphone}
            title="BLIK / Przelew"
            description="Płatność online"
            color="purple"
          />
          <PaymentToggle
            enabled={settings.qr_payment_enabled}
            onClick={() => setSettings({ ...settings, qr_payment_enabled: !settings.qr_payment_enabled })}
            icon={QrCode}
            title="Kod QR"
            description="Skanuj kod do zapłaty"
            color="cyan"
          />
        </div>
      </div>
    </div>
  )
}