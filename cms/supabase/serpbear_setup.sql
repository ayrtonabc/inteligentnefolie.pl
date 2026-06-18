-- =============================================================================
-- SERPBEAR SEO POSITION TRACKING - Google Search Console Integration
-- =============================================================================
-- Este SQL crea las tablas necesarias para tracking real de posiciones en Google
-- Usa Google Search Console API para datos reales y precisos
-- =============================================================================

begin;

-- Funciones de seguridad necesarias para RLS
-- Usan ANY_AUTHENTICATED que permite cualquier usuario autenticado
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null;
$$;

create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null;
$$;

-- Tabla principal de palabras clave que el usuario quiere rastrear
create table if not exists public.serpbear_keywords (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  keyword text not null,
  domain text not null,
  device text default 'desktop' check (device in ('desktop', 'mobile', 'tablet')),
  location text default 'Poland',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.serpbear_keywords is 'Palabras clave que el usuario quiere rastrear en Google';
comment on column public.serpbear_keywords.device is 'desktop|mobile|tablet - dispositivo para búsqueda';
comment on column public.serpbear_keywords.location is 'País o región para la búsqueda (ej: Poland, Warsaw)';

create index if not exists serpbear_keywords_site_idx on public.serpbear_keywords (website_id);
create index if not exists serpbear_keywords_keyword_idx on public.serpbear_keywords (keyword);
create index if not exists serpbear_keywords_active_idx on public.serpbear_keywords (website_id, is_active);

drop trigger if exists trg_serpbear_keywords_updated_at on public.serpbear_keywords;
create trigger trg_serpbear_keywords_updated_at
before update on public.serpbear_keywords
for each row execute function public.set_updated_at();

-- Historial de posiciones para cada palabra clave
create table if not exists public.serpbear_positions (
  id uuid primary key default gen_random_uuid(),
  keyword_id uuid not null references public.serpbear_keywords(id) on delete cascade,
  position int not null check (position >= 0 and position <= 1000),
  impressions int default 0,
  clicks int default 0,
  ctr numeric(5,4) default 0,
  url text,
  device text default 'desktop',
  country text default 'pol',
  search_type text default 'web' check (search_type in ('web', 'image', 'video', 'news')),
  date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

comment on table public.serpbear_positions is 'Historial de posiciones y métricas de cada palabra clave';
comment on column public.serpbear_positions.position is 'Posición en resultados de búsqueda (1 = primer lugar)';
comment on column public.serpbear_positions.impressions is 'Número de veces que apareció en búsquedas';
comment on column public.serpbear_positions.clicks is 'Número de clics desde los resultados';
comment on column public.serpbear_positions.ctr is 'Click Through Rate (clicks/impressions)';

create index if not exists serpbear_positions_keyword_idx on public.serpbear_positions (keyword_id);
create index if not exists serpbear_positions_date_idx on public.serpbear_positions (date desc);
create index if not exists serpbear_positions_position_idx on public.serpbear_positions (position);

-- Configuración de Google Search Console API
create table if not exists public.serpbear_google_config (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  access_token text,
  refresh_token text,
  token_type text default 'Bearer',
  expires_at timestamptz,
  property_url text not null,
  property_type text default 'sc-domain' check (property_type in ('sc-domain', 'domain', 'prefix')),
  is_active boolean not null default false,
  last_sync timestamptz,
  sync_status text default 'pending' check (sync_status in ('pending', 'syncing', 'success', 'error')),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.serpbear_google_config is 'Credenciales y configuración de Google Search Console';
comment on column public.serpbear_google_config.property_url is 'URL de la propiedad en Search Console (ej: sc-domain:tudominio.com)';
comment on column public.serpbear_google_config.property_type is 'Tipo de propiedad: sc-domain (dominio) o prefix (URL)';

create unique index if not exists serpbear_google_config_site_unique on public.serpbear_google_config (website_id);

drop trigger if exists trg_serpbear_google_config_updated_at on public.serpbear_google_config;
create trigger trg_serpbear_google_config_updated_at
before update on public.serpbear_google_config
for each row execute function public.set_updated_at();

-- Queries reales de Google Search Console (todas las búsquedas)
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

comment on table public.serpbear_queries is 'Datos reales de Google Search Console - todas las queries';
comment on column public.serpbear_queries.query is 'Término de búsqueda real';
comment on column public.serpbear_queries.page_url is 'URL de tu página que aparece en resultados';

create index if not exists serpbear_queries_site_idx on public.serpbear_queries (website_id);
create index if not exists serpbear_queries_query_idx on public.serpbear_queries (query);
create index if not exists serpbear_queries_date_idx on public.serpbear_queries (date desc);
create index if not exists serpbear_queries_position_idx on public.serpbear_queries (position);

alter table public.serpbear_queries drop constraint if exists serpbear_queries_unique_daily;
alter table public.serpbear_queries add constraint serpbear_queries_unique_daily 
  unique (website_id, query, page_url, date);

-- Páginas que reciben tráfico desde Google
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

comment on table public.serpbear_pages is 'Rendimiento de cada página en Google Search';
comment on column public.serpbear_pages.url is 'URL completa de la página';
comment on column public.serpbear_pages.page_title is 'Título de la página (h1 o title tag)';

create unique index if not exists serpbear_pages_site_url_date_unique on public.serpbear_pages (website_id, url, date);
create index if not exists serpbear_pages_site_idx on public.serpbear_pages (website_id);
create index if not exists serpbear_pages_position_idx on public.serpbear_pages (position);
create index if not exists serpbear_pages_clicks_idx on public.serpbear_pages (website_id, clicks desc);

-- Tabla para ranking de competidores (detecta cómo aparecen en Google)
create table if not exists public.serpbear_competitors (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  competitor_domain text not null,
  common_keywords int default 0,
  total_appearances int default 0,
  avg_position numeric(10,2) default 0,
  last_checked timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.serpbear_competitors is 'Competidores detectados por keywords en común';
comment on column public.serpbear_competitors.competitor_domain is 'Dominio del competidor (ej: competitor.com)';
comment on column public.serpbear_competitors.common_keywords is 'Número de keywords que comparten';

create index if not exists serpbear_competitors_site_idx on public.serpbear_competitors (website_id);
create index if not exists serpbear_competitors_domain_idx on public.serpbear_competitors (competitor_domain);

drop trigger if exists trg_serpbear_competitors_updated_at on public.serpbear_competitors;
create trigger trg_serpbear_competitors_updated_at
before update on public.serpbear_competitors
for each row execute function public.set_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

alter table public.serpbear_keywords enable row level security;
alter table public.serpbear_positions enable row level security;
alter table public.serpbear_google_config enable row level security;
alter table public.serpbear_queries enable row level security;
alter table public.serpbear_pages enable row level security;
alter table public.serpbear_competitors enable row level security;

-- Políticas para serpbear_keywords
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

-- Políticas para serpbear_positions
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

-- Políticas para serpbear_google_config
drop policy if exists "serpbear_google_config_auth_select" on public.serpbear_google_config;
create policy "serpbear_google_config_auth_select"
on public.serpbear_google_config
for select
to authenticated
using (public.is_editor());

drop policy if exists "serpbear_google_config_editor_upsert" on public.serpbear_google_config;
create policy "serpbear_google_config_editor_upsert"
on public.serpbear_google_config
for all
to authenticated
using (public.is_editor())
with check (public.is_editor());

-- Políticas para serpbear_queries
drop policy if exists "serpbear_queries_auth_select" on public.serpbear_queries;
create policy "serpbear_queries_auth_select"
on public.serpbear_queries
for select
to authenticated
using (public.is_editor());

drop policy if exists "serpbear_queries_editor_upsert" on public.serpbear_queries;
create policy "serpbear_queries_editor_upsert"
on public.serpbear_queries
for all
to authenticated
using (public.is_editor())
with check (public.is_editor());

-- Políticas para serpbear_pages
drop policy if exists "serpbear_pages_auth_select" on public.serpbear_pages;
create policy "serpbear_pages_auth_select"
on public.serpbear_pages
for select
to authenticated
using (public.is_editor());

drop policy if exists "serpbear_pages_editor_upsert" on public.serpbear_pages;
create policy "serpbear_pages_editor_upsert"
on public.serpbear_pages
for all
to authenticated
using (public.is_editor())
with check (public.is_editor());

-- Políticas para serpbear_competitors
drop policy if exists "serpbear_competitors_auth_select" on public.serpbear_competitors;
create policy "serpbear_competitors_auth_select"
on public.serpbear_competitors
for select
to authenticated
using (public.is_editor());

drop policy if exists "serpbear_competitors_editor_upsert" on public.serpbear_competitors;
create policy "serpbear_competitors_editor_upsert"
on public.serpbear_competitors
for all
to authenticated
using (public.is_editor())
with check (public.is_editor());

-- =============================================================================
-- FUNCIONES ÚTILES
-- =============================================================================

-- Función para obtener estadísticas de keywords
create or replace function public.get_serpbear_keyword_stats(p_website_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_result json;
begin
  select json_build_object(
    'total_keywords', (
      select count(*) from public.serpbear_keywords 
      where website_id = p_website_id and is_active = true
    ),
    'top_10_count', (
      select count(distinct k.id) from public.serpbear_keywords k
      join public.serpbear_positions p on p.keyword_id = k.id
      where k.website_id = p_website_id and k.is_active = true
      and p.position <= 10
      and p.date = (
        select max(date) from public.serpbear_positions 
        where keyword_id = k.id
      )
    ),
    'top_50_count', (
      select count(distinct k.id) from public.serpbear_keywords k
      join public.serpbear_positions p on p.keyword_id = k.id
      where k.website_id = p_website_id and k.is_active = true
      and p.position <= 50
      and p.date = (
        select max(date) from public.serpbear_positions 
        where keyword_id = k.id
      )
    ),
    'avg_position', (
      select round(avg(position), 1) from public.serpbear_positions p
      join public.serpbear_keywords k on k.id = p.keyword_id
      where k.website_id = p_website_id and k.is_active = true
      and p.date >= now() - interval '30 days'
    ),
    'total_impressions', (
      select sum(impressions) from public.serpbear_queries
      where website_id = p_website_id
      and date >= now() - interval '30 days'
    ),
    'total_clicks', (
      select sum(clicks) from public.serpbear_queries
      where website_id = p_website_id
      and date >= now() - interval '30 days'
    )
  ) into v_result;
  
  return v_result;
end;
$$;

comment on function public.get_serpbear_keyword_stats is 
'Retorna estadísticas completas de SEO para un website: total keywords, rankings top 10/50, posición promedio, impresiones y clics';

-- Función para actualizar posiciones de keywords desde Search Console
create or replace function public.update_keyword_positions_from_gsc(
  p_website_id uuid,
  p_query text,
  p_position int,
  p_impressions int,
  p_clicks int,
  p_ctr numeric,
  p_page_url text,
  p_device text default 'desktop',
  p_country text default 'pol'
)
returns void
language plpgsql
security definer
as $$
declare
  v_keyword_id uuid;
begin
  -- Buscar si existe el keyword
  select id into v_keyword_id
  from public.serpbear_keywords
  where website_id = p_website_id 
    and lower(keyword) = lower(p_query)
    and is_active = true
  limit 1;
  
  -- Si no existe, crear automáticamente
  if v_keyword_id is null then
    insert into public.serpbear_keywords (website_id, keyword, domain, device, location)
    values (
      p_website_id,
      p_query,
      (select website_url from public.websites where id = p_website_id limit 1),
      p_device,
      p_country
    )
    returning id into v_keyword_id;
  end if;
  
  -- Registrar la posición
  insert into public.serpbear_positions (
    keyword_id, position, impressions, clicks, ctr, url, device, country, date
  ) values (
    v_keyword_id, p_position, p_impressions, p_clicks, p_ctr, p_page_url, p_device, p_country, now()
  );
  
  -- Registrar en queries también
  insert into public.serpbear_queries (
    website_id, query, page_url, country, device, impressions, clicks, ctr, position, date
  ) values (
    p_website_id, p_query, p_page_url, p_country, p_device, p_impressions, p_clicks, p_ctr, p_position, now()
  )
  on conflict (website_id, query, page_url, date) do update set
    impressions = p_impressions,
    clicks = p_clicks,
    ctr = p_ctr,
    position = p_position;
end;
$$;

comment on function public.update_keyword_positions_from_gsc is 
'Función para importar datos de Google Search Console y actualizar posiciones automáticamente';

-- Función para detectar competidores
create or replace function public.detect_competitors(p_website_id uuid, p_min_appearances int default 5)
returns table(
  competitor_domain text,
  common_keywords int,
  total_appearances bigint,
  avg_position numeric
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    regexp_replace(
      split_part(page_url, '/', 3),
      '^www\.', ''
    ) as competitor_domain,
    count(distinct query) as common_keywords,
    count(*) as total_appearances,
    round(avg(position), 2) as avg_position
  from public.serpbear_queries
  where website_id = p_website_id
    and page_url not like '%' || (
      select website_url from public.websites where id = p_website_id limit 1
    ) || '%'
    and page_url ~* '^[http|https]://'
  group by competitor_domain
  having count(*) >= p_min_appearances
  order by common_keywords desc
  limit 20;
end;
$$;

comment on function public.detect_competitors is 
'Detecta competidores basándose en las keywords que comparten contigo en Google. 
Retorna dominios, número de keywords en común, apariciones totales y posición promedio.';

-- Función para limpiar datos antiguos
create or replace function public.cleanup_old_serpbear_data(p_days_to_keep int default 90)
returns void
language plpgsql
security definer
as $$
begin
  -- Eliminar posiciones antiguas
  delete from public.serpbear_positions
  where date < now() - (p_days_to_keep || ' days')::interval;
  
  -- Eliminar queries antiguas
  delete from public.serpbear_queries
  where date < now() - (p_days_to_keep || ' days')::interval;
  
  -- Eliminar pages antiguas
  delete from public.serpbear_pages
  where date < now() - (p_days_to_keep || ' days')::interval;
  
  -- Limpiar competidores no actualizados
  delete from public.serpbear_competitors
  where last_checked < now() - interval '7 days';
end;
$$;

comment on function public.cleanup_old_serpbear_data is 
'Limpia datos de SerpBear más antiguos que los días especificados. Por defecto mantiene 90 días.';

commit;

-- =============================================================================
-- INSTRUCCIONES DE USO
-- =============================================================================
-- 
-- 1. EJECUTAR ESTE SQL en Supabase SQL Editor
-- 
-- 2. CONFIGURAR GOOGLE SEARCH CONSOLE:
--    - Ve a https://search.google.com/search-console
--    - Añade tu dominio o propiedad URL
--    - Verifica la propiedad
--    - Ve a Configuración > Enlaces de Search Console > Conectar
-- 
-- 3. OBTENER ACCESS TOKEN:
--    - Ve a https://console.cloud.google.com/
--    - Crea un proyecto
--    - Habilita "Search Console API"
--    - Crea credenciales OAuth 2.0
--    - Usa el refresh_token para obtener access_token
-- 
-- 4. SINCRONIZACIÓN:
--    - El CMS automáticamente sincroniza datos de GSC
--    - Se recomienda sincronizar 1-2 veces al día
--    - Los datos tienen un delay de 2-3 días en GSC
-- 
-- =============================================================================
