'use client';

import React from 'react';
import { PageData } from '@/lib/pageData';
import { useCmsContentValue, useVisualEditor } from '@/lib/context/VisualEditorContext';

function findAllContentByKey(pageData: PageData | undefined, sectionKey: string) {
  if (!pageData?.content) return [];
  return pageData.content.filter(c => c.section_key === sectionKey);
}

function getContentType(pageData: PageData | undefined, sectionKey: string): string {
  const allMatches = findAllContentByKey(pageData, sectionKey);
  return allMatches[0]?.content_type || 'text';
}

function getRecordId(pageData: PageData | undefined, sectionKey: string): string | undefined {
  const allMatches = findAllContentByKey(pageData, sectionKey);
  return allMatches[0]?.id;
}

function getImageAltFromMetadata(pageData: PageData | undefined, sectionKey: string): string {
  const allMatches = findAllContentByKey(pageData, sectionKey);
  const first: any = allMatches[0] as any;
  const alt = first?.metadata?.alt;
  return typeof alt === 'string' ? alt : '';
}

function buildCmsAttrs(sectionKey: string, recordId: string | undefined, contentType: string) {
  return {
    'data-cms-section': sectionKey,
    'data-cms-source': 'site_content',
    'data-cms-type': contentType,
    ...(recordId ? { 'data-cms-id': recordId } : {}),
  };
}

// ============================================================================
// CmsText - SERVER component
// ============================================================================

export function CmsText({
  pageData,
  sectionKey,
  fallback = '',
  as: Tag = 'span' as any,
  className = '',
  pagePath = '/',
  ...props
}: {
  pageData?: PageData;
  sectionKey: string;
  fallback?: string;
  as?: any;
  className?: string;
  pagePath?: string;
  [key: string]: any;
}) {
  const { isEditing } = useVisualEditor();
  const value = useCmsContentValue(pageData, sectionKey, fallback);
  const contentType = getContentType(pageData, sectionKey);
  const recordId = getRecordId(pageData, sectionKey);
  const cmsAttrs = buildCmsAttrs(sectionKey, recordId, contentType);

  if (!value) {
    if (!isEditing) return null;
    return (
      <Tag
        className={[className, 'bg-yellow-50 border border-dashed border-yellow-300 px-1'].filter(Boolean).join(' ')}
        title={`Puste pole - kliknij aby edytować: ${sectionKey}`}
        {...cmsAttrs}
        {...props}
      >
        [Kliknij aby edytować: {sectionKey}]
      </Tag>
    );
  }

  return <Tag className={className} dangerouslySetInnerHTML={{ __html: value }} {...cmsAttrs} {...props} />;
}

// ============================================================================
// CmsImage - SERVER component
// ============================================================================

export function CmsImage({
  pageData,
  sectionKey,
  fallback = '',
  alt = '',
  className = '',
  width,
  height,
  fill,
  sizes,
  style,
  loading,
  decoding,
  fetchPriority,
  pagePath = '/',
}: {
  pageData?: PageData;
  sectionKey: string;
  fallback?: string;
  alt?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'sync' | 'auto';
  fetchPriority?: 'high' | 'low' | 'auto';
  pagePath?: string;
}) {
  const { isEditing } = useVisualEditor();
  const value = useCmsContentValue(pageData, sectionKey, fallback);
  const altRow = useCmsContentValue(pageData, `${sectionKey}_alt`, '');
  const metadataAlt = getImageAltFromMetadata(pageData, sectionKey);
  const src = value || fallback;
  const resolvedAlt = (alt || '').trim() || (metadataAlt || '').trim() || (altRow || '').trim() || '';
  const contentType = getContentType(pageData, sectionKey) || 'image';
  const recordId = getRecordId(pageData, sectionKey);
  const cmsAttrs = buildCmsAttrs(sectionKey, recordId, contentType);

  if (!src) {
    if (!isEditing) return null;
    return (
      <div
        className={[
          fill ? 'absolute inset-0' : '',
          className,
          'flex items-center justify-center bg-gray-100 text-gray-500 text-xs border border-dashed border-gray-300',
        ].filter(Boolean).join(' ')}
        style={fill ? { position: 'absolute', inset: 0, ...style } : { width: width || '100%', height: height || 160, ...style }}
        {...cmsAttrs}
      >
        Brak obrazu: {sectionKey}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={resolvedAlt}
      className={className}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      style={fill ? { position: 'absolute', height: '100%', width: '100%', left: 0, top: 0, right: 0, bottom: 0, objectFit: 'cover', ...style } : style}
      loading={loading || 'lazy'}
      decoding={decoding || 'async'}
      fetchPriority={fetchPriority || 'auto'}
      referrerPolicy="no-referrer-when-downgrade"
      {...cmsAttrs}
    />
  );
}

// ============================================================================
// CmsButton - SERVER component
// ============================================================================

export function CmsButton({
  pageData,
  sectionKey,
  fallbackText = '',
  fallbackHref = '#',
  className = '',
  onClick,
  pagePath = '/',
}: {
  pageData?: PageData;
  sectionKey: string;
  fallbackText?: string;
  fallbackHref?: string;
  className?: string;
  onClick?: () => void;
  pagePath?: string;
}) {
  const { isEditing } = useVisualEditor();
  const raw = useCmsContentValue(pageData, sectionKey, fallbackText);
  const text = raw || fallbackText;
  const contentType = getContentType(pageData, sectionKey) || 'json';
  const recordId = getRecordId(pageData, sectionKey);
  const cmsAttrs = buildCmsAttrs(sectionKey, recordId, contentType);
  
  const href = (() => {
    if (raw && (raw.startsWith('{') || raw.startsWith('['))) {
      try {
        const obj = JSON.parse(raw);
        if (obj && obj.href) return obj.href;
      } catch {}
    }
    return fallbackHref;
  })();

  if (!text) {
    if (!isEditing) return null;
    const placeholderClassName = [className, 'bg-yellow-50 border border-dashed border-yellow-300 px-1'].filter(Boolean).join(' ');
    const placeholder = `[Kliknij aby edytować: ${sectionKey}]`;

    if (onClick) {
      return <button onClick={onClick} className={placeholderClassName} {...cmsAttrs}>{placeholder}</button>;
    }

    return <a href={fallbackHref} className={placeholderClassName} {...cmsAttrs}>{placeholder}</a>;
  }

  if (onClick) {
    return <button onClick={onClick} className={className} {...cmsAttrs}>{text}</button>;
  }

  return <a href={href} className={className} {...cmsAttrs}>{text}</a>;
}
