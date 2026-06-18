import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar variables de entorno
const envPath = join(__dirname, '..', '.env')
let envVars = {}

try {
  const envContent = readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim()
    }
  })
} catch (error) {
  console.error('Error leyendo .env:', error.message)
  process.exit(1)
}

const supabaseUrl = envVars.VITE_SUPABASE_URL
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Faltan variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

// Obtener argumentos de la línea de comandos
const args = process.argv.slice(2)
const email = args[0] || 'admin@tailandia.com'
const password = args[1] || 'admin123'
const name = args[2] || 'Administrador'

console.log('📝 Creando usuario en Supabase...')
console.log(`   Email: ${email}`)
console.log(`   Nombre: ${name}`)
console.log('')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createUser() {
  try {
    // Intentar crear el usuario
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        },
        emailRedirectTo: undefined // No requerir confirmación de email si está deshabilitada
      }
    })

    if (error) {
      // Si el usuario ya existe, intentar iniciar sesión para verificar
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        console.log('⚠️  El usuario ya existe. Intentando iniciar sesión...')
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (signInError) {
          console.error('❌ Error:', signInError.message)
          console.log('\n💡 El usuario existe pero la contraseña es incorrecta.')
          console.log('   Puedes resetear la contraseña desde el panel de Supabase o usar otra.')
          process.exit(1)
        } else {
          console.log('✅ El usuario existe y las credenciales son correctas!')
          console.log(`   Email: ${email}`)
          console.log(`   Password: ${password}`)
          process.exit(0)
        }
      } else {
        throw error
      }
    }

    if (data.user) {
      console.log('✅ Usuario creado exitosamente!')
      console.log(`   Email: ${email}`)
      console.log(`   Password: ${password}`)
      console.log(`   User ID: ${data.user.id}`)
      
      if (data.user.email_confirmed_at) {
        console.log('✅ Email confirmado automáticamente')
      } else {
        console.log('⚠️  Revisa tu email para confirmar la cuenta')
        console.log('   O desactiva la confirmación de email en Supabase Dashboard')
      }
    }
  } catch (err) {
    console.error('❌ Error al crear usuario:', err.message)
    console.log('\n💡 Alternativas:')
    console.log('   1. Ve a https://gzjnbqyjjoyhpzeykktk.supabase.co')
    console.log('   2. Authentication > Users > Add User')
    console.log('   3. Crea el usuario manualmente')
    console.log(`\n   Email: ${email}`)
    console.log(`   Password: ${password}`)
    process.exit(1)
  }
}

createUser()
