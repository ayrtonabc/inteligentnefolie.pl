# SeoGrow — inteligentnefolie.pl

Sitio público + panel CMS multi-tenant para **inteligentnefolie.pl** (folie inteligentne / smart film).
Construido como monorepo de dos proyectos coordinados:

- **Next.js 15** (sitio público + API) — `app/`, `components/`, `lib/`, `features/`
- **CMS admin** (Vite + React + TypeScript) — `cms/` (workspace npm)

Backend: **PocketBase** (multi-tenant), con Supabase como alternativa para storage.
Pagos: **TPAY** (PLN). SEO: schema.org, sitemap, hreflang, auditoría IA.

---

## Stack

| Capa | Tecnología |
|---|---|
| Front | Next.js 15 (App Router) · React 18 · TypeScript · Tailwind CSS |
| CMS | Vite · React 18 · TypeScript · PocketBase SDK |
| Backend | PocketBase (multi-tenant) · opcional Supabase (storage) |
| Pagos | TPAY |
| IA | DeepSeek API · Minimax API |
| Deploy | Vercel (sitio) · Docker (alternativa) |

---

## Quick start

### 1. Clonar e instalar

```bash
git clone <repo-url>
cd inteligentnefolie
npm install
```

`npm install` también instala el workspace `cms/` (definido en `package.json`).

### 2. Variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales reales. **Nunca** commitees `.env` ni `.env.tpay`
(ya están en `.gitignore`). Para una referencia de qué variables existen mira
[`.env.example`](./.env.example).

### 3. Levantar PocketBase

El proyecto espera un PocketBase corriendo en `NEXT_PUBLIC_POCKETBASE_URL`.
Sigue la guía de setup en [`cms/SETUP_STORAGE.md`](./cms/SETUP_STORAGE.md)
para crear las colecciones necesarias.

### 4. Desarrollo

```bash
npm run dev          # dev wrapper: arranca Next.js + compila el CMS
npm run build:cms    # compila solo el CMS (output → public/panel/)
npm run build        # build:cms + next build (lo que usa Vercel)
npm run start        # arrancar build de producción
npm run lint
```

El sitio corre en `http://localhost:3000` y el panel admin en `http://localhost:3000/panel`.

---

## Estructura

```
.
├── app/                # Next.js App Router (rutas + API routes)
│   ├── api/            # Endpoints: revalidate, blog, checkout, analytics, ...
│   ├── blog/           # Páginas de blog
│   ├── kontakt/        # Contacto (es-ES / pl-PL)
│   ├── o-nas/          # About
│   ├── realizacje/     # Portfolio (PL)
│   ├── shop/           # Tienda
│   └── ...
├── cms/                # CMS admin (Vite + React) — workspace npm
│   ├── src/
│   │   ├── pages/      # Páginas admin: Blog, Bookings, Menu, Portfolio, ...
│   │   ├── features/   # Módulos de dominio
│   │   ├── components/ # UI compartida
│   │   └── vendor/     # Código de terceros (popupsmart, etc.)
│   ├── public/         # Assets del CMS (modals, logos)
│   └── dist/           # ⚠️ build output (regenerado, ignorado por Git)
├── components/         # Componentes React compartidos del sitio
│   ├── home/           # Secciones de la home
│   ├── seo/            # Componentes SEO (Schema.org, OG, etc.)
│   ├── shop/           # Carrito, lista de productos
│   └── cms/            # Bridge visual con el CMS
├── lib/                # Helpers, SEO, contexto, integraciones
│   ├── ai/             # Servicios IA (DeepSeek, Minimax)
│   ├── cms/            # Registry + scanner
│   ├── context/        # Contextos React (idioma, consentimiento, ...)
│   └── seo/            # Auditoría, metadata, schema, validador
├── features/           # Módulos de dominio compartidos sitio
│   ├── languages/      # Traducciones
│   ├── menu/           # Tipos del menú
│   └── restaurant/     # Tipos del restaurante
├── public/             # Assets estáticos del sitio
│   ├── images/         # WebP optimizados
│   ├── videos/         # MP4 demo
│   ├── pdf/            # PDFs descargables
│   └── panel/          # ⚠️ build output del CMS (regenerado, ignorado)
├── scripts/            # Build helpers y migraciones
│   ├── deploy-cms.mjs  # Compila el CMS y copia output a public/panel/
│   ├── dev-wrapper.mjs # Arranca dev con CMS en watch
│   ├── migrate-shop.mjs
│   └── legacy/         # Scripts one-off de setup inicial (no se usan)
├── Dockerfile          # Build multi-stage
├── docker-compose.yml  # Servicio producción
├── vercel.json         # Build command para Vercel
└── .env.example        # Plantilla de variables de entorno
```

---

## Build y deploy

### Vercel (recomendado)

`vercel.json` ya está configurado:

```json
{ "buildCommand": "npm run build", "installCommand": "npm install" }
```

El build ejecuta `npm run build:cms && next build`, así que el output del CMS
se regenera en cada deploy. No necesitas commitear `public/panel/` ni `cms/dist/`.

### Docker

```bash
docker compose up -d --build
```

El `Dockerfile` es multi-stage y produce una imagen final mínima
(solo `node:24-alpine` runner con código compilado). Variables de entorno vía `.env`.

---

## Notas importantes

### Qué NO commitear (ya está en `.gitignore`)

- `node_modules/`, `.next/` — dependencias y build cache
- `cms/dist/`, `public/panel/` — se regeneran con `npm run build:cms`
- `*.tsbuildinfo` — cache del compilador TypeScript
- `.env`, `.env.tpay` — **secretos**, no subir a Git nunca
- `.env.example` sí se commitea (es la plantilla sin secretos)

### Scripts de la carpeta `scripts/legacy/`

Son scripts one-off de la fase de setup inicial (poblar PocketBase con
contenido seed, hacer checks/debug, etc.). **No se usan en build ni en runtime.**
Se mantienen por referencia histórica; se pueden borrar en cualquier momento.

### `cms/src/vendor/popupsmart-modal-creator-upstream/`

Código fuente third-party de Popupsmart (forkeado localmente para uso offline).
Si lo actualizas, hazlo desde su repo upstream y propaga los cambios.

### Multi-tenant

El CMS soporta múltiples sitios por instancia de PocketBase.
`NEXT_PUBLIC_TENANT_ID` identifica al tenant activo.

---

## Licencia

Privado / propietario. Todos los derechos reservados.
