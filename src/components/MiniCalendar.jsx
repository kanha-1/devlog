import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { toDateStr, todayStr, cn } from "@/lib/utils"

const DAY_NAMES = ['S','M','T','W','T','F','S']

export default function MiniCalendar({ selectedDate, taskDates, onSelectDate }) {
  const [view, setView] = useState(() => {
    const d = new Date(selectedDate + 'T00:00:00')
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const prev = () => setView(v => v.month === 0 ? { year: v.year-1, month: 11 } : { ...v, month: v.month-1 })
  const next = () => setView(v => v.month === 11 ? { year: v.year+1, month: 0 } : { ...v, month: v.month+1 })

  const { year, month } = view
  const today = todayStr()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const label = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

  const cells = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="p-3 border-t border-subtle mt-auto">
      <div className="flex items-center justify-between mb-2">
        <button onClick={prev} className="text-faint hover:text-accent p-0.5 rounded transition-colors"><ChevronLeft size={14} /></button>
        <span className="text-[11px] text-muted font-medium">{label}</span>
        <button onClick={next} className="text-faint hover:text-accent p-0.5 rounded transition-colors"><ChevronRight size={14} /></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {DAY_NAMES.map((d, i) => (
          <div key={i} className="text-[9px] text-faint text-center py-0.5">{d}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />
          const ds = year + '-' + String(month+1).padStart(2,'0') + '-' + String(d).padStart(2,'0')
          const isToday = ds === today
          const isSel = ds === selectedDate && !isToday
          const hasTask = taskDates.has(ds)
          return (
            <button
              key={i}
              onClick={() => onSelectDate(ds)}
              className={cn(
                "text-[10px] text-center py-1 rounded transition-all",
                isToday  && "bg-accent text-base-900 font-bold",
                isSel    && "bg-base-600 text-accent",
                !isToday && !isSel && "text-muted hover:bg-base-600 hover:text-accent"
              )}
            >
              {d}
              {hasTask && !isToday && (
                <span className="block w-1 h-1 bg-teal-400 rounded-full mx-auto mt-0.5" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
