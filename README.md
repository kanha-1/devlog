# devlog

A personal daily work log built for developers. Track tasks, log your day, generate standups, and review your work history — all in one place, synced across devices.

---

## What is devlog?

devlog is your daily companion as a developer. Instead of forgetting what you worked on or scrambling before a standup, you log tasks as you go — and at any point you can see exactly what you did, when, and how much.

It works like a work journal with structure. Every task belongs to a day. You can flip back to any date, generate a report for last month, or produce a standup message in one click.

---

## Views

### Today
Your main workspace. Shows all tasks for the selected date organised by status.

- **Stats bar** at the top shows total tasks, daily goal progress, tasks in progress, and high priority count
- **Carry over banner** appears automatically if yesterday had unfinished tasks — one click moves them all to today
- **Add a task** using the input bar at the top — press Enter or click Add
- **Pinned tasks** always appear at the top of the list regardless of status

### History
A reverse-chronological list of every day you've logged tasks.

- Click any day to expand and see all tasks
- Each day shows done / open count and a mini progress bar
- Click **open →** on any day to jump directly to it in the Today view

### Report
Generate a work log for any date range you choose.

- Use **presets** (Last 7 days, Last 14 days, Last 30 days, This week) or pick a custom date range
- See a **tag breakdown chart** showing how your time was split across features, bugs, meetings, etc.
- Full **day-by-day breakdown** with every task
- **Copy as markdown** or **download as .md** file — useful for performance reviews, sprint retrospectives, or sharing with your manager

---

## Tasks

### Adding a task
Type in the input bar at the top of the Today view. Select a tag and priority, then press **Enter** or click **+ add**.

### Task statuses
Every task moves through four stages:

| Status | Meaning |
|---|---|
| **Todo** | Not started yet |
| **In Progress** | Actively working on it |
| **In Review** | Waiting for review / PR open |
| **Done** | Completed |

Hover any task and use the **→ wip / → review / → done** buttons to move it between stages. Or check the checkbox to mark it done instantly.

### Tags
Tag every task so you can see how your time is distributed:

| Tag | Use for |
|---|---|
| `feat` | New feature work |
| `bug` | Bug fixes |
| `review` | Code reviews, PR reviews |
| `infra` | DevOps, deployments, config |
| `meet` | Meetings, standups, syncs |
| `doc` | Documentation |
| `other` | Anything else |

### Priority
Set **high / med / low** priority when adding a task. High priority unresolved tasks are highlighted in the stats bar so nothing critical gets missed.

### Notes
Hover a task → click the **note icon** → add context, a PR link, ticket number, or anything useful. Notes appear inline below the task title.

### Subtasks
Break a big task into smaller steps. Hover a task → click **+** → add subtask items and check them off individually. The task shows a `x/y subtasks` counter.

### Pin tasks
Hover a task → click the **pin icon** → the task jumps to the top of the list. Pinned tasks have a subtle amber highlight. Useful for the one thing you absolutely must not forget today.

---

## Daily Goal

Set a daily completion target in the **Daily Goal** stat card. Click the pencil icon to change it. The progress bar fills as you complete tasks and turns green when you hit your goal.

---

## Carry Over

If you have unfinished tasks from yesterday, a banner appears at the top of today's view. Click **carry over** to copy all of them to today in one click. Tasks that already exist in today's list are not duplicated.

---

## Streak Tracker

The sidebar shows your current streak — how many consecutive days you've had at least one completed task. Keep it going.

---

## Standup Generator

Click the **⚡ lightning bolt** in the topbar to open the standup generator. It reads your actual task data and writes:

- **Yesterday** — tasks you completed the day before
- **Today** — tasks currently planned / in progress
- **Blockers** — any high priority open tasks

Copy as plain text for Slack or as markdown for Notion/GitHub.

---

## Day Summary

Click the **list icon** in the topbar to see a clean summary of the current day — all completed tasks and all open tasks. Copy as plain text or markdown. Useful for end-of-day updates to your team.

---

## Calendar

The mini calendar in the sidebar lets you jump to any date. Days with logged tasks show a small teal dot. Use the arrows to navigate between months.

Click any date to open that day in the Today view.

---

## Filter by Tag

Click any tag in the sidebar (Feature, Bug, Review, etc.) to filter the current day's tasks to only show that tag. Click **All** to reset.

---

## Dark / Light Mode

Click the **sun/moon icon** in the topbar to switch between dark and light mode. Your preference is saved automatically.

---

## Notifications

Click the **bell icon** in the topbar to set up daily reminders.

- Enable notifications and grant permission when prompted
- Choose a reminder time (Morning standup, Midday, End of day, or custom)
- Click **Test** to verify notifications are working
- On iPhone, the app must be installed as a PWA first (see below)

---

## iPhone / Mobile

devlog works as a PWA (Progressive Web App) — it installs on your home screen and behaves like a native app.

**To install on iPhone:**
1. Open the app URL in **Safari**
2. Tap the **Share** button (box with arrow)
3. Tap **"Add to Home Screen"**
4. Tap **Add**
5. Open devlog from your home screen
6. Allow notifications when prompted

On mobile, the sidebar is hidden by default. Use the **bottom navigation bar** to switch between Today, History, and Report. Tap **Menu** to open the sidebar with the calendar and tag filters.

---

## Export

Click the **download icon** in the topbar to export all your tasks as a JSON file. This is a full backup of everything — you can re-import or process it however you like.

From the Report view you can also export a specific date range as a formatted markdown file.

---

## Data & Sync

devlog uses **Supabase** as its database. Your tasks are stored in the cloud and sync instantly across all your devices and browsers.

The storage indicator at the bottom of the sidebar shows:
- 🟢 **Supabase · synced** — cloud sync is active
- 🟡 **localStorage · local only** — running without Supabase config, data stays in this browser only