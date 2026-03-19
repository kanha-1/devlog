// Notification manager — handles web push + local scheduled reminders

export async function requestPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  const result = await Notification.requestPermission()
  return result
}

export function getPermission() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export function sendNotification(title, body, icon = '/icon-192.png') {
  if (Notification.permission !== 'granted') return
  new Notification(title, { body, icon, badge: '/icon-192.png' })
}

// Schedule a daily reminder at a given hour (24h)
export function scheduleDailyReminder(hour, minute, getTasksFn) {
  // Clear any existing scheduled reminders
  const existing = localStorage.getItem('devlog-reminder-timer')
  if (existing) clearTimeout(parseInt(existing))

  const schedule = () => {
    const now = new Date()
    const next = new Date()
    next.setHours(hour, minute, 0, 0)
    if (next <= now) next.setDate(next.getDate() + 1)
    const ms = next - now

    const id = setTimeout(() => {
      const tasks = getTasksFn()
      const open = tasks.filter(t => !t.done).length
      const today = new Date().toISOString().split('T')[0]
      const todayTasks = tasks.filter(t => t.date === today && !t.done).length
      sendNotification(
        'devlog reminder',
        todayTasks > 0
          ? `You have ${todayTasks} open task${todayTasks > 1 ? 's' : ''} today`
          : 'No tasks yet today — add something to work on',
        '/icon-192.png'
      )
      schedule() // reschedule for next day
    }, ms)

    localStorage.setItem('devlog-reminder-timer', String(id))
  }

  schedule()
}

export function clearReminders() {
  const existing = localStorage.getItem('devlog-reminder-timer')
  if (existing) clearTimeout(parseInt(existing))
  localStorage.removeItem('devlog-reminder-timer')
}

export function getReminderSettings() {
  const raw = localStorage.getItem('devlog-reminder')
  return raw ? JSON.parse(raw) : { enabled: false, hour: 9, minute: 0 }
}

export function saveReminderSettings(settings) {
  localStorage.setItem('devlog-reminder', JSON.stringify(settings))
}
