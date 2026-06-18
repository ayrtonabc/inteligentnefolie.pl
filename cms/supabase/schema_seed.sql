-- CMS schema + seed for new project
-- Safe to run multiple times thanks to IF NOT EXISTS / ON CONFLICT
begin;

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'editor');
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'editor',
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (new.id, 'editor', coalesce(new.raw_user_meta_data->>'name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin','editor')
  );
$$;

-- CMS Pages
create table if not exists public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  path text not null,
  language_code text not null default 'pl',
  is_published boolean not null default true,
  content jsonb not null default '[]'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'cms_pages_path_lang_unique') then
    alter table public.cms_pages
      add constraint cms_pages_path_lang_unique unique (path, language_code);
  end if;
end $$;

create index if not exists cms_pages_updated_at_idx on public.cms_pages (updated_at desc);

drop trigger if exists trg_cms_pages_updated_at on public.cms_pages;
create trigger trg_cms_pages_updated_at
before update on public.cms_pages
for each row execute function public.set_updated_at();

-- Blog
create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'blog_categories_slug_unique') then
    alter table public.blog_categories
      add constraint blog_categories_slug_unique unique (slug);
  end if;
end $$;

drop trigger if exists trg_blog_categories_updated_at on public.blog_categories;
create trigger trg_blog_categories_updated_at
before update on public.blog_categories
for each row execute function public.set_updated_at();

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  content text,
  excerpt text,
  meta_title text,
  meta_description text,
  cover_image_url text,
  category_id uuid references public.blog_categories(id) on delete set null,
  author_id uuid references auth.users(id) on delete set null,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'blog_posts_slug_unique') then
    alter table public.blog_posts
      add constraint blog_posts_slug_unique unique (slug);
  end if;
end $$;

create index if not exists blog_posts_created_at_idx on public.blog_posts (created_at desc);
create index if not exists blog_posts_category_id_idx on public.blog_posts (category_id);

drop trigger if exists trg_blog_posts_updated_at on public.blog_posts;
create trigger trg_blog_posts_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

-- Leads
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  message text,
  status text not null default 'new',
  priority text not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (email);

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

-- Website visits
create table if not exists public.website_visits (
  id uuid primary key default gen_random_uuid(),
  visited_at timestamptz not null default now(),
  page_path text not null default '/',
  referrer text,
  user_agent text,
  device_type text,
  browser text,
  is_unique boolean not null default false,
  session_id text
);

create index if not exists website_visits_visited_at_idx on public.website_visits (visited_at desc);
create index if not exists website_visits_page_path_idx on public.website_visits (page_path);

-- Site custom content
create table if not exists public.site_custom_content (
  id uuid primary key default gen_random_uuid(),
  content_key text not null,
  content_value text not null default '',
  is_active boolean not null default true,
  page_path text not null default '/',
  language_code text not null default 'pl',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'site_custom_content_unique') then
    alter table public.site_custom_content
      add constraint site_custom_content_unique unique (page_path, language_code, content_key);
  end if;
end $$;

create index if not exists site_custom_content_lookup_idx
on public.site_custom_content (language_code, page_path, content_key);

drop trigger if exists trg_site_custom_content_updated_at on public.site_custom_content;
create trigger trg_site_custom_content_updated_at
before update on public.site_custom_content
for each row execute function public.set_updated_at();

create table if not exists public.websites (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Default',
  created_at timestamptz not null default now()
);

insert into public.websites (name)
select 'Default'
where not exists (select 1 from public.websites);

alter table public.blog_categories add column if not exists website_id uuid;
alter table public.blog_posts add column if not exists website_id uuid;

update public.blog_categories
set website_id = (select id from public.websites order by created_at limit 1)
where website_id is null;

update public.blog_posts
set website_id = (select id from public.websites order by created_at limit 1)
where website_id is null;

