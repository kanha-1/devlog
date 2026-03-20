import { useState } from "react"
import { ArrowLeftRight, Target, Edit2, Check } from "lucide-react"
import AddTaskBar from "./AddTaskBar"
import TaskItem from "./TaskItem"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { STATUS_META, getDailyGoal, setDailyGoal, cn } from "@/lib/utils"

const SECTIONS = [
  { key: 'inprogress', label: 'in progress' },
  { key: 'todo',       label: 'todo'        },
  { key: 'review',     label: 'in review'   },
  { key: 'done',       label: 'done'        },
]

export default function TodayView({ tasks, loading, onAdd, onToggle, onStatusChange, onDelete, onSaveNote, onTogglePin, onUpdateSubtasks, onEditTitle, onUpdateEta, onCarryOver, yesterdayPendingCount }) {
  const [goal,      setGoal]      = useState(getDailyGoal())
  const [editGoal,  setEditGoal]  = useState(false)
  const [goalInput, setGoalInput] = useState(String(getDailyGoal()))

  const total    = tasks.length
  const done     = tasks.filter(t => t.done).length
  const inprog   = tasks.filter(t => t.status === 'inprogress').length
  const highOpen = tasks.filter(t => t.priority === 'high' && !t.done).length
  const pct      = total ? Math.round(done/total*100) : 0
  const goalPct  = Math.min(100, Math.round(done/goal*100))

  const saveGoal = () => {
    const n = Math.max(1, parseInt(goalInput) || 5)
    setGoal(n); setDailyGoal(n); setGoalInput(String(n)); setEditGoal(false)
  }

  // Sort: pinned first, then by section order
  const pinnedTasks = tasks.filter(t => t.pinned && !t.done)
  const sectionTasks = (key) => tasks.filter(t => t.status === key && !t.pinned)
  const doneTasks = tasks.filter(t => t.status === 'done')

  return (
    <div className="animate-fade-in">
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="rounded-xl border border-subtle bg-card px-4 py-3">
          <p className="text-xs text-faint uppercase tracking-widest mb-1.5">total tasks</p>
          <p className="font-display text-3xl font-bold tracking-tight text-primary">{total}</p>
          <div className="mt-2 h-0.5 rounded-full bg-elevated overflow-hidden">
            <div className="h-full bg-green-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-faint mt-1">{pct}% complete</p>
        </div>

        {/* Daily goal card */}
        <div className="rounded-xl border border-subtle bg-card px-4 py-3 relative">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-faint uppercase tracking-widest">daily goal</p>
            <button onClick={() => { setEditGoal(true); setGoalInput(String(goal)) }} className="text-faint hover:text-primary transition-colors">
              <Edit2 size={10} />
            </button>
          </div>
          {editGoal ? (
            <div className="flex items-center gap-1.5">
              <input
                className="w-14 h-7 rounded border border-subtle bg-surface text-center text-xs text-primary focus:outline-none focus:border-subtle-hover"
                value={goalInput} onChange={e => setGoalInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveGoal()} autoFocus type="number" min={1}
              />
              <Button size="xs" variant="ghost" onClick={saveGoal}><Check size={10} /></Button>
            </div>
          ) : (
            <p className={cn("font-display text-3xl font-bold tracking-tight", goalPct >= 100 ? "text-green-400" : "text-primary")}>
              {done}<span className="text-lg text-faint">/{goal}</span>
            </p>
          )}
          <div className="mt-2 h-0.5 rounded-full bg-elevated overflow-hidden">
            <div className={cn("h-full rounded-full transition-all duration-500", goalPct >= 100 ? "bg-green-400" : "bg-teal-400")} style={{ width: `${goalPct}%` }} />
          </div>
          <p className="text-xs text-faint mt-1">{goalPct >= 100 ? '🎯 goal hit!' : `${goalPct}% of goal`}</p>
        </div>

        <div className="rounded-xl border border-subtle bg-card px-4 py-3">
          <p className="text-xs text-faint uppercase tracking-widest mb-1.5">in progress</p>
          <p className={cn("font-display text-3xl font-bold tracking-tight", inprog > 0 ? "text-amber-400" : "text-primary")}>{inprog}</p>
          <p className="text-xs text-faint mt-1">active now</p>
        </div>

        <div className="rounded-xl border border-subtle bg-card px-4 py-3">
          <p className="text-xs text-faint uppercase tracking-widest mb-1.5">high priority</p>
          <p className={cn("font-display text-3xl font-bold tracking-tight", highOpen > 0 ? "text-red-400" : "text-primary")}>{highOpen}</p>
          <p className="text-xs text-faint mt-1">unresolved</p>
        </div>
      </div>

      {/* Carry over banner */}
      {yesterdayPendingCount > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-2.5 mb-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <ArrowLeftRight size={13} className="text-amber-400" />
            <span className="text-[12px] text-amber-400 font-medium">{yesterdayPendingCount} unfinished task{yesterdayPendingCount > 1 ? 's' : ''} from yesterday</span>
          </div>
          <Button size="xs" variant="outline" onClick={onCarryOver} className="border-amber-400/30 text-amber-400 hover:bg-amber-400/10">
            carry over
          </Button>
        </div>
      )}

      <AddTaskBar onAdd={onAdd} />

      {loading && <div className="text-center py-12 text-faint text-xs">loading tasks...</div>}

      {!loading && total === 0 && (
        <div className="text-center py-12 text-faint text-xs border border-dashed border-subtle rounded-xl">
          <p className="text-2xl mb-2 opacity-30">[ ]</p>
          no tasks for this day — add one above
        </div>
      )}

      {/* Pinned section */}
      {!loading && pinnedTasks.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-2 mt-2">
            <span className="text-xs font-medium uppercase tracking-widest text-amber-400">pinned</span>
            <div className="flex-1 h-px bg-amber-400/20" />
            <span className="text-xs text-faint bg-elevated px-2 py-0.5 rounded-full">{pinnedTasks.length}</span>
          </div>
          {pinnedTasks.map(t => (
            <TaskItem key={t.id} task={t} onToggle={onToggle} onStatusChange={onStatusChange} onDelete={onDelete} onSaveNote={onSaveNote} onTogglePin={onTogglePin} onUpdateSubtasks={onUpdateSubtasks} onEditTitle={onEditTitle} onUpdateEta={onUpdateEta} />
          ))}
        </div>
      )}

      {/* Status sections */}
      {!loading && SECTIONS.map(sec => {
        const secTasks = sectionTasks(sec.key)
        if (sec.key === 'done') {
          if (!doneTasks.length) return null
          return (
            <div key={sec.key} className="mb-2">
              <div className="flex items-center gap-2 mb-2 mt-5">
                <span className="text-xs font-medium uppercase tracking-widest text-green-400">done</span>
                <div className="flex-1 h-px bg-subtle" />
                <span className="text-xs text-faint bg-elevated px-2 py-0.5 rounded-full">{doneTasks.length}</span>
              </div>
              {doneTasks.map(t => (
                <TaskItem key={t.id} task={t} onToggle={onToggle} onStatusChange={onStatusChange} onDelete={onDelete} onSaveNote={onSaveNote} onTogglePin={onTogglePin} onUpdateSubtasks={onUpdateSubtasks} onEditTitle={onEditTitle} onUpdateEta={onUpdateEta} />
              ))}
            </div>
          )
        }
        if (!secTasks.length) return null
        const meta = STATUS_META[sec.key]
        return (
          <div key={sec.key} className="mb-2">
            <div className="flex items-center gap-2 mb-2 mt-5">
              <span className={cn("text-xs font-medium uppercase tracking-widest", meta.color)}>{sec.label}</span>
              <div className="flex-1 h-px bg-subtle" />
              <span className="text-xs text-faint bg-elevated px-2 py-0.5 rounded-full">{secTasks.length}</span>
            </div>
            {secTasks.map(t => (
              <TaskItem key={t.id} task={t} onToggle={onToggle} onStatusChange={onStatusChange} onDelete={onDelete} onSaveNote={onSaveNote} onTogglePin={onTogglePin} onUpdateSubtasks={onUpdateSubtasks} onEditTitle={onEditTitle} onUpdateEta={onUpdateEta} />
            ))}
          </div>
        )
      })}
    </div>
  )
}