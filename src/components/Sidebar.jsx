import { Database, X, Flame, Target, LogOut } from "lucide-react"
import MiniCalendar from "./MiniCalendar"
import { todayStr, calcStreak, cn } from "@/lib/utils"
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
    <button onClick={onClick} className={cn(
      "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] transition-all text-left",
      active ? "bg-elevated text-primary" : "text-muted hover:bg-surface hover:text-primary"
    )}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dot)} />}
      <span className="flex-1">{children}</span>
      {badge != null && badge > 0 && (
        <span className="text-[10px] bg-hover text-faint px-1.5 py-0.5 rounded-full">{badge}</span>
      )}
    </button>
  )
}

export default function Sidebar({
  view, tagFilter, selectedDate, tasks, isSupabase,
  session, onViewChange, onTagFilter, onSelectDate,
  mobileOpen, onMobileClose, onSignOut
}) {
  const todayOpen = tasks.filter(t => t.date === todayStr() && !t.done).length
  const taskDates = new Set(tasks.map(t => t.date))
  const streak    = calcStreak(tasks)

  const userName = session?.user?.user_metadata?.user_name
    || session?.user?.email
    || null

  const userInitial = userName ? userName[0].toUpperCase() : null

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onMobileClose} />
      )}

      <aside className={cn(
        "flex-shrink-0 bg-card border-r border-subtle flex flex-col overflow-y-auto z-50 transition-transform duration-300",
        "hidden md:flex md:w-56",
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

        {/* Streak + stats */}
        <div className="px-3 pt-3 pb-1 flex gap-2">
          <div className="flex-1 rounded-lg bg-surface px-3 py-2 flex items-center gap-2">
            <Flame size={13} className={streak > 0 ? "text-orange-400" : "text-faint"} />
            <div>
              <p className="text-[10px] font-bold text-primary">{streak} day{streak !== 1 ? 's' : ''}</p>
              <p className="text-[9px] text-faint">streak</p>
            </div>
          </div>
          <div className="flex-1 rounded-lg bg-surface px-3 py-2 flex items-center gap-2">
            <Target size={13} className="text-teal-400" />
            <div>
              <p className="text-[10px] font-bold text-primary">{tasks.filter(t => t.date === todayStr() && t.done).length}</p>
              <p className="text-[9px] text-faint">done today</p>
            </div>
          </div>
        </div>

        {/* Views */}
        <div className="px-2 pt-2 pb-1">
          <p className="text-[9px] text-faint uppercase tracking-widest px-2 mb-1.5">views</p>
          <NavItem active={view==='today'} onClick={() => { onViewChange('today'); onMobileClose?.() }} dot="bg-teal-400" badge={todayOpen}>
            Today
          </NavItem>
          <NavItem active={view==='history'} onClick={() => { onViewChange('history'); onMobileClose?.() }} dot="bg-purple-400">
            History
          </NavItem>
          <NavItem active={view==='report'} onClick={() => { onViewChange('report'); onMobileClose?.() }} dot="bg-blue-400">
            Report
          </NavItem>
          <NavItem active={view==='scratchpad'} onClick={() => { onViewChange('scratchpad'); onMobileClose?.() }} dot="bg-pink-400">
            Scratchpad
          </NavItem>
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

        {/* User info */}
        {session && userName && (
          <div className="mx-3 mt-2 flex items-center gap-2 rounded-lg bg-surface px-3 py-2">
            <div className="w-5 h-5 rounded-full bg-teal-400/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] text-teal-400 font-bold">{userInitial}</span>
            </div>
            <span className="text-[10px] text-faint flex-1 truncate">{userName}</span>
            <button onClick={onSignOut} className="text-faint hover:text-red-400 transition-colors flex-shrink-0" title="Sign out">
              <LogOut size={11} />
            </button>
          </div>
        )}

        {/* Storage indicator */}
        <div className="mx-3 mb-3 mt-1.5 flex items-center gap-2 rounded-lg bg-surface px-3 py-2">
          <Database size={10} className={isSupabase ? "text-green-400" : "text-amber-400"} />
          <span className="text-[10px] text-faint">
            {isSupabase ? "Supabase · synced" : "localStorage · local only"}
          </span>
        </div>

      </aside>
    </>
  )
}