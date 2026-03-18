import { useState, useEffect, useMemo } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import Sidebar from "./components/Sidebar"
import Topbar from "./components/Topbar"
import TodayView from "./components/TodayView"
import HistoryView from "./components/HistoryView"
import SummaryModal from "./components/SummaryModal"
import { loadTasks, saveTask, deleteTask as deleteStorage, isSupabaseConfigured } from "./lib/storage"
import { todayStr, uid } from "./lib/utils"

export default function App() {
  const [tasks,        setTasks]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [view,         setView]         = useState('today')
  const [tagFilter,    setTagFilter]    = useState('all')
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [search,       setSearch]       = useState('')
  const [showSummary,  setShowSummary]  = useState(false)

  // Load
  useEffect(() => {
    loadTasks()
      .then(data => setTasks(data))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false))
  }, [])

  // Mutations
  const addTask = async ({ title, tag, priority }) => {
    const task = { id: uid(), title, tag, priority, status: 'todo', date: selectedDate, done: false, note: '', createdAt: Date.now() }
    const next = [...tasks, task]
    setTasks(next)
    await saveTask(task, next)
  }

  const toggleDone = async id => {
    const next = tasks.map(t => t.id === id ? { ...t, done: !t.done, status: !t.done ? 'done' : 'todo' } : t)
    setTasks(next)
    await saveTask(next.find(t => t.id === id), next)
  }

  const setStatus = async (id, status) => {
    const next = tasks.map(t => t.id === id ? { ...t, status, done: status === 'done' } : t)
    setTasks(next)
    await saveTask(next.find(t => t.id === id), next)
  }

  const deleteTask = async id => {
    const next = tasks.filter(t => t.id !== id)
    setTasks(next)
    await deleteStorage(id, next)
  }

  const saveNote = async (id, note) => {
    const next = tasks.map(t => t.id === id ? { ...t, note } : t)
    setTasks(next)
    await saveTask(next.find(t => t.id === id), next)
  }

  // Filtered tasks for today view
  const filteredTasks = useMemo(() => {
    let t = tasks.filter(x => x.date === selectedDate)
    if (tagFilter !== 'all') t = t.filter(x => x.tag === tagFilter)
    if (search.trim()) t = t.filter(x =>
      x.title.toLowerCase().includes(search.toLowerCase()) ||
      (x.note||'').toLowerCase().includes(search.toLowerCase())
    )
    return t
  }, [tasks, selectedDate, tagFilter, search])

  // Export
  const exportData = () => {
    const blob = new Blob([JSON.stringify({ tasks, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `devlog-export-${todayStr()}.json`
    a.click()
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen overflow-hidden bg-base-900">
        <Sidebar
          view={view}
          tagFilter={tagFilter}
          selectedDate={selectedDate}
          tasks={tasks}
          isSupabase={isSupabaseConfigured}
          onViewChange={setView}
          onTagFilter={setTagFilter}
          onSelectDate={d => { setSelectedDate(d); setView('today') }}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar
            selectedDate={selectedDate}
            tasks={tasks}
            view={view}
            search={search}
            onSearch={setSearch}
            onSummary={() => setShowSummary(true)}
            onExport={exportData}
          />

          <main className="flex-1 overflow-y-auto p-6">
            {view === 'today' ? (
              <TodayView
                tasks={filteredTasks}
                loading={loading}
                onAdd={addTask}
                onToggle={toggleDone}
                onStatusChange={setStatus}
                onDelete={deleteTask}
                onSaveNote={saveNote}
              />
            ) : (
              <HistoryView
                tasks={search ? tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase())) : tasks}
                onJump={d => { setSelectedDate(d); setView('today') }}
              />
            )}
          </main>
        </div>

        <SummaryModal
          date={selectedDate}
          tasks={tasks.filter(t => t.date === selectedDate)}
          open={showSummary}
          onClose={() => setShowSummary(false)}
        />
      </div>
    </TooltipProvider>
  )
}
