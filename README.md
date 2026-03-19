# devlog — Personal Daily Work Log

Dark/light themed React app to track your daily work as a developer.
**React + Vite + Tailwind CSS + shadcn/ui + Supabase + PWA**

---

## Quick Start

```bash
npm install
cp .env.example .env   # fill in your Supabase URL + anon key
npm run dev
```

Open http://localhost:5173

---

## Supabase setup

Run once in your Supabase SQL Editor:

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

---

## Install as PWA on iPhone

1. Build first: `npm run build`
2. Deploy to Vercel/Netlify (drag the `dist/` folder)
3. Open the deployed URL in **Safari on iPhone**
4. Tap the **Share** button → **"Add to Home Screen"**
5. Tap **Add** — devlog installs like a native app
6. Open from home screen → allow notifications when prompted

> Requires iOS 16.4+ for push notifications

---

## Features

| Feature | Details |
|---|---|
| Dark + Light mode | Toggle in topbar, persists to localStorage |
| Mobile responsive | Sidebar drawer on mobile, bottom nav bar |
| PWA | Installs on iPhone/Android, works offline |
| Notifications | Daily reminders at custom time, iOS 16.4+ |
| Date-wise tasks | Mini calendar, jump between any day |
| 4 task statuses | Todo → In Progress → In Review → Done |
| Tags | feat / bug / review / infra / meet / doc / other |
| Notes per task | Add context or PR links inline |
| Day summary | Copy as plain text or markdown for standups |
| History view | All days with stats, expandable |
| Supabase sync | Tasks sync across all devices |
| Export JSON | Full data backup anytime |

---

## Build for production

```bash
npm run build
```

Deploy `dist/` to Vercel or Netlify for a permanent URL.
The PWA service worker and offline caching is automatically configured.

---

## Tech Stack

- React 18 + Vite 5
- Tailwind CSS v3
- shadcn/ui (Radix UI primitives — Dialog, Tooltip, etc.)
- Lucide React icons
- Supabase JS v2
- vite-plugin-pwa + Workbox
- JetBrains Mono + Syne (Google Fonts)
