create table if not exists workers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  created_at timestamp with time zone default now()
);

-- Habilitar seguridad (RLS)
alter table workers enable row level security;

-- Política para permitir acceso a usuarios autenticados
create policy "Allow all authenticated" on workers
  for all
  using (auth.role() = 'authenticated');
