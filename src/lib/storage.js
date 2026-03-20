import { supabase, isSupabaseConfigured } from './supabase'

const LS_KEY = 'devlog_v2'

function lsLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) {
      const old = localStorage.getItem('devtask_pro_v1')
      if (old) return JSON.parse(old).tasks || []
    }
    return raw ? JSON.parse(raw).tasks || [] : []
  } catch { return [] }
}

function lsSave(tasks) {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ tasks, savedAt: Date.now() })) } catch {}
}

async function sbLoad() {
  const { data, error } = await supabase
    .from('tasks').select('*').order('created_at', { ascending: true })
  if (error) throw error
  return (data || []).map(row => ({
    id: row.id, title: row.title, tag: row.tag, priority: row.priority,
    status: row.status, date: row.date, done: row.done, note: row.note || '',
    pinned: row.pinned || false,
    eta: row.eta || null,
    subtasks: (() => { try { return JSON.parse(row.subtasks || '[]') } catch { return [] } })(),
    createdAt: new Date(row.created_at).getTime(),
  }))
}

// userId is required — Supabase RLS will reject without it
async function sbUpsert(task, userId) {
  if (!userId) {
    console.error('[devlog] saveTask called without userId — skipping')
    return
  }
  const { error } = await supabase.from('tasks').upsert({
    id: task.id,
    title: task.title,
    tag: task.tag,
    priority: task.priority,
    status: task.status,
    date: task.date,
    done: task.done,
    note: task.note || '',
    pinned: task.pinned || false,
    eta: task.eta || null,
    subtasks: JSON.stringify(task.subtasks || []),
    user_id: userId,
    updated_at: new Date().toISOString(),
  })
  if (error) {
    console.error('[devlog] sbUpsert error:', error.message)
    throw error
  }
}

async function sbDelete(id) {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function loadTasks() {
  if (isSupabaseConfigured) return sbLoad()
  return lsLoad()
}

export async function saveTask(task, allTasks, userId) {
  if (isSupabaseConfigured) await sbUpsert(task, userId)
  else lsSave(allTasks)
}

export async function deleteTask(id, allTasks) {
  if (isSupabaseConfigured) await sbDelete(id)
  else lsSave(allTasks)
}

export { isSupabaseConfigured }