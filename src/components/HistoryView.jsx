import { useState } from "react"
import { ChevronRight, ExternalLink } from "lucide-react"
import TaskChip from "./TaskChip"
import { Button } from "@/components/ui/button"
import { todayStr, formatDate, cn } from "@/lib/utils"

function DayCard({ date, tasks, onJump }) {
  const [open, setOpen] = useState(false)
  const done  = tasks.filter(t => t.done).length
  const total = tasks.length
  const pct   = total ? Math.round(done/total*100) : 0

  return (
    <div className={cn(
      "rounded-xl border bg-card mb-3 overflow-hidden transition-colors",
      open ? "border-subtle-hover" : "border-subtle hover:border-subtle-hover"
    )}>
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-display text-sm font-bold text-primary truncate">
            {date === todayStr() ? 'Today' : formatDate(date)}
          </span>
          <Button size="xs" variant="ghost" className="gap-1 opacity-60 hover:opacity-100 flex-shrink-0"
            onClick={e => { e.stopPropagation(); onJump(date) }}>
            open <ExternalLink size={9} />
          </Button>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-12 h-1 rounded-full bg-elevated overflow-hidden hidden sm:block">
            <div className="h-full bg-green-400 rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">{done} done</span>
          {total - done > 0 && (
            <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full hidden sm:inline">{total-done} open</span>
          )}
          <span className="text-[10px] text-faint hidden sm:inline">{total} total</span>
          <ChevronRight size={13} className={cn("text-faint transition-transform", open && "rotate-90")} />
        </div>
      </div>

      {open && (
        <div className="border-t border-subtle px-4 py-2 animate-fade-in">
          {tasks.sort((a,b) => a.done - b.done).map(t => (
            <div key={t.id} className="flex items-center gap-2.5 py-1.5 border-b border-subtle last:border-0">
              <span className={cn("text-[11px] flex-shrink-0", t.done ? "text-green-400" : "text-faint")}>
                {t.done ? "✓" : "○"}
              </span>
              <TaskChip tag={t.tag} />
              <span className={cn("text-[12px] flex-1 min-w-0 truncate", t.done ? "text-faint line-through" : "text-primary")}>
                {t.title}
              </span>
              <span className="text-[10px] text-faint flex-shrink-0 hidden sm:inline">{t.priority}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function HistoryView({ tasks, onJump }) {
  const allDates  = [...new Set(tasks.map(t => t.date))].sort((a,b) => b.localeCompare(a))
  const totalEver = tasks.length
  const doneEver  = tasks.filter(t => t.done).length

  if (!allDates.length) {
    return (
      <div className="text-center py-16 text-faint text-xs border border-dashed border-subtle rounded-xl animate-fade-in">
        <p className="text-3xl mb-3 opacity-20">[ ]</p>
        no history yet — start logging tasks
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'days logged', value: allDates.length },
          { label: 'total tasks', value: totalEver },
          { label: 'completed',   value: doneEver, cls: 'text-green-400' },
        ].map(item => (
          <div key={item.label} className="rounded-xl border border-subtle bg-card px-3 md:px-4 py-3">
            <p className="text-[9px] text-faint uppercase tracking-widest mb-1.5">{item.label}</p>
            <p className={cn("font-display text-2xl md:text-3xl font-bold tracking-tight text-primary", item.cls)}>{item.value}</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-faint mb-4">tap any day to expand · tap "open" to jump to it</p>
      {allDates.map(date => (
        <DayCard key={date} date={date} tasks={tasks.filter(t => t.date === date)} onJump={onJump} />
      ))}
    </div>
  )
}
