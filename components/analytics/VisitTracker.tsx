'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function VisitTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we're in visual edit mode - don't track editor visits
    const isEditing = searchParams.get('visual_edit') === 'true';
    if (isEditing) return;

    const trackVisit = async () => {
      try {
        const userAgent = navigator.userAgent;
        const isMobile = /Mobile|Android|iPhone/i.test(userAgent);
        const isTablet = /Tablet|iPad/i.test(userAgent);
        const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

        // Basic browser detection
        let browser = 'Unknown';
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';

        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: pathname,
            device_type: deviceType,
            browser: browser,
            referrer: document.referrer || null,
          }),
        });
      } catch (error) {
        console.error('Failed to track visit:', error);
      }
    };

    // Track after a short delay to ensure it's a real visit
    const timer = setTimeout(trackVisit, 2000);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return null;
}
