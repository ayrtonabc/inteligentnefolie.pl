import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export function Card({ 
  children, 
  className = '', 
  hover = true,
  padding = 'md',
  onClick 
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-2xl border border-gray-100 overflow-hidden
        ${padding !== 'none' ? paddingClasses[padding] : ''}
        ${hover ? 'hover:shadow-lg hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200' : 'transition-all duration-200'}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  change?: {
    value: number
    label?: string
  }
  className?: string
  onClick?: () => void
}

export function StatCard({ icon, label, value, change, className = '', onClick }: StatCardProps) {
  const isPositive = change && change.value >= 0
  
  return (
    <Card className={className} onClick={onClick}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <svg className={`w-3 h-3 ${isPositive ? '' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span>{isPositive ? '+' : ''}{change.value}%</span>
              {change.label && <span className="text-gray-400 ml-1">{change.label}</span>}
            </div>
          )}
        </div>
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
          {icon}
        </div>
      </div>
    </Card>
  )
}

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in ${className}`}>
      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 text-gray-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn btn-primary"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

interface BadgeProps {
  children: ReactNode
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'gray'
  className?: string
}

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  const variants = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    gray: 'bg-gray-100 text-gray-600'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

interface ProgressBarProps {
  value: number
  max?: number
  variant?: 'primary' | 'success' | 'warning' | 'danger'
  showLabel?: boolean
  className?: string
}

export function ProgressBar({ 
  value, 
  max = 100, 
  variant = 'primary', 
  showLabel = true,
  className = '' 
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)
  
  const variants = {
    primary: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-amber-600',
    danger: 'bg-red-600'
  }

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600">{value}/{max}</span>
          <span className="text-xs font-semibold text-gray-900">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${variants[variant]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface SkeletonProps {
  variant?: 'text' | 'circle' | 'rect'
  width?: string
  height?: string
  className?: string
}

export function Skeleton({ variant = 'text', width, height, className = '' }: SkeletonProps) {
  const baseClasses = 'bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]'
  
  const variantClasses = {
    text: 'h-4 rounded',
    circle: 'rounded-full',
    rect: 'rounded-lg'
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    />
  )
}

export function CardSkeleton() {
  return (
    <Card hover={false}>
      <Skeleton variant="rect" height="200px" className="mb-4" />
      <Skeleton className="mb-2" />
      <Skeleton width="70%" />
    </Card>
  )
}
