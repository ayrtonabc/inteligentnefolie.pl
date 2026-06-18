# Crear Bucket "web-offers" en Supabase Storage

## 📋 Pasos Rápidos

### Opción 1: Crear el Bucket Manualmente (Recomendado)

1. Ve a tu proyecto de Supabase: https://gzjnbqyjjoyhpzeykktk.supabase.co
2. Abre **Storage** en el menú lateral
3. Haz clic en **"New bucket"**
4. Completa el formulario:
   - **Name**: `web-offers` (exactamente así, sin espacios)
   - **Public bucket**: ✅ **Activar** (muy importante para que las imágenes sean accesibles)
   - **File size limit**: `5242880` (5 MB) o el que prefieras
   - **Allowed MIME types**: `image/jpeg,image/png,image/gif,image/webp`
5. Haz clic en **"Create bucket"**

### Opción 2: Usar el Bucket Existente "hola"

Si prefieres usar el bucket "hola" que ya existe, el código ya está configurado para usarlo. Solo asegúrate de que tenga las políticas correctas.

## 🔐 Configurar Políticas RLS

Después de crear el bucket, ejecuta este script en el **SQL Editor** de Supabase:

```sql
-- Políticas para storage.objects (web-offers bucket)
-- Permitir lectura pública
CREATE POLICY "Public can view web-offers images"
ON storage.objects FOR SELECT
USING (bucket_id = 'web-offers');

-- Permitir subida a usuarios autenticados
CREATE POLICY "Authenticated users can upload web-offers images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'web-offers' 
  AND auth.role() = 'authenticated'
);

-- Permitir actualización a usuarios autenticados
CREATE POLICY "Authenticated users can update web-offers images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'web-offers' 
  AND auth.role() = 'authenticated'
);

-- Permitir eliminación a usuarios autenticados
CREATE POLICY "Authenticated users can delete web-offers images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'web-offers' 
  AND auth.role() = 'authenticated'
);
```

## ✅ Verificar que Funciona

1. Ve al CMS > Ofertas Web
2. Crea o edita una oferta
3. Haz clic en "Click para subir" en el campo de imagen
4. Selecciona una imagen
5. Debería subirse sin errores

## 🔄 Si Quieres Usar el Bucket "hola" en su Lugar

El código ya está configurado para usar "hola" por defecto. Si prefieres crear "web-offers" más tarde, solo cambia:

```typescript
// En cms/src/pages/WebOffers.tsx
bucketName="hola"  // Cambiar a "web-offers" cuando lo crees
```

## 📝 Nota

- El bucket debe ser **público** para que las imágenes se muestren en el sitio web
- Las políticas RLS controlan quién puede subir/eliminar imágenes
- Solo usuarios autenticados pueden subir, pero todos pueden ver las imágenes
