// scripts/seed-about-translations.js
//
// Seed/Update site_content records on PocketBase for the /o-nas page.
// Two operations:
//   1. UPDATE existing records that contain "HETOR" -> replace with "Altra"
//   2. CREATE new records for the 8 critical section_keys in de/en/cz (pl already exists)
//
// Usage:
//   node scripts/seed-about-translations.js            # dry-run, UPDATES only (HETOR -> Altra)
//   node scripts/seed-about-translations.js --apply    # apply UPDATES only
//   node scripts/seed-about-translations.js --with-creates
//                                                        # also CREATE new records from JSON
//
// By default the script ONLY patches existing records that contain "HETOR"
// (replacing it with "Altra"). The "create new translation records" step is
// opt-in via --with-creates and only fires for translation entries that have
// a real (non-placeholder) value in the JSON.
//
// Required env:
//   PB_URL                    e.g. https://pb.fullwork.pl
//   PB_ADMIN_EMAIL            PocketBase superuser email
//   PB_ADMIN_PASSWORD         PocketBase superuser password
//   NEXT_PUBLIC_TENANT_ID     e.g. dktsle4yev6syo4 (the website_id is pbc_2708086759)
//
// Reads: scripts/seed-about-translations.json  (the translation data, used only with --with-creates)

const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const WITH_CREATES = process.argv.includes('--with-creates');
const PB_URL = process.env.PB_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.fullwork.pl';
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || 'dktsle4yev6syo4';

// PocketBase auto-prefixes website IDs of related records with pbc_.
// The actual website record for TENANT_ID 'dktsle4yev6syo4' is 'pbc_2708086759'.
// For safety, fetch it dynamically from PocketBase instead of hardcoding.
const COLLECTION = 'site_content';

// Section keys we want to create translations for in de/en/cz.
// Polish already exists in PocketBase; we don't touch it.
const CRITICAL_SECTION_KEYS = [
  'about_section_about',
  'about_welcome_title',
  'about_welcome_text',
  'about_company_name',
  'about_company_address',
  'about_company_phone',
  'about_email_1',
  'about_email_2',
];

const TARGET_LANGS = ['de', 'en', 'cz'];

// Polish source texts (the "correct" version per Ayrton, 2026-06-25)
const POLISH_TEXTS = {
  about_section_about:    'O NASZEJ FIRMIE',
  about_welcome_title:    'Jesteśmy Altra',
  about_welcome_text:     'Jesteśmy wiodącym producentem i instalatorem konstrukcji szklanych w Polsce. Działamy pod firmą Altra Sp. z o.o. Specjalizujemy się w produkcji ścianek szklanych, balustrad, drzwi szklanych, schodów szklanych, podłóg szklanych oraz innowacyjnych rozwiązań z wykorzystaniem folii inteligentnych.',
  about_company_name:     'Altra sp. z o.o.',
  about_company_address:  'Polska',
  about_company_phone:    '+48 790 555 900',
  about_email_1:          'biuro@scianki-szklane.com',
  about_email_2:          'biuro@inteligentnefolie.pl',
};

// Content type for each key (text is short, textarea is long)
const CONTENT_TYPES = {
  about_welcome_text: 'textarea',
};

function log(level, ...args) {
  const tag = { info: '   ', ok: ' ✓ ', warn: ' ! ', err: ' ✗ ' }[level] || '   ';
  console.log(tag + args.join(' '));
}

function fail(msg) {
  console.error('\n ✗ ' + msg + '\n');
  process.exit(1);
}

async function pbAuth() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    fail('Missing PB_ADMIN_EMAIL / PB_ADMIN_PASSWORD env vars.');
  }
  const res = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) {
    const body = await res.text();
    fail(`Auth failed: ${res.status} - ${body}`);
  }
  const data = await res.json();
  return data.token;
}

