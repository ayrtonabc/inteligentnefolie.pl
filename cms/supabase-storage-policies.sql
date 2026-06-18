-- ============================================
-- SUPABASE STORAGE RLS POLICIES
-- Ejecutar en SQL Editor de Supabase Dashboard
-- ============================================

-- 1. Habilitar RLS en storage.objects (si no está habilitado)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICAS PARA BUCKETS PÚBLICOS
-- Eliminar políticas existentes primero (opcional, para limpiar)
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Public INSERT" ON storage.objects;
DROP POLICY IF EXISTS "Public UPDATE" ON storage.objects;
DROP POLICY IF EXISTS "Public DELETE" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete" ON storage.objects;

-- 3. CREAR POLÍTICAS DE SOLO LECTURA PARA TODOS (ANÓNIMOS Y AUTH)
-- Permitir SELECT a todos (público)
CREATE POLICY "Public SELECT" ON storage.objects
    FOR SELECT USING (true);

-- 4. CREAR POLÍTICAS PARA USUARIOS AUTENTICADOS (INSERT, UPDATE, DELETE)
-- Permitir INSERT a usuarios autenticados
CREATE POLICY "Authenticated INSERT" ON storage.objects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir UPDATE a usuarios autenticados (solo sus propios archivos)
CREATE POLICY "Authenticated UPDATE" ON storage.objects
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Permitir DELETE a usuarios autenticados
CREATE POLICY "Authenticated DELETE" ON storage.objects
    FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- ALTERNATIVA: BUCKETS ESPECÍFICOS
-- Descomenta y modifica según necesites
-- ============================================

-- Para buckets específicos (ejemplo: solo website-assets público)
-- CREATE POLICY "Public SELECT website-assets" ON storage.objects
--     FOR SELECT USING (bucket_id = 'website-assets');

-- ============================================
-- NOTA IMPORTANTE
-- ============================================
-- Después de ejecutar este SQL:
-- 1. Ve a Storage en Supabase Dashboard
-- 2. Verifica que los buckets estén públicos (checkbox "Public")
-- 3. Recarga la página /panel/media en el CMS
