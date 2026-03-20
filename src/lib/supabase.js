import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase =
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project')
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export const isSupabaseConfigured = !!supabase

/* ── STEP 1: Run this SQL in Supabase SQL Editor ─────────────────────────────

-- Add user_id column
alter table tasks add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table tasks add column if not exists pinned boolean not null default false;
alter table tasks add column if not exists subtasks text default '[]';

-- Drop old open policy
drop policy if exists "allow all" on tasks;

-- New per-user policies
create policy "select own tasks"
  on tasks for select using (auth.uid() = user_id);

create policy "insert own tasks"
  on tasks for insert with check (auth.uid() = user_id);

create policy "update own tasks"
  on tasks for update using (auth.uid() = user_id);

create policy "delete own tasks"
  on tasks for delete using (auth.uid() = user_id);

────────────────────────────────────────────────────────────────────────────────

── STEP 2: Enable GitHub OAuth in Supabase ──────────────────────────────────

1. Go to Supabase → Authentication → Providers → GitHub → Enable
2. Go to github.com/settings/developers → New OAuth App
   - Homepage URL: your app URL (e.g. http://localhost:5173)
   - Callback URL: https://YOUR_PROJECT.supabase.co/auth/v1/callback
3. Copy Client ID + Client Secret → paste into Supabase GitHub provider settings
4. Save

────────────────────────────────────────────────────────────────────────────── */