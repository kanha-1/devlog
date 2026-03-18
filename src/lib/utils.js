import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function toDateStr(d) {
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0')
}
export function todayStr() { return toDateStr(new Date()) }
export function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6) }

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1)
  if (dateStr === todayStr()) return 'Today'
  if (dateStr === toDateStr(yesterday)) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' })
}
export function formatDateLong(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })
}

export const TAG_META = {
  feat:   { label: 'Feature', color: 'text-blue-400',   bg: 'bg-blue-400/10'   },
  bug:    { label: 'Bug',     color: 'text-red-400',    bg: 'bg-red-400/10'    },
  review: { label: 'Review',  color: 'text-amber-400',  bg: 'bg-amber-400/10'  },
  infra:  { label: 'Infra',   color: 'text-teal-400',   bg: 'bg-teal-400/10'   },
  meet:   { label: 'Meeting', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  doc:    { label: 'Docs',    color: 'text-green-400',  bg: 'bg-green-400/10'  },
  other:  { label: 'Other',   color: 'text-zinc-400',   bg: 'bg-zinc-400/10'   },
}

export const PRIORITY_META = {
  high: { label: 'High', dot: 'bg-red-400'    },
  med:  { label: 'Med',  dot: 'bg-amber-400'  },
  low:  { label: 'Low',  dot: 'bg-zinc-600'   },
}

export const STATUS_META = {
  todo:       { label: 'Todo',        color: 'text-faint'    },
  inprogress: { label: 'In Progress', color: 'text-amber-400'},
  review:     { label: 'In Review',   color: 'text-purple-400'},
  done:       { label: 'Done',        color: 'text-green-400' },
}
