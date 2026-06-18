import { TrendingUp, TrendingDown, DollarSign, Activity, LineChart, Users, Search } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  helper?: string
  badge?: string
  linkLabel?: string
  linkHref?: string
  // legacy props kept for compatibility (ignored in minimalist design)
  change?: number
  changeLabel?: string
  icon?: 'trending-up' | 'trending-down' | 'dollar' | 'activity' | 'line' | 'users' | 'search'
  color?: 'blue' | 'green' | 'purple' | 'amber'
}

export default function StatsCard({ 
  title, 
  value, 
  subtitle,
  helper,
  badge,
  linkLabel,
  linkHref,
  icon = 'line',
  color = 'blue'
}: StatsCardProps) {
  const icons = {
    'trending-up': TrendingUp,
    'trending-down': TrendingDown,
    'dollar': DollarSign,
    'activity': Activity,
    'line': LineChart,
    'users': Users,
    'search': Search,
  }

  const tints = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-100', fg: 'text-blue-600' },
    green: { bg: 'bg-green-50', border: 'border-green-100', fg: 'text-green-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-100', fg: 'text-purple-600' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-100', fg: 'text-amber-600' },
  }

  const Icon = icons[icon]
  const tone = tints[color]

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm text-gray-600">{title}</div>
          <div className="mt-1 text-3xl font-bold text-gray-900">{value}</div>
          {subtitle && <div className="mt-1 text-xs text-gray-500">{subtitle}</div>}
          {badge && (
            <span className="inline-flex items-center px-2 py-1 mt-2 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
              {badge}
            </span>
          )}
          {helper && <div className="mt-2 text-xs text-gray-500">{helper}</div>}
          {linkLabel && linkHref && (
            <a href={linkHref} className="mt-2 inline-block text-sm font-semibold text-blue-700 hover:text-blue-800">
              {linkLabel} →
            </a>
          )}
        </div>
        <div className={`p-3 rounded-xl ${tone.bg} ${tone.border} border`}>
          <Icon size={22} className={tone.fg} />
        </div>
      </div>
    </div>
  )
}
