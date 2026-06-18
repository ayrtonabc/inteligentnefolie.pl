-- =====================================================
-- SQL DE DEMOSTRACIÓN PARA CURSO PLATFORM
-- Cursos, secciones, lecciones y datos de prueba
-- Versión con website_id automático
-- =====================================================

DO $$
DECLARE
    v_website_id UUID;
    v_course_id_1 UUID;
    v_course_id_2 UUID;
    v_course_id_3 UUID;
    v_course_id_4 UUID;
    v_section_id_1 UUID;
    v_section_id_2 UUID;
    v_section_id_3 UUID;
    v_category_id_1 UUID;
    v_category_id_2 UUID;
    v_category_id_3 UUID;
    v_category_id_4 UUID;
BEGIN
    -- Obtener el website_id automáticamente
    SELECT id INTO v_website_id FROM websites ORDER BY created_at LIMIT 1;
    
    IF v_website_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró ningún website. Por favor, crea un website primero.';
    END IF;

    -- =====================================================
    -- INSERTAR CATEGORÍAS
    -- =====================================================
    
    INSERT INTO course_categories (website_id, name, slug, description, color, icon, sort_order, is_active)
    VALUES 
      (v_website_id, 'Programación', 'programacion', 'Cursos de desarrollo y programación', '#3B82F6', 'Code', 1, true)
    ON CONFLICT (website_id, slug) DO NOTHING
    RETURNING id INTO v_category_id_1;
    
    -- Si ya existía, obtener el id
    IF v_category_id_1 IS NULL THEN
        SELECT id INTO v_category_id_1 FROM course_categories 
        WHERE website_id = v_website_id AND slug = 'programacion';
    END IF;
    
    INSERT INTO course_categories (website_id, name, slug, description, color, icon, sort_order, is_active)
    VALUES 
      (v_website_id, 'Diseño', 'diseno', 'Cursos de diseño gráfico y UX/UI', '#8B5CF6', 'Palette', 2, true)
    ON CONFLICT (website_id, slug) DO NOTHING
    RETURNING id INTO v_category_id_2;
    
    IF v_category_id_2 IS NULL THEN
        SELECT id INTO v_category_id_2 FROM course_categories 
        WHERE website_id = v_website_id AND slug = 'diseno';
    END IF;
    
    INSERT INTO course_categories (website_id, name, slug, description, color, icon, sort_order, is_active)
    VALUES 
      (v_website_id, 'Marketing', 'marketing', 'Marketing digital y estrategias', '#10B981', 'TrendingUp', 3, true)
    ON CONFLICT (website_id, slug) DO NOTHING
    RETURNING id INTO v_category_id_3;
    
    IF v_category_id_3 IS NULL THEN
        SELECT id INTO v_category_id_3 FROM course_categories 
        WHERE website_id = v_website_id AND slug = 'marketing';
    END IF;
    
    INSERT INTO course_categories (website_id, name, slug, description, color, icon, sort_order, is_active)
    VALUES 
      (v_website_id, 'Negocios', 'negocios', 'Emprendimiento y gestión empresarial', '#F59E0B', 'Briefcase', 4, true)
    ON CONFLICT (website_id, slug) DO NOTHING
    RETURNING id INTO v_category_id_4;
    
    IF v_category_id_4 IS NULL THEN
        SELECT id INTO v_category_id_4 FROM course_categories 
        WHERE website_id = v_website_id AND slug = 'negocios';
    END IF;

    -- =====================================================
    -- INSERTAR CURSOS
    -- =====================================================

    -- Curso 1: Introducción a React
    INSERT INTO courses (
      website_id, 
      title, 
      slug, 
      description, 
      short_description,
      cover_image,
      status,
      price,
      is_free,
      currency,
      is_featured,
      is_published,
      allow_preview,
      meta_title,
      meta_description,
      created_at,
      updated_at
    ) VALUES (
      v_website_id,
      'Introducción a React.js',
      'introduccion-a-react',
      'Aprende React.js desde cero. Este curso completo te llevará desde los conceptos básicos hasta crear aplicaciones web modernas y escalables. Incluye hooks, componentes, estado, y mucho más.',
      'Curso completo de React desde cero hasta experto',
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      'published',
      49.99,
      false,
      'USD',
      true,
      true,
      true,
      'Curso de React.js Completo 2024 | Desde Cero a Experto',
      'Aprende React.js con este curso práctico. Hooks, componentes, estado, rutas y más. Proyectos reales incluidos.',
      NOW(),
      NOW()
    )
    RETURNING id INTO v_course_id_1;

    -- Curso 2: Diseño UX/UI (Gratuito)
    INSERT INTO courses (
      website_id, 
      title, 
      slug, 
      description, 
      short_description,
      cover_image,
      status,
      price,
      is_free,
      currency,
      is_featured,
      is_published,
      allow_preview,
      meta_title,
      meta_description,
      created_at,
      updated_at
    ) VALUES (
      v_website_id,
      'Diseño UX/UI para Principiantes',
      'diseno-ux-ui-principiantes',
      'Aprende los fundamentos del diseño de experiencia de usuario y interfaz. Desde investigación de usuarios hasta prototipos interactivos en Figma.',
      'Fundamentos de UX/UI para principiantes',
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
      'published',
      0,
      true,
      'USD',
      true,
      true,
      true,
      'Curso Gratis de UX/UI Design | Principiantes',
      'Aprende diseño UX/UI desde cero. Investigación, wireframes, prototipos y prácticas profesionales.',
      NOW(),
      NOW()
    )
    RETURNING id INTO v_course_id_2;

    -- Curso 3: Marketing Digital
    INSERT INTO courses (
      website_id, 
      title, 
      slug, 
      description, 
      short_description,
      cover_image,
      status,
      price,
      is_free,
      currency,
      is_featured,
      is_published,
      allow_preview,
      meta_title,
      meta_description,
      created_at,
      updated_at
    ) VALUES (
      v_website_id,
      'Marketing Digital 360°',
      'marketing-digital-360',
      'Domina el marketing digital: SEO, redes sociales, email marketing, Google Ads, analytics y estrategias de contenido. Casos de estudio reales incluidos.',
      'Estrategias completas de marketing digital',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      'published',
      79.99,
      false,
      'USD',
      false,
      true,
      true,
      'Marketing Digital Completo 2024 | SEO, Ads, Redes Sociales',
      'Curso completo de marketing digital. Aprende SEO, SEM, redes sociales, email marketing y analytics.',
      NOW(),
      NOW()
    )
    RETURNING id INTO v_course_id_3;

    -- Curso 4: Python (Borrador)
    INSERT INTO courses (
      website_id, 
      title, 
      slug, 
      description, 
      short_description,
      cover_image,
      status,
      price,
      is_free,
      currency,
      is_featured,
      is_published,
      allow_preview,
      meta_title,
      meta_description,
      created_at,
      updated_at
    ) VALUES (
      v_website_id,
      'Python para Data Science',
      'python-data-science',
      'Curso avanzado de Python enfocado en análisis de datos, machine learning y visualización. Pandas, NumPy, Matplotlib, Scikit-learn.',
      'Python para ciencia de datos y ML',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
      'draft',
      99.99,
      false,
      'USD',
      false,
      false,
      false,
      'Python Data Science y Machine Learning | Curso Avanzado',
      'Domina Python para data science. Machine learning, análisis de datos, visualización y proyectos reales.',
      NOW(),
      NOW()
    )
    RETURNING id INTO v_course_id_4;

    -- =====================================================
    -- SECCIONES PARA EL CURSO DE REACT
    -- =====================================================

    INSERT INTO course_sections (course_id, title, description, sort_order, is_published)
    VALUES (v_course_id_1, 'Módulo 1: Fundamentos de React', 'Conceptos básicos, JSX, componentes y props', 1, true)
    RETURNING id INTO v_section_id_1;

    INSERT INTO course_sections (course_id, title, description, sort_order, is_published)
    VALUES (v_course_id_1, 'Módulo 2: Hooks en React', 'useState, useEffect y hooks personalizados', 2, true)
    RETURNING id INTO v_section_id_2;

    INSERT INTO course_sections (course_id, title, description, sort_order, is_published)
    VALUES (v_course_id_1, 'Módulo 3: Proyecto Final', 'Desarrolla una aplicación completa con React', 3, true)
    RETURNING id INTO v_section_id_3;

    -- =====================================================
    -- LECCIONES PARA EL CURSO DE REACT - MÓDULO 1
    -- =====================================================

    INSERT INTO course_lessons (section_id, course_id, title, slug, description, content, video_url, video_duration, lesson_type, sort_order, is_published, is_preview, created_at)
    VALUES (
      v_section_id_1, v_course_id_1, '1.1 - Introducción a React', 'introduccion-a-react-11',
      '¿Qué es React y por qué usarlo?',
      '<h2>¿Qué es React?</h2><p>React es una biblioteca de JavaScript para construir interfaces de usuario...</p><h3>Conceptos clave:</h3><ul><li>Componentes</li><li>Virtual DOM</li><li>Unidirectional Data Flow</li></ul>',
      'https://www.youtube.com/embed/w7ejDZ8SWv8', 900, 'video', 1, true, true, NOW()
    );

    INSERT INTO course_lessons (section_id, course_id, title, slug, description, content, video_url, video_duration, lesson_type, sort_order, is_published, is_preview, created_at)
    VALUES (
      v_section_id_1, v_course_id_1, '1.2 - JSX y Componentes', 'jsx-y-componentes-12',
      'Aprende a escribir JSX y crear tus primeros componentes',
      '<h2>JSX: JavaScript XML</h2><p>JSX es una extensión de sintaxis para JavaScript...</p><pre><code>const element = &lt;h1&gt;Hello, world!&lt;/h1&gt;;</code></pre>',
      NULL, 1200, 'text', 2, true, true, NOW()
    );

    INSERT INTO course_lessons (section_id, course_id, title, slug, description, content, video_url, video_duration, lesson_type, sort_order, is_published, is_preview, created_at)
    VALUES (
      v_section_id_1, v_course_id_1, '1.3 - Props y Comunicación', 'props-y-comunicacion-13',
      'Pasar datos entre componentes con props',
      '<h2>Props en React</h2><p>Las props (propiedades) son la forma de pasar datos de un componente padre a un componente hijo...</p>',
      NULL, 600, 'text', 3, true, false, NOW()
    );

    -- =====================================================
    -- LECCIONES PARA EL CURSO DE REACT - MÓDULO 2
    -- =====================================================

    INSERT INTO course_lessons (section_id, course_id, title, slug, description, content, video_url, video_duration, lesson_type, sort_order, is_published, is_preview, created_at)
    VALUES (
      v_section_id_2, v_course_id_1, '2.1 - useState Hook', 'usestate-hook-21',
      'Manejo de estado en componentes funcionales',
      '<h2>useState</h2><p>El hook useState nos permite agregar estado a los componentes funcionales...</p><pre><code>const [count, setCount] = useState(0);</code></pre>',
      'https://www.youtube.com/embed/O6P86uwfdR0', 1800, 'video', 1, true, true, NOW()
    );

    INSERT INTO course_lessons (section_id, course_id, title, slug, description, content, video_url, video_duration, lesson_type, sort_order, is_published, is_preview, created_at)
    VALUES (
      v_section_id_2, v_course_id_1, '2.2 - useEffect Hook', 'useeffect-hook-22',
      'Efectos secundarios y ciclo de vida',
      '<h2>useEffect</h2><p>useEffect nos permite realizar efectos secundarios en componentes funcionales...</p>',
      NULL, 1500, 'text', 2, true, false, NOW()
    );

    -- =====================================================
    -- SECCIONES PARA EL CURSO DE UX/UI
    -- =====================================================

    INSERT INTO course_sections (course_id, title, description, sort_order, is_published)
    VALUES (v_course_id_2, 'Fundamentos de UX', 'Investigación de usuarios y arquitectura de información', 1, true);

    INSERT INTO course_sections (course_id, title, description, sort_order, is_published)
    VALUES (v_course_id_2, 'Diseño de Interfaces', 'Principios de diseño visual y herramientas', 2, true);

    -- =====================================================
    -- ANUNCIOS DE CURSO
    -- =====================================================

    INSERT INTO course_announcements (course_id, title, content, is_pinned, created_at)
    VALUES (
      v_course_id_1,
      '🎉 Bienvenidos al curso!',
      'Espero que disfruten aprendiendo React. No duden en hacer preguntas en los comentarios.',
      true, NOW()
    );

    INSERT INTO course_announcements (course_id, title, content, is_pinned, created_at)
    VALUES (
      v_course_id_1,
      '📅 Actualización programada',
      'Próxima semana agregaremos nuevas lecciones sobre React Router y Context API.',
      false, NOW()
    );

    -- =====================================================
    -- ACTIVAR ADDON DE CURSOS
    -- =====================================================

    INSERT INTO website_addons (website_id, addon_key, is_active)
    VALUES (v_website_id, 'courses', true)
    ON CONFLICT (website_id, addon_key) DO UPDATE SET is_active = true;

    RAISE NOTICE 'Datos de demostración insertados correctamente para website_id: %', v_website_id;
    RAISE NOTICE 'Cursos creados: React, UX/UI, Marketing, Python (borrador)';
    RAISE NOTICE 'Lecciones creadas: 5 lecciones en el curso de React';

END $$;

