-- =============================================================================
-- FUNCIONES SQL OPTIMIZADAS PARA GOOGLE SEARCH CONSOLE
-- =============================================================================
-- Detección real de posiciones, competidores y análisis SEO
-- =============================================================================

drop function if exists public.sync_gsc_data(uuid, jsonb);
drop function if exists public.get_google_appearances(uuid);
drop function if exists public.detect_competitors(uuid, int);
drop function if exists public.seo_position_summary(uuid, int);
drop function if exists public.pages_ranking(uuid);
drop function if exists public.device_comparison(uuid);
drop function if exists public.position_trends(uuid, int);
drop function if exists public.position_changes(uuid, int);
drop function if exists public.lost_opportunities(uuid, int);
drop function if exists public.position_distribution(uuid);

-- 1. ACTUALIZAR/SINCRONIZAR keywords con datos reales de GSC
create or replace function public.sync_gsc_data(
  p_website_id uuid,
  p_data jsonb
)
returns void
language plpgsql
security definer
as $$
declare
  v_keyword_id uuid;
  v_website_domain text;
  v_item jsonb;
begin
  select replace(replace(website_url, 'https://', ''), 'http://', '')
    into v_website_domain
  from public.websites where id = p_website_id;
  
  for v_item in select * from jsonb_array_elements(p_data)
  loop
    insert into public.serpbear_keywords (
      website_id, keyword, domain, device, location, is_active
    ) values (
      p_website_id,
      v_item->>'query',
      v_website_domain,
      coalesce(v_item->>'device', 'desktop'),
      coalesce(v_item->>'country', 'pol'),
      true
    )
    on conflict (website_id, lower(keyword)) do update set
      updated_at = now(),
      is_active = true
    returning id into v_keyword_id;
    
    insert into public.serpbear_positions (
      keyword_id, position, impressions, clicks, ctr, url, device, country, date
    ) values (
      v_keyword_id,
      (v_item->>'position')::int,
      (v_item->>'impressions')::int,
      (v_item->>'clicks')::int,
      (v_item->>'ctr')::numeric,
      v_item->>'page',
      coalesce(v_item->>'device', 'desktop'),
      coalesce(v_item->>'country', 'pol'),
      now()
    );
    
    insert into public.serpbear_queries (
      website_id, query, page_url, country, device, impressions, clicks, ctr, position, date
    ) values (
      p_website_id,
      v_item->>'query',
      v_item->>'page',
      coalesce(v_item->>'country', 'pol'),
      coalesce(v_item->>'device', 'desktop'),
      (v_item->>'impressions')::int,
      (v_item->>'clicks')::int,
      (v_item->>'ctr')::numeric,
      (v_item->>'position')::int,
      date_trunc('day', now())
    )
    on conflict on constraint serpbear_queries_unique_daily do update set
      impressions = (v_item->>'impressions')::int,
      clicks = (v_item->>'clicks')::int,
      ctr = (v_item->>'ctr')::numeric,
      position = (v_item->>'position')::int;
  end loop;
end;
$$;

