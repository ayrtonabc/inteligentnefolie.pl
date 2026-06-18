'use client';

import { useState, useRef, useEffect, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt: string;
  afterAlt: string;
}

export default function BeforeAfterSlider({ 
  beforeImage, 
  afterImage, 
  beforeAlt, 
  afterAlt,
  ...props
}: BeforeAfterSliderProps & { [key: string]: any }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    let position = (x / width) * 100;
    position = Math.max(0, Math.min(100, position));
    setSliderPosition(position);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleTouchEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden cursor-ew-resize select-none group touch-manipulation"
      onMouseDown={(e) => { setIsDragging(true); handleMove(e.clientX); }}
      onTouchStart={(e) => { setIsDragging(true); handleMove(e.touches[0].clientX); }}
      {...props}
    >
      <Image src={afterImage} alt={afterAlt} fill className="object-cover pointer-events-none" priority />

      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image src={beforeImage} alt={beforeAlt} fill className="object-cover" priority />
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-black/50 sm:bg-black/40 backdrop-blur-md text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wider border border-white/20 shadow-lg">
          ON
        </div>
      </div>

      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white/90 sm:bg-white/90 backdrop-blur-md text-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wider border border-black/10 shadow-lg z-0">
        OFF
      </div>

      <div 
        className="absolute top-0 bottom-0 w-0.5 sm:w-1 bg-white cursor-ew-resize z-20 flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ left: `calc(${sliderPosition}% - 1px)` }}
      >
        <div className={`w-12 h-12 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-2xl border-2 border-gray-200 transition-transform duration-200 touch-none ${isDragging ? 'scale-110' : 'scale-100 group-hover:scale-110'}`}>
          <ChevronLeft size={16} className="text-gray-500 -mr-1" />
          <ChevronRight size={16} className="text-gray-500 -ml-1" />
        </div>
      </div>
    </div>
  );
}
