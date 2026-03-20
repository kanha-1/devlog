import { CalendarDays, History, Menu, Search, BarChart2 } from "lucide-react"
import { cn, todayStr } from "@/lib/utils"

export default function BottomNav({ view, tasks, onViewChange, onMenuOpen, onSearchOpen }) {
  const todayOpen = tasks.filter(t => t.date === todayStr() && !t.done).length
  const tabs = [
    { id: 'today',   label: 'Today',   icon: CalendarDays, badge: todayOpen },
    { id: 'history', label: 'History', icon: History },
    { id: 'report',  label: 'Report',  icon: BarChart2 },
  ]

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 md:hidden border-t border-subtle bg-card safe-pb">
      <div className="flex items-center h-16">
        <button onClick={onMenuOpen} className="flex-1 flex flex-col items-center justify-center gap-1 h-full text-faint hover:text-primary transition-colors">
          <Menu size={20} />
          <span className="text-[9px] uppercase tracking-wider">Menu</span>
        </button>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => onViewChange(tab.id)}
            className={cn("flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors relative",
              view === tab.id ? "text-primary" : "text-faint hover:text-primary")}>
            <div className="relative">
              <tab.icon size={20} />
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-teal-400 text-black text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              )}
            </div>
            <span className="text-[9px] uppercase tracking-wider">{tab.label}</span>
            {view === tab.id && <span className="absolute top-0 inset-x-4 h-0.5 bg-teal-400 rounded-full" />}
          </button>
        ))}
        <button onClick={onSearchOpen} className="flex-1 flex flex-col items-center justify-center gap-1 h-full text-faint hover:text-primary transition-colors">
          <Search size={20} />
          <span className="text-[9px] uppercase tracking-wider">Search</span>
        </button>
      </div>
    </nav>
  )
}
