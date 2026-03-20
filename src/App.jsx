import { useState, useEffect, useMemo, useRef } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import Sidebar from "./components/Sidebar"
import Topbar from "./components/Topbar"
import BottomNav from "./components/BottomNav"
import TodayView from "./components/TodayView"
import HistoryView from "./components/HistoryView"
import ReportView from "./components/ReportView"
import SummaryModal from "./components/SummaryModal"
import StandupModal from "./components/StandupModal"
import NotificationSettings from "./components/NotificationSettings"
import LoginScreen from "./components/Loginscreen"
import { loadTasks, saveTask, deleteTask as deleteStorage, isSupabaseConfigured } from "./lib/storage"
import { todayStr, yesterdayStr, uid } from "./lib/utils"
import { getTheme, toggleTheme, applyTheme } from "./lib/theme"
import { scheduleAllReminders, getReminderSettings, scheduleEtaReminders, clearEtaReminders, rescheduleAllEtaReminders } from "./lib/notifications"
import { getSession, onAuthChange, signOut } from "./lib/auth"
import { isSupabaseConfigured as sbConfigured } from "./lib/storage"

export default function App() {
  const [session,           setSession]           = useState(undefined) // undefined = loading
  const [tasks,             setTasks]             = useState([])
  const [loading,           setLoading]           = useState(true)
  const [view,              setView]              = useState('today')
  const [tagFilter,         setTagFilter]         = useState('all')
  const [selectedDate,      setSelectedDate]      = useState(todayStr())
  const [search,            setSearch]            = useState('')
  const [showSummary,       setShowSummary]       = useState(false)
  const [showStandup,       setShowStandup]       = useState(false)
  const [showNotifSettings, setShowNotifSettings] = useState(false)
  const [sidebarOpen,       setSidebarOpen]       = useState(false)
  const [theme,             setTheme]             = useState(getTheme())
  const [showMobileSearch,  setShowMobileSearch]  = useState(false)

  useEffect(() => { applyTheme(theme) }, [])

  // Auth state
  useEffect(() => {
    if (!sbConfigured) {
      setSession(null) // no supabase — skip auth
      return
    }
    getSession().then(s => setSession(s))
    const { data: { subscription } } = onAuthChange(s => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  // Load tasks once session is known
  // Load tasks once — only when session user ID actually changes
const prevUserIdRef = useRef(undefined)

useEffect(() => {
  if (session === undefined) return

  const newUserId = session?.user?.id || null

  // Skip if same user — prevents reload on tab focus/Supabase reconnect
  if (prevUserIdRef.current === newUserId) return
  prevUserIdRef.current = newUserId

  setLoading(true)
  loadTasks()
    .then(data => {
      setTasks(data)
      const s = getReminderSettings()
      if (Object.values(s).some(r => r.enabled)) scheduleAllReminders(s)
      rescheduleAllEtaReminders(data)
    })
    .catch(() => setTasks([]))
    .finally(() => setLoading(false))
}, [session])

  const userId = session?.user?.id || null

  const handleToggleTheme = () => { const next = toggleTheme(); setTheme(next) }

  // Mutations
  const addTask = async ({ title, tag, priority, eta }) => {
    const task = { id: uid(), title, tag, priority, status: 'todo', date: selectedDate, done: false, note: '', pinned: false, subtasks: [], eta: eta || null, createdAt: Date.now() }
    const next = [...tasks, task]
    setTasks(next); await saveTask(task, next, userId)
    if (task.eta) scheduleEtaReminders(task)
  }

  const toggleDone = async id => {
    const next = tasks.map(t => t.id === id ? { ...t, done: !t.done, status: !t.done ? 'done' : 'todo' } : t)
    setTasks(next); await saveTask(next.find(t => t.id === id), next, userId)
  }

  const setStatus = async (id, status) => {
    const next = tasks.map(t => t.id === id ? { ...t, status, done: status === 'done' } : t)
    setTasks(next); await saveTask(next.find(t => t.id === id), next, userId)
  }

  const deleteTask = async id => {
    const next = tasks.filter(t => t.id !== id)
    setTasks(next); await deleteStorage(id, next)
  }

  const saveNote = async (id, note) => {
    const next = tasks.map(t => t.id === id ? { ...t, note } : t)
    setTasks(next); await saveTask(next.find(t => t.id === id), next, userId)
  }

  const editTitle = async (id, title) => {
    const next = tasks.map(t => t.id === id ? { ...t, title } : t)
    setTasks(next); await saveTask(next.find(t => t.id === id), next, userId)
  }

  const togglePin = async id => {
    const next = tasks.map(t => t.id === id ? { ...t, pinned: !t.pinned } : t)
    setTasks(next); await saveTask(next.find(t => t.id === id), next, userId)
  }

  const updateSubtasks = async (id, subtasks) => {
    const next = tasks.map(t => t.id === id ? { ...t, subtasks } : t)
    setTasks(next); await saveTask(next.find(t => t.id === id), next, userId)
  }

  const updateEta = async (id, eta) => {
    clearEtaReminders(id)
    const next = tasks.map(t => t.id === id ? { ...t, eta } : t)
    setTasks(next)
    const updated = next.find(t => t.id === id)
    await saveTask(updated, next, userId)
    if (eta) scheduleEtaReminders(updated)
  }

  const carryOver = async () => {
    const yesterday = yesterdayStr()
    const pending = tasks.filter(t => t.date === yesterday && !t.done)
    const alreadyCarried = new Set(tasks.filter(t => t.date === todayStr()).map(t => t.title))
    const toAdd = pending.filter(t => !alreadyCarried.has(t.title)).map(t => ({
      ...t, id: uid(), date: todayStr(), done: false, status: 'todo', createdAt: Date.now()
    }))
    if (!toAdd.length) {
      // Nothing new to carry — just mark yesterday tasks as carried to hide banner
      const marked = tasks.map(t =>
        t.date === yesterday && !t.done ? { ...t, carried: true } : t
      )
      setTasks(marked)
      await Promise.all(marked.filter(t => t.date === yesterday && t.carried).map(t => saveTask(t, marked)))
      return
    }
    // Mark yesterday tasks as carried + add copies to today
    const marked = tasks.map(t =>
      t.date === yesterday && !t.done ? { ...t, carried: true } : t
    )
    const next = [...marked, ...toAdd]
    setTasks(next)
    await Promise.all([
      ...marked.filter(t => t.date === yesterday && t.carried).map(t => saveTask(t, next)),
      ...toAdd.map(t => saveTask(t, next))
    ])
  }

  const filteredTasks = useMemo(() => {
    let t = tasks.filter(x => x.date === selectedDate)
    if (tagFilter !== 'all') t = t.filter(x => x.tag === tagFilter)
    if (search.trim()) t = t.filter(x =>
      x.title.toLowerCase().includes(search.toLowerCase()) ||
      (x.note||'').toLowerCase().includes(search.toLowerCase())
    )
    return t
  }, [tasks, selectedDate, tagFilter, search])

  const yesterdayPendingCount = useMemo(() =>
    tasks.filter(t => t.date === yesterdayStr() && !t.done).length
  , [tasks])

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ tasks, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `devlog-export-${todayStr()}.json`; a.click()
  }

  // Still checking auth
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-faint text-xs animate-pulse">loading...</div>
      </div>
    )
  }

  // Not logged in and Supabase is configured — show login
  if (!session && sbConfigured) {
    return <LoginScreen />
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen overflow-hidden bg-primary">
        <Sidebar
          view={view} tagFilter={tagFilter} selectedDate={selectedDate}
          tasks={tasks} isSupabase={isSupabaseConfigured}
          session={session}
          onViewChange={setView} onTagFilter={setTagFilter}
          onSelectDate={d => { setSelectedDate(d); setView('today') }}
          mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)}
          onSignOut={signOut}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar
            selectedDate={selectedDate} tasks={tasks} view={view}
            search={search} onSearch={setSearch}
            onSummary={() => setShowSummary(true)}
            onStandup={() => setShowStandup(true)}
            onExport={exportData} theme={theme}
            onToggleTheme={handleToggleTheme}
            onOpenSettings={() => setShowNotifSettings(true)}
          />

          {showMobileSearch && (
            <div className="md:hidden px-4 py-2 border-b border-subtle bg-primary animate-slide-up">
              <input autoFocus
                className="w-full h-8 rounded-lg border border-subtle bg-surface px-3 text-xs text-primary placeholder:text-faint focus:outline-none focus:border-subtle-hover"
                placeholder="search tasks..." value={search}
                onChange={e => setSearch(e.target.value)}
                onBlur={() => { if (!search) setShowMobileSearch(false) }}
              />
            </div>
          )}

          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
            {view === 'today' && (
              <TodayView
                tasks={filteredTasks} loading={loading}
                onAdd={addTask} onToggle={toggleDone} onStatusChange={setStatus}
                onDelete={deleteTask} onSaveNote={saveNote}
                onTogglePin={togglePin} onUpdateSubtasks={updateSubtasks}
                onEditTitle={editTitle} onUpdateEta={updateEta} onCarryOver={carryOver}
                yesterdayPendingCount={selectedDate === todayStr() ? yesterdayPendingCount : 0}
              />
            )}
            {view === 'history' && (
              <HistoryView
                tasks={search ? tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase())) : tasks}
                onJump={d => { setSelectedDate(d); setView('today') }}
              />
            )}
            {view === 'report' && <ReportView tasks={tasks} />}
          </main>
        </div>

        <BottomNav view={view} tasks={tasks} onViewChange={setView}
          onMenuOpen={() => setSidebarOpen(true)}
          onSearchOpen={() => setShowMobileSearch(s => !s)}
        />

        <SummaryModal date={selectedDate} tasks={tasks.filter(t => t.date === selectedDate)}
          open={showSummary} onClose={() => setShowSummary(false)} />
        <StandupModal open={showStandup} onClose={() => setShowStandup(false)} tasks={tasks} />
        <NotificationSettings open={showNotifSettings} onClose={() => setShowNotifSettings(false)} getTasks={() => tasks} />
      </div>
    </TooltipProvider>
  )
}