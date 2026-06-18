-- ==========================================
-- SCRIPT DE ACTUALIZACIÓN DE BASE DE DATOS
-- Ejecuta este script entero en el Editor SQL de Supabase
-- para corregir los problemas faltantes
-- ==========================================

-- 1. Asegurar que las columnas faltantes existan en la tabla settings
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'pl';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'poland';

-- 2. Crear o recrear la tabla de visitas web si no existe
CREATE TABLE IF NOT EXISTS public.website_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  page_path TEXT NOT NULL,
  referrer TEXT,
  language_code TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT, 
  browser TEXT,
  os TEXT,
  session_id TEXT, 
  is_unique BOOLEAN DEFAULT true, 
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear índices para optimizar las consultas de métricas
CREATE INDEX IF NOT EXISTS idx_website_visits_ip ON public.website_visits(ip_address);
CREATE INDEX IF NOT EXISTS idx_website_visits_visited_at ON public.website_visits(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_website_visits_page_path ON public.website_visits(page_path);
CREATE INDEX IF NOT EXISTS idx_website_visits_is_unique ON public.website_visits(is_unique);
CREATE INDEX IF NOT EXISTS idx_website_visits_session_id ON public.website_visits(session_id);

-- 4. Habilitar la Seguridad de Fila (RLS) en la tabla
ALTER TABLE public.website_visits ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas para permitir inserciones y lecturas sin autenticación
-- Permitir select desde cualquier usuario
DO $$ BEGIN 
  CREATE POLICY "Enable read access for all users" ON public.website_visits FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; 
END $$;

-- Permitir insert desde cualquier usuario (es lo que permite contar las visitas anonimas)
DO $$ BEGIN 
  CREATE POLICY "Enable insert for all users" ON public.website_visits FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; 
END $$;

-- Comentarios explicativos
COMMENT ON TABLE public.website_visits IS 'Almacena las visitas a la landing page, contando solo una vez por IP';
COMMENT ON COLUMN public.website_visits.is_unique IS 'Indica si es la primera visita de esta IP';
COMMENT ON COLUMN public.website_visits.session_id IS 'ID de sesión para agrupar visitas de la misma sesión';

-- ==========================================
-- ¡Listo! Ya todo debería quedar funcionando perfecto.
-- ==========================================