async function pbRequest(path, opts, token) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (token) headers['Authorization'] = token;
  const res = await fetch(`${PB_URL}/api/${path}`, { ...opts, headers, cache: 'no-store' });
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`PB ${res.status}: ${body}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function resolveWebsiteId(token) {
  // The site_content collection has a `website_id` field pointing to the websites collection.
  // We need the actual PB ID (pbc_2708086759), not the tenant slug.
  const data = await pbRequest(
    `collections/websites/records?filter=${encodeURIComponent(`tenant_id="${TENANT_ID}"`)}&perPage=1`,
    {},
    token
  );
  if (!data.items || !data.items[0]) {
    fail(`No website record found for tenant_id="${TENANT_ID}".`);
  }
  return data.items[0].id;
}

async function fetchAllOnasRecords(token, websiteId) {
  // Pull everything for /o-nas in one shot (max 500 per page should be enough for ~80 keys x 4 langs).
  const data = await pbRequest(
    `collections/${COLLECTION}/records?filter=${encodeURIComponent(
      `website_id="${websiteId}" && page_path="/o-nas"`
    )}&perPage=500`,
    {},
    token
  );
  return data.items || [];
}

function buildCreateBody({ websiteId, sectionKey, lang, text }) {
  return {
    website_id: websiteId,
    page_path: '/o-nas',
    section_key: sectionKey,
    content_type: CONTENT_TYPES[sectionKey] || 'text',
    content_value: text,
    language_code: lang,
    is_active: true,
    order_index: 0,
  };
}

async function loadTranslations() {
  // translations.json structure: { "<section_key>": { "de": "...", "en": "...", "cz": "..." } }
  // Missing entries fall back to Polish (with a warning) so the script can still run.
  const p = path.join(__dirname, 'seed-about-translations.json');
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

async function main() {
  console.log(`\n mode: ${APPLY ? 'APPLY (writes to PB)' : 'DRY-RUN (no writes)'}\n`);

  const translations = await loadTranslations();
  const token = await pbAuth();
  const websiteId = await resolveWebsiteId(token);
  log('ok', `website_id resolved: ${websiteId}`);

  const existing = await fetchAllOnasRecords(token, websiteId);
  log('ok', `fetched ${existing.length} existing /o-nas records`);

  // ---- Step 1: UPDATE records that contain "HETOR" ----
  const updates = [];
  for (const rec of existing) {
    const val = rec.content_value;
    if (typeof val === 'string' && val.includes('HETOR')) {
      updates.push({ id: rec.id, key: rec.section_key, lang: rec.language_code, from: val, to: val.replace(/HETOR/g, 'Altra') });
    }
  }
  console.log(`\n UPDATES (HETOR -> Altra): ${updates.length}`);
  for (const u of updates) {
    log('info', `[${u.lang}] ${u.key}`);
    log('info', `   - ${u.from.substring(0, 80)}${u.from.length > 80 ? '...' : ''}`);
    log('info', `   + ${u.to.substring(0, 80)}${u.to.length > 80 ? '...' : ''}`);
  }

  // ---- Step 2: CREATE records for de/en/cz (pl already exists) ----
  const existingKeysByLang = new Map();
  for (const rec of existing) {
    const k = `${rec.language_code}::${rec.section_key}`;
    existingKeysByLang.set(k, rec);
  }

  const creates = [];
  const skipped = [];
  if (WITH_CREATES) {
    for (const sectionKey of CRITICAL_SECTION_KEYS) {
      for (const lang of TARGET_LANGS) {
        const compositeKey = `${lang}::${sectionKey}`;
        if (existingKeysByLang.has(compositeKey)) {
          skipped.push({ lang, sectionKey, reason: 'already exists' });
          continue;
        }
        const fromUser = translations[sectionKey]?.[lang];
        const text = (fromUser && !fromUser.startsWith('[TRADUCIR') && fromUser.trim())
          ? fromUser
          : POLISH_TEXTS[sectionKey];
        if (!fromUser || fromUser.startsWith('[TRADUCIR') || !fromUser.trim()) {
          log('warn', `No translation for [${lang}] ${sectionKey} — using Polish as placeholder.`);
        }
        creates.push({ sectionKey, lang, text, fromUser: !!fromUser });
      }
    }
  }

  console.log(`\n CREATES: ${creates.length}${WITH_CREATES ? '' : '   (skipped: --with-creates not set)'}   SKIPPED (already exist): ${skipped.length}`);
  for (const c of creates) {
    log('info', `[${c.lang}] ${c.sectionKey}  ${c.fromUser ? '(translated)' : '(polish placeholder)'}`);
  }

  // ---- Apply or summarize ----
  if (!APPLY) {
    console.log('\n DRY-RUN: nothing was written. Re-run with --apply to write to PocketBase.\n');
    return;
  }

  console.log('\n Applying...');

  let ok = 0, ko = 0;
  for (const u of updates) {
    try {
      await pbRequest(
        `collections/${COLLECTION}/records/${u.id}`,
        { method: 'PATCH', body: JSON.stringify({ content_value: u.to }) },
        token
      );
      ok++;
      log('ok', `updated ${u.lang}/${u.key}`);
    } catch (e) {
      ko++;
      log('err', `failed to update ${u.lang}/${u.key}: ${e.message}`);
    }
  }
  for (const c of creates) {
    try {
      const body = buildCreateBody({ websiteId, sectionKey: c.sectionKey, lang: c.lang, text: c.text });
      await pbRequest(`collections/${COLLECTION}/records`, { method: 'POST', body: JSON.stringify(body) }, token);
      ok++;
      log('ok', `created ${c.lang}/${c.sectionKey}`);
    } catch (e) {
      ko++;
      log('err', `failed to create ${c.lang}/${c.sectionKey}: ${e.message}`);
    }
  }

  console.log(`\n Done. ${ok} ok, ${ko} failed.\n`);
  if (ko > 0) process.exit(1);
}

main().catch((e) => fail(e.message));
