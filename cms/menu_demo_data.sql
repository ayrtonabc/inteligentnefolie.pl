-- ============================================================================
-- DATOS DE DEMOSTRACIÓN PARA SISTEMA DE MENÚ
-- ============================================================================
-- Categorías: Entradas, Platos Principales, Postres, Bebidas, Especialidades
-- Productos variados con imágenes, precios y características
-- ============================================================================

DO $$
DECLARE
  v_website_id UUID;
  v_category_entradas UUID;
  v_category_principales UUID;
  v_category_postres UUID;
  v_category_bebidas UUID;
  v_category_especialidades UUID;
  v_product_id UUID;
  v_image_id UUID;
BEGIN
  -- Obtener website_id
  SELECT id INTO v_website_id FROM websites LIMIT 1;
  
  IF v_website_id IS NULL THEN
    RAISE EXCEPTION 'No website found. Please create a website first.';
  END IF;

  -- Limpiar datos existentes (opcional, descomentar si se necesita)
  -- DELETE FROM menu_product_images WHERE product_id IN (SELECT id FROM menu_products WHERE website_id = v_website_id);
  -- DELETE FROM menu_products WHERE website_id = v_website_id;
  -- DELETE FROM menu_categories WHERE website_id = v_website_id;

  RAISE NOTICE 'Creating demo menu data for website_id: %', v_website_id;

  -- ============================================================================
  -- CATEGORÍA 1: ENTRADAS
  -- ============================================================================
  INSERT INTO menu_categories (website_id, name, slug, description, image_url, sort_order, is_active, is_featured)
  VALUES (
    v_website_id, 
    'Entradas', 
    'entradas', 
    'Deliciosas entradas para comenzar tu experiencia gastronómica',
    'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400',
    1, 
    true, 
    true
  )
  RETURNING id INTO v_category_entradas;

  -- Producto: Ensalada César
  INSERT INTO menu_products (
    website_id, category_id, name, slug, description, short_description,
    price, compare_price, currency, is_available, is_featured, is_vegetarian,
    calories, prep_time_minutes, sort_order
  ) VALUES (
    v_website_id, v_category_entradas, 'Ensalada César', 'ensalada-cesar',
    'Clásica ensalada César con lechuga romana fresca, crutones crujientes, queso parmesano y aderezo César casero. Opcional con pollo a la parrilla.',
    'Ensalada clásica con aderezo César casero',
    12.99, 15.99, 'USD', true, true, true,
    320, 10, 1
  )
  RETURNING id INTO v_product_id;

  INSERT INTO menu_product_images (product_id, url, alt_text, is_primary, sort_order)
  VALUES (v_product_id, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400', 'Ensalada César', true, 0);

  -- Producto: Bruschetta
  INSERT INTO menu_products (
    website_id, category_id, name, slug, description, short_description,
    price, currency, is_available, is_featured, is_vegetarian,
    calories, prep_time_minutes, sort_order
  ) VALUES (
    v_website_id, v_category_entradas, 'Bruschetta Italiana', 'bruschetta-italiana',
    'Pan baguette tostado con tomates frescos, albahaca, ajo y aceite de oliva extra virgen. Tres unidades por porción.',
    'Pan tostado con tomates y albahaca',
    9.50, 'USD', true, false, true,
    280, 8, 2
  )
  RETURNING id INTO v_product_id;

  INSERT INTO menu_product_images (product_id, url, alt_text, is_primary, sort_order)
  VALUES (v_product_id, 'https://images.unsplash.com/photo-1572695157366-5e2263c30781?w=400', 'Bruschetta', true, 0);

  -- Producto: Alitas de Pollo
  INSERT INTO menu_products (
    website_id, category_id, name, slug, description, short_description,
    price, compare_price, currency, is_available, is_featured, is_spicy, spice_level,
    calories, prep_time_minutes, sort_order
  ) VALUES (
    v_website_id, v_category_entradas, 'Alitas BBQ Picantes', 'alitas-bbq-picantes',
    '8 alitas de pollo crujientes bañadas en salsa BBQ picante. Acompañadas de apio y aderezo ranch.',
    'Alitas crujientes con salsa BBQ picante',
    14.99, 17.99, 'USD', true, true, true, 3,
    650, 15, 3
  )
  RETURNING id INTO v_product_id;

  INSERT INTO menu_product_images (product_id, url, alt_text, is_primary, sort_order)
  VALUES (v_product_id, 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400', 'Alitas BBQ', true, 0);

  -- Producto: Sopa del Día
  INSERT INTO menu_products (
    website_id, category_id, name, slug, description, short_description,
    price, currency, is_available, is_featured, is_vegan, is_gluten_free,
    calories, prep_time_minutes, sort_order
  ) VALUES (
    v_website_id, v_category_entradas, 'Sopa de Verduras', 'sopa-verduras',
    'Sopa caliente de verduras frescas de temporada. Pregunta por la sopa del día.',
    'Sopa caliente de verduras frescas',
    7.99, 'USD', true, false, true, true,
    180, 5, 4
  )
  RETURNING id INTO v_product_id;

  INSERT INTO menu_product_images (product_id, url, alt_text, is_primary, sort_order)
  VALUES (v_product_id, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', 'Sopa de verduras', true, 0);

  -- ============================================================================
  -- CATEGORÍA 2: PLATOS PRINCIPALES
  -- ============================================================================
  INSERT INTO menu_categories (website_id, name, slug, description, image_url, sort_order, is_active, is_featured)
  VALUES (
    v_website_id, 
    'Platos Principales', 
    'platos-principales', 
    'Nuestros mejores platos principales, preparados con ingredientes frescos',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    2, 
    true, 
    true
  )
  RETURNING id INTO v_category_principales;

  -- Producto: Pasta Alfredo
  INSERT INTO menu_products (
    website_id, category_id, name, slug, description, short_description,
    price, compare_price, currency, is_available, is_featured, is_vegetarian,
    calories, protein, carbs, fat, prep_time_minutes, sort_order
  ) VALUES (
    v_website_id, v_category_principales, 'Pasta Alfredo', 'pasta-alfredo',
    'Fettuccine en salsa Alfredo cremosa hecha con mantequilla, crema y queso parmesano. Servida con pan de ajo.',
    'Fettuccine en salsa Alfredo cremosa',
    16.99, 19.99, 'USD', true, true, true,
    720, 24, 65, 38, 20, 1
  )
  RETURNING id INTO v_product_id;

  INSERT INTO menu_product_images (product_id, url, alt_text, is_primary, sort_order)
  VALUES (v_product_id, 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400', 'Pasta Alfredo', true, 0);

  -- Producto: Hamburguesa Clásica
  INSERT INTO menu_products (
    website_id, category_id, name, slug, description, short_description,
    price, compare_price, currency, is_available, is_featured,
    calories, protein, carbs, fat, prep_time_minutes, sort_order
  ) VALUES (
    v_website_id, v_category_principales, 'Hamburguesa Clásica', 'hamburguesa-clasica',
    'Carne de res 100% Angus, lechuga, tomate, cebolla, queso cheddar y nuestra salsa especial. Incluye papas fritas.',
    'Carne Angus con queso cheddar y papas',
    15.99, 18.99, 'USD', true, true,
    850, 42, 56, 48, 18, 2
  )
  RETURNING id INTO v_product_id;

  INSERT INTO menu_product_images (product_id, url, alt_text, is_primary, sort_order)
  VALUES (v_product_id, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 'Hamburguesa', true, 0);

  -- Producto: Salmón a la Parrilla
  INSERT INTO menu_products (
    website_id, category_id, name, slug, description, short_description,
    price, currency, is_available, is_featured, is_gluten_free,
    calories, protein, fat, prep_time_minutes, sort_order
  ) VALUES (
    v_website_id, v_category_principales, 'Salmón a la Parrilla', 'salmon-parrilla',
    'Filete de salmón fresco a la parrilla con limón y hierbas. Acompañado de verduras al vapor y arroz integral.',
    'Salmón fresco con limón y hierbas',
    22.99, 'USD', true, true, true,
    480, 38, 26, 25, 1
  )
  RETURNING id INTO v_product_id;

  INSERT INTO menu_product_images (product_id, url, alt_text, is_primary, sort_order)
  VALUES (v_product_id, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', 'Salmón a la parrilla', true, 0);

  -- Producto: Pollo Tikka Masala
  INSERT INTO menu_products (
    website_id, category_id, name, slug, description, short_description,
    price, currency, is_available, is_featured, is_spicy, spice_level,
    calories, protein, carbs, prep_time_minutes, sort_order
  ) VALUES (
    v_website_id, v_category_principales, 'Pollo Tikka Masala', 'pollo-tikka-masala',
    'Pollo marinado en especias indias, cocinado en salsa cremosa de tomate. Servido con arroz basmati y naan.',
    'Pollo en salsa cremosa de tomate',
    18.99, 'USD', true, true, true, 4,
    620, 35, 48, 28, 3
  )
  RETURNING id INTO v_product_id;

  INSERT INTO menu_product_images (product_id, url, alt_text, is_primary, sort_order)
  VALUES (v_product_id, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400', 'Pollo Tikka Masala', true, 0);

  -- Producto: Risotto de Champiñones
  INSERT INTO menu_products (
    website_id, category_id, name, slug, description, short_description,
    price, currency, is_available, is_featured, is_vegetarian, is_gluten_free,
    calories, protein, carbs, fat, prep_time_minutes, sort_order
  ) VALUES (
    v_website_id, v_category_principales, 'Risotto de Champiñones', 'risotto-champinones',
    'Arroz arborio cremoso con champiñones silvestres, vino blanco y queso parmesano.',
    'Arroz cremoso con champiñones',
    19.99, 'USD', true, false, true, false,
    540, 14, 72, 22, 35, 4
  )
  RETURNING id INTO v_product_id;

  INSERT INTO menu_product_images (product_id, url, alt_text, is_primary, sort_order)
  VALUES (v_product_id, 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400', 'Risotto', true, 0);

  -- ============================================================================
  -- CATEGORÍA 3: POSTRES
  -- ============================================================================
  INSERT INTO menu_categories (website_id, name, slug, description, image_url, sort_order, is_active, is_featured)
  VALUES (
    v_website_id, 
    'Postres', 
    'postres', 
    'Dulces tentaciones para cerrar con broche de oro',
    'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400',
    3, 
    true, 
    false
  )
  RETURNING id INTO v_category_postres;

  -- Producto: Tiramisú
  INSERT INTO menu_products (
    website_id, category_id, name, slug, description, short_description,
    price, currency, is_available, is_featured, is_vegetarian,
    calories, prep_time_minutes, sort_order
  ) VALUES (
    v_website_id, v_category_postres, 'Tiramisú Casero', 'tiramisu-casero',
    'Clásico postre italiano con capas de bizcocho empapado en café, crema de mascarpone y cacao en polvo.',
    'Postre italiano con café y mascarpone',
    8.99, 'USD', true, true, true,
    380, 0, 1
  )
  RETURNING id INTO v_product_id;

  INSERT INTO menu_product_images (product_id, url, alt_text, is_primary, sort_order)
  VALUES (v_product_id, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', 'Tiramisú', true, 0);

  -- Producto: Cheesecake
  INSERT INTO menu_products (
    website_id, category_id, name, slug, description, short_description,
    price, currency, is_available, is_featured, is_vegetarian,
    calories, prep_time_minutes, sort_order
  ) VALUES (
    v_website_id, v_category_postres, 'Cheesecake de Fresa', 'cheesecake-fresa',
    'Cheesecake cremoso con base de galleta y cobertura de fresas frescas y salsa de frutos rojos.',
    'Cheesecake con fresas frescas',
    9.99, 'USD', true, false, true,
    420, 0, 2
  )
  RETURNING id INTO v_product_id;

  INSERT INTO menu_product_images (product_id, url, alt_text, is_primary, sort_order)
  VALUES (v_product_id, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400', 'Cheesecake', true, 0);

  -- Producto: Helado Artesanal
  INSERT INTO menu_products (
    website_id, category_id, name, slug, description, short_description,
    price, currency, is_available, is_featured, is_vegetarian, is_gluten_free,
    calories, prep_time_minutes, sort_order
  ) VALUES (
    v_website_id, v_category_postres, 'Helado Artesanal (2 bolas)', 'helado-artesanal',
    'Helado artesanal elaborado in-house. Sabores disponibles: vainilla, chocolate, fresa, pistacho, café.',
    'Helado artesanal - elegir 2 sabores',
    6.99, 'USD', true, false, true, true,
    280, 0, 3
  )
  RETURNING id INTO v_product_id;

  INSERT INTO menu_product_images (product_id, url, alt_text, is_primary, sort_order)
  VALUES (v_product_id, 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400', 'Helado artesanal', true, 0);

  -- Producto: Churros
  INSERT INTO menu_products (
    website_id, category_id, name, slug, description, short_description,
    price, currency, is_available, is_featured, is_vegan,
    calories, prep_time_minutes, sort_order
  ) VALUES (
    v_website_id, v_category_postres, 'Churros con Chocolate', 'churros-chocolate',
    'Churros españoles crujientes espolvoreados con azúcar y canela. Acompañados de chocolate caliente para sumergir.',
    'Churros crujientes con chocolate caliente',
    7.99, 'USD', true, true, true,
    340, 12, 4
  )
  RETURNING id INTO v_product_id;

  INSERT INTO menu_product_images (product_id, url, alt_text, is_primary, sort_order)
  VALUES (v_product_id, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400', 'Churros', true, 0);

  -- ============================================================================
  -- CATEGORÍA 4: BEBIDAS
  -- ============================================================================
  INSERT INTO menu_categories (website_id, name, slug, description, image_url, sort_order, is_active, is_featured)
  VALUES (
    v_website_id, 
    'Bebidas', 
    'bebidas', 
    'Refrescantes bebidas para acompañar tu comida',
    'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
    4, 
    true, 
    false
  )
  RETURNING id INTO v_category_bebidas;

  -- Producto: Café Americano
  INSERT INTO menu_products (
    website_id, category_id, name, slug, description, short_description,
    price, currency, is_available, is_featured, is_vegan, is_gluten_free,
    calories, prep_time_minutes, sort_order
  ) VALUES (
    v_website_id, v_category_bebidas, 'Café Americano', 'cafe-americano',
    'Café de especialidad preparado con granos 100% arábica. Intenso y aromático.',
    'Café de especialidad 100% arábica',
    3.99, 'USD', true, false, true, true,
    5, 3, 1
  )
  RETURNING id INTO v_product_id;

  INSERT INTO menu_product_images (product_id, url, alt_text, is_primary, sort_order)
  VALUES (v_product_id, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400', 'Café americano', true, 0);

  -- Producto: Limonada Casera
  INSERT INTO menu_products (
    website_id, category_id, name, slug, description, short_description,
    price, currency, is_available, is_featured, is_vegan, is_gluten_free,
    calories, prep_time_minutes, sort_order
  ) VALUES (
    v_website_id, v_category_bebidas, 'Limonada Casera', 'limonada-casera',
    'Limonada fresca hecha con limones naturales, agua purificada y un toque de menta.',
    'Limonada fresca con menta',
    4.99, 'USD', true, true, true, true,
    120, 2, 2
  )
  RETURNING id INTO v_product_id;

  INSERT INTO menu_product_images (product_id, url, alt_text, is_primary, sort_order)
  VALUES (v_product_id, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400', 'Limonada', true, 0);

  -- Producto: Smoothie de Frutas
  INSERT INTO menu_products (
    website_id, category_id, name, slug, description, short_description,
    price, currency, is_available, is_featured, is_vegan, is_gluten_free,
    calories, prep_time_minutes, sort_order
  ) VALUES (
    v_website_id, v_category_bebidas, 'Smoothie Tropical', 'smoothie-tropical',
    'Mezcla de mango, piña, plátano y jugo de naranja. Refrescante y nutritivo.',
    'Mezcla de frutas tropicales',
    6.99, 'USD', true, true, true, true,
    180, 5, 3
  )
  RETURNING id INTO v_product_id;

  INSERT INTO menu_product_images (product_id, url, alt_text, is_primary, sort_order)
  VALUES (v_product_id, 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400', 'Smoothie', true, 0);

  -- Producto: Cerveza Artesanal
  INSERT INTO menu_products (
    website_id, category_id, name, slug, description, short_description,
    price, currency, is_available, is_featured, is_vegan, is_gluten_free,
    calories, prep_time_minutes, sort_order
  ) VALUES (
    v_website_id, v_category_bebidas, 'Cerveza Artesanal', 'cerveza-artesanal',
    'Cerveza local de producción artesanal. Variedades: rubia, roja, negra. Pregunta al mesero.',
    'Cerveza artesanal local',
    5.99, 'USD', true, false, true, false,
    150, 0, 4
  )
  RETURNING id INTO v_product_id;

  INSERT INTO menu_product_images (product_id, url, alt_text, is_primary, sort_order)
  VALUES (v_product_id, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', 'Cerveza', true, 0);

  -- Producto: Vino de la Casa
  INSERT INTO menu_products (
    website_id, category_id, name, slug, description, short_description,
    price, currency, is_available, is_featured, is_vegan, is_gluten_free,
    calories, prep_time_minutes, sort_order
  ) VALUES (
    v_website_id, v_category_bebidas, 'Vino de la Casa (Copa)', 'vino-casa',
    'Selección de vinos de la casa. Disponible: tinto, blanco o rosado. Consulta al mesero.',
    'Vino de la casa por copa',
    8.99, 'USD', true, false, true, true,
    120, 0, 5
  )
  RETURNING id INTO v_product_id;

  INSERT INTO menu_product_images (product_id, url, alt_text, is_primary, sort_order)
  VALUES (v_product_id, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400', 'Vino', true, 0);

  -- ============================================================================
  -- CATEGORÍA 5: ESPECIALIDADES
  -- ============================================================================
  INSERT INTO menu_categories (website_id, name, slug, description, image_url, sort_order, is_active, is_featured)
  VALUES (
    v_website_id, 
    'Especialidades del Chef', 
    'especialidades-chef', 
    'Platos exclusivos creados por nuestro chef ejecutivo',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    5, 
    true, 
    true
  )
  RETURNING id INTO v_category_especialidades;

  -- Producto: Filete Mignon
  INSERT INTO menu_products (
    website_id, category_id, name, slug, description, short_description,
    price, currency, is_available, is_featured, is_gluten_free,
    calories, protein, fat, prep_time_minutes, sort_order
  ) VALUES (
    v_website_id, v_category_especialidades, 'Filete Mignon', 'filete-mignon',
    'Corte premium de res de 8oz, cocinado a la perfección. Acompañado de puré de papas trufado y espárragos.',
    'Corte premium con puré trufado',
    34.99, 'USD', true, true, true,
    680, 48, 42, 30, 1
  )
  RETURNING id INTO v_product_id;

  INSERT INTO menu_product_images (product_id, url, alt_text, is_primary, sort_order)
  VALUES (v_product_id, 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400', 'Filete Mignon', true, 0);

  -- Producto: Langosta
  INSERT INTO menu_products (
    website_id, category_id, name, slug, description, short_description,
    price, currency, is_available, is_featured, is_gluten_free,
    calories, protein, fat, prep_time_minutes, sort_order
  ) VALUES (
    v_website_id, v_category_especialidades, 'Langosta a la Mantequilla', 'langosta-mantequilla',
    'Cola de langosta fresca de 12oz, preparada a la mantequilla con ajo y hierbas. Servida con arroz pilaf.',
    'Langosta fresca con mantequilla de ajo',
    42.99, 'USD', true, true, true,
    420, 42, 24, 25, 2
  )
  RETURNING id INTO v_product_id;

  INSERT INTO menu_product_images (product_id, url, alt_text, is_primary, sort_order)
  VALUES (v_product_id, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400', 'Langosta', true, 0);

  -- Producto: Paella
  INSERT INTO menu_products (
    website_id, category_id, name, slug, description, short_description,
    price, currency, is_available, is_featured, is_gluten_free,
    calories, protein, carbs, fat, prep_time_minutes, sort_order
  ) VALUES (
    v_website_id, v_category_especialidades, 'Paella de Mariscos', 'paella-mariscos',
    'Arroz bomba con azafrán, camarones, mejillones, almejas y calamar. Para compartir (2 personas).',
    'Arroz con mariscos frescos (2 pers.)',
    38.99, 'USD', true, true, false,
    520, 32, 58, 18, 35, 3
  )
  RETURNING id INTO v_product_id;

  INSERT INTO menu_product_images (product_id, url, alt_text, is_primary, sort_order)
  VALUES (v_product_id, 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400', 'Paella', true, 0);

  -- ============================================================================
  -- ACTIVAR ADDON DE MENÚ SI NO EXISTE
  -- ============================================================================
  INSERT INTO website_addons (website_id, addon_key, is_active)
  VALUES (v_website_id, 'menu', true)
  ON CONFLICT (website_id, addon_key) DO UPDATE SET is_active = true;

  RAISE NOTICE 'Demo menu data created successfully!';
  RAISE NOTICE 'Categories created: 5';
  RAISE NOTICE 'Products created: 20';
  RAISE NOTICE 'Images created: 20';

END $$;

-- Verificar datos creados
SELECT 'Categorías creadas: ' || COUNT(*)::text as result FROM menu_categories WHERE website_id = (SELECT id FROM websites LIMIT 1)
UNION ALL
SELECT 'Productos creados: ' || COUNT(*)::text FROM menu_products WHERE website_id = (SELECT id FROM websites LIMIT 1)
UNION ALL
SELECT 'Imágenes creadas: ' || COUNT(*)::text FROM menu_product_images WHERE product_id IN (SELECT id FROM menu_products WHERE website_id = (SELECT id FROM websites LIMIT 1));
