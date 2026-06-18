-- ============================================================================
-- DATOS DE DEMOSTRACIÓN PARA PORTFOLIO/PROYECTOS
-- ============================================================================
-- 4 categorías, 8 proyectos demo con imágenes de Unsplash
-- ============================================================================

-- Eliminar constraint problemático si existe
ALTER TABLE project_images DROP CONSTRAINT IF EXISTS unique_primary_image_per_project;

DO $$
DECLARE
  v_website_id UUID;
  v_project UUID;
  v_cat_web UUID;
  v_cat_mobile UUID;
  v_cat_branding UUID;
  v_cat_ui UUID;
  v_tech_react UUID;
  v_tech_vue UUID;
  v_tech_node UUID;
  v_tech_figma UUID;
  v_tech_ps UUID;
BEGIN
  -- Obtener website_id
  SELECT id INTO v_website_id FROM websites LIMIT 1;
  
  IF v_website_id IS NULL THEN
    RAISE EXCEPTION 'No website found. Please create a website first.';
  END IF;

  RAISE NOTICE 'Creating demo portfolio data for website_id: %', v_website_id;

  -- ============================================================================
  -- CATEGORÍAS
  -- ============================================================================
  
  INSERT INTO project_categories (website_id, name, slug, description, color, is_active, sort_order)
  VALUES (v_website_id, 'Desarrollo Web', 'desarrollo-web', 'Sitios web y aplicaciones web modernas', '#3B82F6', true, 1)
  RETURNING id INTO v_cat_web;

  INSERT INTO project_categories (website_id, name, slug, description, color, is_active, sort_order)
  VALUES (v_website_id, 'Apps Móviles', 'apps-moviles', 'Aplicaciones para iOS y Android', '#10B981', true, 2)
  RETURNING id INTO v_cat_mobile;

  INSERT INTO project_categories (website_id, name, slug, description, color, is_active, sort_order)
  VALUES (v_website_id, 'Branding', 'branding', 'Identidad corporativa y diseño de marca', '#8B5CF6', true, 3)
  RETURNING id INTO v_cat_branding;

  INSERT INTO project_categories (website_id, name, slug, description, color, is_active, sort_order)
  VALUES (v_website_id, 'UI/UX Design', 'ui-ux-design', 'Interfaces de usuario y experiencia', '#EC4899', true, 4)
  RETURNING id INTO v_cat_ui;

  -- ============================================================================
  -- TECNOLOGÍAS
  -- ============================================================================
  
  INSERT INTO project_technologies (website_id, name, icon, color)
  VALUES (v_website_id, 'React', 'react', '#61DAFB')
  RETURNING id INTO v_tech_react;

  INSERT INTO project_technologies (website_id, name, icon, color)
  VALUES (v_website_id, 'Vue.js', 'vue', '#4FC08D')
  RETURNING id INTO v_tech_vue;

  INSERT INTO project_technologies (website_id, name, icon, color)
  VALUES (v_website_id, 'Node.js', 'nodejs', '#339933')
  RETURNING id INTO v_tech_node;

  INSERT INTO project_technologies (website_id, name, icon, color)
  VALUES (v_website_id, 'Figma', 'figma', '#F24E1E')
  RETURNING id INTO v_tech_figma;

  INSERT INTO project_technologies (website_id, name, icon, color)
  VALUES (v_website_id, 'Photoshop', 'photoshop', '#31A8FF')
  RETURNING id INTO v_tech_ps;

  -- ============================================================================
  -- PROYECTO 1: E-commerce Moderno
  -- ============================================================================
  INSERT INTO projects (
    website_id, category_id, title, slug, short_description, description,
    client_name, completion_date, project_url, status, is_featured, layout, sort_order
  ) VALUES (
    v_website_id, v_cat_web, 'E-commerce Moderno', 'e-commerce-moderno',
    'Plataforma de comercio electrónico con React y Node.js',
    'Desarrollo completo de una plataforma de comercio electrónico moderna con carrito de compras, pasarela de pagos integrada, panel de administración y sistema de inventario en tiempo real.',
    'TechStore Inc.', '2024-03-15', 'https://techstore-demo.com', 'published', true, 'standard', 1
  )
  RETURNING id INTO v_project;

  INSERT INTO project_images (project_id, url, is_primary, sort_order, alt_text)
  VALUES 
    (v_project, 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200', true, 1, 'E-commerce homepage'),
    (v_project, 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=1200', false, 2, 'Product page'),
    (v_project, 'https://images.unsplash.com/photo-1556742111-a301076d8d58?w=1200', false, 3, 'Checkout flow');

  INSERT INTO project_technology_links (project_id, technology_id) VALUES (v_project, v_tech_react), (v_project, v_tech_node);

  -- ============================================================================
  -- PROYECTO 2: App Fitness Tracker
  -- ============================================================================
  INSERT INTO projects (
    website_id, category_id, title, slug, short_description, description,
    client_name, completion_date, project_url, status, is_featured, layout, sort_order
  ) VALUES (
    v_website_id, v_cat_mobile, 'Fitness Tracker Pro', 'fitness-tracker-pro',
    'Aplicación móvil para seguimiento de ejercicios y salud',
    'Aplicación completa para iOS y Android que permite a los usuarios registrar sus entrenamientos, seguir su progreso, establecer metas y conectar con dispositivos wearables.',
    'FitLife Co.', '2024-02-20', 'https://fitness-pro.app', 'published', true, 'standard', 2
  )
  RETURNING id INTO v_project;

  INSERT INTO project_images (project_id, url, is_primary, sort_order, alt_text)
  VALUES 
    (v_project, 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=1200', true, 1, 'App dashboard'),
    (v_project, 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200', false, 2, 'Workout tracking'),
    (v_project, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200', false, 3, 'Health metrics');

  INSERT INTO project_technology_links (project_id, technology_id) VALUES (v_project, v_tech_react);

  -- ============================================================================
  -- PROYECTO 3: Identidad de Marca Café
  -- ============================================================================
  INSERT INTO projects (
    website_id, category_id, title, slug, short_description, description,
    client_name, completion_date, status, is_featured, layout, sort_order
  ) VALUES (
    v_website_id, v_cat_branding, 'Aroma Coffee Brand', 'aroma-coffee-brand',
    'Diseño completo de identidad corporativa para cafetería artesanal',
    'Creación de identidad de marca completa incluyendo logo, paleta de colores, tipografía, packaging, menús y aplicaciones en espacio físico para una cadena de cafeterías premium.',
    'Aroma Coffee Co.', '2024-01-10', 'published', false, 'gallery', 3
  )
  RETURNING id INTO v_project;

  INSERT INTO project_images (project_id, url, is_primary, sort_order, alt_text)
  VALUES 
    (v_project, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200', true, 1, 'Brand identity'),
    (v_project, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200', false, 2, 'Coffee packaging'),
    (v_project, 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200', false, 3, 'Store interior'),
    (v_project, 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=1200', false, 4, 'Menu design');

  INSERT INTO project_technology_links (project_id, technology_id) VALUES (v_project, v_tech_ps);

  -- ============================================================================
  -- PROYECTO 4: Dashboard Analytics
  -- ============================================================================
  INSERT INTO projects (
    website_id, category_id, title, slug, short_description, description,
    client_name, completion_date, project_url, status, is_featured, layout, sort_order
  ) VALUES (
    v_website_id, v_cat_ui, 'Analytics Dashboard', 'analytics-dashboard',
    'Diseño de interfaz para dashboard de análisis de datos',
    'Diseño completo de interfaz de usuario para un dashboard empresarial de análisis de datos, incluyendo visualizaciones, gráficos interactivos y sistema de filtros avanzados.',
    'DataCorp', '2024-03-01', NULL, 'published', true, 'fullscreen', 4
  )
  RETURNING id INTO v_project;

  INSERT INTO project_images (project_id, url, is_primary, sort_order, alt_text)
  VALUES 
    (v_project, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200', true, 1, 'Dashboard main'),
    (v_project, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200', false, 2, 'Charts view'),
    (v_project, 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200', false, 3, 'Data visualization');

  INSERT INTO project_technology_links (project_id, technology_id) VALUES (v_project, v_tech_figma);

  -- ============================================================================
  -- PROYECTO 5: App de Delivery
  -- ============================================================================
  INSERT INTO projects (
    website_id, category_id, title, slug, short_description, description,
    client_name, completion_date, project_url, status, is_featured, layout, sort_order
  ) VALUES (
    v_website_id, v_cat_mobile, 'Foodie Delivery', 'foodie-delivery',
    'App de delivery de comida con tracking en tiempo real',
    'Aplicación de entrega de comida con sistema de tracking GPS en tiempo real, integración con pasarelas de pago, sistema de calificaciones y panel de administración para restaurantes.',
    'FoodieApp', '2023-12-15', NULL, 'published', false, 'standard', 5
  )
  RETURNING id INTO v_project;

  INSERT INTO project_images (project_id, url, is_primary, sort_order, alt_text)
  VALUES 
    (v_project, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200', true, 1, 'App home screen'),
    (v_project, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200', false, 2, 'Restaurant list'),
    (v_project, 'https://images.unsplash.com/photo-1576867757600-424c25c5bd85?w=1200', false, 3, 'Order tracking');

  INSERT INTO project_technology_links (project_id, technology_id) VALUES (v_project, v_tech_vue), (v_project, v_tech_node);

  -- ============================================================================
  -- PROYECTO 6: Rediseño Web Corporativa
  -- ============================================================================
  INSERT INTO projects (
    website_id, category_id, title, slug, short_description, description,
    client_name, completion_date, project_url, status, is_featured, layout, sort_order
  ) VALUES (
    v_website_id, v_cat_web, 'Rediseño TechCorp', 'rediseno-techcorp',
    'Rediseño completo de sitio web corporativo',
    'Rediseño completo del sitio web corporativo incluyendo nueva arquitectura de información, diseño responsive, optimización SEO y sistema de gestión de contenidos personalizado.',
    'TechCorp International', '2024-02-01', NULL, 'published', false, 'standard', 6
  )
  RETURNING id INTO v_project;

  INSERT INTO project_images (project_id, url, is_primary, sort_order, alt_text)
  VALUES 
    (v_project, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200', true, 1, 'Corporate website'),
    (v_project, 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200', false, 2, 'About page'),
    (v_project, 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200', false, 3, 'Contact section');

  INSERT INTO project_technology_links (project_id, technology_id) VALUES (v_project, v_tech_react);

  -- ============================================================================
  -- PROYECTO 7: App de Música
  -- ============================================================================
  INSERT INTO projects (
    website_id, category_id, title, slug, short_description, description,
    client_name, completion_date, project_url, status, is_featured, layout, sort_order
  ) VALUES (
    v_website_id, v_cat_ui, 'MusicFlow App', 'musicflow-app',
    'Diseño UI/UX para aplicación de streaming musical',
    'Diseño completo de interfaz para aplicación de streaming musical, incluyendo reproductor, playlists, descubrimiento de música y perfil de usuario con sistema social.',
    'MusicFlow', '2024-01-25', NULL, 'published', false, 'gallery', 7
  )
  RETURNING id INTO v_project;

  INSERT INTO project_images (project_id, url, is_primary, sort_order, alt_text)
  VALUES 
    (v_project, 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=1200', true, 1, 'Music player UI'),
    (v_project, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200', false, 2, 'Playlist view'),
    (v_project, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200', false, 3, 'Discover screen');

  INSERT INTO project_technology_links (project_id, technology_id) VALUES (v_project, v_tech_figma);

  -- ============================================================================
  -- PROYECTO 8: Branding Restaurante
  -- ============================================================================
  INSERT INTO projects (
    website_id, category_id, title, slug, short_description, description,
    client_name, completion_date, status, is_featured, layout, sort_order
  ) VALUES (
    v_website_id, v_cat_branding, 'El Sabor Gourmet', 'el-sabor-gourmet',
    'Identidad visual para restaurante de alta cocina',
    'Desarrollo de identidad de marca premium para restaurante de alta cocina, incluyendo logo elegante, menús de lujo, uniformes del personal, señalización y material promocional.',
    'El Sabor Gourmet', '2023-11-20', 'published', false, 'gallery', 8
  )
  RETURNING id INTO v_project;

  INSERT INTO project_images (project_id, url, is_primary, sort_order, alt_text)
  VALUES 
    (v_project, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200', true, 1, 'Restaurant branding'),
    (v_project, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200', false, 2, 'Menu design'),
    (v_project, 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200', false, 3, 'Interior signage'),
    (v_project, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200', false, 4, 'Business cards');

  INSERT INTO project_technology_links (project_id, technology_id) VALUES (v_project, v_tech_ps), (v_project, v_tech_figma);

  -- ============================================================================
  -- ACTIVAR ADDON
  -- ============================================================================
  INSERT INTO website_addons (website_id, addon_key, is_active)
  VALUES (v_website_id, 'portfolio', true)
  ON CONFLICT (website_id, addon_key) DO UPDATE SET is_active = true;

  RAISE NOTICE 'Demo portfolio data created successfully!';
  RAISE NOTICE 'Categories created: 4';
  RAISE NOTICE 'Projects created: 8';

END $$;

-- Verificar datos creados
SELECT 'Categorías: ' || COUNT(*)::text FROM project_categories WHERE website_id = (SELECT id FROM websites LIMIT 1)
UNION ALL
SELECT 'Proyectos: ' || COUNT(*)::text FROM projects WHERE website_id = (SELECT id FROM websites LIMIT 1)
UNION ALL
SELECT 'Imágenes: ' || COUNT(*)::text FROM project_images WHERE project_id IN (SELECT id FROM projects WHERE website_id = (SELECT id FROM websites LIMIT 1));
