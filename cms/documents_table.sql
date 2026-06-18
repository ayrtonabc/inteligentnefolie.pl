-- Tabla para almacenar documentos y contratos
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    category VARCHAR(50) DEFAULT 'other' CHECK (category IN ('contract', 'agreement', 'certificate', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsquedas por categoría
CREATE INDEX idx_documents_category ON documents(category);

-- Índice para ordenar por fecha
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

-- Habilitar RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas las operaciones (ajustar según necesidades de seguridad)
CREATE POLICY "Enable all operations for authenticated users" ON documents
    FOR ALL
    USING (true)
    WITH CHECK (true);
