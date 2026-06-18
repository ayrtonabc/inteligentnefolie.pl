# Crear Usuario en el CMS

## Opción 1: Usar el Script Automático

Ejecuta el siguiente comando desde la carpeta `cms`:

```bash
npm run create-user
```

O con credenciales personalizadas:

```bash
npm run create-user tu-email@ejemplo.com tu-password Tu Nombre
```

**Credenciales por defecto:**
- Email: `admin@tailandia.com`
- Password: `admin123`
- Nombre: `Administrador`

## Opción 2: Crear Usuario Manualmente en Supabase

Si el script no funciona, puedes crear el usuario directamente desde el panel de Supabase:

1. Ve a: https://gzjnbqyjjoyhpzeykktk.supabase.co
2. Inicia sesión en tu cuenta de Supabase
3. Ve a **Authentication** > **Users**
4. Click en **Add User** o **Add user manually**
5. Completa el formulario:
   - **Email**: `admin@tailandia.com` (o el que prefieras)
   - **Password**: `admin123` (o la que prefieras)
   - **Auto Confirm User**: ✅ Activa esta opción para no requerir confirmación de email
6. Click en **Create User**

## Opción 3: Usar la Página de Registro del CMS

1. Inicia el servidor del CMS: `npm run dev`
2. Ve a: http://localhost:5174/register
3. Completa el formulario de registro
4. Si Supabase requiere confirmación de email, revisa tu bandeja de entrada

## Credenciales Recomendadas

Para facilitar el acceso, usa estas credenciales:

- **Email**: `admin@tailandia.com`
- **Password**: `admin123`

O cualquier otra que prefieras, solo recuerda guardarla en un lugar seguro.

## Notas Importantes

- Si Supabase tiene habilitada la confirmación de email, necesitarás confirmar tu cuenta antes de poder iniciar sesión
- Puedes desactivar la confirmación de email en: Supabase Dashboard > Authentication > Settings > Email Auth > "Enable email confirmations"
- Si olvidas tu contraseña, puedes resetearla desde el panel de Supabase o desde la página de login del CMS
