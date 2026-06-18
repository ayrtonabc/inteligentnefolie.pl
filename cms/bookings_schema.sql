-- ============================================================================
-- SISTEMA DE RESERVAS / BOOKINGS
-- ============================================================================
-- Tablas: booking_services, booking_schedules, booking_clients, bookings
-- Funcionalidades: servicios, horarios, reservas, clientes
-- ============================================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLA: SERVICIOS DE RESERVA
-- ============================================================================
CREATE TABLE IF NOT EXISTS booking_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  
  -- Información del servicio
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Duración y precio
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Configuración
  is_active BOOLEAN DEFAULT true,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Color para el calendario
  max_bookings_per_slot INTEGER DEFAULT 1, -- Máximo reservas por horario
  
  -- Buffer antes/después del servicio
  buffer_before_minutes INTEGER DEFAULT 0,
  buffer_after_minutes INTEGER DEFAULT 0,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT booking_services_duration_positive CHECK (duration_minutes > 0),
  CONSTRAINT booking_services_price_positive CHECK (price >= 0)
);

CREATE INDEX IF NOT EXISTS idx_booking_services_website_id ON booking_services(website_id);
CREATE INDEX IF NOT EXISTS idx_booking_services_is_active ON booking_services(is_active);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_booking_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_booking_services_updated_at ON booking_services;
CREATE TRIGGER trg_booking_services_updated_at
  BEFORE UPDATE ON booking_services
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_services_updated_at();

-- ============================================================================
-- TABLA: HORARIOS DE DISPONIBILIDAD
-- ============================================================================
CREATE TABLE IF NOT EXISTS booking_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  service_id UUID REFERENCES booking_services(id) ON DELETE CASCADE, -- NULL = aplica a todos los servicios
  
  -- Día de la semana (0=domingo, 1=lunes, ..., 6=sábado)
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  
  -- Horario
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Si está activo este horario
  is_active BOOLEAN DEFAULT true,
  
  -- Fechas específicas (opcional - para horarios especiales)
  specific_date DATE,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT booking_schedules_time_valid CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS idx_booking_schedules_website_id ON booking_schedules(website_id);
CREATE INDEX IF NOT EXISTS idx_booking_schedules_service_id ON booking_schedules(service_id);
CREATE INDEX IF NOT EXISTS idx_booking_schedules_day_of_week ON booking_schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_booking_schedules_is_active ON booking_schedules(is_active);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trg_booking_schedules_updated_at ON booking_schedules;
CREATE TRIGGER trg_booking_schedules_updated_at
  BEFORE UPDATE ON booking_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_services_updated_at();

-- ============================================================================
-- TABLA: EXCEPCIONES DE HORARIO (días cerrados, horarios especiales)
-- ============================================================================
CREATE TABLE IF NOT EXISTS booking_schedule_exceptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  
  -- Fecha de la excepción
  exception_date DATE NOT NULL,
  
  -- Tipo: 'closed' = cerrado, 'special' = horario especial
  exception_type VARCHAR(20) NOT NULL CHECK (exception_type IN ('closed', 'special')),
  
  -- Si es especial, nuevo horario
  start_time TIME,
  end_time TIME,
  
  -- Descripción (ej: "Día festivo", "Mantenimiento")
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT booking_exceptions_time_valid CHECK (
    exception_type = 'closed' OR (start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time)
  )
);

CREATE INDEX IF NOT EXISTS idx_booking_exceptions_website_id ON booking_schedule_exceptions(website_id);
CREATE INDEX IF NOT EXISTS idx_booking_exceptions_date ON booking_schedule_exceptions(exception_date);

-- ============================================================================
-- TABLA: CLIENTES
-- ============================================================================
CREATE TABLE IF NOT EXISTS booking_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  
  -- Información del cliente
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  
  -- Notas sobre el cliente
  notes TEXT,
  
  -- Contadores
  total_bookings INTEGER DEFAULT 0,
  completed_bookings INTEGER DEFAULT 0,
  cancelled_bookings INTEGER DEFAULT 0,
  no_show_bookings INTEGER DEFAULT 0,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT booking_clients_email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_booking_clients_website_id ON booking_clients(website_id);
CREATE INDEX IF NOT EXISTS idx_booking_clients_email ON booking_clients(email);
CREATE INDEX IF NOT EXISTS idx_booking_clients_phone ON booking_clients(phone);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trg_booking_clients_updated_at ON booking_clients;
CREATE TRIGGER trg_booking_clients_updated_at
  BEFORE UPDATE ON booking_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_services_updated_at();

