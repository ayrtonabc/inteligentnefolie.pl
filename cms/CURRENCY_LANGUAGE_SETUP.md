# Configuración de Moneda e Idioma

## Pasos para activar la funcionalidad de moneda e idioma:

### 1. Ejecutar el script SQL en Supabase

Ve a tu proyecto de Supabase:
1. Abre el **SQL Editor**
2. Copia y pega el contenido del archivo `add_currency_settings.sql`
3. Ejecuta el script (Run)

Esto agregará las columnas necesarias a la tabla `settings`:
- `currency` (moneda: USD, EUR, COP, MXN)
- `language` (idioma: es, en, ru, pl)
- `city` (ciudad)
- `postal_code` (código postal)
- `state` (estado/provincia)
- `country` (país)

### 2. Características implementadas

**Idiomas disponibles:**
- 🇪🇸 Español (es)
- 🇬🇧 English (en)
- 🇷🇺 Русский (ru)
- 🇵🇱 Polski (pl)

**Monedas disponibles:**
- $ Dólar (USD)
- € Euro (EUR)
- $ Peso Colombiano (COP)
- $ Peso Mexicano (MXN)

### 3. Uso

1. Ve a **Settings** en el menú lateral
2. En la sección **System Preferences**:
   - Selecciona tu moneda preferida
   - Selecciona tu idioma preferido
3. Haz clic en **Save Changes**

Los cambios se aplicarán inmediatamente en toda la aplicación:
- Los valores monetarios se mostrarán en la moneda seleccionada
- La interfaz se traducirá al idioma seleccionado

### 4. Funcionalidad

- **CurrencyContext**: Proporciona formateo de moneda en toda la aplicación
- **LanguageContext**: Gestiona las traducciones en 4 idiomas
- Integrado en: Dashboard, Projects, Payroll, Accounting, Invoices, etc.

### Nota importante:

Si al guardar en Settings obtienes un error 400, significa que las columnas no existen en tu base de datos. Asegúrate de ejecutar el script SQL `add_currency_settings.sql` en Supabase primero.
