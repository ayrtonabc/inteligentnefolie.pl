const PB_URL = 'https://pb.fullwork.pl';
const ADMIN_EMAIL = 'kontakt@jestemprogramista.pl';
const ADMIN_PASSWORD = 'Programista2026';

async function cleanup() {
  console.log('🔐 Autenticando...');
  const authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  const auth = await authRes.json();
  const token = auth.token;
  console.log('✅ Autenticado\n');
  
  console.log('🗑️ Eliminando página /o-nas con ID antiguo pbc_2708086759...');
  const delRes = await fetch(`${PB_URL}/api/collections/cms_pages/records/vm42isypfb9het3`, {
    method: 'DELETE',
    headers: { 'Authorization': token }
  });
  
  if (delRes.ok) {
    console.log('✅ Eliminada página con ID antiguo\n');
  } else {
    console.log('ℹ️ Error al eliminar:', delRes.status);
  }
  
  console.log('✅ LIMPIEZA COMPLETADA');
  console.log('Ahora recarga el CMS para ver /o-nas con el ID correcto');
}

cleanup().catch(console.error);