import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 48
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 size={sizes[size]} className="animate-spin text-primary-600" />
    </div>
  )
}
