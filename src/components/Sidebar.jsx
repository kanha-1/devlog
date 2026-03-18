import { LayoutDashboard, History, Tag, Circle, Database } from "lucide-react"
import MiniCalendar from "./MiniCalendar"
import { todayStr, TAG_META, cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const TAGS = [
  { id: 'all',    label: 'All',     dotClass: 'bg-zinc-500'   },
  { id: 'feat',   label: 'Feature', dotClass: 'bg-blue-400'   },
  { id: 'bug',    label: 'Bug',     dotClass: 'bg-red-400'    },
  { id: 'review', label: 'Review',  dotClass: 'bg-amber-400'  },
  { id: 'infra',  label: 'Infra',   dotClass: 'bg-teal-400'   },
  { id: 'meet',   label: 'Meeting', dotClass: 'bg-purple-400' },
  { id: 'doc',    label: 'Docs',    dotClass: 'bg-green-400'  },
]

function NavItem({ active, onClick, dot, children, badge }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] transition-all text-left",
        active ? "bg-base-600 text-accent" : "text-muted hover:bg-base-700 hover:text-accent"
      )}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dot)} />}
      <span className="flex-1">{children}</span>
      {badge != null && badge > 0 && (
        <span className="text-[10px] bg-base-500 text-faint px-1.5 py-0.5 rounded-full">{badge}</span>
      )}
    </button>
  )
}

export default function Sidebar({ view, tagFilter, selectedDate, tasks, isSupabase, onViewChange, onTagFilter, onSelectDate }) {
  const todayOpen = tasks.filter(t => t.date === todayStr() && !t.done).length
  const taskDates = new Set(tasks.map(t => t.date))

  return (
    <aside className="w-56 flex-shrink-0 bg-base-800 border-r border-subtle flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-subtle">
        <div className="font-display text-xl font-extrabold text-accent tracking-tight">devlog</div>
        <div className="text-[9px] text-faint uppercase tracking-widest mt-0.5">daily work log</div>
      </div>

      {/* Views */}
      <div className="px-2 pt-3 pb-1">
        <p className="text-[9px] text-faint uppercase tracking-widest px-2 mb-1.5">views</p>
        <NavItem active={view==='today'} onClick={() => onViewChange('today')} dot="bg-teal-400" badge={todayOpen}>
          Today
        </NavItem>
        <NavItem active={view==='history'} onClick={() => onViewChange('history')} dot="bg-purple-400">
          History
        </NavItem>
      </div>

      <Separator className="my-2" />

      {/* Tag filter */}
      <div className="px-2 pb-1">
        <p className="text-[9px] text-faint uppercase tracking-widest px-2 mb-1.5">filter by tag</p>
        {TAGS.map(tag => (
          <NavItem key={tag.id} active={tagFilter===tag.id} onClick={() => onTagFilter(tag.id)} dot={tag.dotClass}>
            {tag.label}
          </NavItem>
        ))}
      </div>

      {/* Calendar */}
      <MiniCalendar
        selectedDate={selectedDate}
        taskDates={taskDates}
        onSelectDate={d => { onSelectDate(d); onViewChange('today') }}
      />

      {/* Storage indicator */}
      <div className="mx-3 mb-3 mt-2 flex items-center gap-2 rounded-lg bg-base-700 px-3 py-2">
        <Database size={10} className={isSupabase ? "text-green-400" : "text-amber-400"} />
        <span className="text-[10px] text-faint">
          {isSupabase ? "Supabase · synced" : "localStorage · local only"}
        </span>
      </div>
    </aside>
  )
}
