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
  const isToday = date === todayStr()

  return (
    <div className={cn(
      "rounded-xl border bg-base-800 mb-3 overflow-hidden transition-colors",
      open ? "border-border-hover" : "border-subtle hover:border-border-hover"
    )}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <span className="font-display text-sm font-bold text-accent">
            {isToday ? 'Today' : formatDate(date)}
          </span>
          <Button
            size="xs"
            variant="ghost"
            className="gap-1 opacity-60 hover:opacity-100"
            onClick={e => { e.stopPropagation(); onJump(date) }}
          >
            open <ExternalLink size={9} />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {/* Mini progress bar */}
          <div className="w-16 h-1 rounded-full bg-base-600 overflow-hidden">
            <div className="h-full bg-green-400 rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">{done} done</span>
          {total - done > 0 && (
            <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">{total-done} open</span>
          )}
          <span className="text-[10px] text-faint">{total} total</span>
          <ChevronRight size={13} className={cn("text-faint transition-transform", open && "rotate-90")} />
        </div>
      </div>

      {/* Expanded task list */}
      {open && (
        <div className="border-t border-subtle px-4 py-2 animate-fade-in">
          {tasks
            .sort((a, b) => a.done - b.done)
            .map(t => (
              <div key={t.id} className="flex items-center gap-2.5 py-1.5 border-b border-subtle last:border-0">
                <span className={cn("text-[11px] flex-shrink-0", t.done ? "text-green-400" : "text-faint")}>
                  {t.done ? "✓" : "○"}
                </span>
                <TaskChip tag={t.tag} />
                <span className={cn("text-[12px] flex-1", t.done ? "text-faint line-through" : "text-accent")}>
                  {t.title}
                </span>
                <span className="text-[10px] text-faint flex-shrink-0">{t.priority}</span>
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
      {/* All-time stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'days logged',  value: allDates.length },
          { label: 'total tasks',  value: totalEver },
          { label: 'completed',    value: doneEver, valueClass: 'text-green-400' },
        ].map(item => (
          <div key={item.label} className="rounded-xl border border-subtle bg-base-800 px-4 py-3">
            <p className="text-[9px] text-faint uppercase tracking-widest mb-1.5">{item.label}</p>
            <p className={cn("font-display text-3xl font-bold tracking-tight text-accent", item.valueClass)}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-faint mb-4">click any day to expand · click "open" to jump to it</p>

      {allDates.map(date => (
        <DayCard
          key={date}
          date={date}
          tasks={tasks.filter(t => t.date === date)}
          onJump={onJump}
        />
      ))}
    </div>
  )
}
