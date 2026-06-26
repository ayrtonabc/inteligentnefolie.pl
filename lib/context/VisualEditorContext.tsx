'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { pb, getTenantFilter, TENANT_ID } from '@/lib/pocketbase';
import { optimizeImage, formatBytes } from '@/lib/imageOptimizer';
import { RegistryScanner } from '@/lib/cms/registry-scanner';
import { CMS_REGISTRY, CMSEditableRegion } from '@/lib/cms/cms-registry';
import { getPageContentValue } from '@/lib/pageData';
import { requestRevalidation } from '@/lib/revalidate';

interface EditableItem {
  id: string; // Row UUID
  sectionKey: string;
  field?: string;
  collection: string;
  contentValue: any;
  contentType: string;
  pagePath: string;
}

interface VisualEditorContextType {
  isEditing: boolean;
  editingItem: EditableItem | null;
  setEditingItem: (item: EditableItem | null) => void;
  saveContent: (id: string, sectionKey: string, newValue: any, collection?: string) => Promise<boolean>;
  contentItems: EditableItem[];
}

const VisualEditorContext = createContext<VisualEditorContextType | null>(null);

export function VisualEditorProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const isEditing = searchParams.get('visual_edit') === 'true';

  const [editingItem, setEditingItem] = useState<EditableItem | null>(null);
  const [contentItems, setContentItems] = useState<EditableItem[]>([]);
  const pathname = usePathname();
  
  // Bridge handshake tracking
  const isConnectedRef = useRef(false);
  const retryTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Save queue per record ID to prevent race conditions
  const saveQueueRef = useRef<Map<string, { newValue: any, sectionKey: string }>>(new Map());
  const isSavingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    console.log('[VisualEditorContext] isEditing detected:', isEditing);
  }, [isEditing]);

  // Fetch content when editing mode is active
  useEffect(() => {
    if (!isEditing) return;

    // Normalize path: ignore trailing slash, except for root
    let pagePath = window.location.pathname;
    if (pagePath.length > 1 && pagePath.endsWith('/')) {
      pagePath = pagePath.slice(0, -1);
    }

    const lang = searchParams.get('lang') || 'pl';
    console.log('[VisualEditorContext] Client-side fetch started for:', pagePath, 'language:', lang);

    const fetchContent = async () => {
      try {
        const filter = `(${getTenantFilter()} && (page_path = "${pagePath}" || page_path = "common" || page_path = "site_settings") && language_code = "${lang}")`;
        
        // Fetch both site_content and site_settings
        const [contentData, settingsData] = await Promise.all([
          pb.collection('site_content').getFullList({
            filter,
            sort: '-updated',
            requestKey: null,
          }),
          pb.collection('site_settings').getFullList({
            filter: getTenantFilter(),
            requestKey: null,
          })
        ]);
        console.log('[CMS] Raw site_settings from PocketBase:', settingsData.map(d => ({ key: d.setting_key })));
        
        const processedContent = contentData.map(d => ({
          id: d.id,
          sectionKey: d.section_key,
          field: 'content_value',
          collection: d.collectionName || 'site_content',
          contentValue: d.content_value,
          contentType: d.content_type || 'text',
          pagePath: d.page_path || 'common',
        }));

        const processedSettings = settingsData.map(d => ({
          id: d.id,
          sectionKey: d.setting_key,
          field: 'setting_value',
          collection: d.collectionName || 'site_settings',
          contentValue: d.setting_value,
          contentType: 'text',
          pagePath: 'site_settings',
        }));

        const allItems = [...processedContent, ...processedSettings];
        console.log('[CMS] Normalized items keys:', allItems.map(i => i.sectionKey));
        setContentItems(allItems);

        // Handshake con retry exponencial
        isConnectedRef.current = false;
        retryTimersRef.current.forEach(t => clearTimeout(t));
        retryTimersRef.current = [];

        const send = () => window.parent.postMessage({ type: 'cms:iframe-ready', items: allItems }, '*');
        send();
        retryTimersRef.current.push(setTimeout(() => { if (!isConnectedRef.current) send(); }, 500));
        retryTimersRef.current.push(setTimeout(() => { if (!isConnectedRef.current) send(); }, 1500));
      } catch (error) {
        console.error('[VisualEditorContext] Fetch error:', error);
      }
    };

    fetchContent();
    return () => {
      retryTimersRef.current.forEach(t => clearTimeout(t));
    };
  }, [isEditing, pathname, searchParams]);

  // Listen for messages from CMS sidebar
  useEffect(() => {
    if (!isEditing) return;

    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'cms:content') {
        if (e.data.token) {
          // Authenticate the local pb instance with the passed token
          pb.authStore.save(e.data.token, e.data.model || null);
          console.log('[VisualEditorContext] Authenticated with token from CMS');
        }
        
        if (e.data.items) {
          const normalizedItems = e.data.items.map((d: any) => ({
            id: d.id,
            sectionKey: d.section_key || d.setting_key || d.key,
            field: d.field || (d.collectionName === 'site_settings' || d.collection === 'site_settings' ? 'setting_value' : 'content_value'),
            collection: d.collection || d.collectionName || 'site_content',
            contentValue: d.content_value || d.setting_value || d.value,
            contentType: d.content_type || 'text',
            pagePath: d.page_path || 'common',
          }));
          
          // Only update if something changed to prevent loops
          setContentItems(prev => {
            const currentStr = JSON.stringify(prev);
            const nextStr = JSON.stringify(normalizedItems);
            if (currentStr === nextStr) return prev;
            return normalizedItems;
          });
        }
      }

      // ACK del handshake: detener retries
      if (e.data?.type === 'cms:bridge-ack') {
        isConnectedRef.current = true;
        retryTimersRef.current.forEach(t => clearTimeout(t));
        retryTimersRef.current = [];
      }

      if (e.data?.type === 'cms:select') {
        const key = e.data.sectionKey;
        const el = document.querySelector(`[data-cms-section="${key}"], [data-cms-key="${key}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [isEditing]);

  const saveContent = useCallback(async (id: string, sectionKey: string, newValue: any, overrideCollection?: string): Promise<boolean> => {
    // If already saving this record, queue the new value and return
    if (isSavingRef.current.has(id)) {
      saveQueueRef.current.set(id, { newValue, sectionKey });
      console.log(`[VisualEditor] Save queued for ${id} (${sectionKey})`);
      return true;
    }

    isSavingRef.current.add(id);

    const performSave = async (recordId: string, sKey: string, val: any): Promise<boolean> => {
      const item = contentItems.find(i => i.id === recordId);
      const itemPath = item?.pagePath || window.location.pathname;

      let valueToSave = val;
      if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
        try { valueToSave = JSON.parse(val); } catch { /* ignore */ }
      }

      const collection = overrideCollection || item?.collection || (recordId.length < 10 ? 'site_settings' : 'site_content');
      const field = item?.field || (collection === 'site_settings' ? 'setting_value' : 'content_value');

      // Guard: If recordId is a placeholder
      if (recordId === sKey || recordId === 'folie_hero_title' || recordId === 'hero_title' || recordId === 'auto') {
        console.error(`[CMS] Cannot save: ${recordId} is a placeholder, not a valid PocketBase UUID. Please create the record in the CMS first.`);
        return false;
      }

      console.log(`[VisualEditor] Saving to ${collection} [${recordId}], field: ${field}`);

      try {
        await pb.collection(collection).update(recordId, {
          [field]: valueToSave,
        }, { requestKey: null });

        // Sync with blog_posts if it's a blog path
        if (itemPath.startsWith('/blog/') && itemPath.length > 6) {
          const slug = itemPath.replace('/blog/', '');
          try {
            const post = await pb.collection('blog_posts').getFirstListItem(`website_id = "${TENANT_ID}" && slug = "${slug}"`);
            if (post) {
              const updateData: any = {};
              if (sKey === 'page_title' || sKey === 'hero_title' || sKey === 'title') {
                updateData.title = typeof valueToSave === 'object' ? valueToSave.text || valueToSave.value : valueToSave;
              }
              if (sKey === 'meta_title') updateData.meta_title = valueToSave;
              if (sKey === 'meta_description') updateData.meta_description = valueToSave;
              
              if (Object.keys(updateData).length > 0) {
                await pb.collection('blog_posts').update(post.id, updateData);
                console.log('[VisualEditor] Synced edit with blog_posts for slug:', slug);
              }
            }
          } catch (err) {
            console.warn('[VisualEditor] Blog post sync failed:', err);
          }
        }

        // Optimistic update of local state
        setContentItems(prev =>
          prev.map(i => i.id === recordId ? { ...i, contentValue: valueToSave } : i)
        );

        // Notify and revalidate (debounced in revalidate.ts)
        try {
          requestRevalidation(itemPath === 'common' ? ['/', window.location.pathname] : [itemPath]);
        } catch (err) {
          console.warn('Revalidation trigger failed:', err);
        }

        window.parent.postMessage({ type: 'cms:saved', sectionKey: sKey }, '*');

        // Check if there's more in queue for this record
        const next = saveQueueRef.current.get(recordId);
        if (next) {
          saveQueueRef.current.delete(recordId);
          return performSave(recordId, next.sectionKey, next.newValue);
        }

        isSavingRef.current.delete(recordId);
        return true;
      } catch (error) {
        console.error('Save error:', error);
        isSavingRef.current.delete(recordId);
        return false;
      }
    };

    return performSave(id, sectionKey, newValue);
  }, [contentItems]);

  return (
    <VisualEditorContext.Provider value={{
      isEditing,
      editingItem,
      setEditingItem,
      saveContent,
      contentItems,
    }}>
      {children}
      {isEditing && (
        <EditorInline />
      )}
    </VisualEditorContext.Provider>
  );
}

export function useCmsContentValue(
  pageData: any,
  sectionKey: string,
  fallback: string = ''
): string {
  const ctx = useContext(VisualEditorContext);
  
  if (ctx?.isEditing) {
    const items = ctx.contentItems.filter(i => i.sectionKey === sectionKey);
    if (items.length > 0) {
      const firstMatch = items[0];
      
      if (firstMatch.contentType === 'image') {
        const itemsWithImage = items
          .filter(i => {
            const val = typeof i.contentValue === 'string' ? i.contentValue : i.contentValue?.text || i.contentValue?.value || '';
            return val && val.startsWith('http');
          })
          .sort((a, b) => {
            const dateA = new Date((a as any).updated || 0).getTime();
            const dateB = new Date((b as any).updated || 0).getTime();
            return dateB - dateA;
          });
        const imgItem = itemsWithImage[0] || firstMatch;
        const val = typeof imgItem.contentValue === 'string' ? imgItem.contentValue : imgItem.contentValue?.text || imgItem.contentValue?.value || '';
        return val || fallback;
      }
      
      const targetLang = pageData?.settings?.current_language || 'pl';
      const langMatch = items.find(i => i.contentValue?.language_code === targetLang);
      const item = langMatch || firstMatch;
      
      if (typeof item.contentValue === 'string') return item.contentValue;
      if (item.contentValue && typeof item.contentValue === 'object') {
        return item.contentValue.text || item.contentValue.value || fallback;
      }
    }
  }

  return getPageContentValue(pageData, sectionKey, fallback);
}

export function useVisualEditor() {
  const ctx = useContext(VisualEditorContext);
  if (!ctx) throw new Error('useVisualEditor must be used within VisualEditorProvider');
  return ctx;
}

function MediaLibrary({ onSelect }: { onSelect: (url: string) => void }) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFiles() {
      setLoading(true);
      try {
        const records = await pb.collection('media').getFullList({
          filter: getTenantFilter(),
          sort: '-created',
          requestKey: null, // Disable auto-cancellation
        });
        
        const allFiles = records.map(record => ({
          ...record,
          publicUrl: pb.files.getURL(record, record.file),
          name: record.name || record.file,
        }));
        
        setFiles(allFiles);
      } catch (err: any) {
        console.error('Library fetch error:', err);
        // If it's a 403, it might be an auth issue
        if (err.status === 403) {
          console.error('Permission denied. Ensure the media collection allows listing or the token is valid.');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchFiles();
  }, []);

  if (loading) return <div style={{ padding: '20px', textAlign: 'center', fontSize: '11px', color: '#64748b' }}>Ładowanie biblioteki...</div>;
  if (files.length === 0) return <div style={{ padding: '20px', textAlign: 'center', fontSize: '11px', color: '#64748b' }}>Biblioteka jest pusta</div>;

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(3, 1fr)', 
      gap: '8px', 
      maxHeight: '240px', 
      overflowY: 'auto', 
      padding: '4px',
      background: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    }}>
      {files.map((file, i) => (
        <div 
          key={i} 
          onClick={() => onSelect(file.publicUrl)} 
          title={file.name}
          style={{ 
            cursor: 'pointer', 
            borderRadius: '6px', 
            overflow: 'hidden', 
            border: '2px solid transparent',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.borderColor = '#3b82f6'}
          onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = 'transparent'}
        >
          <img src={file.publicUrl} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} alt="" />
        </div>
      ))}
    </div>
  );
}
function ImageEditor({ activeEdit, setActiveEdit }: {
  activeEdit: EditableItem & { editValue: string };
  setActiveEdit: (item: EditableItem & { editValue: string }) => void;
}) {
  const [showLibrary, setShowLibrary] = useState(false);
  // Removed restriction to allow editing all images found in site_content
  // const isHeroImage = activeEdit.sectionKey.toLowerCase().includes('hero');


  /*
  if (!isHeroImage) {
    ... (removed block)
  }
  */


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>Źródło obrazu</label>
        <button 
          onClick={() => setShowLibrary(!showLibrary)}
          style={{ fontSize: '11px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          {showLibrary ? '✕ Zamknij galerię' : '🖼 Wybierz z biblioteki'}
        </button>
      </div>

      {showLibrary ? (
        <MediaLibrary onSelect={(url) => {
          setActiveEdit({ ...activeEdit, editValue: url });
          setShowLibrary(false);
        }} />
      ) : (
        <>
          <div>
            <input
              type="text"
              value={activeEdit.editValue}
              readOnly
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', background: '#f1f5f9', color: '#64748b' }}
              placeholder="Wybierz obraz z biblioteki..."
            />
          </div>
          <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8' }}>Wskazówka: Kliknij "Wybierz z biblioteki", aby zmienić obraz.</p>
        </>
      )}

      {activeEdit.editValue && (
        <div style={{
          borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0',
          background: '#f8fafc', maxHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px'
        }}>
          <img src={activeEdit.editValue} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
        </div>
      )}
    </div>
  );
}

function EditorInline() {
  const { contentItems, isEditing, saveContent } = useVisualEditor();
  const [activeEdit, setActiveEdit] = useState<EditableItem & { editValue: string } | null>(null);
  const scannerRef = useRef<RegistryScanner | null>(null);

  const openEditorForItem = useCallback((item: EditableItem) => {
    let val = '';
    if (item.contentType === 'json') {
      try { val = typeof item.contentValue === 'string' ? item.contentValue : JSON.stringify(item.contentValue, null, 2); } catch { val = String(item.contentValue); }
    } else {
      val = String(item.contentValue ?? '');
    }
    setActiveEdit({ ...item, editValue: val });
  }, []);

  useEffect(() => {
    if (!isEditing) return;

    const handler = (e: MessageEvent) => {
      if (e.data?.type !== 'cms:start-edit') return;
      const item = contentItems.find(i => i.sectionKey === e.data.sectionKey || i.id === e.data.recordId);
      if (item) {
        openEditorForItem(item);
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [contentItems, isEditing, openEditorForItem]);

  useEffect(() => {
    if (!isEditing) return;

    if (!scannerRef.current) {
      scannerRef.current = new RegistryScanner();
    }
    const scanner = scannerRef.current;

    const attachHighlightHandlers = (el: HTMLElement, region: CMSEditableRegion) => {
      // Evitar duplicados
      if (el.hasAttribute('data-cms-processed')) return;
      el.setAttribute('data-cms-processed', 'true');

      console.log(`[CMS] Attaching handlers to: ${region.id}`, el);

      // Hover
      el.addEventListener('mouseenter', () => {
        el.style.outline = '2px dashed #3b82f6';
        el.style.outlineOffset = '2px';
        el.style.cursor = region.type === 'image' ? 'pointer' : 'text';
        el.setAttribute('data-cms-hover', 'true');
        
        // Badge with the ID - Append to body to avoid polluting innerHTML
        const rect = el.getBoundingClientRect();
        const badge = document.createElement('div');
        badge.className = 'cms-badge';
        badge.id = `badge-${region.id}`;
        badge.textContent = region.id;
        badge.style.cssText = `
          position: fixed; 
          top: ${rect.top + window.scrollY - 24}px; 
          left: ${rect.left + window.scrollX}px; 
          background: #3b82f6; color: white; font-size: 11px;
          padding: 2px 8px; border-radius: 4px 4px 0 0;
          font-family: monospace; z-index: 1000000; pointer-events: none;
        `;
        document.body.appendChild(badge);
      });

      el.addEventListener('mouseleave', () => {
        el.style.outline = 'none';
        el.removeAttribute('data-cms-hover');
        const badge = document.getElementById(`badge-${region.id}`);
        badge?.remove();
      });

      // Click
      el.addEventListener('click', (e) => {
        const isLink = el.tagName.toLowerCase() === 'a' || el.closest('a');
        const noPrevent = el.hasAttribute('data-cms-no-prevent') || el.tagName.toLowerCase() === 'button';

        if (isLink && !noPrevent) {
          e.preventDefault();
          e.stopPropagation();
        }

        console.log('[VisualEditorContext] Element clicked:', region.id, 'Matching in contentItems...');
        
        // Notify sidebar
        window.parent.postMessage({
          type: 'cms:element-selected',
          cmsId: region.id,
          cmsField: region.field,
          cmsSource: region.collection,
          cmsType: region.type,
          sectionKey: region.id,
          rect: el.getBoundingClientRect().toJSON(),
          currentText: el.textContent,
        }, '*');

        // Get clean content (removing any residual badges if any)
        const getCleanHtml = (element: HTMLElement) => {
          const clone = element.cloneNode(true) as HTMLElement;
          clone.querySelectorAll('.cms-badge').forEach(b => b.remove());
          return clone.innerHTML.trim();
        };

        const item = contentItems.find(i => 
          i.sectionKey === region.id || 
          i.sectionKey === region.field ||
          i.sectionKey === region.recordId ||
          i.id === el.getAttribute('data-cms-id') ||
          i.sectionKey === el.getAttribute('data-cms-id') ||
          (el.getAttribute('data-cms-section') === i.sectionKey)
        );
        if (item) {
          console.log('[VisualEditorContext] Match found! Opening editor for:', item.sectionKey, 'Record ID:', item.id);
          openEditorForItem(item);
        } else {
           const cleanHtml = getCleanHtml(el);
           const dynamicId = el.getAttribute('data-cms-id') || region.recordId;
           
           console.warn(`[CMS] NO MATCH for region ${region.id}. Pool keys:`, contentItems.map(i => i.sectionKey));
           console.log(`[CMS] Details: dynamicId=${dynamicId}, recordId=${region.recordId}, regionId=${region.id}`);
           
           // Si no lo encuentra, creamos un item temporal solo si tenemos un ID real
           if (dynamicId && dynamicId !== 'auto' && dynamicId !== region.id) {
             setActiveEdit({
               id: dynamicId,
               sectionKey: region.field || region.id,
               field: region.field,
               collection: region.collection,
               contentValue: cleanHtml,
               contentType: region.type,
               pagePath: window.location.pathname,
               editValue: cleanHtml
             } as any);
           }
        }
      }, true);
    };

    // 1. Scan inicial
    const found = scanner.scan();
    found.forEach(({ element, region }) => attachHighlightHandlers(element, region));

    // 2. Start observing
    scanner.onFound((editables) => {
      editables.forEach(({ element, region }) => attachHighlightHandlers(element, region));
    });
    scanner.startObserving();

    return () => {
      // El scanner persiste en el ref, no lo destruimos si solo cambia contentItems
    };
  }, [isEditing, contentItems, openEditorForItem]);

  if (!isEditing) return null;

  const handleSave = async () => {
    if (!activeEdit) return;
    const success = await saveContent(activeEdit.id, activeEdit.sectionKey, activeEdit.editValue, activeEdit.collection);
    if (success) {
      setActiveEdit(null);
    }
  };

  if (!activeEdit) return (
    <div style={{
      position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 999999, padding: '10px 20px', background: '#3b82f6', color: 'white',
      borderRadius: '99px', fontWeight: 700, fontSize: '14px', boxShadow: '0 10px 25px rgba(59,130,246,0.5)',
      display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none'
    }}>
      <span style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%', display: 'inline-block' }} className="animate-pulse" />
      Tryb edycji aktywny
      <style dangerouslySetInnerHTML={{ __html: '@keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }' }} />
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        background: 'white', borderRadius: '16px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        width: '90%', maxWidth: '480px', overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{activeEdit.sectionKey}</h3>
            <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>{activeEdit.contentType}</p>
          </div>
          <button onClick={() => setActiveEdit(null)} style={{
            padding: '6px', border: 'none', background: '#f8fafc', borderRadius: '8px',
            cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        <div style={{ padding: '20px' }}>
          {activeEdit.contentType === 'image' ? (
            <ImageEditor activeEdit={activeEdit} setActiveEdit={setActiveEdit} />
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Treść</label>
              <textarea value={activeEdit.editValue} onChange={e => setActiveEdit({ ...activeEdit, editValue: e.target.value })} rows={5} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
              <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#94a3b8' }}>{activeEdit.editValue.length} znaków</p>
            </div>
          )}
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
          <button onClick={() => setActiveEdit(null)} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#475569', background: 'white', cursor: 'pointer' }}>Anuluj</button>
          <button onClick={handleSave} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: 'white', background: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>✓ Zapisz</button>
        </div>
      </div>
    </div>
  );
}
