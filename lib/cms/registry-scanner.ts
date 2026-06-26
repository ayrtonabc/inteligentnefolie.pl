
import { CMS_REGISTRY, CMSEditableRegion, buildSelectorMap } from './cms-registry';

interface FoundEditable {
  element: HTMLElement;
  region: CMSEditableRegion;
}

export class RegistryScanner {
  private selectorMap: Map<string, CMSEditableRegion>;
  private isScanning = false;
  private observer: MutationObserver | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private onFoundListeners = new Set<(editables: FoundEditable[]) => void>();
  private processedElements = new WeakSet<HTMLElement>();

  constructor() {
    this.selectorMap = buildSelectorMap();
  }

  /**
   * Escanea el DOM usando EXCLUSIVAMENTE los selectores del registry.
   * Zero heurística. Zero text-matching.
   */
  scan(): FoundEditable[] {
    if (this.isScanning) return [];
    this.isScanning = true;

    const found: FoundEditable[] = [];

    try {
      // 1. Scan registry selectors
      for (const [selector, region] of this.selectorMap) {
        try {
          const elements = document.querySelectorAll<HTMLElement>(selector);
          for (const el of elements) {
            if (this.processedElements.has(el)) continue;
            this.processedElements.add(el);

            if (!el.getAttribute('data-cms-id') || region.recordId !== 'auto') {
               const finalId = (region.recordId && region.recordId !== 'auto') ? region.recordId : region.id;
               el.setAttribute('data-cms-id', finalId);
            }
            
            el.setAttribute('data-cms-field', region.field);
            el.setAttribute('data-cms-source', region.collection);
            el.setAttribute('data-cms-record', region.recordId);
            el.setAttribute('data-cms-type', region.type);

            found.push({ element: el, region });
          }
        } catch (e) {
          console.warn(`[CMS] Invalid selector in registry: "${selector}"`, e);
        }
      }

      // 2. Scan for elements with explicit CMS attributes (CMSEditable / CmsText)
      const explicitElements = document.querySelectorAll<HTMLElement>('[data-cms-section], [data-cms-key]');
      for (const el of explicitElements) {
        if (this.processedElements.has(el)) continue;
        this.processedElements.add(el);

        const sectionKey = el.getAttribute('data-cms-section') || el.getAttribute('data-cms-key') || '';
        const source = el.getAttribute('data-cms-source') || 'site_content';
        const type = (el.getAttribute('data-cms-type') as any) || (el.tagName === 'IMG' ? 'image' : 'text');
        const recordId = el.getAttribute('data-cms-id') || 'auto';

        const virtualRegion: CMSEditableRegion = {
          id: sectionKey,
          collection: source,
          field: source === 'site_settings' ? 'setting_value' : 'content_value',
          recordId: recordId,
          selector: '', // Not used here
          type: type
        };

        found.push({ element: el, region: virtualRegion });
      }
    } finally {
      this.isScanning = false;
    }

    if (found.length > 0) {
      this.notifyListeners(found);
    }

    return found;
  }

  /**
   * Escanea una región específica (útil después de fetch parcial).
   */
  scanRegion(regionId: string): FoundEditable[] {
    const region = CMS_REGISTRY.find(r => r.id === regionId);
    if (!region) return [];

    const elements = document.querySelectorAll<HTMLElement>(region.selector);
    const found: FoundEditable[] = [];

    for (const el of elements) {
      if (!el.getAttribute('data-cms-id') || region.recordId !== 'auto') {
        const finalId = (region.recordId && region.recordId !== 'auto') ? region.recordId : region.id;
        el.setAttribute('data-cms-id', finalId);
      }
      el.setAttribute('data-cms-field', region.field);
      el.setAttribute('data-cms-source', region.collection);
      el.setAttribute('data-cms-record', region.recordId);
      el.setAttribute('data-cms-type', region.type);
      found.push({ element: el, region });
    }

    return found;
  }

  /**
   * Observa cambios del DOM para detectar secciones que se montan
   * después del scan inicial (lazy-loaded, popups, sliders).
   */
  startObserving(debounceMs = 200) {
    this.observer = new MutationObserver((mutations) => {
      if (this.isScanning) return;

      // Solo reaccionar a nodos NUEVOS (no atributos que nosotros inyectamos)
      const hasNewNodes = mutations.some(m => 
        m.type === 'childList' && m.addedNodes.length > 0
      );

      if (!hasNewNodes) return;

      // Debounce
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.scan();
      }, debounceMs);
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      // ⚠️ CRÍTICO: NO observar attributes (causa loops)
      attributes: false,
      characterData: false,
    });
  }

  /**
   * Para elementos tipo 'list', obtiene todos los items hijos.
   */
  getListItems(regionId: string): HTMLElement[] {
    const region = CMS_REGISTRY.find(r => r.id === regionId);
    if (!region?.itemSelector) return [];
    return Array.from(document.querySelectorAll<HTMLElement>(region.itemSelector));
  }

  onFound(listener: (editables: FoundEditable[]) => void): () => void {
    this.onFoundListeners.add(listener);
    return () => this.onFoundListeners.delete(listener);
  }

  private notifyListeners(editables: FoundEditable[]) {
    this.onFoundListeners.forEach(l => l(editables));
  }

  /** Resetea el cache de elementos procesados (para re-scan completo) */
  reset() {
    this.processedElements = new WeakSet();
  }

  destroy() {
    this.observer?.disconnect();
    this.observer = null;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.onFoundListeners.clear();
  }
}
