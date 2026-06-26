/**
 * Script para probar el endpoint de revalidación de caché
 * Uso:
 *   node scripts/test-revalidate.js /
 *   node scripts/test-revalidate.js / http://localhost:3000
 *   node scripts/test-revalidate.js / http://localhost:3000 --token=mi_token_secreto
 */

const pathToRevalidate = process.argv[2] || '/';
const siteUrl = process.argv[3] || process.env.SITE_URL || 'http://localhost:3000';

// Intentar múltiples variables de entorno comunes para el token
const tokenFromEnv = 
  process.env.REVALIDATE_TOKEN || 
  process.env.NEXT_PUBLIC_REVALIDATE_TOKEN || 
  process.env.VITE_REVALIDATE_TOKEN;

// Token desde línea de comandos (--token=xxx)
const tokenArg = process.argv.find(arg => arg.startsWith('--token='));
const revalidateToken = tokenArg 
  ? tokenArg.split('=')[1] 
  : tokenFromEnv;

async function testServerConnection() {
  console.log('🔍 Verificando conexión con el servidor...\n');
  console.log(`📍 URL: ${siteUrl}`);
  console.log(`📍 Path: ${pathToRevalidate}`);
  console.log('');

  if (!revalidateToken) {
    console.error('❌ Error: No se encontró el token de revalidación');
    console.log('');
    console.log('💡 Opciones para especificar el token:');
    console.log('   1. Variable de entorno:');
    console.log('      REVALIDATE_TOKEN=tu_token node scripts/test-revalidate.js /');
    console.log('      NEXT_PUBLIC_REVALIDATE_TOKEN=tu_token node scripts/test-revalidate.js /');
    console.log('');
    console.log('   2. Argumento de línea de comandos:');
    console.log('      node scripts/test-revalidate.js / --token=tu_token');
    console.log('');
    process.exitCode = 1;
    return;
  }

  console.log(`🔑 Token encontrado: "${revalidateToken}"`);
  console.log('');
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${siteUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${revalidateToken}`,
      },
      body: JSON.stringify({ path: pathToRevalidate }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    console.log(`📊 Status: ${response.status}`);
    console.log('📋 Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Revalidación exitosa');
    } else {
      console.log('\n❌ Revalidación fallida');
      if (response.status === 401) {
        console.log('');
        console.log('💡 El token no coincide. Asegúrate de que REVALIDATE_TOKEN en .env sea igual al que usas aquí.');
      }
      process.exitCode = 1;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Timeout: El servidor no respondió en 5 segundos');
    } else if (error.cause?.code === 'ECONNREFUSED') {
      console.error('❌ Conexión rechazada: ¿Está corriendo el servidor en', siteUrl + '?');
    } else {
      console.error('❌ Error de conexión:', error.message);
    }
    console.log('\n💡 Asegúrate de que el servidor esté corriendo:');
    console.log('   npm run dev');
    process.exitCode = 1;
  }
}

testServerConnection();
