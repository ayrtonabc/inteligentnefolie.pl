# 🚀 Dashboard con Proyectos Reales - Guía de Instalación

## 📋 Resumen

Hemos transformado tu Dashboard para que funcione con **datos reales** basados en proyectos/oportunidades. El sistema ahora incluye:

- ✅ **Tabla de Proyectos** (projects) - Gestión completa de oportunidades
- ✅ **Tabla de Leads** (leads) - Contactos y clientes potenciales  
- ✅ **Tabla de Tasks** (tasks) - Tareas vinculadas a proyectos
- ✅ **Dashboard Dinámico** - Métricas calculadas en tiempo real
- ✅ **Página de Proyectos** - CRUD completo con filtros

---

## 🗄️ Paso 1: Crear las Tablas en Supabase

### Opción A: SQL Editor (Recomendado)

1. Ve a tu **Supabase Dashboard** → **SQL Editor**
2. Crea una nueva query
3. Copia y pega el contenido de `database_setup.sql`
4. Haz clic en **Run**

### Opción B: Ejecutar archivos individuales

Ejecuta en este orden:
1. `leads_table.sql`
2. `projects_table.sql`  
3. `tasks_table.sql`

---

## 🔄 Paso 2: Recargar Schema Cache

**MUY IMPORTANTE:** Después de ejecutar el SQL:

1. Ve a **Supabase Dashboard** → **Settings** → **API**
2. Haz clic en **"Reload Schema Cache"**
3. Espera 5-10 segundos

---

## 🎯 Paso 3: Agregar Datos de Prueba (Opcional)

Para ver el Dashboard con datos, puedes:

### Opción 1: Usar la interfaz
1. Ve a `/projects` en tu aplicación
2. Haz clic en "New Project"
3. Crea algunos proyectos de prueba

### Opción 2: Insertar datos directamente

```sql
-- Insertar proyectos de ejemplo
INSERT INTO projects (name, client_name, client_email, value, status, priority, stage, expected_close_date) VALUES
  ('Website Redesign', 'Acme Corp', 'contact@acme.com', 50000, 'open', 'high', 'proposal', '2026-02-15'),
  ('Mobile App Development', 'TechStart Inc', 'info@techstart.com', 120000, 'open', 'urgent', 'negotiation', '2026-03-01'),
  ('Brand Identity', 'Creative Studio', 'hello@creative.com', 25000, 'won', 'medium', 'closed', '2026-01-20'),
  ('E-commerce Platform', 'ShopNow LLC', 'sales@shopnow.com', 80000, 'open', 'high', 'qualified', '2026-02-28'),
  ('Marketing Campaign', 'GrowFast', 'team@growfast.com', 15000, 'abandoned', 'low', 'lead', '2026-01-30');

-- Insertar leads de ejemplo
INSERT INTO leads (name, email, phone, message, status, priority) VALUES
  ('John Smith', 'john@example.com', '+1-555-0101', 'Interested in web development services', 'new', 'high'),
  ('Sarah Johnson', 'sarah@company.com', '+1-555-0102', 'Looking for mobile app development', 'contacted', 'medium'),
  ('Mike Wilson', 'mike@business.com', '+1-555-0103', 'Need branding consultation', 'qualified', 'high');
```

---

## 📊 Estructura del Dashboard

El Dashboard ahora muestra:

### Card 1: Opportunity Status
- **Total de proyectos** en el período seleccionado
- **Gráfico de pastel** con distribución por estado (Open, Won, Lost, Abandoned)
- **Comparación** vs período anterior

### Card 2: Opportunity Value  
- **Valor total** de todos los proyectos
- **Gráfico de barras** mostrando valor por estado
- **Revenue total** calculado

### Card 3: Conversion Rate
- **Tasa de conversión** (proyectos ganados / total)
- **Gráfico circular** mostrando porcentaje
- **Revenue ganado** (solo proyectos con status 'won')

---

## 🎨 Nuevas Funcionalidades

### Página de Proyectos (`/projects`)
- ✅ Crear nuevos proyectos con todos los detalles
- ✅ Filtrar por estado (All, Open, Won, Abandoned)
- ✅ Buscar por nombre de proyecto o cliente
- ✅ Cambiar estado directamente desde la tabla
- ✅ Eliminar proyectos
- ✅ Ver valor, prioridad, etapa y fecha de cierre

### Dashboard Actualizado (`/dashboard`)
- ✅ Datos reales desde Supabase
- ✅ Cálculos automáticos de métricas
- ✅ Rango de fechas (últimos 31 días por defecto)
- ✅ Gráficos dinámicos con Recharts
- ✅ Formateo inteligente de moneda ($50K, $1.2M)

---

## 🔧 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `src/pages/Dashboard.tsx` | Completamente refactorizado para consumir datos reales |
| `src/pages/Projects.tsx` | **NUEVO** - Página completa de gestión de proyectos |
| `projects_table.sql` | **NUEVO** - Schema de tabla projects |
| `leads_table.sql` | **NUEVO** - Schema de tabla leads |
| `tasks_table.sql` | **NUEVO** - Schema de tabla tasks actualizado |

---

## 🐛 Solución de Problemas

### Error 403 en Projects
- Verifica que ejecutaste el SQL correctamente
- Asegúrate de recargar el Schema Cache
- Verifica que las políticas RLS estén activas

### Dashboard muestra 0 en todo
- Agrega proyectos de prueba
- Verifica que el rango de fechas incluya tus proyectos
- Revisa la consola del navegador para errores

### Recharts Warning
- Es solo una advertencia cosmética
- No afecta la funcionalidad
- Los gráficos se renderizan correctamente después del primer frame

---

## 📱 Próximos Pasos Sugeridos

1. **Vincular Leads con Projects**: Cuando conviertes un lead, crear automáticamente un proyecto
2. **Pipeline View**: Vista Kanban para mover proyectos entre etapas
3. **Reports**: Gráficos de tendencias y análisis histórico
4. **Notificaciones**: Alertas cuando un proyecto está cerca de la fecha de cierre
5. **Integración con Tasks**: Vincular tareas específicas a cada proyecto

---

## 💡 Uso del Sistema

### Flujo de Trabajo Recomendado:

1. **Leads** → Captura contactos nuevos en `/leads`
2. **Projects** → Convierte leads en proyectos en `/projects`
3. **Tasks** → Crea tareas relacionadas en `/tasks`
4. **Dashboard** → Monitorea métricas y progreso en `/dashboard`
5. **Invoices** → Genera facturas para proyectos ganados en `/invoices`

---

## ✅ Checklist de Verificación

- [ ] Ejecuté el SQL en Supabase
- [ ] Recargué el Schema Cache
- [ ] Puedo ver la página de Projects sin errores
- [ ] Puedo crear un nuevo proyecto
- [ ] El Dashboard muestra datos reales
- [ ] Los gráficos se renderizan correctamente
- [ ] No hay errores 403 en la consola

---

**¡Listo!** Tu CMS ahora tiene un Dashboard completamente funcional con datos reales. 🎉
