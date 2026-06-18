const PB_URL = 'https://pb.fullwork.pl';
const WEBSITE_ID = 'dktsle4yev6syo4';

const collections = {
  course_quizzes: {
    name: 'course_quizzes',
    type: 'base',
    schema: [
      { name: 'lecture_id', type: 'text', required: false },
      { name: 'question', type: 'text', required: false },
      { name: 'options', type: 'json', required: false },
      { name: 'correct_answer', type: 'number', required: false },
      { name: 'explanation', type: 'text', required: false },
      { name: 'order_index', type: 'number', required: false },
    ]
  },
  course_materials: {
    name: 'course_materials',
    type: 'base',
    schema: [
      { name: 'lecture_id', type: 'text', required: false },
      { name: 'title', type: 'text', required: false },
      { name: 'file', type: 'file', required: false },
      { name: 'file_name', type: 'text', required: false },
      { name: 'file_type', type: 'text', required: false },
      { name: 'file_size', type: 'number', required: false },
      { name: 'description', type: 'text', required: false },
    ]
  },
  lesson_progress: {
    name: 'lesson_progress',
    type: 'base',
    schema: [
      { name: 'enrollment_id', type: 'text', required: false },
      { name: 'lecture_id', type: 'text', required: false },
      { name: 'watch_percent', type: 'number', required: false },
      { name: 'last_position', type: 'number', required: false },
      { name: 'completed', type: 'bool', required: false },
      { name: 'completed_at', type: 'text', required: false },
    ]
  },
  course_settings: {
    name: 'course_settings',
    type: 'base',
    schema: [
      { name: 'stripe_enabled', type: 'bool', required: false },
      { name: 'stripe_api_key', type: 'text', required: false },
      { name: 'stripe_webhook_secret', type: 'text', required: false },
      { name: 'currency', type: 'text', required: false },
    ]
  },
};

async function apiRequest(endpoint, method, body, token = null) {
  const url = `${PB_URL}${endpoint}`;
  const options = {
    method: method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (token) options.headers['Authorization'] = token;
  if (body) options.body = JSON.stringify(body);
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(`Error ${response.status}: ${JSON.stringify(data)}`);
  return data;
}

async function auth() {
  const authData = await apiRequest('/api/collections/_superusers/auth-with-password', 'POST', {
    identity: 'kontakt@jestemprogramista.pl', password: 'Programista2026'
  });
  return authData.token;
}

async function collectionExists(token, name) {
  try {
    const res = await fetch(`${PB_URL}/api/collections/${name}`, { headers: { Authorization: token } });
    return res.status !== 404;
  } catch { return false; }
}

async function createCollection(token, schema) {
  const exists = await collectionExists(token, schema.name);
  if (exists) { console.log(`  Collection '${schema.name}' already exists, skipping.`); return; }
  const res = await apiRequest('/api/collections', 'POST', {
    name: schema.name, type: schema.type, schema: schema.schema,
    listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
  }, token);
  console.log(`  Created '${schema.name}'`);
}

async function main() {
  console.log('=== LMS FEATURE COLLECTIONS ===\n');
  const token = await auth();
  console.log('Authenticated!\n--- Creating collections ---');
  for (const key of Object.keys(collections)) {
    await createCollection(token, collections[key]);
  }
  console.log('\n=== DONE ===');
  console.log('\nCollections created:');
  console.log('  - course_quizzes (questions with options + correct answer');
  console.log('  - course_materials (PDF/document uploads per lecture');
  console.log('  - lesson_progress (watch progress per lesson');
  console.log('  - course_settings (Stripe config)');
}

main().catch(console.error);
