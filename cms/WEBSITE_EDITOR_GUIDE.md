# Guía del Editor Visual del Sitio Web

## 📋 Descripción

El sistema de edición visual permite modificar cualquier elemento del sitio web tocándolo directamente, similar a Odoo. Solo funciona cuando se accede desde el panel CMS con un token especial.

## 🚀 Configuración Inicial

### 1. Ejecutar el Schema SQL

Primero, ejecuta el schema en Supabase:

```sql
-- Ejecuta el archivo: cms/website_content_schema.sql
-- En Supabase Dashboard > SQL Editor
```

### 2. Acceder al Panel de Gestión

1. Inicia sesión en el CMS
2. Ve a **"Sitio Web"** en el menú lateral
3. En la pestaña **"Resumen"**, haz clic en **"Generar Token de Edición"**

## ✏️ Cómo Usar el Editor Visual

### Paso 1: Generar Token de Edición

1. En el CMS, ve a **Sitio Web > Resumen**
2. Haz clic en **"Generar Token de Edición"**
3. Se generará un enlace especial con el formato: `http://localhost:5173?edit=edit_xxxxx`

### Paso 2: Abrir el Sitio en Modo Edición

1. Haz clic en **"Abrir"** o copia el enlace y ábrelo en una nueva pestaña
2. El sitio se cargará en modo edición
3. Verás una barra de herramientas flotante en la esquina superior derecha

### Paso 3: Editar Elementos

1. **Haz clic en cualquier elemento** del sitio (texto, imagen, enlace, etc.)
2. Se abrirá un modal de edición
3. Modifica el contenido
4. Haz clic en **"Guardar"**
5. El cambio se aplicará inmediatamente y se guardará en la base de datos

### Paso 4: Salir del Modo Edición

- Haz clic en **"Salir"** en la barra de herramientas
- O simplemente cierra la pestaña

## 🎯 Características

### ✅ Elementos Editables

- **Textos**: Títulos, párrafos, botones, etc.
- **Imágenes**: URLs de imágenes
- **Enlaces**: URLs de enlaces
- **HTML**: Contenido HTML completo
- **Videos**: URLs de videos

### 🔒 Seguridad

- Solo funciona con un token válido generado desde el CMS
- Los tokens expiran después de 24 horas
- Solo usuarios autenticados pueden generar tokens
- El modo edición solo se activa con el parámetro `?edit=token` en la URL

### 🌍 Gestión de Idiomas

1. Ve a **Sitio Web > Idiomas**
2. Activa/desactiva idiomas disponibles
3. Establece el idioma por defecto
4. El contenido se guarda por idioma

## 📝 Estructura de Datos

### Tabla `site_content`

```sql
- page_path: Ruta de la página (ej: '/', '/projects')
- section_key: Identificador único del elemento
- content_type: Tipo de contenido (text, html, image, link, video)
- content_value: Valor del contenido (JSONB)
- language_code: Código del idioma (pl, en, es)
- is_active: Si está activo
```

### Ejemplo de Uso en Código

```typescript
import { useSiteContent } from '../hooks/useSiteContent'

function MyComponent() {
  const { content, loading } = useSiteContent({
    pagePath: '/',
    sectionKey: 'hero-title',
    languageCode: 'pl',
    defaultValue: 'Título por defecto'
  })

  if (loading) return <div>Cargando...</div>
  
  return <h1>{content}</h1>
}
```

## 🛠️ Herramientas Disponibles

### En el Panel CMS (Sitio Web)

1. **Resumen**: 
   - Generar tokens de edición
   - Ver estadísticas
   - Acceso rápido al editor

2. **Idiomas**:
   - Gestionar idiomas disponibles
   - Activar/desactivar idiomas
   - Establecer idioma por defecto

3. **Contenido**:
   - Ver información sobre el editor
   - Próximamente: gestión masiva de contenido

4. **Configuración**:
   - Configuración general del sitio
   - Próximamente: SEO, redes sociales, etc.

## 💡 Tips y Mejores Prácticas

1. **Genera un nuevo token** cada vez que vayas a editar
2. **Guarda frecuentemente** mientras editas
3. **Usa el modo edición en una ventana separada** para comparar cambios
4. **Verifica los cambios** en diferentes dispositivos después de editar
5. **El contenido se guarda por idioma**, así que edita cada idioma por separado

## 🔧 Solución de Problemas

### El modo edición no se activa

- Verifica que el token sea válido (menos de 24 horas)
- Asegúrate de que la URL tenga el formato correcto: `?edit=token_xxxxx`
- Revisa la consola del navegador para errores

### Los cambios no se guardan

- Verifica tu conexión a internet
- Asegúrate de estar autenticado en el CMS
- Revisa los permisos de la tabla `site_content` en Supabase

### No puedo generar un token

- Verifica que estés autenticado en el CMS
- Revisa que la tabla `edit_sessions` exista en Supabase
- Verifica los permisos RLS en Supabase

## 📚 Próximas Mejores

- [ ] Editor de estilos (colores, fuentes, tamaños)
- [ ] Arrastrar y soltar elementos
- [ ] Historial de cambios
- [ ] Vista previa antes de publicar
- [ ] Gestión de imágenes desde el editor
- [ ] Plantillas predefinidas
- [ ] Editor de SEO por página

## 🆘 Soporte

Si tienes problemas, verifica:
1. Que el schema SQL se haya ejecutado correctamente
2. Que las políticas RLS estén configuradas
3. Que el token no haya expirado
4. La consola del navegador para errores
