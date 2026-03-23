import { Clock, AlertTriangle, AlertCircle } from "lucide-react"
import { etaStatus } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import TaskChip from "./TaskChip"

const COLOR = {
  overdue:  { text: 'text-red-400',   bg: 'bg-red-400/10',   icon: AlertCircle   },
  urgent:   { text: 'text-red-400',   bg: 'bg-red-400/10',   icon: AlertTriangle },
  soon:     { text: 'text-amber-400', bg: 'bg-amber-400/10', icon: Clock         },
  upcoming: { text: 'text-teal-400',  bg: 'bg-teal-400/10',  icon: Clock         },
}

export default function UpcomingEtas({ tasks }) {
  const withEta = tasks
    .filter(t => t.eta && !t.done)
    .map(t => ({ ...t, _status: etaStatus(t.eta) }))
    .filter(t => t._status)
    .sort((a, b) => new Date(a.eta) - new Date(b.eta))
    .slice(0, 5)

  if (!withEta.length) return null

  return (
    <div className="rounded-xl border border-subtle bg-card mb-5 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-subtle bg-surface">
        <Clock size={12} className="text-teal-400" />
        <span className="text-[9px] text-faint uppercase tracking-widest font-medium">upcoming deadlines</span>
      </div>
      <div className="divide-y divide-subtle">
        {withEta.map(task => {
          const { text, bg, icon: Icon } = COLOR[task._status.color] || COLOR.upcoming
          return (
            <div key={task.id} className="flex items-center gap-2.5 px-4 py-2.5">
              <TaskChip tag={task.tag} />
              <span className="flex-1 text-[12px] text-primary truncate min-w-0">{task.title}</span>
              <span className={cn("flex-shrink-0 flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full", text, bg)}>
                <Icon size={9} />
                {task._status.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}