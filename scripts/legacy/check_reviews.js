const PB_URL = 'https://pb.fullwork.pl';
const ADMIN_EMAIL = 'kontakt@jestemprogramista.pl';
const ADMIN_PASSWORD = 'Programista2026';

async function login() {
  const res = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  return res.json();
}

async function main() {
  const { token } = await login();

  console.log('📦 Reviews con todos los campos:\n');
  const reviews = await fetch(`${PB_URL}/api/collections/shop_reviews/records?perPage=2`, {
    headers: { Authorization: token }
  }).then(r => r.json());

  reviews.items?.forEach(r => {
    console.log('Review completo:');
    console.log(JSON.stringify(r, null, 2));
    console.log('---');
  });
}

main().catch(console.error);