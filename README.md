# devlog — Personal Daily Work Log

Dark-themed React app to track your work as a developer.
Built with React + Vite + Tailwind CSS + shadcn/ui + Supabase.

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Supabase
```bash
cp .env.example .env
```
Fill in your Supabase URL and anon key in `.env`.

Run this SQL once in your Supabase SQL Editor:
```sql
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
alter table tasks enable row level security;
create policy "allow all" on tasks for all using (true) with check (true);
```

### 3. Run
```bash
npm run dev
```

Open http://localhost:5173

---

## Build for production
```bash
npm run build
```
Deploy the `dist/` folder to Vercel or Netlify.

---

## Tech Stack
- React 18 + Vite 5
- Tailwind CSS v3
- shadcn/ui (Radix UI primitives)
- Supabase JS v2
- Lucide React icons
- JetBrains Mono + Syne (Google Fonts)
