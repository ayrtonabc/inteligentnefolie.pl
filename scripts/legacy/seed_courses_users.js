const PB_URL = 'https://pb.fullwork.pl';
const WEBSITE_ID = 'dktsle4yev6syo4';

const collections = {
  course_users: {
    name: 'course_users',
    type: 'base',
    schema: [
      { name: 'name', type: 'text', required: false },
      { name: 'email', type: 'email', required: false },
      { name: 'avatar', type: 'text', required: false },
      { name: 'role', type: 'select', required: false, options: { values: ['student', 'instructor', 'admin'] } },
      { name: 'is_blocked', type: 'bool', required: false },
      { name: 'enrolled_courses', type: 'number', required: false },
      { name: 'website_id', type: 'text', required: false },
    ]
  },
  course_categories: {
    name: 'course_categories',
    type: 'base',
    schema: [
      { name: 'name', type: 'text', required: false },
      { name: 'slug', type: 'text', required: false },
      { name: 'description', type: 'text', required: false },
      { name: 'icon', type: 'text', required: false },
      { name: 'color', type: 'text', required: false },
      { name: 'order_index', type: 'number', required: false },
      { name: 'courses_count', type: 'number', required: false },
    ]
  },
  course_reviews: {
    name: 'course_reviews',
    type: 'base',
    schema: [
      { name: 'course_id', type: 'text', required: false },
      { name: 'course_title', type: 'text', required: false },
      { name: 'user_name', type: 'text', required: false },
      { name: 'user_avatar', type: 'text', required: false },
      { name: 'rating', type: 'number', required: false },
      { name: 'review', type: 'text', required: false },
      { name: 'is_approved', type: 'bool', required: false },
      { name: 'website_id', type: 'text', required: false },
    ]
  },
  course_transactions: {
    name: 'course_transactions',
    type: 'base',
    schema: [
      { name: 'course_id', type: 'text', required: false },
      { name: 'course_title', type: 'text', required: false },
      { name: 'student_name', type: 'text', required: false },
      { name: 'student_email', type: 'email', required: false },
      { name: 'amount', type: 'number', required: false },
      { name: 'status', type: 'select', required: false, options: { values: ['completed', 'pending', 'refunded', 'failed'] } },
      { name: 'payment_method', type: 'text', required: false },
      { name: 'transaction_id', type: 'text', required: false },
      { name: 'website_id', type: 'text', required: false },
    ]
  }
};

async function auth() {
  const res = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'kontakt@jestemprogramista.pl', password: 'Programista2026' })
  });
  if (!res.ok) throw new Error('Auth failed: ' + await res.text());
  return (await res.json()).token;
}

async function collectionExists(token, name) {
  try {
    const res = await fetch(`${PB_URL}/api/collections/${name}`, {
      headers: { Authorization: token }
    });
    return res.status !== 404;
  } catch { return false; }
}

async function createCollection(token, schema) {
  const exists = await collectionExists(token, schema.name);
  if (exists) {
    console.log(`  Collection '${schema.name}' already exists, skipping.`);
    return;
  }
  const res = await fetch(`${PB_URL}/api/collections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: token },
    body: JSON.stringify({
      name: schema.name,
      type: schema.type,
      schema: schema.schema,
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
    })
  });
  if (!res.ok) {
    const err = await res.text();
    console.log(`  Failed to create '${schema.name}': ${err}`);
  } else {
    console.log(`  Created '${schema.name}'`);
  }
}

async function seedUsers(token) {
  const users = [
    { name: 'Anna Kowalski', email: 'anna.kowalski@example.com', role: 'student', is_blocked: false, enrolled_courses: 3, website_id: WEBSITE_ID },
    { name: 'Michał Nowak', email: 'michal.nowak@example.com', role: 'student', is_blocked: false, enrolled_courses: 5, website_id: WEBSITE_ID },
    { name: 'Katarzyna Wiśniewska', email: 'kasia.w@example.com', role: 'student', is_blocked: false, enrolled_courses: 2, website_id: WEBSITE_ID },
    { name: 'Piotr Dąbrowski', email: 'piotr.dabrowski@example.com', role: 'instructor', is_blocked: false, enrolled_courses: 0, website_id: WEBSITE_ID },
    { name: 'Marta Lewandowska', email: 'marta.lewandowska@example.com', role: 'student', is_blocked: false, enrolled_courses: 4, website_id: WEBSITE_ID },
    { name: 'Tomasz Zielinski', email: 'tomasz.zielinski@example.com', role: 'student', is_blocked: true, enrolled_courses: 1, website_id: WEBSITE_ID },
    { name: 'Krzysztof Woźniak', email: 'krzysztof.wozniak@example.com', role: 'admin', is_blocked: false, enrolled_courses: 0, website_id: WEBSITE_ID },
    { name: 'Natalia Kamińska', email: 'natalia.kaminska@example.com', role: 'student', is_blocked: false, enrolled_courses: 6, website_id: WEBSITE_ID },
    { name: 'Jakub Kowalczyk', email: 'jakub.kowalczyk@example.com', role: 'student', is_blocked: false, enrolled_courses: 3, website_id: WEBSITE_ID },
    { name: 'Alicja Pietrzak', email: 'alicja.pietrzak@example.com', role: 'instructor', is_blocked: false, enrolled_courses: 0, website_id: WEBSITE_ID },
  ];
  for (const user of users) {
    await fetch(`${PB_URL}/api/collections/course_users/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify(user)
    });
    console.log(`  Seeded user: ${user.name}`);
  }
}

