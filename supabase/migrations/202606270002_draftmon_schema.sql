-- DraftMon game schema
-- Depends on: 202606270001_initial_game_foundation.sql (set_updated_at trigger already defined)

-- ============================================================
-- ROOMS
-- ============================================================
create table if not exists public.rooms (
  id                 text primary key,
  name               text not null,
  status             text not null default 'open',       -- open | drafting | betting | simulating | finished
  capacity           int  not null,                      -- 4 | 8 | 16
  entry_fee_wei      text not null,                      -- wei as string (bigint-safe)
  contract_room_id   text not null,                      -- bytes32 hex (0x...) — contract'ta kullanılan değer
  draft_started_at   timestamptz,
  betting_started_at timestamptz,
  winner_wallet      text,
  created_at         timestamptz not null default now()
);

alter table public.rooms enable row level security;

create policy "rooms are publicly readable"
  on public.rooms for select using (true);

create policy "rooms can be inserted by service role"
  on public.rooms for insert with check (false);  -- sadece service_role bypass eder

create policy "rooms can be updated by service role"
  on public.rooms for update using (false);       -- sadece service_role bypass eder

-- ============================================================
-- PLAYERS (entry fee ödeyenler)
-- ============================================================
create table if not exists public.players (
  id         uuid primary key default gen_random_uuid(),
  room_id    text not null references public.rooms(id) on delete cascade,
  wallet     text not null,
  tx_hash    text not null unique,
  squad_json jsonb,          -- [{name, position, pace, shooting, passing, tackling}]
  draft_done boolean not null default false,
  joined_at  timestamptz not null default now(),
  unique(room_id, wallet)
);

alter table public.players enable row level security;

create policy "players are publicly readable"
  on public.players for select using (true);

create policy "players can be inserted by service role"
  on public.players for insert with check (false);

create policy "players can be updated by service role"
  on public.players for update using (false);

-- ============================================================
-- MATCHES (sim engine çıktısı)
-- ============================================================
create table if not exists public.matches (
  id            uuid primary key default gen_random_uuid(),
  room_id       text not null references public.rooms(id) on delete cascade,
  round         text not null,   -- R16 | QF | SF | Final
  match_index   int  not null,   -- round içindeki sıra (0-based)
  home_wallet   text not null,
  away_wallet   text not null,
  home_score    int  not null,
  away_score    int  not null,
  winner_wallet text not null,
  sim_data      jsonb,           -- MatchSimulation (events + ticks) — replay için
  played_at     timestamptz not null default now()
);

alter table public.matches enable row level security;

create policy "matches are publicly readable"
  on public.matches for select using (true);

create policy "matches can be inserted by service role"
  on public.matches for insert with check (false);

-- ============================================================
-- BETS
-- ============================================================
create table if not exists public.bets (
  id            uuid primary key default gen_random_uuid(),
  room_id       text not null references public.rooms(id) on delete cascade,
  bettor_wallet text not null,
  target_wallet text not null,
  amount_wei    text not null,   -- wei as string
  tx_hash       text not null unique,
  payout_wei    text,            -- ödül dağıtıldıktan sonra set edilir
  won           boolean,         -- sim bittikten sonra set edilir
  placed_at     timestamptz not null default now(),
  unique(room_id, bettor_wallet) -- aynı odaya bir kez bet
);

alter table public.bets enable row level security;

create policy "bets are publicly readable"
  on public.bets for select using (true);

create policy "bets can be inserted by service role"
  on public.bets for insert with check (false);

create policy "bets can be updated by service role"
  on public.bets for update using (false);

-- ============================================================
-- LEADERBOARD
-- ============================================================
create table if not exists public.leaderboard (
  wallet             text primary key,
  wins               int  not null default 0,
  losses             int  not null default 0,
  draws              int  not null default 0,
  goals_for          int  not null default 0,
  goals_against      int  not null default 0,
  tournaments_played int  not null default 0,
  total_earned_wei   text not null default '0',
  updated_at         timestamptz not null default now()
);

alter table public.leaderboard enable row level security;

create policy "leaderboard is publicly readable"
  on public.leaderboard for select using (true);

create policy "leaderboard can be upserted by service role"
  on public.leaderboard for all with check (false);
