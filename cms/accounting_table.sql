create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('income', 'expense')),
  amount numeric not null,
  category text not null,
  description text,
  date date not null,
  payment_method text,
  created_at timestamp with time zone default now()
);

-- Habilitar seguridad (RLS)
alter table transactions enable row level security;

-- Política para permitir acceso a usuarios autenticados
create policy "Allow all authenticated" on transactions
  for all
  using (auth.role() = 'authenticated');
