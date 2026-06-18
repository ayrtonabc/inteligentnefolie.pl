create table if not exists payroll (
  id uuid primary key default gen_random_uuid(),
  person text not null,
  project text not null,
  amount numeric not null,
  date date not null,
  status text not null,
  notes text
);

-- Política de RLS para permitir acceso a todos los usuarios autenticados
alter table payroll enable row level security;
create policy "Allow all authenticated" on payroll
  for all
  using (auth.role() = 'authenticated');
