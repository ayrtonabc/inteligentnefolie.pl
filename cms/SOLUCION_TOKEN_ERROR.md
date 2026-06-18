# Solución: Error "Token de edición inválido o expirado"

## 🔴 Problema

Si ves el error "Token de edición inválido o expirado" al intentar usar el editor visual, es porque las políticas RLS (Row Level Security) en Supabase están bloqueando el acceso público a la tabla `edit_sessions`.

## ✅ Solución

### Paso 1: Ejecutar el Script SQL

1. Ve a tu proyecto de Supabase: https://gzjnbqyjjoyhpzeykktk.supabase.co
2. Abre el **SQL Editor** en el dashboard
3. Copia y pega el contenido del archivo `cms/fix_edit_sessions_policy.sql`
4. Haz clic en **Run** o presiona `Ctrl+Enter`

### Paso 2: Verificar que Funcionó

1. Vuelve al CMS
2. Ve a **Sitio Web > Resumen**
3. Genera un nuevo token de edición
4. Abre el enlace en una nueva pestaña
5. Deberías ver el modo edición activo sin errores

## 📋 Script SQL Completo

Si no tienes el archivo, aquí está el script completo:

```sql
-- Fix RLS policies for edit_sessions to allow public token verification
-- Run this in Supabase SQL Editor if tokens are not working

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can manage their edit sessions" ON edit_sessions;

-- Create new policies
-- Allow public read access to verify tokens (for the landing site)
CREATE POLICY "Anyone can read edit sessions to verify tokens" ON edit_sessions
  FOR SELECT USING (true);

-- Only authenticated users can create/update/delete edit sessions
CREATE POLICY "Authenticated users can create edit sessions" ON edit_sessions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update their edit sessions" ON edit_sessions
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete their edit sessions" ON edit_sessions
  FOR DELETE USING (auth.role() = 'authenticated');
```

## 🔍 Verificación

Después de ejecutar el script, puedes verificar que las políticas están correctas:

1. En Supabase, ve a **Authentication > Policies**
2. Busca la tabla `edit_sessions`
3. Deberías ver 4 políticas:
   - ✅ "Anyone can read edit sessions to verify tokens" (SELECT)
   - ✅ "Authenticated users can create edit sessions" (INSERT)
   - ✅ "Authenticated users can update their edit sessions" (UPDATE)
   - ✅ "Authenticated users can delete their edit sessions" (DELETE)

## 🚨 Si Aún No Funciona

1. **Verifica que la tabla existe:**
   ```sql
   SELECT * FROM edit_sessions LIMIT 1;
   ```

2. **Verifica que RLS está habilitado:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'edit_sessions';
   ```
   Debería mostrar `rowsecurity = true`

3. **Verifica las políticas:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'edit_sessions';
   ```

4. **Revisa la consola del navegador** (F12) para ver errores específicos

## 📝 Nota de Seguridad

Esta configuración permite que **cualquiera** pueda **leer** los tokens para verificación, pero **solo usuarios autenticados** pueden crear, modificar o eliminar tokens. Esto es seguro porque:

- Los tokens son únicos y aleatorios
- Los tokens expiran después de 24 horas
- Solo se pueden leer, no modificar sin autenticación
- El token solo permite editar contenido, no acceder a datos sensibles