-- ============================================================================
-- TABLA: RESERVAS (BOOKINGS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  
  -- Relaciones
  service_id UUID NOT NULL REFERENCES booking_services(id),
  client_id UUID NOT NULL REFERENCES booking_clients(id),
  
  -- Fecha y hora de la reserva
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Estado de la reserva
  status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  
  -- Información de pago
  payment_status VARCHAR(20) DEFAULT 'pending' 
    CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  payment_amount DECIMAL(10, 2) DEFAULT 0,
  
  -- Notas
  client_notes TEXT,
  staff_notes TEXT,
  
  -- Origen de la reserva
  source VARCHAR(50) DEFAULT 'website' 
    CHECK (source IN ('website', 'phone', 'walk_in', 'api', 'import')),
  external_reference VARCHAR(255), -- Para integración con APIs externas
  
  -- Recordatorios enviados
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_by UUID, -- Usuario/admin que creó la reserva
  cancelled_by UUID, -- Usuario/admin que canceló
  cancellation_reason TEXT,
  
  CONSTRAINT bookings_time_valid CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS idx_bookings_website_id ON bookings(website_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date_status ON bookings(booking_date, status);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trg_bookings_updated_at ON bookings;
CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_services_updated_at();

-- ============================================================================
-- VISTA: RESERVAS CON INFORMACIÓN COMPLETA
-- ============================================================================
CREATE OR REPLACE VIEW bookings_full_view AS
SELECT 
  b.id,
  b.booking_date,
  b.start_time,
  b.end_time,
  b.status,
  b.payment_status,
  b.payment_amount,
  b.client_notes,
  b.staff_notes,
  b.source,
  b.reminder_sent,
  b.created_at,
  b.updated_at,
  
  -- Información del servicio
  s.id as service_id,
  s.name as service_name,
  s.duration_minutes,
  s.price as service_price,
  s.color as service_color,
  
  -- Información del cliente
  c.id as client_id,
  c.first_name as client_first_name,
  c.last_name as client_last_name,
  c.email as client_email,
  c.phone as client_phone,
  
  -- Nombre completo del cliente
  CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as client_full_name

FROM bookings b
JOIN booking_services s ON s.id = b.service_id
JOIN booking_clients c ON c.id = b.client_id
ORDER BY b.booking_date DESC, b.start_time DESC;

-- ============================================================================
-- FUNCIONES AUXILIARES
-- ============================================================================

-- Función para obtener disponibilidad de un día
CREATE OR REPLACE FUNCTION get_available_slots(
  p_website_id UUID,
  p_service_id UUID,
  p_date DATE
)
RETURNS TABLE (
  slot_start TIME,
  slot_end TIME,
  is_available BOOLEAN
) AS $$
DECLARE
  v_day_of_week INTEGER;
  v_service_duration INTEGER;
  v_schedule RECORD;
  v_slot TIME;
BEGIN
  -- Obtener día de la semana
  v_day_of_week := EXTRACT(DOW FROM p_date);
  
  -- Obtener duración del servicio
  SELECT duration_minutes INTO v_service_duration
  FROM booking_services WHERE id = p_service_id;
  
  -- Verificar si hay excepción para este día
  IF EXISTS (
    SELECT 1 FROM booking_schedule_exceptions 
    WHERE website_id = p_website_id 
    AND exception_date = p_date 
    AND exception_type = 'closed'
  ) THEN
    RETURN; -- Día cerrado, no hay slots
  END IF;
  
  -- Obtener horarios para este día
  FOR v_schedule IN 
    SELECT bs.start_time, bs.end_time
    FROM booking_schedules bs
    WHERE bs.website_id = p_website_id
    AND (bs.service_id = p_service_id OR bs.service_id IS NULL)
    AND bs.day_of_week = v_day_of_week
    AND bs.is_active = true
    
    UNION
    
    -- Horarios específicos de excepción
    SELECT bse.start_time, bse.end_time
    FROM booking_schedule_exceptions bse
    WHERE bse.website_id = p_website_id
    AND bse.exception_date = p_date
    AND bse.exception_type = 'special'
  LOOP
    v_slot := v_schedule.start_time;
    
    WHILE v_slot < v_schedule.end_time LOOP
      slot_start := v_slot;
      slot_end := v_slot + (v_service_duration || ' minutes')::INTERVAL;
      
      -- Verificar si el slot está disponible
      is_available := NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.service_id = p_service_id
        AND b.booking_date = p_date
        AND b.status IN ('pending', 'confirmed')
        AND b.start_time < slot_end
        AND b.end_time > slot_start
      );
      
      RETURN NEXT;
      
      v_slot := v_slot + '30 minutes'::INTERVAL;
    END LOOP;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar contadores de cliente
CREATE OR REPLACE FUNCTION update_client_booking_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar contadores del cliente
  UPDATE booking_clients
  SET 
    total_bookings = (
      SELECT COUNT(*) FROM bookings WHERE client_id = NEW.client_id
    ),
    completed_bookings = (
      SELECT COUNT(*) FROM bookings WHERE client_id = NEW.client_id AND status = 'completed'
    ),
    cancelled_bookings = (
      SELECT COUNT(*) FROM bookings WHERE client_id = NEW.client_id AND status = 'cancelled'
    ),
    no_show_bookings = (
      SELECT COUNT(*) FROM bookings WHERE client_id = NEW.client_id AND status = 'no_show'
    ),
    updated_at = NOW()
  WHERE id = NEW.client_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_client_counts ON bookings;
CREATE TRIGGER trg_update_client_counts
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_client_booking_counts();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_schedule_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Políticas (ajustar según necesidades de autenticación)
CREATE POLICY "Allow all" ON booking_services FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON booking_schedules FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON booking_schedule_exceptions FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON booking_clients FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON bookings FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- ============================================================================
-- DATOS DE CONFIGURACIÓN INICIAL
-- ============================================================================

-- Insertar addon si no existe
INSERT INTO website_addons (website_id, addon_key, is_active)
SELECT id, 'bookings', true FROM websites
ON CONFLICT (website_id, addon_key) DO UPDATE SET is_active = true;

SELECT 'Esquema de reservas creado correctamente' as status;
