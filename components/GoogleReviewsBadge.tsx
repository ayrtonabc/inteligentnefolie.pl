'use client';

import { Star } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { getTranslation } from '@/lib/translations';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

interface GoogleReviewsBadgeProps {
  className?: string;
  showReviewsCount?: boolean;
  reviewsCount?: number;
  rating?: number;
}

export default function GoogleReviewsBadge({ 
  className = '', 
  showReviewsCount = true,
  reviewsCount = 130,
  rating = 5
}: GoogleReviewsBadgeProps) {
  const { language } = useLanguage();
  
  const reviewsText = getTranslation(language, 'reviews.google') || `${reviewsCount} opinii Google`;
  const ratingText = getTranslation(language, 'reviews.rating') || `${rating}.0/5`;

  return (
    <a 
      href="https://www.google.com/maps/place/Inteligentne+Folie/@51.9185376,19.1451364,17z/data=!4m8!3m7!1s0x471cac3b4c5b4a4b:0x8c9b1e23f5f5c0a5!8m2!3d51.9185376!4d19.1451364!9m1!8s!16s%2Fg%2F11hx3l8z9j?entry=ttu&g_ep=EgoyMDI1MDUxMi4wIKXMDSoASAFQAw%3D%3D"
      target="_blank" 
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-3 bg-white px-5 py-3 rounded-full border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 ${className}`}
    >
      <GoogleIcon />
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-gray-900">Google</span>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star 
                key={s} 
                fill="currentColor" 
                className="text-[#FBBC05]" 
                strokeWidth={0} 
                size={14} 
              />
            ))}
          </div>
          <span className="text-sm font-bold text-gray-900">{rating}.0</span>
        </div>
      </div>
      {showReviewsCount && (
        <div className="border-l border-gray-200 pl-3">
          <span className="text-sm font-medium text-gray-700">{reviewsCount}+</span>
          <p className="text-[10px] text-gray-500 leading-tight">{reviewsText}</p>
        </div>
      )}
    </a>
  );
}
