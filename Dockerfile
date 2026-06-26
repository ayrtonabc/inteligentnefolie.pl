# STAGE 1: Builder
FROM node:24-alpine AS builder
WORKDIR /app

# Instalar dependencias necesarias para node-gyp u otros módulos nativos
RUN apk add --no-cache libc6-compat

# Copiar archivos de definición de dependencias
COPY package.json package-lock.json ./
# COPY cms/package.json ./cms/package.json

# Instalar todas las dependencias (incluyendo workspaces)
RUN npm install

# Copiar el resto del código
COPY . .

# Variables de entorno para la construcción (puedes pasar estas en tiempo de build si es necesario)
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Construir el CMS y luego Next.js
# El script "build" ya hace: npm run build:cms && next build
RUN npm run build

# STAGE 2: Runner
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Crear usuario de sistema para mayor seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios desde el builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Asegurar permisos correctos
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "start"]
