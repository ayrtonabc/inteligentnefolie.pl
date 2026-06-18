# Configuración de Storage para Carga de Imágenes

## 📋 Pasos para Configurar Supabase Storage

### Paso 1: Crear el Bucket en Supabase

1. Ve a tu proyecto de Supabase: https://gzjnbqyjjoyhpzeykktk.supabase.co
2. Abre **Storage** en el menú lateral
3. Haz clic en **"New bucket"**
4. Configura:
   - **Name**: `web-offers`
   - **Public bucket**: ✅ Activar (para que las imágenes sean accesibles públicamente)
   - **File size limit**: 5 MB (o el que prefieras)
   - **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp`

### Paso 2: Configurar Políticas RLS

Ejecuta el script SQL `cms/setup_storage_bucket.sql` en el SQL Editor de Supabase, o configura manualmente:

1. Ve a **Storage** > **Policies** en Supabase
2. Selecciona el bucket `web-offers`
3. Crea las siguientes políticas:

**Política 1: Lectura Pública**
- Nombre: "Public can view web-offers images"
- Operación: SELECT
- SQL:
```sql
bucket_id = 'web-offers'
```

**Política 2: Subida Autenticada**
- Nombre: "Authenticated users can upload web-offers images"
- Operación: INSERT
- SQL:
```sql
bucket_id = 'web-offers' AND auth.role() = 'authenticated'
```

**Política 3: Actualización Autenticada**
- Nombre: "Authenticated users can update web-offers images"
- Operación: UPDATE
- SQL:
```sql
bucket_id = 'web-offers' AND auth.role() = 'authenticated'
```

**Política 4: Eliminación Autenticada**
- Nombre: "Authenticated users can delete web-offers images"
- Operación: DELETE
- SQL:
```sql
bucket_id = 'web-offers' AND auth.role() = 'authenticated'
```

### Paso 3: Verificar Configuración

1. Ve al CMS
2. Ve a **Ofertas Web**
3. Crea o edita una oferta
4. Haz clic en el área de carga de imagen
5. Selecciona una imagen desde tu computadora
6. La imagen debería subirse automáticamente

## ✅ Características del Componente de Carga

- ✅ Carga directa desde el navegador
- ✅ Preview inmediato de la imagen
- ✅ Validación de tipo de archivo (solo imágenes)
- ✅ Validación de tamaño (máx 5MB)
- ✅ Indicador de progreso
- ✅ Manejo de errores
- ✅ Opción para cambiar o eliminar imagen

## 🔧 Solución de Problemas

### Error: "Bucket not found"
- Verifica que el bucket `web-offers` exista en Supabase Storage
- Asegúrate de que el nombre sea exactamente `web-offers`

### Error: "Permission denied"
- Verifica que las políticas RLS estén configuradas correctamente
- Asegúrate de estar autenticado en el CMS

### Error: "File too large"
- El archivo excede el límite de 5MB
- Comprime la imagen o usa una de menor tamaño

### La imagen no se muestra
- Verifica que el bucket sea público
- Revisa la consola del navegador para errores
- Verifica que la URL de la imagen sea correcta

## 📝 Notas

- Las imágenes se almacenan en Supabase Storage
- Las URLs generadas son públicas y permanentes
- Puedes eliminar imágenes desde Supabase Storage si es necesario
- El componente soporta arrastrar y soltar (drag & drop)