-- 2. VER TODAS LAS APARICIONES DEL SITIO EN GOOGLE
create or replace function public.get_google_appearances(p_website_id uuid)
returns table(
  query text,
  page_url text,
  pos numeric,
  impressions bigint,
  clicks bigint,
  ctr numeric,
  device text,
  country text,
  search_type text
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    q.query,
    q.page_url,
    q.position as pos,
    q.impressions::bigint,
    q.clicks::bigint,
    q.ctr,
    q.device,
    q.country,
    coalesce(q.search_type, 'web')::text
  from public.serpbear_queries q
  where q.website_id = p_website_id
  order by q.impressions desc
  limit 1000;
end;
$$;

-- 3. DETECTAR COMPETIDORES SEO (sitios que aparecen en las mismas búsquedas)
create or replace function public.detect_competitors(p_website_id uuid, p_min_shared int default 3)
returns table(
  competitor_domain text,
  shared_keywords int,
  your_avg_position numeric,
  competitor_avg_position numeric,
  total_impressions bigint,
  overlap_percentage numeric
)
language plpgsql
security definer
as $$
begin
  return query
  with my_keywords as (
    select distinct lower(query) as kw
    from public.serpbear_queries
    where website_id = p_website_id
  ),
  all_appearances as (
    select 
      lower(query) as kw,
      split_part(replace(replace(page_url, 'https://', ''), 'http://', ''), '/', 1) as domain,
      position,
      impressions
    from public.serpbear_queries
    where website_id != p_website_id
  ),
  competitor_stats as (
    select
      a.domain,
      count(distinct a.kw) as shared_count,
      (
        select round(avg(position), 1)
        from public.serpbear_queries
        where website_id = p_website_id and lower(query) in (select kw from all_appearances where domain = a.domain)
      ) as my_avg_pos,
      round(avg(a.position), 1) as comp_avg_pos,
      sum(a.impressions)::bigint as total_imp
    from all_appearances a
    inner join my_keywords mk on a.kw = mk.kw
    where a.domain is not null and a.domain != ''
    group by a.domain
    having count(distinct a.kw) >= p_min_shared
  )
  select 
    c.domain,
    c.shared_count,
    c.my_avg_pos,
    c.comp_avg_pos,
    c.total_imp,
    round((c.shared_count::numeric / (select count(*) from my_keywords)::numeric) * 100, 1)
  from competitor_stats c
  order by c.shared_count desc
  limit 20;
end;
$$;

-- 4. RESUMEN COMPLETO DE POSICIONAMIENTO
create or replace function public.seo_position_summary(p_website_id uuid, p_days int default 30)
returns json
language plpgsql
security definer
as $$
declare
  v_result json;
  v_total_kw int;
  v_top3 int;
  v_top10 int;
  v_top20 int;
  v_top50 int;
  v_beyond50 int;
  v_total_imp bigint;
  v_total_clicks bigint;
  v_avg_ctr numeric;
  v_avg_pos numeric;
  v_best_kw text;
  v_worst_kw text;
begin
  select count(distinct query) into v_total_kw
  from public.serpbear_queries
  where website_id = p_website_id and date >= now() - (p_days || ' days')::interval;
  
  select count(distinct query) into v_top3
  from public.serpbear_queries
  where website_id = p_website_id and position between 1 and 3
  and date >= now() - (p_days || ' days')::interval;
  
  select count(distinct query) into v_top10
  from public.serpbear_queries
  where website_id = p_website_id and position between 1 and 10
  and date >= now() - (p_days || ' days')::interval;
  
  select count(distinct query) into v_top20
  from public.serpbear_queries
  where website_id = p_website_id and position between 1 and 20
  and date >= now() - (p_days || ' days')::interval;
  
  select count(distinct query) into v_top50
  from public.serpbear_queries
  where website_id = p_website_id and position between 1 and 50
  and date >= now() - (p_days || ' days')::interval;
  
  select count(distinct query) into v_beyond50
  from public.serpbear_queries
  where website_id = p_website_id and position > 50
  and date >= now() - (p_days || ' days')::interval;
  
  select sum(impressions)::bigint, sum(clicks)::bigint
  into v_total_imp, v_total_clicks
  from public.serpbear_queries
  where website_id = p_website_id and date >= now() - (p_days || ' days')::interval;
  
  select round(avg(ctr) * 100, 2), round(avg(position), 1)
  into v_avg_ctr, v_avg_pos
  from public.serpbear_queries
  where website_id = p_website_id and position > 0
  and date >= now() - (p_days || ' days')::interval;
  
  select query into v_best_kw
  from public.serpbear_queries
  where website_id = p_website_id and position > 0
  and date >= now() - (p_days || ' days')::interval
  order by position asc limit 1;
  
  select query into v_worst_kw
  from public.serpbear_queries
  where website_id = p_website_id and position > 0
  and date >= now() - (p_days || ' days')::interval
  order by position desc limit 1;
  
  select json_build_object(
    'period_days', p_days,
    'total_keywords', v_total_kw,
    'position_1_3', v_top3,
    'position_4_10', v_top10 - v_top3,
    'position_11_20', v_top20 - v_top10,
    'position_21_50', v_top50 - v_top20,
    'position_51_plus', v_beyond50,
    'top_3_percentage', case when v_total_kw > 0 then round((v_top3::numeric / v_total_kw) * 100, 1) else 0 end,
    'top_10_percentage', case when v_total_kw > 0 then round((v_top10::numeric / v_total_kw) * 100, 1) else 0 end,
    'total_impressions', v_total_imp,
    'total_clicks', v_total_clicks,
    'average_ctr', v_avg_ctr,
    'average_position', v_avg_pos,
    'best_keyword', v_best_kw,
    'worst_keyword', v_worst_kw
  ) into v_result;
  
  return v_result;
end;
$$;

-- 5. RANKING DE PÁGINAS POR TRÁFICO DE GOOGLE
create or replace function public.pages_ranking(p_website_id uuid, p_limit int default 20)
returns table(
  page_url text,
  impressions bigint,
  clicks bigint,
  ctr numeric,
  avg_position numeric,
  keyword_count int
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    q.page_url,
    sum(q.impressions)::bigint as impressions,
    sum(q.clicks)::bigint as clicks,
    case when sum(q.impressions) > 0 
      then round(sum(q.clicks)::numeric / sum(q.impressions), 4) 
      else 0 
    end as ctr,
    round(avg(q.position), 1) as avg_position,
    count(distinct q.query)::int as keyword_count
  from public.serpbear_queries q
  where q.website_id = p_website_id
  group by q.page_url
  order by clicks desc
  limit p_limit;
end;
$$;

-- 6. COMPARATIVA MOBILE VS DESKTOP
create or replace function public.device_comparison(p_website_id uuid)
returns table(
  query text,
  desktop_position numeric,
  mobile_position numeric,
  position_diff int,
  desktop_impressions bigint,
  mobile_impressions bigint,
  desktop_clicks bigint,
  mobile_clicks bigint
)
language plpgsql
security definer
as $$
begin
  return query
  with latest_data as (
    select distinct on (query, device)
      query, device, position, impressions, clicks, date
    from public.serpbear_queries
    where website_id = p_website_id
    order by query, device, date desc
  )
  select 
    d.query,
    d.position as desktop_position,
    m.position as mobile_position,
    (coalesce(m.position, 100) - coalesce(d.position, 100))::int as position_diff,
    d.impressions as desktop_impressions,
    coalesce(m.impressions, 0) as mobile_impressions,
    d.clicks as desktop_clicks,
    coalesce(m.clicks, 0) as mobile_clicks
  from (select * from latest_data where device = 'desktop') d
  left join (select * from latest_data where device = 'mobile') m on d.query = m.query
  where d.position > 0
  order by d.impressions desc;
end;
$$;

-- 7. TENDENCIAS DE POSICIÓN EN EL TIEMPO
create or replace function public.position_trends(p_website_id uuid, p_days int default 30)
returns table(
  date_date date,
  avg_position numeric,
  total_impressions bigint,
  total_clicks bigint,
  top10_keywords int,
  top50_keywords int,
  new_top10 int
)
language plpgsql
security definer
as $$
begin
  return query
  with daily_data as (
    select 
      date::date,
      round(avg(position), 2) as avg_pos,
      sum(impressions)::bigint as impressions,
      sum(clicks)::bigint as clicks,
      count(distinct case when position <= 10 then query end)::int as top10,
      count(distinct case when position <= 50 then query end)::int as top50
    from public.serpbear_queries
    where website_id = p_website_id and date >= now() - (p_days || ' days')::interval
    group by date::date
  ),
  with_previous as (
    select 
      d.*,
      lag(d.top10) over (order by d.date) as prev_top10
    from daily_data d
  )
  select 
    date_date,
    avg_pos,
    impressions,
    clicks,
    top10,
    top50,
    greatest(0, top10 - coalesce(prev_top10, 0)) as new_top10
  from with_previous
  order by date_date;
end;
$$;

-- 8. CAMBIOS DE POSICIÓN (Keywords que mejoraron o empeoraron)
create or replace function public.position_changes(p_website_id uuid, p_days int default 7)
returns table(
  query text,
  current_position numeric,
  previous_position numeric,
  change int,
  current_impressions bigint,
  previous_impressions bigint,
  trend text
)
language plpgsql
security definer
as $$
begin
  return query
  with current_data as (
    select distinct on (query)
      query, position, impressions
    from public.serpbear_queries
    where website_id = p_website_id and date >= now() - interval '1 day'
    order by query, date desc
  ),
  previous_data as (
    select distinct on (query)
      query, position, impressions
    from public.serpbear_queries
    where website_id = p_website_id and date < now() - interval '1 day'
    and date >= now() - (p_days || ' days')::interval
    order by query, date desc
  )
  select 
    c.query,
    c.position as current_position,
    p.position as previous_position,
    (coalesce(p.position, 100) - coalesce(c.position, 100))::int as change,
    c.impressions as current_impressions,
    p.impressions as previous_impressions,
    case 
      when c.position < p.position then 'improved'
      when c.position > p.position then 'declined'
      else 'stable'
    end as trend
  from current_data c
  left join previous_data p on c.query = p.query
  where c.position > 0
  order by abs(coalesce(p.position, 100) - coalesce(c.position, 100)) desc;
end;
$$;

-- 9. KEYWORDS QUE APARECEN PERO NO ESTÁN EN TOP 100
create or replace function public.lost_opportunities(p_website_id uuid, p_min_impressions int default 100)
returns table(
  query text,
  best_position numeric,
  total_impressions bigint,
  potential_clicks bigint
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    query,
    min(position) as best_position,
    sum(impressions)::bigint as total_impressions,
    (sum(impressions)::bigint * 0.05)::bigint as potential_clicks
  from public.serpbear_queries
  where website_id = p_website_id and position > 20
  group by query
  having sum(impressions) >= p_min_impressions
  order by total_impressions desc
  limit 50;
end;
$$;

-- 10. ANÁLISIS DE CTR POR POSICIÓN
create or replace function public.ctr_analysis(p_website_id uuid)
returns table(
  position_range text,
  avg_ctr numeric,
  total_impressions bigint,
  keyword_count int
)
language plpgsql
security definer
as $$
begin
  return query
  with position_buckets as (
    select 
      case
        when position between 1 and 3 then '1-3'
        when position between 4 and 10 then '4-10'
        when position between 11 and 20 then '11-20'
        when position between 21 and 50 then '21-50'
        when position between 51 and 100 then '51-100'
        else '100+'
      end as bucket,
      ctr,
      impressions,
      query
    from public.serpbear_queries
    where website_id = p_website_id and date >= now() - interval '30 days'
  )
  select 
    bucket as position_range,
    round(avg(ctr) * 100, 2) as avg_ctr,
    sum(impressions)::bigint as total_impressions,
    count(distinct query)::int as keyword_count
  from position_buckets
  group by bucket
  order by 
    case bucket
      when '1-3' then 1
      when '4-10' then 2
      when '11-20' then 3
      when '21-50' then 4
      when '51-100' then 5
      else 6
    end;
end;
$$;

-- 11. CONFIGURAR Google Search Console OAuth
create or replace function public.setup_gsc_oauth(
  p_website_id uuid,
  p_access_token text,
  p_refresh_token text,
  p_expires_at timestamptz,
  p_site_url text
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.serpbear_google_config (
    website_id, access_token, refresh_token, expires_at, site_url, is_active
  ) values (
    p_website_id, p_access_token, p_refresh_token, p_expires_at, p_site_url, true
  )
  on conflict (website_id) do update set
    access_token = p_access_token,
    refresh_token = p_refresh_token,
    expires_at = p_expires_at,
    site_url = p_site_url,
    updated_at = now(),
    is_active = true;
end;
$$;

-- 12. OBTENER CONFIGURACIÓN GSC ACTIVA
create or replace function public.get_gsc_config(p_website_id uuid)
returns table(
  site_url text,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  is_active boolean,
  needs_refresh boolean
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    g.site_url,
    g.access_token,
    g.refresh_token,
    g.expires_at,
    g.is_active,
    g.expires_at < now() as needs_refresh
  from public.serpbear_google_config g
  where g.website_id = p_website_id and g.is_active = true;
end;
$$;

-- 13. MARCAR COMPETIDOR
create or replace function public.add_competitor(
  p_website_id uuid,
  p_domain text,
  p_shared_keywords int default 0
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.serpbear_competitors (website_id, domain, shared_keywords, is_tracked)
  values (p_website_id, p_domain, p_shared_keywords, false)
  on conflict (website_id, domain) do update set
    shared_keywords = p_shared_keywords,
    updated_at = now();
end;
$$;

-- 14. ELIMINAR DATOS ANTIGUOS (limpieza)
create or replace function public.cleanup_old_data(p_website_id uuid, p_days_to_keep int default 90)
returns text
language plpgsql
security definer
as $$
declare
  v_deleted int;
begin
  delete from public.serpbear_queries
  where website_id = p_website_id and date < now() - (p_days_to_keep || ' days')::interval;
  
  get diagnostics v_deleted = row_count;
  
  return 'Deleted ' || v_deleted || ' old query records';
end;
$$;
