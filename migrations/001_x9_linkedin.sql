-- 16x9 LinkedIn desk. Field-for-field clone of Frontier Desk
-- private.fd_linkedin_page_posts and private.fd_linkedin_page_visuals,
-- plus the destination column and per-target delivery rows.
--
-- Ecosystem: 318b5ffd-6706-492f-912b-37ed4bc28a55
-- Drafter key: li-page:<note_id>
-- Visual key:  li-visual:<post_id>
-- Target id:   <post_id>:<target>
--
-- This file is the table definition. It does not connect to Mycel and it
-- contains no credentials. Apply it in the 16x9 ecosystem when that write
-- is approved. Do not point it at a Frontier Desk database.

create table if not exists x9_linkedin_page_posts (
  id uuid primary key,
  note_id uuid not null,
  note_title text not null default '',
  note_url text not null default '',
  draft_text text not null default '',
  final_text text,
  status text not null default 'drafted'
    check (status in ('drafted', 'approved', 'rejected', 'published', 'failed')),
  destination text not null default 'neither'
    check (destination in ('company', 'personal', 'both', 'neither')),
  decided_by text,
  decided_at timestamptz,
  post_urn text,
  published_at timestamptz,
  error text,
  idempotency_key text not null,
  source_run text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists x9_linkedin_page_posts_idempotency
  on x9_linkedin_page_posts (idempotency_key);

create table if not exists x9_linkedin_page_visuals (
  id uuid primary key,
  post_id uuid not null unique references x9_linkedin_page_posts (id),
  note_id uuid not null,
  kind text not null
    check (kind in ('spec', 'unsupported_type', 'unsupported_layout')),
  spec jsonb,
  reason text,
  idempotency_key text not null,
  source_run text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists x9_linkedin_page_visuals_idempotency
  on x9_linkedin_page_visuals (idempotency_key);

create table if not exists x9_linkedin_page_targets (
  id text primary key,
  post_id uuid not null references x9_linkedin_page_posts (id),
  target text not null check (target in ('company', 'personal')),
  status text not null default 'approved'
    check (status in ('approved', 'published', 'failed')),
  final_text text not null,
  image_version text not null default '',
  post_urn text,
  published_at timestamptz,
  error text,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, target)
);

create table if not exists x9_intel_articles (
  id uuid primary key,
  slug text not null unique,
  title text not null,
  dek text not null default '',
  body text not null,
  sources jsonb not null default '[]',
  status text not null default 'draft'
    check (status in ('draft', 'published', 'withheld')),
  audience text not null default 'private'
    check (audience in ('public', 'private')),
  published_at timestamptz,
  idempotency_key text not null unique,
  source_run text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
