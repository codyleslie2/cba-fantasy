# CBA League Archive

A production-ready foundation for the private CBA fantasy football league history and analytics site. Built with Next.js App Router, TypeScript, Tailwind CSS, and a PostgreSQL model designed for Supabase.

The interface currently uses clearly labeled demo statistics only. No historical CBA result is fabricated or persisted.

## Local setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`. Environment values are optional for the current mock-backed UI.

## Quality commands

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Structure

```text
database/schema.sql        PostgreSQL/Supabase-ready relational model
scripts/import-espn.ts     Read-only ESPN importer preview
src/app/                   App Router pages and global styling
src/components/            Shared navigation, banners, tables, and cards
src/data/                  Current manager identities and unmistakable demo data
src/lib/espn/              Isolated ESPN client, normalization, and identity matching
src/types/                 Core domain types
```

## Data identity model

The model deliberately separates:

1. `managers`: permanent human identity, including active/inactive status.
2. `franchises`: stable ESPN team slot identity.
3. `franchise_seasons`: the team’s season-specific name and branding.
4. `manager_seasons`: who controlled a franchise in a particular season.

This preserves former managers, co-owners, ownership changes, and changing team names. Unknown historical ESPN members must be created as inactive managers for review; they must never be silently discarded.

## ESPN import plan

League `273644` began in 2017. The importer should request each season from 2017 through the current year using ESPN’s fantasy API views (`mTeam`, `mRoster`, `mMatchup`, `mSettings`, and `mStatus`). The endpoints are undocumented, so all access is isolated in `src/lib/espn/client.ts`.

The intended pipeline is:

1. Fetch one raw season at a time with retry/backoff and explicit logging.
2. Normalize ESPN response shapes into the stable types in `src/lib/espn/types.ts`.
3. Match member IDs first, then normalized aliases.
4. Flag unmatched people for creation as inactive permanent managers and manual review.
5. Upsert seasons, franchises, season-specific team names, ownership, and matchups transactionally.
6. Derive standings, records, H2H, and championships from normalized matchup data; apply explicit manual overrides only when recorded with `source='manual'`.
7. Store import timestamps and produce a reconciliation report before publishing.

Run the current read-only preview with:

```bash
pnpm import:espn 2017 2025
```

Public leagues may work without cookies. If ESPN later restricts access, set `ESPN_S2` and `ESPN_SWID` locally. Never commit those values. The current script logs normalized counts and identity-review needs but deliberately performs no database writes.

## Deployment

The app is Vercel-compatible. Supabase credentials and deployment are intentionally deferred. When a database is connected, apply `database/schema.sql`, enable appropriate Row Level Security policies, and keep privileged import credentials server-only.
