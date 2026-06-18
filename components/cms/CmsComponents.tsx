'use client';

import { useEffect, useState } from 'react';
import { getSectionContent, getContentValue, SiteContent } from '@/lib/cms';
import { useVisualEditor } from '@/lib/context/VisualEditorContext';
import { useLanguage } from '@/lib/context/LanguageContext';

function extractInlineValue(value: unknown, fallback: string = ''): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record.text === 'string') return record.text;
    if (typeof record.value === 'string') return record.value;
  }
  return fallback;
}

function extractButtonValue(value: unknown, fallbackText: string, fallbackHref: string) {
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return {
      text: typeof record.text === 'string' ? record.text : fallbackText,
      href: typeof record.href === 'string' ? record.href : fallbackHref,
    };
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object') {
        return {
          text: typeof parsed.text === 'string' ? parsed.text : fallbackText,
          href: typeof parsed.href === 'string' ? parsed.href : fallbackHref,
        };
      }
    } catch {
      return { text: value, href: fallbackHref };
    }
  }

  return { text: fallbackText, href: fallbackHref };
}

// ============================================================================
// CmsText - Fetches text content from CMS and renders it
// ============================================================================

export function CmsText({
  pagePath,
  sectionKey,
  fallback = '',
  as: Component = 'span' as any,
  className = '',
  ...props
}: {
  pagePath: string;
  sectionKey: string;
  fallback?: string;
  as?: any;
  className?: string;
  [key: string]: any;
}) {
  const { isEditing, contentItems } = useVisualEditor();
  const { language } = useLanguage();
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const liveItem = contentItems.find(item => item.sectionKey === sectionKey);
  const cmsId = liveItem?.id;
  const resolvedContent = isEditing && liveItem ? extractInlineValue(liveItem.contentValue, fallback) : content;

  useEffect(() => {
    async function fetchContent() {
      try {
        const data = await getSectionContent(pagePath, sectionKey, language, isEditing);
        const value = data ? getContentValue(data, fallback) : fallback;
        setContent(value || fallback || null);
      } catch {
        setContent(fallback || null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchContent();
  }, [pagePath, sectionKey, fallback, language, isEditing]);

  if (isLoading) return <Component className={className} data-cms-section={sectionKey} data-cms-source="site_content" data-cms-id={cmsId} data-cms-type="text" {...props}>{fallback}</Component>;
  
  if (isEditing && (!resolvedContent || resolvedContent.trim() === '')) {
    return <Component className={`${className} bg-yellow-50 border border-dashed border-yellow-300 px-1`} data-cms-section={sectionKey} data-cms-source="site_content" data-cms-id={cmsId} data-cms-type="text" title="Puste pole - kliknij aby dodać tekst" {...props}>[Kliknij aby edytować: {sectionKey}]</Component>;
  }

  if (!resolvedContent) return fallback ? <Component className={className} data-cms-section={sectionKey} data-cms-source="site_content" data-cms-id={cmsId} data-cms-type="text" {...props}>{fallback}</Component> : null;

  return <Component className={className} data-cms-section={sectionKey} data-cms-source="site_content" data-cms-id={cmsId} data-cms-type="text" dangerouslySetInnerHTML={{ __html: resolvedContent }} {...props} />;
}

// ============================================================================
// CmsImage - Fetches image URL from CMS and renders it
// ============================================================================

export function CmsImage({
  pagePath,
  sectionKey,
  fallback = '',
  alt = '',
  className = '',
  width,
  height,
}: {
  pagePath: string;
  sectionKey: string;
  fallback?: string;
  alt?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
}) {
  const { isEditing, contentItems } = useVisualEditor();
  const { language } = useLanguage();
  const [src, setSrc] = useState<string | null>(null);
  const [altText, setAltText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const liveItem = contentItems.find(item => item.sectionKey === sectionKey);
  const liveAltItem = contentItems.find(item => item.sectionKey === `${sectionKey}_alt`);
  const cmsId = liveItem?.id;
  const resolvedSrc = isEditing && liveItem ? extractInlineValue(liveItem.contentValue, '') || fallback || null : src;
  const resolvedAlt = (alt || '').trim() || (isEditing && liveAltItem ? extractInlineValue(liveAltItem.contentValue, '') : altText).trim();

  useEffect(() => {
    async function fetchContent() {
      try {
        const [imageData, altData] = await Promise.all([
          getSectionContent(pagePath, sectionKey, language, isEditing),
          getSectionContent(pagePath, `${sectionKey}_alt`, language, isEditing),
        ]);

        const value = imageData ? getContentValue(imageData, '') : '';
        setSrc(value || fallback || null);

        const altValue = altData ? getContentValue(altData, '') : '';
        setAltText(altValue || '');
      } catch {
        setSrc(fallback || null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchContent();
  }, [pagePath, sectionKey, fallback, language, isEditing]);

  if (isLoading) {
    return <div className={`bg-gray-200 animate-pulse ${className}`} style={{ width: width || '100%', height: height || '100%' }} />;
  }

  if (!resolvedSrc) {
    if (isEditing) {
      return (
        <div
          className={`flex items-center justify-center bg-gray-100 text-gray-500 text-xs border border-dashed border-gray-300 ${className}`}
          style={{ width: width || '100%', height: height || 160 }}
          data-cms-section={sectionKey}
          data-cms-source="site_content"
          data-cms-id={cmsId}
          data-cms-type="image"
        >
          Brak obrazu: {sectionKey}
        </div>
      );
    }
    return null;
  }

  return <img src={resolvedSrc} alt={resolvedAlt} className={className} width={width} height={height} data-cms-section={sectionKey} data-cms-source="site_content" data-cms-id={cmsId} data-cms-type="image" />;
}

// ============================================================================
// CmsButton - Fetches button text + href from CMS and renders it
// ============================================================================

export function CmsButton({
  pagePath,
  sectionKey,
  fallbackText = '',
  fallbackHref = '#',
  className = '',
  onClick,
}: {
  pagePath: string;
  sectionKey: string;
  fallbackText?: string;
  fallbackHref?: string;
  className?: string;
  onClick?: () => void;
}) {
  const { isEditing, contentItems } = useVisualEditor();
  const { language } = useLanguage();
  const [text, setText] = useState<string>(fallbackText);
  const [href, setHref] = useState<string>(fallbackHref);
  const [isLoading, setIsLoading] = useState(true);
  const liveItem = contentItems.find(item => item.sectionKey === sectionKey);
  const cmsId = liveItem?.id;
  const liveButton = isEditing && liveItem ? extractButtonValue(liveItem.contentValue, fallbackText, fallbackHref) : null;
  const resolvedText = liveButton?.text ?? text;
  const resolvedHref = liveButton?.href ?? href;

  useEffect(() => {
    async function fetchContent() {
      try {
        const data = await getSectionContent(pagePath, sectionKey, language, isEditing);
        if (data?.content_value) {
          const value = data.content_value;
          if (typeof value === 'object' && (value.text || value.href)) {
            setText(value.text || fallbackText);
            setHref(value.href || fallbackHref);
          } else if (typeof value === 'string') {
            try {
              const parsed = JSON.parse(value);
              setText(parsed.text || fallbackText);
              setHref(parsed.href || fallbackHref);
            } catch {
              setText(value);
            }
          }
        }
      } catch {
        // Use fallback
      } finally {
        setIsLoading(false);
      }
    }
    fetchContent();
  }, [pagePath, sectionKey, fallbackText, fallbackHref, language, isEditing]);

  if (isLoading) return <span className={className} data-cms-section={sectionKey} data-cms-source="site_content" data-cms-id={cmsId} data-cms-type="json">{fallbackText}</span>;
  if (!resolvedText) {
    if (!isEditing) return null;
    const placeholder = `[Kliknij aby edytować: ${sectionKey}]`;
    if (onClick) {
      return <button onClick={onClick} className={`${className} bg-yellow-50 border border-dashed border-yellow-300 px-1`} data-cms-section={sectionKey} data-cms-source="site_content" data-cms-id={cmsId} data-cms-type="json">{placeholder}</button>;
    }
    return <a href={fallbackHref} className={`${className} bg-yellow-50 border border-dashed border-yellow-300 px-1`} data-cms-section={sectionKey} data-cms-source="site_content" data-cms-id={cmsId} data-cms-type="json">{placeholder}</a>;
  }

  if (onClick) {
    return <button onClick={onClick} className={className} data-cms-section={sectionKey} data-cms-source="site_content" data-cms-id={cmsId} data-cms-type="json">{resolvedText}</button>;
  }

  return <a href={resolvedHref} className={className} data-cms-section={sectionKey} data-cms-source="site_content" data-cms-id={cmsId} data-cms-type="json">{resolvedText}</a>;
}

// ============================================================================
// CmsList - Fetches JSON array from CMS and renders it
// ============================================================================

export function CmsList({
  pagePath,
  sectionKey,
  fallback = [],
  renderItem,
  className = '',
}: {
  pagePath: string;
  sectionKey: string;
  fallback?: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
}) {
  const { language } = useLanguage();
  const [items, setItems] = useState<any[]>(fallback);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        const data = await getSectionContent(pagePath, sectionKey, language, false);
        if (data?.content_value) {
          const value = data.content_value;
          try {
            const parsed = typeof value === 'string' ? JSON.parse(value) : value;
            if (Array.isArray(parsed)) {
              setItems(parsed);
            } else {
              setItems(fallback);
            }
          } catch {
            setItems(fallback);
          }
        }
      } catch {
        setItems(fallback);
      } finally {
        setIsLoading(false);
      }
    }
    fetchContent();
  }, [pagePath, sectionKey, fallback]);

  if (isLoading) return <div className={className}>{fallback.map((item, idx) => renderItem(item, idx))}</div>;

  return <div className={className}>{items.map((item, idx) => renderItem(item, idx))}</div>;
}