async function seedCategories(token) {
  const categories = [
    { name: 'Frontend', slug: 'frontend', description: 'Technologie frontendowe: React, Vue, Angular, HTML, CSS', color: '#3B82F6', order_index: 1, courses_count: 3 },
    { name: 'Backend', slug: 'backend', description: 'Programowanie backendowe: Node.js, Python, Java, bazy danych', color: '#10B981', order_index: 2, courses_count: 2 },
    { name: 'DevOps', slug: 'devops', description: 'Docker, Kubernetes, CI/CD, chmury', color: '#F59E0B', order_index: 3, courses_count: 1 },
    { name: 'Data Science', slug: 'data', description: 'Machine Learning, AI, analityka danych', color: '#8B5CF6', order_index: 4, courses_count: 1 },
    { name: 'Design', slug: 'design', description: 'UX/UI Design, Figma, Adobe XD', color: '#EC4899', order_index: 5, courses_count: 1 },
    { name: 'Mobile', slug: 'mobile', description: 'React Native, Flutter, iOS, Android', color: '#06B6D4', order_index: 6, courses_count: 1 },
    { name: 'Marketing', slug: 'marketing', description: 'Marketing cyfrowy, SEO, social media', color: '#EF4444', order_index: 7, courses_count: 1 },
  ];
  for (const cat of categories) {
    await fetch(`${PB_URL}/api/collections/course_categories/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify(cat)
    });
    console.log(`  Seeded category: ${cat.name}`);
  }
}

async function seedReviews(token) {
  const reviews = [
    { course_id: '1', course_title: 'React 18 - Kompletny kurs od podstaw', user_name: 'Anna Kowalski', rating: 5, review: 'Najlepszy kurs React jaki przeszedłem! Michał tłumaczy wszystko krok po kroku, materiał jest bardzo dobrze przygotowany. Polecam każdemu kto chce nauczyć się React od zera.', is_approved: true, website_id: WEBSITE_ID },
    { course_id: '2', course_title: 'Node.js i Express - Backend od podstaw', user_name: 'Michał Nowak', rating: 4, review: 'Solidny kurs backendowy. Dowiedziałem się dużo o Express i REST API. Mogłoby być więcej przykładów z bazami danych.', is_approved: true, website_id: WEBSITE_ID },
    { course_id: '1', course_title: 'React 18 - Kompletny kurs od podstaw', user_name: 'Katarzyna Wiśniewska', rating: 5, review: 'Rewelacyjny kurs! Wszystko jasno wytłumaczone, projekty praktyczne są super.', is_approved: true, website_id: WEBSITE_ID },
    { course_id: '3', course_title: 'TypeScript od 0 do 100', user_name: 'Piotr Dąbrowski', rating: 4, review: 'Bardzo dobry kurs TypeScript. Pomógł mi przejść z JS na TS bez problemów.', is_approved: true, website_id: WEBSITE_ID },
    { course_id: '1', course_title: 'React 18 - Kompletny kurs od podstaw', user_name: 'Marta Lewandowska', rating: 3, review: 'Kurs jest OK, ale brakuje mi bardziej zaawansowanych tematów jak Redux czy Next.js App Router.', is_approved: false, website_id: WEBSITE_ID },
    { course_id: '4', course_title: 'Python dla początkujących', user_name: 'Tomasz Zielinski', rating: 5, review: 'Mega polecam dla startu w Python!', is_approved: true, website_id: WEBSITE_ID },
    { course_id: '5', course_title: 'Docker i Kubernetes - Kompletny kurs', user_name: 'Natalia Kamińska', rating: 4, review: 'Docker wyjaśniony perfekcyjnie. K8s troszeczkę ciężej ale da się zrozumieć.', is_approved: true, website_id: WEBSITE_ID },
    { course_id: '6', course_title: 'UX/UI Design w Figma', user_name: 'Jakub Kowalczyk', rating: 5, review: 'Design kurs jest niesamowity. Figma od podstaw do zaawansowanych projektów. Rewelacja!', is_approved: true, website_id: WEBSITE_ID },
  ];
  for (const r of reviews) {
    await fetch(`${PB_URL}/api/collections/course_reviews/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify(r)
    });
    console.log(`  Seeded review: ${r.user_name} (${r.rating}★)`);
  }
}

