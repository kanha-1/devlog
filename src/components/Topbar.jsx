import { Search, FileDown, LayoutList } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { todayStr, formatDate } from "@/lib/utils"

export default function Topbar({ selectedDate, tasks, view, search, onSearch, onSummary, onExport }) {
  const isToday  = selectedDate === todayStr()
  const dayTasks = tasks.filter(t => t.date === selectedDate)
  const done     = dayTasks.filter(t => t.done).length

  const dateLabel = view === 'history'
    ? 'All History'
    : isToday
      ? `Today · ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      : formatDate(selectedDate)

  return (
    <div className="flex-shrink-0 border-b border-subtle bg-base-900 px-6 py-3.5 flex items-center justify-between gap-4">
      <div>
        <h1 className="font-display text-lg font-bold text-accent tracking-tight leading-none">{dateLabel}</h1>
        {view === 'today' && (
          <p className="text-[11px] text-faint mt-0.5">{done}/{dayTasks.length} tasks completed</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
          <Input
            className="pl-7 w-48 h-7 text-[11px]"
            placeholder="search tasks..."
            value={search}
            onChange={e => onSearch(e.target.value)}
          />
        </div>
        {view === 'today' && (
          <Button size="sm" variant="outline" onClick={onSummary} className="gap-1.5">
            <LayoutList size={12} /> summary
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={onExport} className="gap-1.5">
          <FileDown size={12} /> export
        </Button>
      </div>
    </div>
  )
}
