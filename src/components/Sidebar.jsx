import { Database, X } from "lucide-react"
import MiniCalendar from "./MiniCalendar"
import { todayStr, cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const TAGS = [
  { id: 'all',    label: 'All',     dot: 'bg-zinc-500'   },
  { id: 'feat',   label: 'Feature', dot: 'bg-blue-400'   },
  { id: 'bug',    label: 'Bug',     dot: 'bg-red-400'    },
  { id: 'review', label: 'Review',  dot: 'bg-amber-400'  },
  { id: 'infra',  label: 'Infra',   dot: 'bg-teal-400'   },
  { id: 'meet',   label: 'Meeting', dot: 'bg-purple-400' },
  { id: 'doc',    label: 'Docs',    dot: 'bg-green-400'  },
]

function NavItem({ active, onClick, dot, children, badge }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] transition-all text-left",
        active ? "bg-elevated text-primary" : "text-muted hover:bg-surface hover:text-primary"
      )}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dot)} />}
      <span className="flex-1">{children}</span>
      {badge != null && badge > 0 && (
        <span className="text-[10px] bg-hover text-faint px-1.5 py-0.5 rounded-full">{badge}</span>
      )}
    </button>
  )
}

export default function Sidebar({ view, tagFilter, selectedDate, tasks, isSupabase, onViewChange, onTagFilter, onSelectDate, mobileOpen, onMobileClose }) {
  const todayOpen = tasks.filter(t => t.date === todayStr() && !t.done).length
  const taskDates = new Set(tasks.map(t => t.date))

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside className={cn(
        "flex-shrink-0 bg-card border-r border-subtle flex flex-col overflow-y-auto z-50 transition-transform duration-300",
        // Desktop: always visible
        "hidden md:flex md:w-56",
        // Mobile: slide in from left as overlay
        mobileOpen && "fixed inset-y-0 left-0 w-72 flex",
      )}>
        {/* Logo */}
        <div className="px-4 py-5 border-b border-subtle flex items-center justify-between">
          <div>
            <div className="font-display text-xl font-extrabold text-primary tracking-tight">devlog</div>
            <div className="text-[9px] text-faint uppercase tracking-widest mt-0.5">daily work log</div>
          </div>
          {mobileOpen && (
            <button onClick={onMobileClose} className="text-faint hover:text-primary p-1 rounded md:hidden">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Views */}
        <div className="px-2 pt-3 pb-1">
          <p className="text-[9px] text-faint uppercase tracking-widest px-2 mb-1.5">views</p>
          <NavItem active={view==='today'} onClick={() => { onViewChange('today'); onMobileClose?.() }} dot="bg-teal-400" badge={todayOpen}>Today</NavItem>
          <NavItem active={view==='history'} onClick={() => { onViewChange('history'); onMobileClose?.() }} dot="bg-purple-400">History</NavItem>
        </div>

        <Separator className="my-2" />

        {/* Tag filter */}
        <div className="px-2 pb-1">
          <p className="text-[9px] text-faint uppercase tracking-widest px-2 mb-1.5">filter by tag</p>
          {TAGS.map(tag => (
            <NavItem key={tag.id} active={tagFilter===tag.id} onClick={() => { onTagFilter(tag.id); onMobileClose?.() }} dot={tag.dot}>
              {tag.label}
            </NavItem>
          ))}
        </div>

        {/* Calendar */}
        <MiniCalendar
          selectedDate={selectedDate}
          taskDates={taskDates}
          onSelectDate={d => { onSelectDate(d); onViewChange('today'); onMobileClose?.() }}
        />

        {/* Storage indicator */}
        <div className="mx-3 mb-3 mt-2 flex items-center gap-2 rounded-lg bg-surface px-3 py-2">
          <Database size={10} className={isSupabase ? "text-green-400" : "text-amber-400"} />
          <span className="text-[10px] text-faint">
            {isSupabase ? "Supabase · synced" : "localStorage · local only"}
          </span>
        </div>
      </aside>
    </>
  )
}
