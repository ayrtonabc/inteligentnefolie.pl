# Sistema de Traducciones Dinámicas para Ofertas Web

## Descripción

Este sistema permite almacenar y mostrar traducciones dinámicas para las ofertas web (título, descripción y categoría) en múltiples idiomas. Las traducciones se gestionan desde el CMS y se muestran automáticamente en la landing page según el idioma seleccionado por el usuario.

## Instalación

### 1. Aplicar el Script SQL

Ejecuta el siguiente script en tu base de datos Supabase para agregar los campos de traducción:

```sql
-- Ejecuta el contenido de: cms/web_offers_translations_schema.sql
```

Este script:
- Agrega columnas `title_pl`, `title_en`, `title_es`, `title_ru`
- Agrega columnas `description_pl`, `description_en`, `description_es`, `description_ru`
- Agrega columnas `category_pl`, `category_en`, `category_es`, `category_ru`
- Migra los datos existentes a los campos en polaco (idioma por defecto)
- Crea índices para mejorar el rendimiento

### 2. Verificar la Aplicación

Después de ejecutar el script, verifica que las columnas se hayan creado correctamente en la tabla `web_offers` en Supabase.

## Funcionamiento

### En el CMS (WebOffers.tsx)

1. **Pestañas por Idioma**: Al crear o editar una oferta, verás pestañas para cada idioma activo en el sistema (configurados en "Sitio Web" > "Idiomas").

2. **Edición por Idioma**: 
   - Selecciona la pestaña del idioma que quieres editar
   - Completa el título, descripción y categoría en ese idioma
   - Cambia de pestaña para editar otros idiomas
   - Todos los idiomas se guardan al hacer clic en "Crear" o "Actualizar"

3. **Compatibilidad hacia atrás**: Los campos originales (`title`, `description`, `category`) se llenan automáticamente con el idioma por defecto para mantener compatibilidad.

### En la Landing Page

1. **Traducción Automática**: 
   - Cuando un usuario selecciona un idioma, las ofertas se muestran automáticamente en ese idioma
   - Si no existe traducción para un idioma, se muestra el contenido del idioma por defecto

2. **Componentes Actualizados**:
   - `Home.tsx`: Muestra ofertas destacadas con traducciones
   - `Projects.tsx`: Lista completa de ofertas con traducciones
   - `ProjectDetail.tsx`: Detalle de oferta con traducciones

## Uso

### Crear una Nueva Oferta con Traducciones

1. Ve a "Sitio Web" > "Ofertas Web" en el CMS
2. Haz clic en "Nueva Oferta"
3. Verás pestañas para cada idioma activo (🇵🇱 Polski, 🇬🇧 English, 🇪🇸 Español, etc.)
4. Completa los campos en cada idioma:
   - **Título**: Nombre de la oferta en ese idioma
   - **Descripción**: Descripción completa en ese idioma
   - **Categoría**: Categoría en ese idioma (ej: "Comercial", "Commercial", "Comercial")
5. Completa los demás campos (imágenes, costo, fechas, etc.)
6. Guarda la oferta

### Editar Traducciones de una Oferta Existente

1. Haz clic en "Editar" en la oferta que quieres modificar
2. Cambia entre las pestañas de idiomas
3. Modifica los textos en el idioma que necesites
4. Guarda los cambios

## Notas Importantes

- **Idiomas Activos**: Solo los idiomas marcados como "Activo" en "Sitio Web" > "Idiomas" aparecerán como pestañas
- **Idioma por Defecto**: El idioma marcado como "Por defecto" se usa como fallback si falta una traducción
- **Campos Obligatorios**: El título es obligatorio en al menos el idioma por defecto
- **Nuevos Idiomas**: Si agregas un nuevo idioma en "Sitio Web" > "Idiomas", automáticamente aparecerá como pestaña en el formulario de ofertas

## Estructura de Datos

Cada oferta ahora tiene:
- Campos originales (compatibilidad): `title`, `description`, `category`
- Campos de traducción: `title_pl`, `title_en`, `title_es`, `title_ru`, etc.
- Los campos de traducción se crean dinámicamente según los idiomas activos

## Solución de Problemas

### Las traducciones no se muestran
- Verifica que hayas ejecutado el script SQL
- Verifica que los idiomas estén marcados como "Activo" en el CMS
- Verifica que hayas guardado las traducciones en el formulario

### Falta un idioma en las pestañas
- Ve a "Sitio Web" > "Idiomas" y verifica que el idioma esté marcado como "Activo"
- Recarga la página del CMS
