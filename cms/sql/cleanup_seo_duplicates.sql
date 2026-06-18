-- ============================================================================
-- SQL para limpiar duplicados en site_content
-- Ejecutar en PocketBase SQL shell o cualquier cliente SQLite
-- ============================================================================

-- Primero, hacer backup de la tabla
-- CREATE TABLE site_content_backup AS SELECT * FROM site_content;

-- ============================================================================
-- 1. ENCONTRAR DUPLICADOS DE meta_title
-- ============================================================================
SELECT 
  page_path,
  language_code,
  COUNT(*) as count,
  GROUP_CONCAT(id) as ids
FROM site_content
WHERE section_key = 'meta_title' 
  AND is_active = true
GROUP BY page_path, language_code
HAVING COUNT(*) > 1;

-- ============================================================================
-- 2. ENCONTRAR DUPLICADOS DE meta_description
-- ============================================================================
SELECT 
  page_path,
  language_code,
  COUNT(*) as count,
  GROUP_CONCAT(id) as ids
FROM site_content
WHERE section_key = 'meta_description' 
  AND is_active = true
GROUP BY page_path, language_code
HAVING COUNT(*) > 1;

-- ============================================================================
-- 3. ELIMINAR DUPLICADOS - Mantener el registro más reciente de meta_title
-- ============================================================================
DELETE FROM site_content
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id,
      page_path,
      language_code,
      updated,
      ROW_NUMBER() OVER (
        PARTITION BY page_path, language_code 
        ORDER BY updated DESC
      ) as rn
    FROM site_content
    WHERE section_key = 'meta_title' AND is_active = true
  )
  WHERE rn > 1
);

-- ============================================================================
-- 4. ELIMINAR DUPLICADOS - Mantener el registro más reciente de meta_description
-- ============================================================================
DELETE FROM site_content
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id,
      page_path,
      language_code,
      updated,
      ROW_NUMBER() OVER (
        PARTITION BY page_path, language_code 
        ORDER BY updated DESC
      ) as rn
    FROM site_content
    WHERE section_key = 'meta_description' AND is_active = true
  )
  WHERE rn > 1
);

-- ============================================================================
-- 5. ELIMINAR DUPLICADOS - Otros campos SEO comunes
-- ============================================================================
DELETE FROM site_content
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id,
      section_key,
      page_path,
      language_code,
      updated,
      ROW_NUMBER() OVER (
        PARTITION BY page_path, section_key, language_code 
        ORDER BY updated DESC
      ) as rn
    FROM site_content
    WHERE section_key IN ('_seo_canonical', '_og_title', '_og_description', '_og_image', '_seo_indexable')
      AND is_active = true
  )
  WHERE rn > 1
);

-- ============================================================================
-- 6. VERIFICAR QUE NO QUEDAN DUPLICADOS
-- ============================================================================
SELECT 
  section_key,
  COUNT(*) as total,
  SUM(CASE WHEN duplicate_count > 1 THEN 1 ELSE 0 END) as with_duplicates
FROM (
  SELECT 
    section_key,
    page_path,
    language_code,
    COUNT(*) as duplicate_count
  FROM site_content
  WHERE is_active = true
    AND section_key LIKE 'meta_%' 
    OR section_key LIKE '_og_%'
    OR section_key LIKE '_seo_%'
  GROUP BY section_key, page_path, language_code
)
GROUP BY section_key;
