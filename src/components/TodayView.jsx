import AddTaskBar from "./AddTaskBar"
import TaskItem from "./TaskItem"
import { STATUS_META, cn } from "@/lib/utils"

const SECTIONS = [
  { key: 'inprogress', label: 'in progress' },
  { key: 'todo',       label: 'todo'         },
  { key: 'review',     label: 'in review'    },
  { key: 'done',       label: 'done'         },
]

function StatCard({ label, value, sub, valueClass }) {
  return (
    <div className="rounded-xl border border-subtle bg-card px-4 py-3">
      <p className="text-[9px] text-faint uppercase tracking-widest mb-1.5">{label}</p>
      <p className={cn("font-display text-3xl font-bold tracking-tight text-primary", valueClass)}>{value}</p>
      {sub && <p className="text-[10px] text-faint mt-1">{sub}</p>}
    </div>
  )
}

export default function TodayView({ tasks, loading, onAdd, onToggle, onStatusChange, onDelete, onSaveNote }) {
  const total    = tasks.length
  const done     = tasks.filter(t => t.done).length
  const inprog   = tasks.filter(t => t.status === 'inprogress').length
  const highOpen = tasks.filter(t => t.priority === 'high' && !t.done).length
  const pct      = total ? Math.round(done/total*100) : 0

  return (
    <div className="animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-subtle bg-card px-4 py-3">
          <p className="text-[9px] text-faint uppercase tracking-widest mb-1.5">total tasks</p>
          <p className="font-display text-3xl font-bold tracking-tight text-primary">{total}</p>
          <div className="mt-2 h-0.5 rounded-full bg-elevated overflow-hidden">
            <div className="h-full bg-green-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[10px] text-faint mt-1">{pct}% complete</p>
        </div>
        <StatCard label="completed"     value={done}     sub={`of ${total} tasks`} valueClass={done > 0 ? "text-green-400" : ""} />
        <StatCard label="in progress"   value={inprog}   sub="active"              valueClass={inprog > 0 ? "text-amber-400" : ""} />
        <StatCard label="high priority" value={highOpen} sub="unresolved"          valueClass={highOpen > 0 ? "text-red-400" : ""} />
      </div>

      <AddTaskBar onAdd={onAdd} />

      {loading && <div className="text-center py-12 text-faint text-xs">loading tasks...</div>}

      {!loading && total === 0 && (
        <div className="text-center py-12 text-faint text-xs border border-dashed border-subtle rounded-xl">
          <p className="text-2xl mb-2 opacity-30">[ ]</p>
          no tasks for this day — add one above
        </div>
      )}

      {!loading && SECTIONS.map(sec => {
        const secTasks = tasks.filter(t => t.status === sec.key)
        if (!secTasks.length) return null
        const meta = STATUS_META[sec.key]
        return (
          <div key={sec.key} className="mb-2">
            <div className="flex items-center gap-2 mb-2 mt-5">
              <span className={cn("text-[9px] font-medium uppercase tracking-widest", meta.color)}>{sec.label}</span>
              <div className="flex-1 h-px bg-subtle" />
              <span className="text-[9px] text-faint bg-elevated px-2 py-0.5 rounded-full">{secTasks.length}</span>
            </div>
            {secTasks.map(t => (
              <TaskItem key={t.id} task={t} onToggle={onToggle} onStatusChange={onStatusChange} onDelete={onDelete} onSaveNote={onSaveNote} />
            ))}
          </div>
        )
      })}
    </div>
  )
}
