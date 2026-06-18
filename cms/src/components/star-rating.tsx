import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

const MAX_RATING = 5

interface StarRatingProps {
  rating: number
  className?: string
  iconClassName?: string
  showValue?: boolean
  count?: number
}

export function StarRating({ rating, className, iconClassName, showValue, count }: StarRatingProps) {
  const safeRating = Math.max(0, Math.min(rating, MAX_RATING))

  return (
    <div className={cn('flex items-center gap-x-0.5', className)}>
      {Array.from({ length: MAX_RATING }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            'size-4',
            index < safeRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300',
            iconClassName
          )}
        />
      ))}
      {showValue && (
        <span className="text-sm font-medium text-gray-700 ml-1.5">
          {safeRating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs text-gray-400 ml-1">
          ({count})
        </span>
      )}
    </div>
  )
}
