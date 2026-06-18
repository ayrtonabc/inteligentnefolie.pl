'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface AnimatedSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt: string;
  afterAlt: string;
  duration?: number;
}

export default function AnimatedSlider({ 
  beforeImage, 
  afterImage, 
  beforeAlt, 
  afterAlt,
  duration = 4000,
}: AnimatedSliderProps) {
  const [progress, setProgress] = useState(0);
  const directionRef = useRef<'down' | 'up'>('down');
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  useEffect(() => {
    const stepDuration = duration / 100;
    
    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - lastTimeRef.current;
      
      if (elapsed >= stepDuration) {
        lastTimeRef.current = timestamp;
        
        setProgress(prev => {
          if (directionRef.current === 'down') {
            if (prev >= 100) {
              directionRef.current = 'up';
              return 99;
            }
            return prev + 1;
          } else {
            if (prev <= 0) {
              directionRef.current = 'down';
              return 1;
            }
            return prev - 1;
          }
        });
      }
      
      rafRef.current = requestAnimationFrame(animate);
    };
    
    rafRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [duration]);
  
  const showBeforeOnRight = progress > 50;
  const dividerPercent = 100 - progress;

  return (
    <div className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden select-none">
      <Image 
        src={afterImage} 
        alt={afterAlt} 
        fill 
        className="object-cover" 
        priority
      />
      
      <div 
        className="absolute inset-0"
        style={{ 
          clipPath: `inset(0 ${dividerPercent}% 0 0)` 
        }}
      >
        <Image 
          src={beforeImage} 
          alt={beforeAlt} 
          fill 
          className="object-cover" 
          priority
        />
      </div>

      <div 
        className="absolute top-0 bottom-0 bg-white z-20 flex items-center justify-center"
        style={{ 
          left: `${progress}%`,
          width: '2px',
          transform: 'translateX(-50%)'
        }}
      >
        <div className="w-10 h-10 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-2xl border-2 border-gray-200">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 5l-5 7 5 7"/>
            <path d="M16 5l5 7-5 7"/>
          </svg>
        </div>
      </div>

      <div className={`absolute bottom-4 left-6 bg-black/60 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wider border border-white/20 shadow-lg transition-opacity duration-300 ${showBeforeOnRight ? 'opacity-100' : 'opacity-40'}`}>
        ON
      </div>

      <div className={`absolute bottom-4 right-6 bg-white/90 backdrop-blur-md text-black px-4 py-1.5 rounded-full text-xs font-bold tracking-wider border border-black/10 shadow-lg transition-opacity duration-300 ${!showBeforeOnRight ? 'opacity-100' : 'opacity-40'}`}>
        OFF
      </div>
    </div>
  );
}