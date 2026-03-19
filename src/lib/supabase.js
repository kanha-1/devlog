import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Will be null if env vars are not set — app falls back to localStorage
export const supabase =
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project')
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export const isSupabaseConfigured = !!supabase

/* ── SQL to run once in Supabase SQL Editor ──────────────────────────────────

create table if not exists tasks (
  id          text primary key,
  title       text not null,
  tag         text not null default 'feat',
  priority    text not null default 'med',
  status      text not null default 'todo',
  date        text not null,
  done        boolean not null default false,
  note        text default '',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Enable row-level security (optional but recommended)
alter table tasks enable row level security;

-- Allow all operations for now (single-user personal app)
create policy "allow all" on tasks for all using (true) with check (true);

────────────────────────────────────────────────────────────────────────────── */