async function seedTransactions(token) {
  const transactions = [
    { course_id: '1', course_title: 'React 18 - Kompletny kurs od podstaw', student_name: 'Anna Kowalski', student_email: 'anna.kowalski@example.com', amount: 9999, status: 'completed', payment_method: 'Stripe', transaction_id: 'txn_react_001', website_id: WEBSITE_ID },
    { course_id: '1', course_title: 'React 18 - Kompletny kurs od podstaw', student_name: 'Michał Nowak', student_email: 'michal.nowak@example.com', amount: 9999, status: 'completed', payment_method: 'Stripe', transaction_id: 'txn_react_002', website_id: WEBSITE_ID },
    { course_id: '2', course_title: 'Node.js i Express - Backend od podstaw', student_name: 'Katarzyna Wiśniewska', student_email: 'kasia.w@example.com', amount: 14999, status: 'completed', payment_method: 'Stripe', transaction_id: 'txn_node_001', website_id: WEBSITE_ID },
    { course_id: '3', course_title: 'TypeScript od 0 do 100', student_name: 'Marta Lewandowska', student_email: 'marta.lewandowska@example.com', amount: 11999, status: 'completed', payment_method: 'BLIK', transaction_id: 'txn_ts_001', website_id: WEBSITE_ID },
    { course_id: '4', course_title: 'Python dla początkujących', student_name: 'Natalia Kamińska', student_email: 'natalia.kaminska@example.com', amount: 7999, status: 'completed', payment_method: 'Stripe', transaction_id: 'txn_py_001', website_id: WEBSITE_ID },
    { course_id: '5', course_title: 'Docker i Kubernetes - Kompletny kurs', student_name: 'Jakub Kowalczyk', student_email: 'jakub.kowalczyk@example.com', amount: 19999, status: 'pending', payment_method: 'Stripe', transaction_id: 'txn_docker_001', website_id: WEBSITE_ID },
    { course_id: '6', course_title: 'UX/UI Design w Figma', student_name: 'Anna Kowalski', student_email: 'anna.kowalski@example.com', amount: 12999, status: 'refunded', payment_method: 'Stripe', transaction_id: 'txn_figma_001', website_id: WEBSITE_ID },
    { course_id: '1', course_title: 'React 18 - Kompletny kurs od podstaw', student_name: 'Natalia Kamińska', student_email: 'natalia.kaminska@example.com', amount: 9999, status: 'completed', payment_method: 'BLIK', transaction_id: 'txn_react_003', website_id: WEBSITE_ID },
    { course_id: '2', course_title: 'Node.js i Express - Backend od podstaw', student_name: 'Tomasz Zielinski', student_email: 'tomasz.zielinski@example.com', amount: 14999, status: 'failed', payment_method: 'Stripe', transaction_id: 'txn_node_002', website_id: WEBSITE_ID },
    { course_id: '7', course_title: 'Flutter - Aplikacje mobilne', student_name: 'Michał Nowak', student_email: 'michal.nowak@example.com', amount: 17999, status: 'completed', payment_method: 'Stripe', transaction_id: 'txn_flutter_001', website_id: WEBSITE_ID },
    { course_id: '8', course_title: 'Marketing cyfrowy - Kompletny kurs', student_name: 'Katarzyna Wiśniewska', student_email: 'kasia.w@example.com', amount: 8999, status: 'completed', payment_method: 'BLIK', transaction_id: 'txn_marketing_001', website_id: WEBSITE_ID },
    { course_id: '1', course_title: 'React 18 - Kompletny kurs od podstaw', student_name: 'Marta Lewandowska', student_email: 'marta.lewandowska@example.com', amount: 9999, status: 'completed', payment_method: 'Stripe', transaction_id: 'txn_react_004', website_id: WEBSITE_ID },
    { course_id: '3', course_title: 'TypeScript od 0 do 100', student_name: 'Anna Kowalski', student_email: 'anna.kowalski@example.com', amount: 11999, status: 'completed', payment_method: 'Stripe', transaction_id: 'txn_ts_002', website_id: WEBSITE_ID },
    { course_id: '5', course_title: 'Docker i Kubernetes - Kompletny kurs', student_name: 'Katarzyna Wiśniewska', student_email: 'kasia.w@example.com', amount: 19999, status: 'completed', payment_method: 'Stripe', transaction_id: 'txn_docker_002', website_id: WEBSITE_ID },
  ];
  for (const t of transactions) {
    await fetch(`${PB_URL}/api/collections/course_transactions/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify(t)
    });
    console.log(`  Seeded transaction: ${t.student_name} - ${t.course_title} - ${t.status}`);
  }
}

async function main() {
  console.log('=== SEEDING LMS COLLECTIONS ===\n');
  console.log('Authenticating with PocketBase...');
  const token = await auth();
  console.log('Authenticated!\n');

  console.log('--- Creating collections ---');
  for (const key of Object.keys(collections)) {
    await createCollection(token, collections[key]);
  }

  console.log('\n--- Seeding data ---');
  console.log('Users:');
  await seedUsers(token);
  console.log('Categories:');
  await seedCategories(token);
  console.log('Reviews:');
  await seedReviews(token);
  console.log('Transactions:');
  await seedTransactions(token);

  console.log('\n=== DONE ===');
}

main().catch(console.error);
