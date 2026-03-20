import { Clock, AlertCircle, AlertTriangle, Calendar } from "lucide-react"
import { etaStatus } from "@/lib/notifications"
import { cn } from "@/lib/utils"

const COLOR_MAP = {
  overdue:  { text: 'text-red-400',    bg: 'bg-red-400/10',    icon: AlertCircle   },
  urgent:   { text: 'text-red-400',    bg: 'bg-red-400/10',    icon: AlertTriangle },
  soon:     { text: 'text-amber-400',  bg: 'bg-amber-400/10',  icon: Clock         },
  upcoming: { text: 'text-teal-400',   bg: 'bg-teal-400/10',   icon: Calendar      },
}

export default function EtaBadge({ eta, done }) {
  if (!eta) return null
  const status = etaStatus(eta)
  if (!status) return null

  // If done and not overdue — show quiet green
  if (done) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] bg-green-400/10 text-green-400 px-2 py-0.5 rounded-full">
        <Clock size={9} /> done on time
      </span>
    )
  }

  const { text, bg, icon: Icon } = COLOR_MAP[status.color] || COLOR_MAP.upcoming

  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium", text, bg)}>
      <Icon size={9} />
      {status.label}
    </span>
  )
}