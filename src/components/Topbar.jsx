import { Search, FileDown, LayoutList, Sun, Moon, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { todayStr, formatDate } from "@/lib/utils"

export default function Topbar({ selectedDate, tasks, view, search, onSearch, onSummary, onExport, theme, onToggleTheme, onOpenSettings }) {
  const isToday  = selectedDate === todayStr()
  const dayTasks = tasks.filter(t => t.date === selectedDate)
  const done     = dayTasks.filter(t => t.done).length

  const dateLabel = view === 'history'
    ? 'All History'
    : isToday
      ? `Today · ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      : formatDate(selectedDate)

  return (
    <div className="flex-shrink-0 border-b border-subtle bg-primary px-4 md:px-6 py-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-display text-base md:text-lg font-bold text-primary tracking-tight leading-none truncate">{dateLabel}</h1>
        {view === 'today' && (
          <p className="text-[10px] text-faint mt-0.5">{done}/{dayTasks.length} completed</p>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Search — hidden on very small screens */}
        <div className="relative hidden sm:block">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
          <Input className="pl-7 w-36 md:w-48 h-7 text-[11px]" placeholder="search..." value={search} onChange={e => onSearch(e.target.value)} />
        </div>

        {view === 'today' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="outline" onClick={onSummary}><LayoutList size={13} /></Button>
            </TooltipTrigger>
            <TooltipContent>Day summary</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline" onClick={onOpenSettings}><Bell size={13} /></Button>
          </TooltipTrigger>
          <TooltipContent>Notification settings</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline" onClick={onToggleTheme}>
              {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline" onClick={onExport}><FileDown size={13} /></Button>
          </TooltipTrigger>
          <TooltipContent>Export JSON</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
