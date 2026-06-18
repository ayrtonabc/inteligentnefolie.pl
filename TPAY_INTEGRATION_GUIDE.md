# TPAY INTEGRATION - Setup Instructions

## 📁 FILE STRUCTURE

```
project/
├── pocketbase/
│   └── pb_hooks/
│       ├── tpay-create.js        # Endpoint para crear transacciones
│       └── tpay-webhook.js        # Webhook para recibir notificaciones
├── cms/src/pages/shop/
│   └── TransactionsSection.tsx     # Panel admin de transacciones
├── next15-ecommerce-main/src/modules/checkout/
│   └── components/
│       └── tpay-checkout.tsx     # Componente checkout en frontend
└── pocketbase_setup/
    └── tpay_transactions_collection.txt  # Config de colección
```

## 🔧 STEP 1: Configure PocketBase Environment Variables

En tu servidor PocketBase (archivo `.env` o variables de sistema):

```env
TPAY_CLIENT_ID=tu_client_id_de_tpay
TPAY_SECRET_KEY=tu_secret_key_de_tpay
TPAY_API_URL=https://secure.tpay.com
```

### Para pruebas (sandbox):
```env
TPAY_CLIENT_ID=tu_client_id_sandbox
TPAY_SECRET_KEY=tu_secret_key_sandbox
TPAY_API_URL=https://secure.sandbox.tpay.com
```

## 📦 STEP 2: Create Collection in PocketBase Admin

1. Ve a PocketBase Admin → Collections
2. Crea una nueva colección llamada `tpay_transactions`
3. Agrega los campos según `pocketbase_setup/tpay_transactions_collection.txt`

**Campos requeridos:**
- `order_id` (text, required)
- `amount` (number, required)
- `transaction_id` (text, required)
- `status` (select: pending/completed/failed/refunded)
- `customer_email` (text)
- `customer_name` (text)
- `description` (text)
- `currency` (text, default: PLN)
- `payment_url` (text)
- `paid_at` (date)
- `error_code` (text)
- `error_message` (text)
- `paid_amount` (number)
- `website_id` (text)

## 📁 STEP 3: Install Hook Files

1. Copia `tpay-create.js` a `pb_hooks/tpay-create.js`
2. Copia `tpay-webhook.js` a `pb_hooks/tpay-webhook.js`
3. Reinicia PocketBase

Los endpoints estarán disponibles en:
- `POST /api/tpay/create-transaction`
- `POST /api/tpay/webhook`

## 🔗 STEP 4: Configure Tpay Webhook URL

1. Ve a tu panel de Tpay: https://merchant.tpay.com/
2. Ve a Configuración → Webhooks
3. Agrega la URL de tu webhook:
   ```
   https://tu-dominio.pl/api/tpay/webhook
   ```
4. Asegúrate de que esté habilitado para notificaciones de estado

## 🌐 STEP 5: Configure Return URLs

En el código de checkout, las URLs de retorno deben ser accesibles:

- **Success URL:** `https://tu-dominio.pl/checkout/success`
- **Error URL:** `https://tu-dominio.pl/checkout/error`

## 🧪 STEP 6: Testing with ngrok (Local Development)

1. Instala ngrok: `npm install -g ngrok`
2. Ejecuta ngrok: `ngrok http 8090` (asumiendo que PocketBase corre en puerto 8090)
3. Copia la URL de ngrok (ej: `https://abc123.ngrok.io`)
4. En Tpay Dashboard, configura el webhook URL como:
   ```
   https://abc123.ngrok.io/api/tpay/webhook
   ```

## 📋 API ENDPOINTS

### Create Transaction
```bash
POST /api/tpay/create-transaction
Content-Type: application/json

{
  "order_id": "ORD-2026-001",
  "amount": 9999,              # en grosz (99.99 PLN)
  "description": "Zamówienie #ORD-2026-001",
  "customer_email": "jan@example.pl",
  "customer_name": "Jan Kowalski",
  "return_url": "https://tu-dominio.pl/checkout/success",
  "return_error_url": "https://tu-dominio.pl/checkout/error"
}

# Response:
{
  "success": true,
  "transaction_id": "TRX123456",
  "payment_url": "https://secure.tpay.com/?c=abc123",
  "local_id": "local_record_id"
}
```

### Webhook (Tpay → Your Server)
```bash
POST /api/tpay/webhook
Content-Type: application/json

{
  "tr_id": "TRX123456",
  "tr_amount": "9999",
  "tr_currency": "PLN",
  "tr_status": "TRUE",
  "tr_crc": "ORD-2026-001",
  "tr_description": "Zamówienie #ORD-2026-001",
  "md5sum": "f1c9d7..."
}
```

## ⚠️ SECURITY NOTES

1. **Never expose secrets in frontend** - TPAY_CLIENT_ID and TPAY_SECRET_KEY solo en el servidor
2. **Verify all webhook signatures** - Siempre validar MD5/JWS antes de procesar
3. **Idempotency** - El webhook debe manejar pagos duplicados sin efectos secundarios
4. **Respond TRUE to Tpay** - Siempre responder "TRUE" para detener reintentos

## 🔍 DEBUGGING

### Ver logs de PocketBase:
```bash
# En terminal donde corre PocketBase
./pocketbase serve --dev
```

### Verificar que el webhook funciona:
```bash
# Simular notificación de Tpay
curl -X POST https://tu-dominio.pl/api/tpay/webhook \
  -H "Content-Type: application/json" \
  -d '{"tr_id":"TEST123","tr_status":"TRUE","tr_amount":"1000"}'
```

## 📞 TPAY SUPPORT

- Documentación: https://docs.tpay.com/
- Panel merchant: https://merchant.tpay.com/
- Sandbox: https://secure.sandbox.tpay.com/