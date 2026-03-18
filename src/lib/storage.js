import { supabase, isSupabaseConfigured } from './supabase'

const LS_KEY = 'devtask_pro_v1'

// ── localStorage helpers ──────────────────────────────────────────────────────
function lsLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw).tasks || [] : []
  } catch {
    return []
  }
}

function lsSave(tasks) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ tasks, savedAt: Date.now() }))
  } catch {}
}

// ── Supabase helpers ──────────────────────────────────────────────────────────
async function sbLoad() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []).map(row => ({
    id: row.id,
    title: row.title,
    tag: row.tag,
    priority: row.priority,
    status: row.status,
    date: row.date,
    done: row.done,
    note: row.note || '',
    createdAt: new Date(row.created_at).getTime(),
  }))
}

async function sbUpsert(task) {
  const { error } = await supabase.from('tasks').upsert({
    id: task.id,
    title: task.title,
    tag: task.tag,
    priority: task.priority,
    status: task.status,
    date: task.date,
    done: task.done,
    note: task.note || '',
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
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

export async function saveTask(task, allTasks) {
  if (isSupabaseConfigured) {
    await sbUpsert(task)
  } else {
    lsSave(allTasks)
  }
}

export async function deleteTask(id, allTasks) {
  if (isSupabaseConfigured) {
    await sbDelete(id)
  } else {
    lsSave(allTasks)
  }
}

export { isSupabaseConfigured }
