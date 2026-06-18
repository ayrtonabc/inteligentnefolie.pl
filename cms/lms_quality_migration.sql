-- ============================================================================
-- MIGRACIÓN LMS - MEJORAS DE CALIDAD
-- Agrega campos y validaciones para robustez y escalabilidad
-- ============================================================================

-- ============================================================================
-- 1. CAMBIOS EN TABLA course_users
-- ============================================================================

ALTER TABLE course_users 
ADD COLUMN IF NOT EXISTS lms_role VARCHAR(20) DEFAULT 'student' CHECK (lms_role IN ('admin', 'instructor', 'student')),
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_watch_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS courses_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

COMMENT ON COLUMN course_users.lms_role IS 'Rol en el LMS: admin, instructor, student';
COMMENT ON COLUMN course_users.last_activity IS 'Última actividad del usuario';
COMMENT ON COLUMN course_users.total_watch_time IS 'Tiempo total de visualización en segundos';
COMMENT ON COLUMN course_users.courses_completed IS 'Cantidad de cursos completados';

-- ============================================================================
-- 2. CAMBIOS EN TABLA lesson_progress
-- ============================================================================

ALTER TABLE lesson_progress
ADD COLUMN IF NOT EXISTS video_position INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_watched_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_lesson_progress_completed ON lesson_progress(enrollment_id, completed);

-- ============================================================================
-- 3. AGREGAR CAMPO last_lesson A course_enrollments
-- ============================================================================

ALTER TABLE course_enrollments
ADD COLUMN IF NOT EXISTS last_lesson_id UUID,
ADD COLUMN IF NOT EXISTS next_lesson_id UUID,
ADD COLUMN IF NOT EXISTS certificate_issued BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS certificate_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_last_lesson ON course_enrollments(last_lesson_id);

-- ============================================================================
-- 4. AGREGAR ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_courses_list_published ON courses_list(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_list_category ON courses_list(category);
CREATE INDEX IF NOT EXISTS idx_course_chapters_course_order ON course_chapters(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_course_lectures_chapter_order ON course_lectures(chapter_id, order_index);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student ON course_enrollments(student_email);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_student ON course_enrollments(course_id, student_email);

-- ============================================================================
-- 5. FUNCIÓN: Actualizar progreso de inscripción
-- ============================================================================

CREATE OR REPLACE FUNCTION update_enrollment_progress(enrollment_uuid UUID)
RETURNS VOID AS $$
DECLARE
    v_course_id UUID;
    v_total_lessons INTEGER;
    v_completed_lessons INTEGER;
    v_progress_percent INTEGER;
BEGIN
    SELECT course_id INTO v_course_id FROM course_enrollments WHERE id = enrollment_uuid;
    
    SELECT COUNT(*) INTO v_total_lessons
    FROM course_lectures
    WHERE course_id = v_course_id;
    
    SELECT COUNT(*) INTO v_completed_lessons
    FROM course_progress cp
    JOIN course_enrollments ce ON cp.enrollment_id = ce.id
    WHERE ce.id = enrollment_uuid AND cp.is_completed = true;
    
    IF v_total_lessons > 0 THEN
        v_progress_percent := ROUND((v_completed_lessons::NUMERIC / v_total_lessons::NUMERIC) * 100);
    ELSE
        v_progress_percent := 0;
    END IF;
    
    IF v_progress_percent = 100 THEN
        UPDATE course_enrollments
        SET progress_percent = v_progress_percent,
            lessons_completed = v_completed_lessons,
            total_lessons = v_total_lessons,
            status = 'completed',
            completed_at = NOW()
        WHERE id = enrollment_uuid;
    ELSE
        UPDATE course_enrollments
        SET progress_percent = v_progress_percent,
            lessons_completed = v_completed_lessons,
            total_lessons = v_total_lessons,
            last_accessed_at = NOW()
        WHERE id = enrollment_uuid;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. FUNCIÓN: Obtener siguiente lección
-- ============================================================================

CREATE OR REPLACE FUNCTION get_next_lesson(enrollment_uuid UUID)
RETURNS TABLE(
    lecture_id UUID,
    lecture_title VARCHAR(255),
    chapter_title VARCHAR(255),
    order_index INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cl.id,
        cl.title,
        cc.chapter_title,
        cl.order_index
    FROM course_enrollments ce
    JOIN course_lectures cl ON cl.course_id = ce.course_id
    JOIN course_chapters cc ON cc.id = cl.chapter_id
    LEFT JOIN course_progress cp ON cp.lesson_id = cl.id AND cp.enrollment_id = ce.id
    WHERE ce.id = enrollment_uuid
      AND (cp.id IS NULL OR cp.is_completed = false)
    ORDER BY cc.order_index, cl.order_index
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. VISTA: Dashboard de estadísticas del estudiante
-- ============================================================================

CREATE OR REPLACE VIEW student_dashboard AS
SELECT 
    cu.id,
    cu.name,
    cu.email,
    cu.avatar,
    cu.lms_role,
    cu.total_watch_time,
    cu.courses_completed,
    COUNT(DISTINCT ce.id) as enrolled_courses,
    AVG(ce.progress_percent) as avg_progress
FROM course_users cu
LEFT JOIN course_enrollments ce ON ce.student_email = cu.email
GROUP BY cu.id, cu.name, cu.email, cu.avatar, cu.lms_role, cu.total_watch_time, cu.courses_completed;

-- ============================================================================
-- 8. VISTA: Cursos con estadísticas
-- ============================================================================

CREATE OR REPLACE VIEW courses_stats AS
SELECT 
    cl.id,
    cl.title,
    cl.thumbnail,
    cl.is_published,
    cl.price,
    cl.category,
    COUNT(DISTINCT ce.id) as enrolled_count,
    COALESCE(AVG(ce.progress_percent), 0) as avg_progress,
    COUNT(DISTINCT CASE WHEN ce.status = 'completed' THEN ce.id END) as completed_count
FROM courses_list cl
LEFT JOIN course_enrollments ce ON ce.course_id = cl.id
GROUP BY cl.id, cl.title, cl.thumbnail, cl.is_published, cl.price, cl.category;