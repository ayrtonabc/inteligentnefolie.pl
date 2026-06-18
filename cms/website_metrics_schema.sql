-- Tabla para almacenar métricas de visitas a la landing page
-- Cuenta visitas únicas por IP (una vez por dispositivo/IP)

CREATE TABLE IF NOT EXISTS website_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  page_path TEXT NOT NULL,
  referrer TEXT,
  language_code TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  browser TEXT,
  os TEXT,
  session_id TEXT, -- Para agrupar visitas de la misma sesión
  is_unique BOOLEAN DEFAULT true, -- Si es la primera visita de esta IP
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_website_visits_ip ON website_visits(ip_address);
CREATE INDEX IF NOT EXISTS idx_website_visits_visited_at ON website_visits(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_website_visits_page_path ON website_visits(page_path);
CREATE INDEX IF NOT EXISTS idx_website_visits_is_unique ON website_visits(is_unique);
CREATE INDEX IF NOT EXISTS idx_website_visits_session_id ON website_visits(session_id);

-- Función para verificar si una IP ya visitó (para contar visitas únicas)
CREATE OR REPLACE FUNCTION check_unique_visit(visit_ip TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  has_visited BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 
    FROM website_visits 
    WHERE ip_address = visit_ip
    LIMIT 1
  ) INTO has_visited;
  
  RETURN NOT has_visited;
END;
$$ LANGUAGE plpgsql;

-- Comentarios
COMMENT ON TABLE website_visits IS 'Almacena las visitas a la landing page, contando solo una vez por IP';
COMMENT ON COLUMN website_visits.is_unique IS 'Indica si es la primera visita de esta IP';
COMMENT ON COLUMN website_visits.session_id IS 'ID de sesión para agrupar visitas de la misma sesión';

-- Habilitar RLS y añadir políticas para inserción y lectura anónima
ALTER TABLE website_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON website_visits FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON website_visits FOR INSERT WITH CHECK (true);
