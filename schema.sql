-- Esquema inicial de referência para o futuro backend Supabase.
-- NÃO armazene solução secreta em tabelas legíveis pelos jogadores.
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  join_code text unique not null,
  status text not null default 'waiting' check (status in ('waiting','active','finished')),
  current_turn integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.game_players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  display_name text not null,
  seat integer not null,
  joined_at timestamptz not null default now(),
  unique(game_id, seat)
);

create table if not exists public.game_events (
  id bigint generated always as identity primary key,
  game_id uuid not null references public.games(id) on delete cascade,
  player_id uuid references public.game_players(id) on delete set null,
  event_type text not null,
  public_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.game_clues_used (
  game_id uuid not null references public.games(id) on delete cascade,
  card_id text not null,
  used_by uuid references public.game_players(id) on delete set null,
  used_at timestamptz not null default now(),
  primary key(game_id, card_id)
);

-- Segurança: a solução e as mãos privadas devem ficar em armazenamento
-- protegido por políticas RLS e/ou funções server-side. Não crie uma tabela
-- pública de soluções nem permita que clientes leiam as mãos de outros jogadores.
-- Ative RLS em todas as tabelas antes de conectar clientes.
alter table public.games enable row level security;
alter table public.game_players enable row level security;
alter table public.game_events enable row level security;
alter table public.game_clues_used enable row level security;
