import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { RefreshCw } from "lucide-react"
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
import ToastContainer, { toast } from "./components/Toast"
import ScratchpadView from "./components/ScratchpadView"
import { loadTasks, saveTask, deleteTask as deleteStorage, isSupabaseConfigured } from "./lib/storage"
import { todayStr, yesterdayStr, uid } from "./lib/utils"
import { getTheme, toggleTheme, applyTheme } from "./lib/theme"
import { scheduleAllReminders, getReminderSettings, scheduleEtaReminders, clearEtaReminders, rescheduleAllEtaReminders } from "./lib/notifications"
import { getSession, onAuthChange, signOut } from "./lib/auth"
import { isSupabaseConfigured as sbConfigured } from "./lib/storage"

export default function App() {
  const [session,           setSession]           = useState(undefined)
  const [tasks,             setTasks]             = useState([])
  const [loading,           setLoading]           = useState(true)
  const [refreshing,        setRefreshing]        = useState(false)
  const [isOffline,         setIsOffline]         = useState(!navigator.onLine)
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

  const prevUserIdRef  = useRef(undefined)
  const lastVisibleRef = useRef(Date.now())

  useEffect(() => { applyTheme(theme) }, [])

  // ── Online / offline detection ──────────────────────────────────────────────
  useEffect(() => {
    const goOnline  = () => { setIsOffline(false); toast.success("Back online — syncing..."); fetchTasks() }
    const goOffline = () => { setIsOffline(true);  toast.offline("You're offline — changes won't save") }
    window.addEventListener('online',  goOnline)
    window.addEventListener('offline', goOffline)
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline) }
  }, [])

  // ── Auth state ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sbConfigured) { setSession(null); return }
    getSession().then(s => setSession(s))
    const { data: { subscription } } = onAuthChange(s => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  // ── Load tasks (only when user actually changes) ────────────────────────────
  const fetchTasks = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    try {
      const data = await loadTasks()
      setTasks(data)
      const s = getReminderSettings()
      if (Object.values(s).some(r => r.enabled)) scheduleAllReminders(s)
      rescheduleAllEtaReminders(data)
    } catch (err) {
      toast.error("Failed to load tasks — check your connection")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (session === undefined) return
    const newUserId = session?.user?.id || null
    if (prevUserIdRef.current === newUserId) return
    prevUserIdRef.current = newUserId
    setLoading(true)
    fetchTasks()
  }, [session])

  // ── Auto-refresh on tab focus if away > 5 mins ──────────────────────────────
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        lastVisibleRef.current = Date.now()
      } else {
        const awayMs = Date.now() - lastVisibleRef.current
        if (awayMs > 5 * 60 * 1000) { // 5 minutes
          toast.success("Welcome back — refreshing tasks...")
          fetchTasks(true)
        }
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [fetchTasks])

  const userId = session?.user?.id || null
  const handleToggleTheme = () => { const next = toggleTheme(); setTheme(next) }

  // ── Mutations ───────────────────────────────────────────────────────────────
  const addTask = async ({ title, tag, priority, eta }) => {
    const task = { id: uid(), title, tag, priority, status: 'todo', date: selectedDate, done: false, note: '', pinned: false, subtasks: [], eta: eta || null, createdAt: Date.now() }
    const next = [...tasks, task]
    setTasks(next)
    try {
      await saveTask(task, next, userId)
      if (task.eta) scheduleEtaReminders(task)
    } catch { toast.error("Failed to save task — check your connection") }
  }

  const toggleDone = async id => {
    const next = tasks.map(t => t.id === id ? { ...t, done: !t.done, status: !t.done ? 'done' : 'todo' } : t)
    setTasks(next)
    try { await saveTask(next.find(t => t.id === id), next, userId) }
    catch { toast.error("Failed to update task"); setTasks(tasks) }
  }

  const setStatus = async (id, status) => {
    const next = tasks.map(t => t.id === id ? { ...t, status, done: status === 'done' } : t)
    setTasks(next)
    try { await saveTask(next.find(t => t.id === id), next, userId) }
    catch { toast.error("Failed to update status"); setTasks(tasks) }
  }

  const deleteTask = async id => {
    const prev = tasks
    const next = tasks.filter(t => t.id !== id)
    setTasks(next)
    try { await deleteStorage(id, next) }
    catch { toast.error("Failed to delete task"); setTasks(prev) }
  }

  const saveNote = async (id, note) => {
    const next = tasks.map(t => t.id === id ? { ...t, note } : t)
    setTasks(next)
    try { await saveTask(next.find(t => t.id === id), next, userId) }
    catch { toast.error("Failed to save note") }
  }

  const editTitle = async (id, title) => {
    const next = tasks.map(t => t.id === id ? { ...t, title } : t)
    setTasks(next)
    try { await saveTask(next.find(t => t.id === id), next, userId) }
    catch { toast.error("Failed to update title") }
  }

  const togglePin = async id => {
    const next = tasks.map(t => t.id === id ? { ...t, pinned: !t.pinned } : t)
    setTasks(next)
    try { await saveTask(next.find(t => t.id === id), next, userId) }
    catch { toast.error("Failed to update pin") }
  }

  const updateSubtasks = async (id, subtasks) => {
    const next = tasks.map(t => t.id === id ? { ...t, subtasks } : t)
    setTasks(next)
    try { await saveTask(next.find(t => t.id === id), next, userId) }
    catch { toast.error("Failed to update subtasks") }
  }

  const updateEta = async (id, eta) => {
    clearEtaReminders(id)
    const next = tasks.map(t => t.id === id ? { ...t, eta } : t)
    setTasks(next)
    const updated = next.find(t => t.id === id)
    try {
      await saveTask(updated, next, userId)
      if (eta) scheduleEtaReminders(updated)
    } catch { toast.error("Failed to update ETA") }
  }

  const carryOver = async () => {
    const today          = todayStr()
    const todayTasks     = tasks.filter(t => t.date === today)
    const pending        = tasks.filter(t => t.date < today && !t.done && !t.carried)
    const existingTitles = new Set(todayTasks.map(t => t.title.trim().toLowerCase()))
    const toCarry = pending.filter(t => !existingTitles.has(t.title.trim().toLowerCase()))

    if (!toCarry.length) {
      toast.success("Nothing new to carry over")
      return
    }

    // Mark original past tasks as carried (so banner won't show them again)
    const markedOriginals = tasks.map(t =>
      toCarry.find(c => c.id === t.id) ? { ...t, carried: true } : t
    )

    // Create fresh copies for today
    const newCopies = toCarry.map(t => ({
      ...t,
      id: uid(),
      date: today,
      done: false,
      status: 'todo',
      carried: false,
      createdAt: Date.now()
    }))

    const next = [...markedOriginals, ...newCopies]
    setTasks(next)
    try {
      await Promise.all([
        ...toCarry.map(t => saveTask({ ...t, carried: true }, next, userId)),
        ...newCopies.map(t => saveTask(t, next, userId)),
      ])
      toast.success(`${newCopies.length} task${newCopies.length > 1 ? 's' : ''} carried over`)
    } catch { toast.error("Failed to carry over tasks") }
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

  const pastPendingCount = useMemo(() =>
    tasks.filter(t => t.date < todayStr() && !t.done && !t.carried).length
  , [tasks])

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ tasks, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `devlog-export-${todayStr()}.json`; a.click()
  }

  // ── Auth loading ────────────────────────────────────────────────────────────
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-faint text-xs animate-pulse">loading...</div>
      </div>
    )
  }

  if (!session && sbConfigured) return <LoginScreen />

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen overflow-hidden bg-primary">
        <Sidebar
          view={view} tagFilter={tagFilter} selectedDate={selectedDate}
          tasks={tasks} isSupabase={isSupabaseConfigured} session={session}
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
            isOffline={isOffline}
            isRefreshing={refreshing}
            onRefresh={() => fetchTasks(true)}
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
                onEditTitle={editTitle} onUpdateEta={updateEta}
                onCarryOver={carryOver}
                yesterdayPendingCount={selectedDate === todayStr() ? pastPendingCount : 0}
              />
            )}
            {view === 'history' && (
              <HistoryView
                tasks={search ? tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase())) : tasks}
                onJump={d => { setSelectedDate(d); setView('today') }}
              />
            )}
            {view === 'report'      && <ReportView tasks={tasks} />}
            {view === 'scratchpad'  && <ScratchpadView />}
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
        <ToastContainer />
      </div>
    </TooltipProvider>
  )
}