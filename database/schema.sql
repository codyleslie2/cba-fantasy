-- CBA PostgreSQL/Supabase foundation. ESPN is source-of-truth unless source='manual'.
create extension if not exists pgcrypto;
create type manager_status as enum ('active', 'inactive');
create type data_source as enum ('espn', 'manual');
create type ownership_role as enum ('primary', 'co_owner');

create table managers (
  id uuid primary key default gen_random_uuid(), slug text not null unique, full_name text not null,
  display_name text not null, status manager_status not null default 'inactive', espn_member_id text unique,
  first_season int check (first_season >= 2017), last_season int, epitaph text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table manager_aliases (
  id uuid primary key default gen_random_uuid(), manager_id uuid not null references managers(id) on delete cascade,
  alias text not null, normalized_alias text not null, source data_source not null default 'espn', unique(normalized_alias)
);
create table seasons (
  id uuid primary key default gen_random_uuid(), year int not null unique check(year >= 2017), espn_league_id bigint not null default 273644,
  is_complete boolean not null default false, regular_season_weeks int, playoff_weeks int, imported_at timestamptz
);
-- A franchise is the stable ESPN team slot. Its visible name lives on franchise_seasons.
create table franchises (
  id uuid primary key default gen_random_uuid(), espn_team_id int not null, created_at timestamptz not null default now(), unique(espn_team_id)
);
create table franchise_seasons (
  id uuid primary key default gen_random_uuid(), franchise_id uuid not null references franchises(id), season_id uuid not null references seasons(id),
  team_name text not null, team_abbrev text, logo_url text, unique(franchise_id, season_id)
);
create table manager_seasons (
  id uuid primary key default gen_random_uuid(), manager_id uuid not null references managers(id),
  franchise_season_id uuid not null references franchise_seasons(id), season_id uuid not null references seasons(id),
  role ownership_role not null default 'primary', unique(manager_id, franchise_season_id)
);
create table matchups (
  id uuid primary key default gen_random_uuid(), season_id uuid not null references seasons(id), espn_matchup_id bigint,
  week int not null check(week > 0), home_franchise_season_id uuid not null references franchise_seasons(id),
  away_franchise_season_id uuid not null references franchise_seasons(id), home_score numeric(10,2) not null,
  away_score numeric(10,2) not null, is_playoff boolean not null default false, source data_source not null default 'espn',
  unique(season_id, espn_matchup_id)
);
create table weekly_scores (
  id uuid primary key default gen_random_uuid(), matchup_id uuid not null references matchups(id) on delete cascade,
  franchise_season_id uuid not null references franchise_seasons(id), score numeric(10,2) not null, projected_score numeric(10,2), unique(matchup_id, franchise_season_id)
);
create table championships (
  id uuid primary key default gen_random_uuid(), season_id uuid not null unique references seasons(id), manager_id uuid not null references managers(id),
  franchise_season_id uuid references franchise_seasons(id), source data_source not null default 'espn', note text
);
create table recaps (
  id uuid primary key default gen_random_uuid(), season_id uuid not null references seasons(id), week int not null,
  title text not null, body_markdown text not null, published_at timestamptz, author_manager_id uuid references managers(id), unique(season_id, week)
);
create index matchups_season_week_idx on matchups(season_id, week);
create index manager_seasons_manager_idx on manager_seasons(manager_id);
create index manager_aliases_manager_idx on manager_aliases(manager_id);
