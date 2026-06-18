-- ============================================================================
-- DATOS DE DEMOSTRACIÓN PARA SISTEMA DE RESERVAS
-- ============================================================================
-- Incluye: Servicios, horarios, clientes y reservas de ejemplo
-- ============================================================================

DO $$
DECLARE
  v_website_id UUID;
  v_service_corte UUID;
  v_service_color UUID;
  v_service_manicura UUID;
  v_service_facial UUID;
  v_service_masaje UUID;
  v_client_1 UUID;
  v_client_2 UUID;
  v_client_3 UUID;
  v_client_4 UUID;
  v_client_5 UUID;
BEGIN
  -- Obtener website_id
  SELECT id INTO v_website_id FROM websites LIMIT 1;
  
  IF v_website_id IS NULL THEN
    RAISE EXCEPTION 'No website found. Please create a website first.';
  END IF;

  RAISE NOTICE 'Creating demo booking data for website_id: %', v_website_id;

  -- ============================================================================
  -- SERVICIOS
  -- ============================================================================
  
  -- Servicio 1: Corte de Cabello
  INSERT INTO booking_services (
    website_id, name, description, duration_minutes, price, currency, 
    color, is_active, buffer_before_minutes, buffer_after_minutes
  ) VALUES (
    v_website_id, 'Corte de Cabello', 'Corte de cabello personalizado con lavado y peinado',
    45, 35.00, 'USD', '#3B82F6', true, 5, 5
  )
  RETURNING id INTO v_service_corte;

  -- Servicio 2: Coloración
  INSERT INTO booking_services (
    website_id, name, description, duration_minutes, price, currency, 
    color, is_active, buffer_before_minutes, buffer_after_minutes
  ) VALUES (
    v_website_id, 'Coloración Completa', 'Tinte completo con productos de alta calidad',
    120, 85.00, 'USD', '#8B5CF6', true, 10, 15
  )
  RETURNING id INTO v_service_color;

  -- Servicio 3: Manicura
  INSERT INTO booking_services (
    website_id, name, description, duration_minutes, price, currency, 
    color, is_active, buffer_before_minutes, buffer_after_minutes
  ) VALUES (
    v_website_id, 'Manicura Profesional', 'Cuidado completo de uñas con esmaltado',
    60, 25.00, 'USD', '#EC4899', true, 5, 5
  )
  RETURNING id INTO v_service_manicura;

  -- Servicio 4: Tratamiento Facial
  INSERT INTO booking_services (
    website_id, name, description, duration_minutes, price, currency, 
    color, is_active, buffer_before_minutes, buffer_after_minutes
  ) VALUES (
    v_website_id, 'Tratamiento Facial', 'Limpieza profunda e hidratación facial',
    90, 65.00, 'USD', '#10B981', true, 5, 10
  )
  RETURNING id INTO v_service_facial;

  -- Servicio 5: Masaje Relajante
  INSERT INTO booking_services (
    website_id, name, description, duration_minutes, price, currency, 
    color, is_active, buffer_before_minutes, buffer_after_minutes
  ) VALUES (
    v_website_id, 'Masaje Relajante', 'Masaje de cuerpo completo para aliviar el estrés',
    60, 70.00, 'USD', '#F59E0B', true, 10, 10
  )
  RETURNING id INTO v_service_masaje;

  -- ============================================================================
  -- HORARIOS DE DISPONIBILIDAD (Lunes a Sábado, 9:00 - 18:00)
  -- ============================================================================
  
  -- Horarios para todos los servicios (NULL en service_id = aplica a todos)
  INSERT INTO booking_schedules (website_id, service_id, day_of_week, start_time, end_time, is_active) VALUES
    (v_website_id, NULL, 1, '09:00', '18:00', true), -- Lunes
    (v_website_id, NULL, 2, '09:00', '18:00', true), -- Martes
    (v_website_id, NULL, 3, '09:00', '18:00', true), -- Miércoles
    (v_website_id, NULL, 4, '09:00', '18:00', true), -- Jueves
    (v_website_id, NULL, 5, '09:00', '18:00', true), -- Viernes
    (v_website_id, NULL, 6, '09:00', '14:00', true); -- Sábado (medio día)

  -- ============================================================================
  -- EXCEPCIÓN: Domingo cerrado (próximas 4 semanas)
  -- ============================================================================
  INSERT INTO booking_schedule_exceptions (website_id, exception_date, exception_type, description)
  SELECT 
    v_website_id,
    date_value,
    'closed',
    'Domingo - Cerrado'
  FROM (
    SELECT (CURRENT_DATE + (n * 7) + (7 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER))::DATE as date_value
    FROM generate_series(0, 3) n
    WHERE (CURRENT_DATE + (n * 7) + (7 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER))::DATE >= CURRENT_DATE
  ) dates;

  -- ============================================================================
  -- CLIENTES
  -- ============================================================================
  
  -- Cliente 1: María García
  INSERT INTO booking_clients (website_id, first_name, last_name, email, phone, notes)
  VALUES (v_website_id, 'María', 'García', 'maria.garcia@email.com', '+1234567890', 'Cliente frecuente, prefiere citas por la mañana')
  RETURNING id INTO v_client_1;

  -- Cliente 2: Juan Pérez
  INSERT INTO booking_clients (website_id, first_name, last_name, email, phone, notes)
  VALUES (v_website_id, 'Juan', 'Pérez', 'juan.perez@email.com', '+1234567891', 'Alérgico a ciertos productos capilares')
  RETURNING id INTO v_client_2;

  -- Cliente 3: Ana Martínez
  INSERT INTO booking_clients (website_id, first_name, last_name, email, phone, notes)
  VALUES (v_website_id, 'Ana', 'Martínez', 'ana.martinez@email.com', '+1234567892', 'Solicita siempre la misma estilista')
  RETURNING id INTO v_client_3;

  -- Cliente 4: Carlos López
  INSERT INTO booking_clients (website_id, first_name, last_name, email, phone, notes)
  VALUES (v_website_id, 'Carlos', 'López', 'carlos.lopez@email.com', '+1234567893', 'Paga siempre en efectivo')
  RETURNING id INTO v_client_4;

  -- Cliente 5: Laura Sánchez
  INSERT INTO booking_clients (website_id, first_name, last_name, email, phone, notes)
  VALUES (v_website_id, 'Laura', 'Sánchez', 'laura.sanchez@email.com', '+1234567894', 'Le gusta conversar durante el servicio')
  RETURNING id INTO v_client_5;

  -- ============================================================================
  -- RESERVAS (para hoy y próximos días)
  -- ============================================================================
  
  -- Reservas para HOY
  INSERT INTO bookings (website_id, service_id, client_id, booking_date, start_time, end_time, status, payment_status, source, client_notes)
  VALUES
    -- Mañana
    (v_website_id, v_service_corte, v_client_1, CURRENT_DATE, '09:00', '09:45', 'confirmed', 'paid', 'website', 'Primera vez'),
    (v_website_id, v_service_manicura, v_client_2, CURRENT_DATE, '09:00', '10:00', 'confirmed', 'pending', 'phone', NULL),
    (v_website_id, v_service_facial, v_client_3, CURRENT_DATE, '10:00', '11:30', 'confirmed', 'paid', 'website', NULL),
    (v_website_id, v_service_corte, v_client_4, CURRENT_DATE, '10:00', '10:45', 'pending', 'pending', 'walk_in', 'Urgente'),
    (v_website_id, v_service_color, v_client_5, CURRENT_DATE, '11:00', '13:00', 'confirmed', 'partial', 'website', 'Traer referencia de color'),
    
    -- Tarde
    (v_website_id, v_service_masaje, v_client_1, CURRENT_DATE, '14:00', '15:00', 'confirmed', 'paid', 'website', NULL),
    (v_website_id, v_service_corte, v_client_2, CURRENT_DATE, '15:00', '15:45', 'confirmed', 'pending', 'phone', NULL),
    (v_website_id, v_service_manicura, v_client_3, CURRENT_DATE, '15:00', '16:00', 'pending', 'pending', 'website', 'Diseño especial'),
    (v_website_id, v_service_facial, v_client_4, CURRENT_DATE, '16:00', '17:30', 'confirmed', 'paid', 'website', NULL);

  -- Reservas para MAÑANA
  INSERT INTO bookings (website_id, service_id, client_id, booking_date, start_time, end_time, status, payment_status, source)
  VALUES
    (v_website_id, v_service_color, v_client_1, CURRENT_DATE + 1, '09:00', '11:00', 'confirmed', 'pending', 'website'),
    (v_website_id, v_service_masaje, v_client_3, CURRENT_DATE + 1, '10:00', '11:00', 'confirmed', 'paid', 'website'),
    (v_website_id, v_service_corte, v_client_5, CURRENT_DATE + 1, '11:00', '11:45', 'confirmed', 'pending', 'phone'),
    (v_website_id, v_service_manicura, v_client_2, CURRENT_DATE + 1, '14:00', '15:00', 'pending', 'pending', 'website'),
    (v_website_id, v_service_facial, v_client_4, CURRENT_DATE + 1, '15:00', '16:30', 'confirmed', 'paid', 'website');

  -- Reservas pasadas (para mostrar historial)
  INSERT INTO bookings (website_id, service_id, client_id, booking_date, start_time, end_time, status, payment_status, source)
  VALUES
    (v_website_id, v_service_corte, v_client_1, CURRENT_DATE - 2, '10:00', '10:45', 'completed', 'paid', 'website'),
    (v_website_id, v_service_manicura, v_client_2, CURRENT_DATE - 3, '14:00', '15:00', 'completed', 'paid', 'website'),
    (v_website_id, v_service_facial, v_client_3, CURRENT_DATE - 5, '09:00', '10:30', 'completed', 'paid', 'phone'),
    (v_website_id, v_service_color, v_client_5, CURRENT_DATE - 7, '11:00', '13:00', 'completed', 'paid', 'website'),
    (v_website_id, v_service_corte, v_client_4, CURRENT_DATE - 1, '16:00', '16:45', 'no_show', 'pending', 'website'),
    (v_website_id, v_service_masaje, v_client_2, CURRENT_DATE - 4, '15:00', '16:00', 'cancelled', 'refunded', 'website');

  -- ============================================================================
  -- ACTIVAR ADDON DE BOOKINGS SI NO EXISTE
  -- ============================================================================
  INSERT INTO website_addons (website_id, addon_key, is_active)
  VALUES (v_website_id, 'bookings', true)
  ON CONFLICT (website_id, addon_key) DO UPDATE SET is_active = true;

  RAISE NOTICE 'Demo booking data created successfully!';
  RAISE NOTICE 'Services created: 5';
  RAISE NOTICE 'Clients created: 5';
  RAISE NOTICE 'Bookings created: 20';

END $$;

-- Verificar datos creados
SELECT 'Servicios creados: ' || COUNT(*)::text as result FROM booking_services WHERE website_id = (SELECT id FROM websites LIMIT 1)
UNION ALL
SELECT 'Clientes creados: ' || COUNT(*)::text FROM booking_clients WHERE website_id = (SELECT id FROM websites LIMIT 1)
UNION ALL
SELECT 'Reservas creadas: ' || COUNT(*)::text FROM bookings WHERE website_id = (SELECT id FROM websites LIMIT 1)
UNION ALL
SELECT 'Horarios creados: ' || COUNT(*)::text FROM booking_schedules WHERE website_id = (SELECT id FROM websites LIMIT 1);
