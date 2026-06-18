# CMS Documentation - Arquitectura y Guía de Integración

**Resumen:** CMS Headless completo construido con React + TypeScript + Supabase, con soporte para múltiples websites, addons modulares y panel de administración profesional.

---

## 📋 Índice

1. [Arquitectura General](#arquitectura-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Base de Datos (Supabase)](#base-de-datos-supabase)
4. [Módulos y Features](#módulos-y-features)
5. [Features Instaladas pero NO Funcionales](#features-instaladas-pero-no-funcionales)
6. [Integración de Frontend](#integración-de-frontend)
7. [Guía de Integraciones](#guía-de-integraciones)
8. [Variables de Entorno](#variables-de-entorno)

---

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   Panel     │  │   Website   │  │   Tienda    │      │
│  │   Admin     │  │   Público   │  │   Online    │      │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │
└─────────┼────────────────┼────────────────┼──────────────┘
          │                │                │
          └────────────────┴────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│              SUPABASE (Backend as a Service)             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│  │   Auth       │ │   Database   │ │   Storage    │     │
│  │   (JWT)      │ │   (PostgreSQL)│ │   (Files)   │     │
│  └──────────────┘ └──────────────┘ └──────────────┘     │
│  ┌──────────────┐ ┌──────────────┐                       │
│  │ Real-time    │ │   Edge       │                       │
│  │ (WebSocket)  │ │   Functions  │                       │
│  └──────────────┘ └──────────────┘                       │
└─────────────────────────────────────────────────────────┘
```

**Tecnologías Principales:**
- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS
- **Estado:** React Query (TanStack Query) para server state
- **Backend:** Supabase (PostgreSQL + Auth + Real-time)
- **UI:** Lucide React (iconos) + componentes custom
- **Routing:** React Router DOM v6

---

## 📁 Estructura del Proyecto

```
cms/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Sidebar.tsx      # Navegación lateral
│   │   ├── PageHeader.tsx   # Header de páginas
│   │   ├── Toast.tsx        # Notificaciones
│   │   └── ConfirmDialog.tsx# Diálogos de confirmación
│   │
│   ├── context/             # Contextos React
│   │   ├── AuthContext.tsx  # Autenticación
│   │   └── LanguageContext.tsx # Gestión de idiomas
│   │
│   ├── features/            # Módulos por dominio
│   │   ├── auth/            # Autenticación
│   │   ├── blog/            # Blog (lista, formulario)
│   │   ├── bookings/        # Sistema de reservas
│   │   ├── courses/         # Cursos online (LMS)
│   │   ├── languages/       # Gestión multi-idioma
│   │   ├── menu/            # Menú de restaurante
│   │   ├── pages/           # CMS de páginas
│   │   ├── popups/          # Pop-ups modales
│   │   ├── projects/        # Portfolio/Proyectos
│   │   ├── seo/             # SEO + AI + Audyt
│   │   ├── serpbear/        # Integración SerpBear
│   │   ├── settings/        # Configuración website
│   │   └── shop/            # Tienda e-commerce
│   │
│   ├── pages/               # Páginas del panel admin
│   │   ├── Seo.tsx          # Panel SEO completo
│   │   ├── Website.tsx      # Editor visual website
│   │   ├── Settings.tsx     # Configuración general
│   │   ├── Shop.tsx         # Gestión tienda
│   │   ├── Courses.tsx      # Gestión cursos
│   │   └── ...              # (54 páginas total)
│   │
│   ├── lib/                 # Librerías core
│   │   ├── supabaseClient.ts # Cliente Supabase
│   │   └── supabase.ts      # Tipos Supabase
│   │
│   ├── hooks/               # Custom hooks
│   │   └── useShop.ts       # Hook para tienda
│   │
│   ├── App.tsx              # Router principal
│   └── main.tsx             # Entry point
│
├── *.sql                    # Schemas de base de datos
├── package.json
└── vite.config.ts
```

---

## 🗄️ Base de Datos (Supabase)

### Tablas Principales

| Tabla | Propósito | Estado |
|-------|-----------|--------|
| `websites` | Websites gestionados | ✅ Activa |
| `website_settings` | Configuración global | ✅ Activa |
| `website_addons` | Addons activados | ✅ Activa |
| `cms_pages` | Páginas CMS | ✅ Activa |
| `blog_posts` | Artículos blog | ✅ Activa |
| `leads` | Contactos/Formularios | ✅ Activa |
| `media_files` | Archivos subidos | ✅ Activa |

### Addons (Tablas condicionales)

| Tabla | Addon Requerido | Estado |
|-------|-----------------|--------|
| `shop_products` | `shop` | ⚠️ Requiere activación |
| `shop_orders` | `shop` | ⚠️ Requiere activación |
| `courses` | `courses` | ⚠️ Requiere activación |
| `course_lessons` | `courses` | ⚠️ Requiere activación |
| `bookings_services` | `bookings` | ⚠️ Requiere activación |
| `bookings_appointments` | `bookings` | ⚠️ Requiere activación |
| `menu_categories` | `restaurant` | ⚠️ Requiere activación |
| `projects` | `portfolio` | ⚠️ Requiere activación |
| `serpbear_keywords` | Config manual | ⚠️ Requiere config |

---

## 🧩 Módulos y Features

### Core (Siempre disponible)

```typescript
// Módulos en /src/features/

├── blog/          ✅ Blog con categorías
├── pages/         ✅ CMS páginas dinámicas
├── popups/        ✅ Pop-ups modales
├── seo/           ✅ SEO completo + AI
├── settings/      ✅ Configuración website
└── languages/     ✅ Multi-idioma
```

### Addons (Activables en `/addons`)

```typescript
// Addon system - activar en UI

shop:        🛒 E-commerce completo
courses:     📚 LMS con lecciones y progreso
bookings:    📅 Reservas con calendario
restaurant:  🍽️ Menú digital
portfolio:   🎨 Galería proyectos
multilang:   🌐 Gestión idiomas avanzada
```

---

## ⚠️ Features Instaladas pero NO Funcionales

### 1. 🤖 Integración AI (SEO)

**Ubicación:** `src/features/seo/ai.ts`

**Estado:** ⚠️ **PARCIALMENTE FUNCIONAL**

**Qué está implementado:**
- Generación de sugerencias meta (fallback local)
- UI para "Generuj z AI"
- Sistema de sugerencias con before/after

**Qué falta:**
```typescript
// Falta configurar en .env:
VITE_SEO_AI_API_URL=https://tu-api-ai.com/generate

// El sistema usa fallback local si no hay API configurada
```

**Cómo integrar:**
1. Crear endpoint API que reciba:
```typescript
{
  page: { title, path, language_code, seo, content },
  issues: SeoIssues
}
```

2. Responder con:
```typescript
{
  suggestions: [{
    code: string,
    title: string,
    before: string,
    after: string,
    target: 'metaTitle' | 'metaDescription',
    applyPatch: { [key: string]: string }
  }]
}
```

3. Configurar variable de entorno

---

### 2. 📊 SerpBear (Tracking de Keywords)

**Ubicación:** `src/features/serpbear/`

**Estado:** ⚠️ **REQUIERE CONFIGURACIÓN EXTERNA**

**Qué está implementado:**
- Cliente API completo (`client.ts`)
- UI de sección "Pozycje" en SEO
- Hooks React para integración
- Tablas de base de datos

**Qué falta:**
```typescript
// Falta instancia SerpBear self-hosted
// Configurar en website_settings:
{
  serpbear_enabled: true,
  serpbear_url: 'https://serp.tudominio.com',
  serpbear_api_key: 'tu-api-key'
}
```

**Cómo integrar:**
1. Desplegar SerpBear (ver github.com/towfiqi/serpbear)
2. Configurar en Settings del panel
3. La UI automáticamente conectará

---

### 3. 📈 PageSpeed Insights / Lighthouse

**Ubicación:** NO IMPLEMENTADO

**Estado:** ❌ **NO EXISTE**

**Cómo integrar:**
Crear nuevo servicio en `src/services/pagespeed.ts`:
```typescript
const API_KEY = import.meta.env.VITE_PAGESPEED_API_KEY
const API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'

export async function runPageSpeed(url: string) {
  const response = await fetch(
    `${API_URL}?url=${encodeURIComponent(url)}&key=${API_KEY}`
  )
  return response.json()
}
```

---

### 4. 🌐 API Pública para Frontend

**Estado:** ❌ **NO EXISTE** - Solo panel admin

**Qué falta:**
- Endpoints REST para consumo público
- Autenticación API Key para frontend
- Rate limiting
- CORS configurado

**Cómo integrar (2 opciones):**

#### Opción A: Usar Supabase Directamente
```typescript
// Frontend Next.js/React consume Supabase
const supabase = createClient(url, anon_key)

// Fetch datos públicos
const { data } = await supabase
  .from('cms_pages')
  .select('*')
  .eq('is_published', true)
```

#### Opción B: Crear API Intermedia
```typescript
// Crear src/api/public.ts con endpoints:

GET /api/v1/pages           → Lista páginas
GET /api/v1/pages/:slug     → Página detalle
GET /api/v1/blog            → Posts blog
GET /api/v1/products        → Productos tienda
GET /api/v1/settings        → Configuración
```

---

## 🔌 Integración de Frontend

### Arquitectura Headless Recomendada

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Next.js App    │────▶│  Supabase API   │◀────│   CMS Panel     │
│  (Frontend)     │     │  (REST/GraphQL) │     │   (React)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                                               │
        │                                               │
        └──────────────┬────────────────────────────────┘
                       │
              ┌────────▼────────┐
              │  PostgreSQL     │
              │  (Datos)        │
              └─────────────────┘
```

### 1. Configurar Supabase para Acceso Público

**RLS Policies necesarias:**
```sql
-- Permitir lectura pública de páginas publicadas
CREATE POLICY "Public read pages" ON cms_pages
  FOR SELECT TO public
  USING (is_published = true);

-- Permitir lectura pública de blog
CREATE POLICY "Public read blog" ON blog_posts
  FOR SELECT TO public
  USING (is_published = true AND published_at <= now());

-- Permitir lectura pública de productos
CREATE POLICY "Public read products" ON shop_products
  FOR SELECT TO public
  USING (is_active = true);
```

### 2. Crear Cliente para Frontend

```typescript
// lib/cms-client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const cmsClient = createClient(supabaseUrl, supabaseKey)

// Helper functions
export async function getPage(slug: string, lang: string) {
  const { data } = await cmsClient
    .from('cms_pages')
    .select('*')
    .eq('slug', slug)
    .eq('language_code', lang)
    .eq('is_published', true)
    .single()
  return data
}

export async function getBlogPosts(limit = 10) {
  const { data } = await cmsClient
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit)
  return data
}
```

### 3. Estructura de Frontend

```
frontend-next/
├── app/
│   ├── [lang]/
│   │   ├── page.tsx           # Homepage
│   │   ├── [slug]/
│   │   │   └── page.tsx       # Páginas dinámicas
│   │   └── blog/
│   │       └── page.tsx       # Lista blog
│   └── api/
│       └── revalidate/        # ISR cache
├── components/
│   ├── PageRenderer.tsx       # Renderiza contenido CMS
│   └── BlockRenderer.tsx      # Renderiza bloques
├── lib/
│   └── cms-client.ts          # Cliente Supabase
└── types/
    └── cms.ts                 # Tipos TypeScript
```

---

## 📚 Guía de Integraciones

### Integración AI (OpenAI/Claude)

**Archivo:** `src/features/seo/ai.ts`

```typescript
// Ejemplo de integración con OpenAI:

export async function generateSeoSuggestions({ page, issues }) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  
  const prompt = `
    Genera meta title y description SEO para:
    Título: ${page.title}
    URL: ${page.path}
    Idioma: ${page.language_code}
    
    Requisitos:
    - Title: 50-60 caracteres
    - Description: 150-160 caracteres
    - Incluir keywords relevantes
    - Llamada a la acción clara
  `
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    })
  })
  
  // Parsear y devolver en formato esperado
}
```

### Integración SerpBear

**Ya implementado - solo configurar:**

1. Desplegar SerpBear en servidor/Docker
2. Añadir dominio y keywords en SerpBear
3. Configurar en panel: Settings → Integraciones
4. Ver datos en: /panel/seo → Pozycje

**Flujo de datos:**
```
SerpBear API → client.ts → React Query → UI Components
```

### Integración PageSpeed Insights

**Nuevo servicio a crear:**

```typescript
// src/services/pagespeed.ts
const API_KEY = import.meta.env.VITE_PAGESPEED_API_KEY

export async function analyzePerformance(url: string) {
  const [mobile, desktop] = await Promise.all([
    fetch(`${API_URL}?url=${url}&strategy=mobile&key=${API_KEY}`),
    fetch(`${API_URL}?url=${url}&strategy=desktop&key=${API_KEY}`)
  ])
  
  return {
    mobile: await mobile.json(),
    desktop: await desktop.json()
  }
}
```

---

## 🔐 Variables de Entorno

### Archivo `.env`

```bash
# Supabase (REQUERIDO)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# AI Integrations (OPCIONAL)
VITE_SEO_AI_API_URL=https://tu-api.com/generate
VITE_OPENAI_API_KEY=sk-...

# External APIs (OPCIONAL)
VITE_PAGESPEED_API_KEY=AIza...
VITE_SERPBEAR_URL=https://serp.tudominio.com
VITE_SERPBEAR_API_KEY=xxx

# Analytics (OPCIONAL)
VITE_GA_MEASUREMENT_ID=G-XXXXXX
```

---

## 🚀 Deployment

### Panel Admin (Vite/React)
```bash
cd cms
npm install
npm run build
# Subir /dist a hosting estático
```

### Base de Datos (Supabase)
```bash
# Aplicar schemas en orden:
1. database_setup.sql
2. website_settings_schema.sql
3. Addons según necesidad:
   - shop_schema.sql
   - courses_schema.sql
   - bookings_schema.sql
   - etc.
```

---

## 📝 Checklist de Implementación

### Para Frontend Público:
- [ ] Crear proyecto Next.js/React
- [ ] Instalar `@supabase/supabase-js`
- [ ] Configurar variables de entorno
- [ ] Crear RLS policies en Supabase
- [ ] Implementar cliente CMS
- [ ] Crear componentes renderers
- [ ] Configurar ISR (Next.js) o SSG

### Para Integraciones:
- [ ] AI: Configurar `VITE_SEO_AI_API_URL`
- [ ] SerpBear: Desplegar instancia + configurar URL/API key
- [ ] PageSpeed: Obtener API key de Google Cloud
- [ ] Analytics: Configurar GA4 ID

---

## 🔗 Recursos

- **Supabase Docs:** https://supabase.com/docs
- **SerpBear:** https://github.com/towfiqi/serpbear
- **PageSpeed API:** https://developers.google.com/speed/docs/insights/v5/get-started
- **React Query:** https://tanstack.com/query/latest
