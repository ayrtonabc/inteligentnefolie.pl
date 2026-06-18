-- ============================================
-- PLATAFORMA DE CURSOS COMPLETA
-- CMS SaaS - React + Vite + Supabase
-- ============================================

-- Habilitar UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABLA: COURSES (Cursos)
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  cover_image TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Precio y acceso
  is_free BOOLEAN DEFAULT true,
  price DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  -- Configuración
  is_featured BOOLEAN DEFAULT false,
  allow_preview BOOLEAN DEFAULT true,
  
  -- Estadísticas (calculadas)
  total_students INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0, -- en minutos
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT unique_slug_per_website UNIQUE (website_id, slug)
);

-- ============================================
-- 2. TABLA: COURSE_SECTIONS (Capítulos)
-- ============================================
CREATE TABLE IF NOT EXISTS course_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. TABLA: COURSE_LESSONS (Lecciones)
-- ============================================
CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Información básica
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Contenido
  content TEXT, -- HTML/Rich text
  lesson_type VARCHAR(20) DEFAULT 'video' CHECK (lesson_type IN ('video', 'text', 'quiz', 'file', 'live')),
  
  -- Video
  video_url TEXT,
  video_duration INTEGER DEFAULT 0, -- en segundos
  video_provider VARCHAR(20) DEFAULT 'storage' CHECK (video_provider IN ('storage', 'youtube', 'vimeo', 'external')),
  video_file_path TEXT, -- path en Supabase Storage
  
  -- Configuración
  is_published BOOLEAN DEFAULT false,
  is_preview BOOLEAN DEFAULT false,
  is_downloadable BOOLEAN DEFAULT false,
  allow_comments BOOLEAN DEFAULT true,
  
  -- Ordenamiento
  sort_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_slug_per_section UNIQUE (section_id, slug)
);

-- ============================================
-- 4. TABLA: COURSE_FILES (Material descargable)
-- ============================================
CREATE TABLE IF NOT EXISTS course_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_path TEXT, -- path en Supabase Storage
  file_size BIGINT, -- en bytes
  file_type VARCHAR(100),
  mime_type VARCHAR(100),
  
  is_downloadable BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. TABLA: COURSE_ENROLLMENTS (Inscripciones)
-- ============================================
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Estado de inscripción
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended', 'cancelled')),
  
  -- Pago
  payment_status VARCHAR(20) DEFAULT 'free' CHECK (payment_status IN ('free', 'paid', 'pending', 'refunded')),
  payment_amount DECIMAL(10,2),
  payment_currency VARCHAR(3),
  payment_method VARCHAR(50),
  payment_date TIMESTAMPTZ,
  
  -- Progreso
  progress_percent INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  
  -- Fechas
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  CONSTRAINT unique_enrollment UNIQUE (course_id, user_id)
);

-- ============================================
-- 6. TABLA: COURSE_LESSON_PROGRESS (Progreso por lección)
-- ============================================
CREATE TABLE IF NOT EXISTS course_lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  
  -- Estado
  is_completed BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  
  -- Progreso del video (para lecciones de video)
  video_progress_seconds INTEGER DEFAULT 0,
  video_watched_seconds INTEGER DEFAULT 0,
  video_last_position INTEGER DEFAULT 0,
  
  -- Fechas
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_lesson_progress UNIQUE (enrollment_id, lesson_id)
);

-- ============================================
-- 7. TABLA: COURSE_REVIEWS (Reseñas)
-- ============================================
CREATE TABLE IF NOT EXISTS course_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE SET NULL,
  
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  is_approved BOOLEAN DEFAULT false,
  
  helpful_count INTEGER DEFAULT 0,
  reported_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_review UNIQUE (course_id, user_id)
);

-- ============================================
-- 8. TABLA: COURSE_CATEGORIES (Categorías)
-- ============================================
CREATE TABLE IF NOT EXISTS course_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7),
  icon VARCHAR(50),
  
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_category_slug UNIQUE (website_id, slug)
);

-- ============================================
-- 9. TABLA: COURSE_CATEGORY_RELATIONS (Relación curso-categoría)
-- ============================================
CREATE TABLE IF NOT EXISTS course_category_relations (
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  category_id UUID REFERENCES course_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, category_id)
);

