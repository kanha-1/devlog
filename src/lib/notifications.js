// ── Notification permission ───────────────────────────────────────────────────
export async function requestPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return await Notification.requestPermission()
}

export function getPermission() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export function sendNotification(title, body, icon = '/icon-192.png') {
  if (Notification.permission !== 'granted') return
  try {
    // Use service worker if available (works when tab not focused)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION', title, body, icon
      })
    } else {
      new Notification(title, { body, icon, badge: '/icon-192.png' })
    }
  } catch (e) {
    console.warn('[devlog] notification error:', e)
  }
}

// ── Settings ──────────────────────────────────────────────────────────────────
const DEFAULTS = {
  morning:  { enabled: true,  hour: 9,  minute: 0,  label: 'Morning kickoff'  },
  midday:   { enabled: true,  hour: 12, minute: 30, label: 'Midday check-in'  },
  evening:  { enabled: true,  hour: 18, minute: 0,  label: 'End of day wrap'  },
}

export function getReminderSettings() {
  try {
    const raw = localStorage.getItem('devlog-reminders-v2')
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {}
  return { ...DEFAULTS }
}

export function saveReminderSettings(settings) {
  localStorage.setItem('devlog-reminders-v2', JSON.stringify(settings))
}

// ── Smart message builder ─────────────────────────────────────────────────────
function todayStr() {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0')
}

function yesterdayStr() {
  const d = new Date(); d.setDate(d.getDate()-1)
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0')
}

function buildMorningMessage(tasks) {
  const today     = todayStr()
  const yesterday = yesterdayStr()
  const carriedOver = tasks.filter(t => t.date === yesterday && !t.done).length
  const todayTasks  = tasks.filter(t => t.date === today).length

  if (carriedOver > 0)
    return `${carriedOver} unfinished task${carriedOver > 1 ? 's' : ''} from yesterday waiting. Let's clear them!`
  if (todayTasks > 0)
    return `You already have ${todayTasks} task${todayTasks > 1 ? 's' : ''} lined up. Let's get started!`
  return "Fresh day, fresh start. What are you working on today?"
}

function buildMiddayMessage(tasks) {
  const today    = todayStr()
  const todayAll = tasks.filter(t => t.date === today)
  const done     = todayAll.filter(t => t.done).length
  const total    = todayAll.length

  if (total === 0)
    return "Hey, you haven't logged anything yet today. Everything okay? 👀"
  if (done === 0)
    return `You have ${total} open task${total > 1 ? 's' : ''} and none done yet. Making progress? 💪`
  if (done === total)
    return `All ${total} tasks done before noon?! You're on fire 🔥`
  return `Nice — ${done}/${total} done so far. Keep the momentum going!`
}

function buildEveningMessage(tasks) {
  const today = todayStr()
  const goal  = parseInt(localStorage.getItem('devlog-daily-goal') || '5')
  const done  = tasks.filter(t => t.date === today && t.done).length
  const total = tasks.filter(t => t.date === today).length

  if (total === 0)
    return "Nothing logged today. Add a quick note before you close out? 📝"
  if (done === 0)
    return `${total} task${total > 1 ? 's' : ''} open, none completed. Tomorrow is a new chance 🌅`
  if (done >= goal)
    return `Goal crushed! ${done} tasks done, goal was ${goal}. Great work today 🎯`
  return `Day's done — ${done}/${total} tasks completed. Well done!`
}

// ── Scheduler ─────────────────────────────────────────────────────────────────
const timers = {}

function msUntil(hour, minute) {
  const now  = new Date()
  const next = new Date()
  next.setHours(hour, minute, 0, 0)
  if (next <= now) next.setDate(next.getDate() + 1)
  return next - now
}

function scheduleOne(key, hour, minute, getMsg) {
  if (timers[key]) clearTimeout(timers[key])

  const fire = () => {
    const tasks = getTasksFromStorage()
    const msg   = getMsg(tasks)
    const labels = { morning: '🌅 devlog', midday: '☀️ devlog', evening: '🌙 devlog' }
    sendNotification(labels[key] || 'devlog', msg)
    // reschedule for tomorrow
    timers[key] = setTimeout(fire, msUntil(hour, minute))
  }

  timers[key] = setTimeout(fire, msUntil(hour, minute))
}

function getTasksFromStorage() {
  try {
    const raw = localStorage.getItem('devlog_v2')
    return raw ? JSON.parse(raw).tasks || [] : []
  } catch { return [] }
}

export function scheduleAllReminders(settings) {
  // Clear all existing
  Object.values(timers).forEach(t => clearTimeout(t))

  if (settings.morning?.enabled)
    scheduleOne('morning', settings.morning.hour, settings.morning.minute, buildMorningMessage)

  if (settings.midday?.enabled)
    scheduleOne('midday', settings.midday.hour, settings.midday.minute, buildMiddayMessage)

  if (settings.evening?.enabled)
    scheduleOne('evening', settings.evening.hour, settings.evening.minute, buildEveningMessage)
}

export function clearAllReminders() {
  Object.values(timers).forEach(t => clearTimeout(t))
  Object.keys(timers).forEach(k => delete timers[k])
}

// Keep old API working
export function scheduleDailyReminder() {}
export function clearReminders() { clearAllReminders() }

// ── ETA Reminders ─────────────────────────────────────────────────────────────
const etaTimers = {} // taskId → [timeoutId, ...]

export function scheduleEtaReminders(task) {
  clearEtaReminders(task.id)
  if (!task.eta || task.done) return

  const eta     = new Date(task.eta)
  const now     = new Date()
  if (eta <= now) return // already past

  const title24 = `⏰ ETA tomorrow`
  const title2  = `🔥 ETA in 2 hours`
  const title0  = `⚠️ ETA reached`

  const body = (prefix) =>
    `${prefix} — "${task.title}" (${task.status === 'inprogress' ? 'in progress' : task.status})`

  const ids = []

  const ms24 = eta - now - 24 * 60 * 60 * 1000
  if (ms24 > 0)
    ids.push(setTimeout(() => sendNotification(title24, body('Due tomorrow')), ms24))

  const ms2 = eta - now - 2 * 60 * 60 * 1000
  if (ms2 > 0)
    ids.push(setTimeout(() => sendNotification(title2, body('Due in 2 hours')), ms2))

  const ms0 = eta - now
  if (ms0 > 0)
    ids.push(setTimeout(() => sendNotification(title0, body("Time's up! Not marked done yet")), ms0))

  etaTimers[task.id] = ids
}

export function clearEtaReminders(taskId) {
  if (etaTimers[taskId]) {
    etaTimers[taskId].forEach(id => clearTimeout(id))
    delete etaTimers[taskId]
  }
}

export function rescheduleAllEtaReminders(tasks) {
  tasks.forEach(t => scheduleEtaReminders(t))
}

// ── ETA display helpers ───────────────────────────────────────────────────────
export function etaStatus(etaStr) {
  if (!etaStr) return null
  const eta  = new Date(etaStr)
  const now  = new Date()
  const diff = eta - now
  const abs  = Math.abs(diff)

  const mins  = Math.floor(abs / 60000)
  const hours = Math.floor(abs / 3600000)
  const days  = Math.floor(abs / 86400000)

  let label, color

  if (diff < 0) {
    // Overdue
    if (mins < 60)       label = `overdue ${mins}m ago`
    else if (hours < 24) label = `overdue ${hours}h ago`
    else                 label = `overdue ${days}d ago`
    color = 'overdue'
  } else if (diff < 2 * 3600000) {
    // Under 2 hours
    if (mins < 60) label = `due in ${mins}m`
    else           label = `due in ${hours}h`
    color = 'urgent'
  } else if (diff < 24 * 3600000) {
    label = `due in ${hours}h`
    color = 'soon'
  } else if (days === 1) {
    label = 'due tomorrow'
    color = 'upcoming'
  } else {
    label = `due in ${days}d`
    color = 'upcoming'
  }

  return { label, color, eta }
}