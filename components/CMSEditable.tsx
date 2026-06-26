'use client';

/**
 * CMSEditable — Componente declarativo para elementos editables.
 *
 * Reemplaza la heurística frágil de text-matching con una declaración
 * explícita de qué elementos son editables y a qué campo de PocketBase
 * corresponden. Cero falsos positivos, cleanup automático.
 *
 * Uso:
 *   <CMSEditable cmsKey="home_hero_title" cmsSource="site_content">
 *     {pageData?.home_hero_title ?? 'Título por defecto'}
 *   </CMSEditable>
 */

import { useRef, useEffect } from 'react';

interface CMSEditableProps {
  /** section_key en la colección site_content */
  cmsKey: string;
  /** UUID del registro en PocketBase */
  cmsId?: string;
  /** Colección de PocketBase (default: 'site_content') */
  cmsSource?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
}

export function CMSEditable({
  cmsKey,
  cmsId,
  cmsSource = 'site_content',
  children,
  as: Tag = 'span',
  className,
  style,
  ...props
}: CMSEditableProps & { [key: string]: any }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    // Solo activar en modo edición visual
    const params = new URLSearchParams(window.location.search);
    if (params.get('visual_edit') !== 'true') return;

    const el = ref.current;
    if (!el) return;

    // Inyectar atributos de identificación CMS (compatibles con el sistema actual)
    el.setAttribute('data-cms-section', cmsKey);
    el.setAttribute('data-cms-source', cmsSource);
    el.setAttribute('data-cms-marked', 'true');
    if (cmsId) {
      el.setAttribute('data-cms-id', cmsId);
    }

    // Estilos base del modo edición
    const originalOutline = el.style.outline;
    const originalCursor = el.style.cursor;
    el.style.outline = '2px solid rgba(59, 130, 246, 0.5)';
    el.style.outlineOffset = '2px';
    el.style.cursor = 'pointer';

    const handleMouseEnter = () => {
      el.style.outline = '3px solid #3b82f6';
      el.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.2)';
    };

    const handleMouseLeave = () => {
      el.style.outline = '2px solid rgba(59, 130, 246, 0.5)';
      el.style.boxShadow = '';
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Notificar al CMS sidebar qué elemento fue seleccionado
      window.parent.postMessage({
        type: 'cms:element-selected',
        sectionKey: cmsKey,
      }, '*');
    };

    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('click', handleClick);

    return () => {
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('click', handleClick);
      el.removeAttribute('data-cms-section');
      el.removeAttribute('data-cms-source');
      el.removeAttribute('data-cms-marked');
      el.style.outline = originalOutline;
      el.style.cursor = originalCursor;
      el.style.boxShadow = '';
    };
  }, [cmsKey, cmsSource]);

  return (
    // @ts-expect-error: dynamic tag ref typing
    <Tag ref={ref} className={className} style={style} {...props}>
      {children}
    </Tag>
  );
}
