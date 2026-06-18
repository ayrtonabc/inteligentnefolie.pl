
'use client';

import { useEffect, useState } from 'react';
import { CMS_REGISTRY } from '@/lib/cms/cms-registry';

export function CMSDebugPanel() {
  const [status, setStatus] = useState<{
    found: string[];
    missing: string[];
    total: number;
  } | null>(null);

  useEffect(() => {
    // Escanear y reportar
    const found: string[] = [];
    const missing: string[] = [];

    for (const region of CMS_REGISTRY) {
      const el = document.querySelector(region.selector);
      if (el) {
        found.push(region.id);
      } else {
        missing.push(`${region.id} → "${region.selector}"`);
      }
    }

    setStatus({ found, missing, total: CMS_REGISTRY.length });
  }, []);

  if (!status) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      right: 16,
      background: '#1e1e1e',
      color: '#d4d4d4',
      padding: 16,
      borderRadius: 8,
      fontFamily: 'monospace',
      fontSize: 12,
      maxWidth: 500,
      maxHeight: 400,
      overflow: 'auto',
      zIndex: 999999,
      border: '1px solid #333',
    }}>
      <div style={{ color: '#4ade80', marginBottom: 8, fontWeight: 'bold' }}>
        CMS Scanner Debug — {status.found.length}/{status.total} found
      </div>
      
      {status.missing.length > 0 && (
        <div style={{ color: '#f87171', marginBottom: 8 }}>
          <strong>❌ NOT FOUND ({status.missing.length}):</strong>
          <ul style={{ margin: '4px 0', paddingLeft: 16 }}>
            {status.missing.map(m => (
              <li key={m} style={{ margin: '2px 0', wordBreak: 'break-all' }}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {status.found.length > 0 && (
        <div style={{ color: '#4ade80' }}>
          <strong>✅ FOUND ({status.found.length}):</strong>
          <ul style={{ margin: '4px 0', paddingLeft: 16 }}>
            {status.found.map(f => (
              <li key={f} style={{ margin: '2px 0' }}>{f}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
