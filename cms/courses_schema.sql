-- ============================================================================
-- MÓDULO DE CURSOS - CMS MULTI-TENANT
-- Schema completo y reparado con manejo automático de website_id
-- ============================================================================

-- ============================================================================
-- TABLAS PRINCIPALES
-- ============================================================================

-- Tabla principal de cursos
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    website_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    short_description TEXT,
    cover_image TEXT,
    status VARCHAR(20) DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
    price DECIMAL(10,2) DEFAULT 0.00,
    is_free BOOLEAN DEFAULT true,
    currency VARCHAR(3) DEFAULT 'USD',
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    allow_preview BOOLEAN DEFAULT true,
    meta_title VARCHAR(255),
    meta_description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para cursos
CREATE INDEX IF NOT EXISTS idx_courses_website_id ON courses(website_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);

-- Secciones de cursos (capítulos)
CREATE TABLE IF NOT EXISTS course_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para secciones
CREATE INDEX IF NOT EXISTS idx_course_sections_course_id ON course_sections(course_id);
CREATE INDEX IF NOT EXISTS idx_course_sections_sort_order ON course_sections(sort_order);

-- Lecciones de cursos
CREATE TABLE IF NOT EXISTS course_lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    lesson_type VARCHAR(20) DEFAULT 'video' CHECK (lesson_type IN ('video', 'text', 'quiz', 'assignment')),
    video_url TEXT,
    video_duration INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    is_preview BOOLEAN DEFAULT false,
    is_downloadable BOOLEAN DEFAULT false,
    allow_comments BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, slug)
);

-- Índices para lecciones
CREATE INDEX IF NOT EXISTS idx_course_lessons_section_id ON course_lessons(section_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON course_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_slug ON course_lessons(slug);
CREATE INDEX IF NOT EXISTS idx_course_lessons_sort_order ON course_lessons(sort_order);

-- Archivos adjuntos a lecciones
CREATE TABLE IF NOT EXISTS lesson_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_path TEXT,
    file_size BIGINT,
    file_type VARCHAR(50),
    mime_type VARCHAR(100),
    is_downloadable BOOLEAN DEFAULT true,
    downloads_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_files_lesson_id ON lesson_files(lesson_id);

-- Categorías de cursos
CREATE TABLE IF NOT EXISTS course_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    website_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50) DEFAULT 'BookOpen',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(website_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_course_categories_website_id ON course_categories(website_id);

-- Inscripciones de alumnos
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended', 'cancelled')),
    progress_percent INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'free', 'refunded')),
    payment_amount DECIMAL(10,2),
    certificate_url TEXT,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, user_id)
);

-- Índices para inscripciones
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(status);

-- Progreso de lecciones
CREATE TABLE IF NOT EXISTS course_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    is_started BOOLEAN DEFAULT false,
    progress_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(enrollment_id, lesson_id)
);

-- Índices para progreso
CREATE INDEX IF NOT EXISTS idx_course_progress_enrollment_id ON course_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_lesson_id ON course_progress(lesson_id);

-- Anuncios de curso
CREATE TABLE IF NOT EXISTS course_announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_announcements_course_id ON course_announcements(course_id);

-- ============================================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_sections_updated_at ON course_sections;
CREATE TRIGGER update_course_sections_updated_at BEFORE UPDATE ON course_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_lessons_updated_at ON course_lessons;
CREATE TRIGGER update_course_lessons_updated_at BEFORE UPDATE ON course_lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_enrollments_updated_at ON course_enrollments;
CREATE TRIGGER update_course_enrollments_updated_at BEFORE UPDATE ON course_enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_categories_updated_at ON course_categories;
CREATE TRIGGER update_course_categories_updated_at BEFORE UPDATE ON course_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar progreso del curso
CREATE OR REPLACE FUNCTION update_course_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE course_enrollments 
    SET 
        progress_percent = (
            SELECT COALESCE(ROUND(
                (COUNT(CASE WHEN is_completed THEN 1 END) * 100.0) / 
                NULLIF(COUNT(*), 0)
            , 0), 0)
            FROM course_progress
            WHERE enrollment_id = NEW.enrollment_id
        ),
        lessons_completed = (
            SELECT COUNT(*) 
            FROM course_progress 
            WHERE enrollment_id = NEW.enrollment_id AND is_completed = true
        )
    WHERE id = NEW.enrollment_id;
    
    -- Marcar como completado si llegó al 100%
    UPDATE course_enrollments 
    SET 
        status = 'completed',
        completed_at = NOW()
    WHERE id = NEW.enrollment_id 
    AND progress_percent >= 100 
    AND completed_at IS NULL;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_course_progress ON course_progress;
CREATE TRIGGER trigger_update_course_progress 
    AFTER INSERT OR UPDATE ON course_progress
    FOR EACH ROW EXECUTE FUNCTION update_course_progress();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Versión simplificada
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_announcements ENABLE ROW LEVEL SECURITY;

-- Políticas simplificadas (permitir todo por ahora, restringir luego)
DROP POLICY IF EXISTS "Allow all" ON courses;
CREATE POLICY "Allow all" ON courses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON course_sections;
CREATE POLICY "Allow all" ON course_sections FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON course_lessons;
CREATE POLICY "Allow all" ON course_lessons FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON lesson_files;
CREATE POLICY "Allow all" ON lesson_files FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON course_categories;
CREATE POLICY "Allow all" ON course_categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON course_enrollments;
CREATE POLICY "Allow all" ON course_enrollments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON course_progress;
CREATE POLICY "Allow all" ON course_progress FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON course_announcements;
CREATE POLICY "Allow all" ON course_announcements FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Crear buckets para almacenamiento (ignorar si ya existen)
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('course-videos', 'course-videos', false),
    ('course-files', 'course-files', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- DATOS INICIALES (Categorías por defecto)
-- ============================================================================

DO $$
DECLARE
    v_website_id UUID;
BEGIN
    -- Obtener el primer website disponible
    SELECT id INTO v_website_id FROM websites ORDER BY created_at LIMIT 1;
    
    IF v_website_id IS NOT NULL THEN
        -- Insertar categorías por defecto
        INSERT INTO course_categories (website_id, name, slug, description, color, icon, sort_order)
        VALUES 
            (v_website_id, 'General', 'general', 'Categoría general para cursos', '#6B7280', 'BookOpen', 1),
            (v_website_id, 'Programación', 'programacion', 'Cursos de desarrollo y programación', '#3B82F6', 'Code', 2),
            (v_website_id, 'Diseño', 'diseno', 'Diseño gráfico y UX/UI', '#8B5CF6', 'Palette', 3)
        ON CONFLICT (website_id, slug) DO NOTHING;
        
        RAISE NOTICE 'Schema de cursos creado correctamente. Categorías por defecto insertadas para website_id: %', v_website_id;
    ELSE
        RAISE NOTICE 'No se encontró website. Las tablas están creadas pero no se insertaron categorías.';
    END IF;
END $$;
