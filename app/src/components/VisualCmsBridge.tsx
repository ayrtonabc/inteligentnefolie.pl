'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function VisualCmsBridge() {
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('visual_edit') === 'true';
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditMode) return;

    // 1. LISTEN FOR MESSAGES FROM CMS PARENT
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'cms:select') {
        setSelectedKey(event.data.sectionKey);
        scrollToElement(event.data.sectionKey);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Notify parent that I'm ready
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'cms:iframe-ready' }, '*');
    }

    return () => window.removeEventListener('message', handleMessage);
  }, [isEditMode]);

  // 2. HIGHLIGHT SELECTED ELEMENT
  useEffect(() => {
    if (!isEditMode) return;

    // Remove old highlights
    document.querySelectorAll('.cms-highlight').forEach(el => {
      (el as HTMLElement).style.outline = '';
      el.classList.remove('cms-highlight');
    });

    if (selectedKey) {
      const element = document.querySelector(`[data-cms-key="${selectedKey}"]`);
      if (element) {
        (element as HTMLElement).style.outline = '3px solid #3b82f6';
        (element as HTMLElement).style.outlineOffset = '2px';
        element.classList.add('cms-highlight');
      }
    }
  }, [selectedKey, isEditMode]);

  // 3. HANDLE CLICKS ON EDITABLE ELEMENTS (Notify CMS)
  useEffect(() => {
    if (!isEditMode) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const editable = target.closest('[data-cms-key]');
      
      if (editable) {
        e.preventDefault();
        e.stopPropagation();
        const key = editable.getAttribute('data-cms-key');
        if (key) {
          setSelectedKey(key);
          window.parent.postMessage({ 
            type: 'cms:element-selected', 
            sectionKey: key 
          }, '*');
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [isEditMode]);

  const scrollToElement = (key: string) => {
    const element = document.querySelector(`[data-cms-key="${key}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (!isEditMode) return null;

  return (
    <>
      <style jsx global>{`
        [data-cms-key] {
          cursor: pointer !important;
          transition: outline 0.2s ease-in-out;
        }
        [data-cms-key]:hover {
          outline: 2px dashed #3b82f6 !important;
          outline-offset: 1px;
        }
      `}</style>
    </>
  );
}