alter table public.blog_categories alter column website_id set not null;
alter table public.blog_posts alter column website_id set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'blog_categories_website_id_fkey') then
    alter table public.blog_categories
      add constraint blog_categories_website_id_fkey
      foreign key (website_id) references public.websites(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'blog_posts_website_id_fkey') then
    alter table public.blog_posts
      add constraint blog_posts_website_id_fkey
      foreign key (website_id) references public.websites(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if exists (select 1 from pg_constraint where conname = 'blog_categories_slug_unique') then
    alter table public.blog_categories drop constraint blog_categories_slug_unique;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'blog_categories_slug_unique') then
    alter table public.blog_categories
      add constraint blog_categories_slug_unique unique (website_id, slug);
  end if;
end $$;

do $$
begin
  if exists (select 1 from pg_constraint where conname = 'blog_posts_slug_unique') then
    alter table public.blog_posts drop constraint blog_posts_slug_unique;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'blog_posts_slug_unique') then
    alter table public.blog_posts
      add constraint blog_posts_slug_unique unique (website_id, slug);
  end if;
end $$;

create table if not exists public.website_addons (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  addon_key text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists website_addons_site_key_unique on public.website_addons (website_id, addon_key);
create index if not exists website_addons_site_active_idx on public.website_addons (website_id, is_active);

create table if not exists public.seo_audits (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  score int not null,
  issues jsonb not null default '{"errors":[],"warnings":[],"good":[]}'::jsonb,
  summary text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists seo_audits_created_at_idx on public.seo_audits (website_id, created_at desc);

create table if not exists public.seo_page_analysis (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  slug text not null,
  language_code text not null default 'pl',
  score int not null,
  issues jsonb not null default '{"errors":[],"warnings":[],"good":[]}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists seo_page_analysis_latest_idx on public.seo_page_analysis (website_id, created_at desc);
create index if not exists seo_page_analysis_slug_idx on public.seo_page_analysis (website_id, slug, language_code);

create table if not exists public.seo_ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  page_slug text not null,
  language_code text not null default 'pl',
  suggestions jsonb not null default '[]'::jsonb,
  applied boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists seo_ai_suggestions_idx on public.seo_ai_suggestions (website_id, page_slug, language_code, created_at desc);

-- New SEO extension tables
create table if not exists public.seo_meta (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  title text,
  description text,
  og_title text,
  og_description text,
  og_image text,
  updated_at timestamptz not null default now()
);

create unique index if not exists seo_meta_site_unique on public.seo_meta (website_id);

create table if not exists public.seo_sitemap (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  last_generated timestamptz,
  status text,
  updated_at timestamptz not null default now()
);

create unique index if not exists seo_sitemap_site_unique on public.seo_sitemap (website_id);

create table if not exists public.seo_analytics (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  page_slug text not null,
  visits int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.serpbear_keywords (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  keyword text not null,
  domain text not null,
  device text default 'desktop',
  location text default 'Poland',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists serpbear_keywords_site_idx on public.serpbear_keywords (website_id);
create index if not exists serpbear_keywords_keyword_idx on public.serpbear_keywords (keyword);

drop trigger if exists trg_serpbear_keywords_updated_at on public.serpbear_keywords;
create trigger trg_serpbear_keywords_updated_at
before update on public.serpbear_keywords
for each row execute function public.set_updated_at();

create table if not exists public.serpbear_positions (
  id uuid primary key default gen_random_uuid(),
  keyword_id uuid not null references public.serpbear_keywords(id) on delete cascade,
  position int not null,
  impressions int default 0,
  clicks int default 0,
  ctr numeric(5,4) default 0,
  url text,
  device text default 'desktop',
  country text default 'pol',
  date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists serpbear_positions_keyword_idx on public.serpbear_positions (keyword_id);
create index if not exists serpbear_positions_date_idx on public.serpbear_positions (date desc);
create index if not exists serpbear_positions_position_idx on public.serpbear_positions (position);

create table if not exists public.serpbear_google_config (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  access_token text,
  refresh_token text,
  token_type text default 'Bearer',
  expires_at timestamptz,
  property_url text,
  is_active boolean not null default false,
  last_sync timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists serpbear_google_config_site_unique on public.serpbear_google_config (website_id);

drop trigger if exists trg_serpbear_google_config_updated_at on public.serpbear_google_config;
create trigger trg_serpbear_google_config_updated_at
before update on public.serpbear_google_config
for each row execute function public.set_updated_at();

create table if not exists public.serpbear_queries (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  query text not null,
  page_url text,
  country text default 'pol',
  device text default 'desktop',
  impressions int default 0,
  clicks int default 0,
  ctr numeric(5,4) default 0,
  position numeric(10,2) default 0,
  date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists serpbear_queries_site_idx on public.serpbear_queries (website_id);
create index if not exists serpbear_queries_query_idx on public.serpbear_queries (query);
create index if not exists serpbear_queries_date_idx on public.serpbear_queries (date desc);

create table if not exists public.serpbear_pages (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  url text not null,
  page_title text,
  impressions int default 0,
  clicks int default 0,
  ctr numeric(5,4) default 0,
  position numeric(10,2) default 0,
  date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists serpbear_pages_site_url_date_unique on public.serpbear_pages (website_id, url, date);
create index if not exists serpbear_pages_site_idx on public.serpbear_pages (website_id);
create index if not exists serpbear_pages_position_idx on public.serpbear_pages (position);

create table if not exists public.popups (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  name text not null,
  type text not null check (type in ('image','html')),
  content text not null,
  title text,
  button_text text,
  button_link text,
  display_pages text[],
  show_on_all boolean not null default true,
  trigger_type text not null default 'load' check (trigger_type in ('load','delay')),
  delay_seconds int,
  frequency text not null default 'once' check (frequency in ('once','always')),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists popups_site_active_idx on public.popups (website_id, is_active);

drop trigger if exists trg_popups_updated_at on public.popups;
create trigger trg_popups_updated_at
before update on public.popups
for each row execute function public.set_updated_at();

-- RLS enable
alter table public.profiles enable row level security;
alter table public.cms_pages enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_posts enable row level security;
alter table public.leads enable row level security;
alter table public.website_visits enable row level security;
alter table public.site_custom_content enable row level security;
alter table public.websites enable row level security;
alter table public.website_addons enable row level security;
alter table public.seo_audits enable row level security;
alter table public.seo_page_analysis enable row level security;
alter table public.seo_ai_suggestions enable row level security;
alter table public.seo_meta enable row level security;
alter table public.seo_sitemap enable row level security;
alter table public.seo_analytics enable row level security;
alter table public.serpbear_keywords enable row level security;
alter table public.serpbear_positions enable row level security;
alter table public.popups enable row level security;

-- PROFILES policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

-- PAGES policies
drop policy if exists "cms_pages_public_select_published" on public.cms_pages;
create policy "cms_pages_public_select_published"
on public.cms_pages
for select
to anon
using (is_published = true);

drop policy if exists "cms_pages_auth_select" on public.cms_pages;
create policy "cms_pages_auth_select"
on public.cms_pages
for select
to authenticated
using (public.is_editor());

drop policy if exists "cms_pages_editor_write" on public.cms_pages;
create policy "cms_pages_editor_write"
on public.cms_pages
for insert
to authenticated
with check (public.is_editor());

drop policy if exists "cms_pages_editor_update" on public.cms_pages;
create policy "cms_pages_editor_update"
on public.cms_pages
for update
to authenticated
using (public.is_editor())
with check (public.is_editor());

drop policy if exists "cms_pages_admin_delete" on public.cms_pages;
create policy "cms_pages_admin_delete"
on public.cms_pages
for delete
to authenticated
using (public.is_admin());

-- seo_meta policies
drop policy if exists "seo_meta_auth_select" on public.seo_meta;
create policy "seo_meta_auth_select"
on public.seo_meta
for select
to authenticated
using (public.is_editor());

drop policy if exists "seo_meta_editor_upsert" on public.seo_meta;
create policy "seo_meta_editor_upsert"
on public.seo_meta
for all
to authenticated
using (public.is_editor())
with check (public.is_editor());

-- seo_sitemap policies
drop policy if exists "seo_sitemap_auth_select" on public.seo_sitemap;
create policy "seo_sitemap_auth_select"
on public.seo_sitemap
for select
to authenticated
using (public.is_editor());

drop policy if exists "seo_sitemap_editor_upsert" on public.seo_sitemap;
create policy "seo_sitemap_editor_upsert"
on public.seo_sitemap
for all
to authenticated
using (public.is_editor())
with check (public.is_editor());

-- seo_analytics policies
drop policy if exists "seo_analytics_auth_select" on public.seo_analytics;
create policy "seo_analytics_auth_select"
on public.seo_analytics
for select
to authenticated
using (public.is_editor());

drop policy if exists "seo_analytics_editor_upsert" on public.seo_analytics;
create policy "seo_analytics_editor_upsert"
on public.seo_analytics
for all
to authenticated
using (public.is_editor())
with check (public.is_editor());

-- serpbear_keywords policies
drop policy if exists "serpbear_keywords_auth_select" on public.serpbear_keywords;
create policy "serpbear_keywords_auth_select"
on public.serpbear_keywords
for select
to authenticated
using (public.is_editor());

drop policy if exists "serpbear_keywords_editor_upsert" on public.serpbear_keywords;
create policy "serpbear_keywords_editor_upsert"
on public.serpbear_keywords
for all
to authenticated
using (public.is_editor())
with check (public.is_editor());

-- serpbear_positions policies
drop policy if exists "serpbear_positions_auth_select" on public.serpbear_positions;
create policy "serpbear_positions_auth_select"
on public.serpbear_positions
for select
to authenticated
using (public.is_editor());

drop policy if exists "serpbear_positions_editor_upsert" on public.serpbear_positions;
create policy "serpbear_positions_editor_upsert"
on public.serpbear_positions
for all
to authenticated
using (public.is_editor())
with check (public.is_editor());

drop policy if exists "popups_public_select_active" on public.popups;
create policy "popups_public_select_active"
on public.popups
for select
to anon
using (is_active = true);

drop policy if exists "popups_auth_select" on public.popups;
create policy "popups_auth_select"
on public.popups
for select
to authenticated
using (public.is_editor());

drop policy if exists "popups_editor_write" on public.popups;
create policy "popups_editor_write"
on public.popups
for insert
to authenticated
with check (public.is_editor());

drop policy if exists "popups_editor_update" on public.popups;
create policy "popups_editor_update"
on public.popups
for update
to authenticated
using (public.is_editor())
with check (public.is_editor());

drop policy if exists "popups_admin_delete" on public.popups;
create policy "popups_admin_delete"
on public.popups
for delete
to authenticated
using (public.is_admin());

drop policy if exists "website_addons_auth_select" on public.website_addons;
create policy "website_addons_auth_select"
on public.website_addons
for select
to authenticated
using (public.is_editor());

drop policy if exists "website_addons_editor_insert" on public.website_addons;
create policy "website_addons_editor_insert"
on public.website_addons
for insert
to authenticated
with check (public.is_editor());

drop policy if exists "website_addons_editor_update" on public.website_addons;
create policy "website_addons_editor_update"
on public.website_addons
for update
to authenticated
using (public.is_editor())
with check (public.is_editor());

drop policy if exists "website_addons_admin_delete" on public.website_addons;
create policy "website_addons_admin_delete"
on public.website_addons
for delete
to authenticated
using (public.is_admin());

drop policy if exists "websites_auth_select" on public.websites;
create policy "websites_auth_select"
on public.websites
for select
to authenticated
using (public.is_editor());

drop policy if exists "websites_admin_write" on public.websites;
create policy "websites_admin_write"
on public.websites
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "seo_audits_auth_select" on public.seo_audits;
create policy "seo_audits_auth_select"
on public.seo_audits
for select
to authenticated
using (public.is_editor());

drop policy if exists "seo_audits_editor_insert" on public.seo_audits;
create policy "seo_audits_editor_insert"
on public.seo_audits
for insert
to authenticated
with check (public.is_editor());

drop policy if exists "seo_audits_admin_delete" on public.seo_audits;
create policy "seo_audits_admin_delete"
on public.seo_audits
for delete
to authenticated
using (public.is_admin());

drop policy if exists "seo_page_analysis_auth_select" on public.seo_page_analysis;
create policy "seo_page_analysis_auth_select"
on public.seo_page_analysis
for select
to authenticated
using (public.is_editor());

drop policy if exists "seo_page_analysis_editor_insert" on public.seo_page_analysis;
create policy "seo_page_analysis_editor_insert"
on public.seo_page_analysis
for insert
to authenticated
with check (public.is_editor());

drop policy if exists "seo_page_analysis_admin_delete" on public.seo_page_analysis;
create policy "seo_page_analysis_admin_delete"
on public.seo_page_analysis
for delete
to authenticated
using (public.is_admin());

drop policy if exists "seo_ai_suggestions_auth_select" on public.seo_ai_suggestions;
create policy "seo_ai_suggestions_auth_select"
on public.seo_ai_suggestions
for select
to authenticated
using (public.is_editor());

drop policy if exists "seo_ai_suggestions_editor_insert" on public.seo_ai_suggestions;
create policy "seo_ai_suggestions_editor_insert"
on public.seo_ai_suggestions
for insert
to authenticated
with check (public.is_editor());

drop policy if exists "seo_ai_suggestions_editor_update" on public.seo_ai_suggestions;
create policy "seo_ai_suggestions_editor_update"
on public.seo_ai_suggestions
for update
to authenticated
using (public.is_editor())
with check (public.is_editor());

drop policy if exists "seo_ai_suggestions_admin_delete" on public.seo_ai_suggestions;
create policy "seo_ai_suggestions_admin_delete"
on public.seo_ai_suggestions
for delete
to authenticated
using (public.is_admin());

-- BLOG policies
drop policy if exists "blog_categories_public_select" on public.blog_categories;
create policy "blog_categories_public_select"
on public.blog_categories
for select
to anon
using (true);

drop policy if exists "blog_categories_auth_select" on public.blog_categories;
create policy "blog_categories_auth_select"
on public.blog_categories
for select
to authenticated
using (public.is_editor());

drop policy if exists "blog_categories_editor_insert" on public.blog_categories;
create policy "blog_categories_editor_insert"
on public.blog_categories
for insert
to authenticated
with check (public.is_editor());

drop policy if exists "blog_categories_editor_update" on public.blog_categories;
create policy "blog_categories_editor_update"
on public.blog_categories
for update
to authenticated
using (public.is_editor())
with check (public.is_editor());

drop policy if exists "blog_categories_admin_delete" on public.blog_categories;
create policy "blog_categories_admin_delete"
on public.blog_categories
for delete
to authenticated
using (public.is_admin());

drop policy if exists "blog_posts_public_select_published" on public.blog_posts;
create policy "blog_posts_public_select_published"
on public.blog_posts
for select
to anon
using (published = true);

drop policy if exists "blog_posts_auth_select" on public.blog_posts;
create policy "blog_posts_auth_select"
on public.blog_posts
for select
to authenticated
using (public.is_editor());

drop policy if exists "blog_posts_editor_insert" on public.blog_posts;
create policy "blog_posts_editor_insert"
on public.blog_posts
for insert
to authenticated
with check (public.is_editor());

drop policy if exists "blog_posts_editor_update" on public.blog_posts;
create policy "blog_posts_editor_update"
on public.blog_posts
for update
to authenticated
using (public.is_editor())
with check (public.is_editor());

drop policy if exists "blog_posts_admin_delete" on public.blog_posts;
create policy "blog_posts_admin_delete"
on public.blog_posts
for delete
to authenticated
using (public.is_admin());

-- LEADS policies
drop policy if exists "leads_public_insert" on public.leads;
create policy "leads_public_insert"
on public.leads
for insert
to anon
with check (true);

drop policy if exists "leads_auth_select" on public.leads;
create policy "leads_auth_select"
on public.leads
for select
to authenticated
using (public.is_editor());

drop policy if exists "leads_editor_update" on public.leads;
create policy "leads_editor_update"
on public.leads
for update
to authenticated
using (public.is_editor())
with check (public.is_editor());

drop policy if exists "leads_admin_delete" on public.leads;
create policy "leads_admin_delete"
on public.leads
for delete
to authenticated
using (public.is_admin());

-- WEBSITE_VISITS policies
drop policy if exists "website_visits_public_insert" on public.website_visits;
create policy "website_visits_public_insert"
on public.website_visits
for insert
to anon
with check (true);

drop policy if exists "website_visits_auth_select" on public.website_visits;
create policy "website_visits_auth_select"
on public.website_visits
for select
to authenticated
using (public.is_editor());

drop policy if exists "website_visits_admin_delete" on public.website_visits;
create policy "website_visits_admin_delete"
on public.website_visits
for delete
to authenticated
using (public.is_admin());

-- STORAGE: bucket + policies (no ALTER TABLE on storage.objects)
insert into storage.buckets (id, name, public)
values ('blog-images','blog-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('popup-images','popup-images', true)
on conflict (id) do nothing;

drop policy if exists "blog_images_public_read" on storage.objects;
create policy "blog_images_public_read"
on storage.objects
for select
to anon
using (bucket_id = 'blog-images');

drop policy if exists "blog_images_auth_read" on storage.objects;
create policy "blog_images_auth_read"
on storage.objects
for select
to authenticated
using (bucket_id = 'blog-images');

drop policy if exists "blog_images_auth_insert" on storage.objects;
create policy "blog_images_auth_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'blog-images' and public.is_editor());

drop policy if exists "blog_images_auth_update" on storage.objects;
create policy "blog_images_auth_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'blog-images' and public.is_editor())
with check (bucket_id = 'blog-images' and public.is_editor());

drop policy if exists "blog_images_admin_delete" on storage.objects;
create policy "blog_images_admin_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'blog-images' and public.is_admin());

drop policy if exists "popup_images_public_read" on storage.objects;
create policy "popup_images_public_read"
on storage.objects
for select
to anon
using (bucket_id = 'popup-images');

drop policy if exists "popup_images_auth_read" on storage.objects;
create policy "popup_images_auth_read"
on storage.objects
for select
to authenticated
using (bucket_id = 'popup-images');

drop policy if exists "popup_images_auth_insert" on storage.objects;
create policy "popup_images_auth_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'popup-images' and public.is_editor());

drop policy if exists "popup_images_auth_update" on storage.objects;
create policy "popup_images_auth_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'popup-images' and public.is_editor())
with check (bucket_id = 'popup-images' and public.is_editor());

drop policy if exists "popup_images_admin_delete" on storage.objects;
create policy "popup_images_admin_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'popup-images' and public.is_admin());

-- DEMO DATA
insert into public.websites (name)
select 'Default'
where not exists (select 1 from public.websites);

insert into public.website_addons (website_id, addon_key, is_active)
select
  w.id,
  v.addon_key,
  false
from (select id from public.websites order by created_at limit 1) w
cross join (
  values
    ('shop'),
    ('courses'),
    ('restaurant'),
    ('bookings'),
    ('multilang'),
    ('portfolio')
) as v(addon_key)
on conflict (website_id, addon_key) do nothing;

insert into public.blog_categories (website_id, name, slug, description)
select
  w.id,
  v.name,
  v.slug,
  v.description
from (select id from public.websites order by created_at limit 1) w
cross join (
  values
    ('Aktualności', 'aktualnosci', 'Aktualności firmy'),
    ('Poradniki', 'poradniki', 'Porady i instrukcje')
) as v(name, slug, description)
on conflict (website_id, slug) do nothing;

insert into public.blog_posts (website_id, title, slug, content, excerpt, published, published_at, category_id)
select
  w.id,
  'Pierwszy wpis demo',
  'pierwszy-wpis-demo',
  '<p>To jest przykładowy wpis w nowym CMS.</p>',
  'Przykładowy wpis demo.',
  true,
  now(),
  c.id
from (select id from public.websites order by created_at limit 1) w
join public.blog_categories c
  on c.website_id = w.id and c.slug = 'aktualnosci'
on conflict (website_id, slug) do nothing;

insert into public.cms_pages (title, path, language_code, is_published, content, seo)
values
  (
    'Strona główna',
    '/',
    'pl',
    true,
    jsonb_build_array(
      jsonb_build_object('id', gen_random_uuid()::text, 'type', 'hero', 'data', jsonb_build_object(
        'title', 'Inteligentne folie PDLC i LCD na okna',
        'subtitle', 'Prywatność na żądanie — do domu, biura i hoteli.',
        'ctaLabel', 'Kontakt',
        'ctaHref', '/kontakt'
      )),
      jsonb_build_object('id', gen_random_uuid()::text, 'type', 'cards', 'data', jsonb_build_object(
        'title', 'Korzyści',
        'items', jsonb_build_array(
          jsonb_build_object('title', 'Prywatność', 'description', 'Jednym kliknięciem.'),
          jsonb_build_object('title', 'Design', 'description', 'Nowoczesny efekt.')
        )
      )),
      jsonb_build_object('id', gen_random_uuid()::text, 'type', 'text', 'data', jsonb_build_object(
        'title', 'O nas',
        'body', 'Dodaj krótki opis firmy i oferty.'
      ))
    ),
    jsonb_build_object(
      'metaTitle', 'Strona główna | Demo',
      'metaDescription', 'Nowy CMS demo: strona główna, blog i kontakty.',
      'canonical', 'https://example.com/',
      'indexable', true
    )
  ),
  (
    'Kontakt',
    '/kontakt',
    'pl',
    true,
    jsonb_build_array(
      jsonb_build_object('id', gen_random_uuid()::text, 'type', 'hero', 'data', jsonb_build_object(
        'title', 'Kontakt',
        'subtitle', 'Napisz do nas — odpowiemy szybko.',
        'ctaLabel', 'Wyślij',
        'ctaHref', '/kontakt'
      )),
      jsonb_build_object('id', gen_random_uuid()::text, 'type', 'text', 'data', jsonb_build_object(
        'title', 'Dane kontaktowe',
        'body', 'Telefon, e-mail, adres…'
      ))
    ),
    jsonb_build_object('metaTitle', 'Kontakt | Demo', 'metaDescription', 'Kontakt demo', 'canonical', 'https://example.com/kontakt', 'indexable', true)
  )
on conflict (path, language_code) do nothing;

insert into public.site_custom_content (content_key, content_value, is_active, page_path, language_code)
values
  ('home.hero.title', 'Inteligentne folie PDLC i LCD na okna', true, '/', 'pl'),
  ('home.hero.subtitle', 'Prywatność na żądanie — do domu, biura i hoteli.', true, '/', 'pl')
on conflict (page_path, language_code, content_key) do nothing;

insert into public.leads (name, email, phone, message, status, priority)
values
  ('Jan Kowalski', 'jan@example.com', '+48 123 456 789', 'Proszę o wycenę.', 'new', 'medium'),
  ('Anna Nowak', 'anna@example.com', '+48 987 654 321', 'Chcę umówić montaż.', 'new', 'high')
on conflict do nothing;

insert into public.website_visits (visited_at, page_path, referrer, device_type, browser, is_unique, session_id)
values
  (now() - interval '2 days', '/', 'https://google.com', 'desktop', 'chrome', true, 's1'),
  (now() - interval '2 days', '/blog', 'https://google.com', 'mobile', 'safari', true, 's2'),
  (now() - interval '1 days', '/', null, 'mobile', 'chrome', false, 's2'),
  (now() - interval '3 hours', '/', null, 'desktop', 'chrome', true, 's3'),
  (now() - interval '1 hours', '/kontakt', null, 'desktop', 'firefox', true, 's4')
on conflict do nothing;

commit;

-- Optional: elevate a user to admin (replace UUID)
-- update public.profiles set role = 'admin' where id = 'YOUR_USER_UUID';
