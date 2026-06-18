import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

interface StarPickerProps {
  value?: number
  onChange?: (value: number) => void
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function StarPicker({ value = 0, onChange, disabled, className, size = 'md' }: StarPickerProps) {
  const [hoverValue, setHoverValue] = useState(0)

  const sizes = {
    sm: 'size-4',
    md: 'size-6',
    lg: 'size-8',
  }

  return (
    <div className={cn('flex items-center gap-1', disabled && 'opacity-50 cursor-not-allowed', className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className={cn(
            'p-0.5 hover:scale-110 transition',
            !disabled && 'cursor-pointer'
          )}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !disabled && setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
        >
          <Star
            className={cn(
              sizes[size],
              (hoverValue || value) >= star
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300'
            )}
          />
        </button>
      ))}
    </div>
  )
}
