'use client';

import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import { getPageContentValue, PageData } from '@/lib/pageData';

export default function FloatingChat({ pageData }: { pageData?: PageData | null }) {
  const [showMessage, setShowMessage] = useState(true);
  const rawPhone = getPageContentValue(pageData, 'header_phone_2', '+48 790 555 900') || '+48 790 555 900';
  const waPhone = rawPhone.replace(/\+/g, '').replace(/\s/g, '');

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-end gap-3">
      {showMessage && (
        <div className="relative bg-white rounded-2xl shadow-lg p-4 max-w-xs mb-2">
          <button onClick={() => setShowMessage(false)} className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition"><X size={12} /></button>
          <p className="text-sm text-gray-700">{getPageContentValue(pageData, 'home_floatingchat_desc_36', 'Masz pytanie? Napisz do nas!')}</p>
          <div 
            className="absolute w-0 h-0"
            style={{
              bottom: '-10px',
              right: '20px',
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '10px solid white',
              filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))'
            }}
          />
        </div>
      )}
      <button onClick={() => window.open(`https://wa.me/${waPhone}`, '_blank')} className="bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#128C7E] transition hover:scale-110">
        <MessageCircle size={24} />
      </button>
    </div>
  );
}