-- ============================================
-- 10. TABLA: COURSE_ANNOUNCEMENTS (Anuncios del curso)
-- ============================================
CREATE TABLE IF NOT EXISTS course_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES (Performance)
-- ============================================
CREATE INDEX idx_courses_website ON courses(website_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_slug ON courses(slug);

CREATE INDEX idx_sections_course ON course_sections(course_id);
CREATE INDEX idx_sections_order ON course_sections(sort_order);

CREATE INDEX idx_lessons_section ON course_lessons(section_id);
CREATE INDEX idx_lessons_course ON course_lessons(course_id);
CREATE INDEX idx_lessons_order ON course_lessons(sort_order);
CREATE INDEX idx_lessons_type ON course_lessons(lesson_type);

CREATE INDEX idx_files_lesson ON course_files(lesson_id);

CREATE INDEX idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_enrollments_status ON course_enrollments(status);

CREATE INDEX idx_progress_enrollment ON course_lesson_progress(enrollment_id);
CREATE INDEX idx_progress_lesson ON course_lesson_progress(lesson_id);
CREATE INDEX idx_progress_completed ON course_lesson_progress(is_completed);

CREATE INDEX idx_reviews_course ON course_reviews(course_id);

-- ============================================
-- TRIGGERS (Auto-update timestamps)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para courses
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers para sections
DROP TRIGGER IF EXISTS update_sections_updated_at ON course_sections;
CREATE TRIGGER update_sections_updated_at
  BEFORE UPDATE ON course_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers para lessons
DROP TRIGGER IF EXISTS update_lessons_updated_at ON course_lessons;
CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON course_lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers para reviews
DROP TRIGGER IF EXISTS update_reviews_updated_at ON course_reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON course_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Actualizar estadísticas del curso
-- ============================================
CREATE OR REPLACE FUNCTION update_course_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar conteo de estudiantes
  UPDATE courses
  SET total_students = (
    SELECT COUNT(*) 
    FROM course_enrollments 
    WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
    AND status IN ('active', 'completed')
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_course_stats_on_enrollment ON course_enrollments;
CREATE TRIGGER update_course_stats_on_enrollment
  AFTER INSERT OR UPDATE OR DELETE ON course_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_course_stats();

-- ============================================
-- RLS POLICIES (Row Level Security)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_category_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_announcements ENABLE ROW LEVEL SECURITY;

-- Courses: Website owners pueden gestionar, otros solo ver publicados
DROP POLICY IF EXISTS courses_website_owner ON courses;
CREATE POLICY courses_website_owner ON courses
  USING (EXISTS (
    SELECT 1 FROM websites w
    JOIN website_users wu ON w.id = wu.website_id
    WHERE w.id = courses.website_id AND wu.user_id = auth.uid()
  ));

-- Sections: Solo website owners
DROP POLICY IF EXISTS sections_website_owner ON course_sections;
CREATE POLICY sections_website_owner ON course_sections
  USING (EXISTS (
    SELECT 1 FROM courses c
    JOIN websites w ON c.website_id = w.id
    JOIN website_users wu ON w.id = wu.website_id
    WHERE c.id = course_sections.course_id AND wu.user_id = auth.uid()
  ));

-- Lessons: Solo website owners
DROP POLICY IF EXISTS lessons_website_owner ON course_lessons;
CREATE POLICY lessons_website_owner ON course_lessons
  USING (EXISTS (
    SELECT 1 FROM courses c
    JOIN websites w ON c.website_id = w.id
    JOIN website_users wu ON w.id = wu.website_id
    WHERE c.id = course_lessons.course_id AND wu.user_id = auth.uid()
  ));

-- Files: Solo website owners
DROP POLICY IF EXISTS files_website_owner ON course_files;
CREATE POLICY files_website_owner ON course_files
  USING (EXISTS (
    SELECT 1 FROM courses c
    JOIN course_lessons l ON c.id = l.course_id
    JOIN websites w ON c.website_id = w.id
    JOIN website_users wu ON w.id = wu.website_id
    WHERE l.id = course_files.lesson_id AND wu.user_id = auth.uid()
  ));

-- Enrollments: Usuarios ven las suyas, admins ven todas del website
DROP POLICY IF EXISTS enrollments_user ON course_enrollments;
CREATE POLICY enrollments_user ON course_enrollments
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM courses c
      JOIN websites w ON c.website_id = w.id
      JOIN website_users wu ON w.id = wu.website_id
      WHERE c.id = course_enrollments.course_id AND wu.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS enrollments_insert ON course_enrollments;
CREATE POLICY enrollments_insert ON course_enrollments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM courses c
      JOIN websites w ON c.website_id = w.id
      JOIN website_users wu ON w.id = wu.website_id
      WHERE c.id = course_enrollments.course_id AND wu.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS enrollments_update ON course_enrollments;
CREATE POLICY enrollments_update ON course_enrollments
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM courses c
      JOIN websites w ON c.website_id = w.id
      JOIN website_users wu ON w.id = wu.website_id
      WHERE c.id = course_enrollments.course_id AND wu.user_id = auth.uid()
    )
  );

-- Progress: Usuarios gestionan su propio progreso
DROP POLICY IF EXISTS progress_user ON course_lesson_progress;
CREATE POLICY progress_user ON course_lesson_progress
  USING (EXISTS (
    SELECT 1 FROM course_enrollments e
    WHERE e.id = course_lesson_progress.enrollment_id 
    AND (e.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM courses c
      JOIN websites w ON c.website_id = w.id
      JOIN website_users wu ON w.id = wu.website_id
      WHERE c.id = e.course_id AND wu.user_id = auth.uid()
    ))
  ));

-- Categories: Solo website owners
DROP POLICY IF EXISTS categories_website_owner ON course_categories;
CREATE POLICY categories_website_owner ON course_categories
  USING (EXISTS (
    SELECT 1 FROM websites w
    JOIN website_users wu ON w.id = wu.website_id
    WHERE w.id = course_categories.website_id AND wu.user_id = auth.uid()
  ));

-- Announcements: Solo website owners
DROP POLICY IF EXISTS announcements_website_owner ON course_announcements;
CREATE POLICY announcements_website_owner ON course_announcements
  USING (EXISTS (
    SELECT 1 FROM courses c
    JOIN websites w ON c.website_id = w.id
    JOIN website_users wu ON w.id = wu.website_id
    WHERE c.id = course_announcements.course_id AND wu.user_id = auth.uid()
  ));
