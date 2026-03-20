import { useState } from "react"
import { FileDown, Copy, Check, BarChart2, Calendar } from "lucide-react"
import TaskChip from "./TaskChip"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toDateStr, todayStr, formatDate, formatDateShort, dateRange, TAG_META, cn } from "@/lib/utils"

const TAG_BAR_COLOR = {
  feat:   'rgba(96,165,250,0.5)',
  bug:    'rgba(248,113,113,0.5)',
  review: 'rgba(251,191,36,0.5)',
  infra:  'rgba(45,212,191,0.5)',
  meet:   'rgba(167,139,250,0.5)',
  doc:    'rgba(74,222,128,0.5)',
  other:  'rgba(161,161,170,0.5)',
}

const PRESETS = [
  { label: 'Last 7 days',  days: 7  },
  { label: 'Last 14 days', days: 14 },
  { label: 'Last 30 days', days: 30 },
  { label: 'This week',    days: null, thisWeek: true },
]

function getPresetRange(preset) {
  const today = new Date()
  if (preset.thisWeek) {
    const day = today.getDay()
    const mon = new Date(today); mon.setDate(today.getDate() - (day === 0 ? 6 : day - 1))
    return { from: toDateStr(mon), to: todayStr() }
  }
  const from = new Date(today); from.setDate(today.getDate() - (preset.days - 1))
  return { from: toDateStr(from), to: todayStr() }
}

function buildMarkdown(from, to, tasks, tagBreakdown) {
  let md = `# Work Log Report\n**${formatDateShort(from)} → ${formatDateShort(to)}**\n\n`
  md += `## Summary\n`
  md += `- Total tasks: **${tasks.length}**\n`
  md += `- Completed: **${tasks.filter(t=>t.done).length}** (${tasks.length ? Math.round(tasks.filter(t=>t.done).length/tasks.length*100) : 0}%)\n`
  md += `- Open: **${tasks.filter(t=>!t.done).length}**\n\n`
  md += `## By Tag\n`
  Object.entries(tagBreakdown).forEach(([tag, { total, done }]) => {
    md += `- \`${tag}\`: ${done}/${total} completed\n`
  })
  md += `\n## Day by Day\n`
  const dates = dateRange(from, to).reverse()
  dates.forEach(date => {
    const dayTasks = tasks.filter(t => t.date === date)
    if (!dayTasks.length) return
    const doneCnt = dayTasks.filter(t => t.done).length
    md += `\n### ${formatDate(date)} — ${doneCnt}/${dayTasks.length} done\n`
    dayTasks.sort((a,b) => a.done - b.done).forEach(t => {
      md += `- ${t.done ? '✅' : '⬜'} \`${t.tag}\` ${t.title}\n`
    })
  })
  return md
}

export default function ReportView({ tasks }) {
  const [from,    setFrom]    = useState(() => { const d = new Date(); d.setDate(d.getDate()-6); return toDateStr(d) })
  const [to,      setTo]      = useState(todayStr())
  const [copied,  setCopied]  = useState(false)
  const [activePreset, setActivePreset] = useState(0)

  const applyPreset = (i, preset) => {
    const range = getPresetRange(preset)
    setFrom(range.from); setTo(range.to); setActivePreset(i)
  }

  const rangeTasks   = tasks.filter(t => t.date >= from && t.date <= to)
  const doneTasks    = rangeTasks.filter(t => t.done)
  const openTasks    = rangeTasks.filter(t => !t.done)
  const dates        = dateRange(from, to).reverse()
  const completionPct = rangeTasks.length ? Math.round(doneTasks.length / rangeTasks.length * 100) : 0

  // Tag breakdown
  const tagBreakdown = {}
  rangeTasks.forEach(t => {
    if (!tagBreakdown[t.tag]) tagBreakdown[t.tag] = { total: 0, done: 0 }
    tagBreakdown[t.tag].total++
    if (t.done) tagBreakdown[t.tag].done++
  })
  const maxTagCount = Math.max(...Object.values(tagBreakdown).map(v => v.total), 1)

  const copyMarkdown = () => {
    navigator.clipboard.writeText(buildMarkdown(from, to, rangeTasks, tagBreakdown))
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const downloadMarkdown = () => {
    const blob = new Blob([buildMarkdown(from, to, rangeTasks, tagBreakdown)], { type: 'text/markdown' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `devlog-report-${from}-to-${to}.md`; a.click()
  }

  return (
    <div className="animate-fade-in">
      {/* Date range picker */}
      <div className="rounded-xl border border-subtle bg-card p-4 mb-4">
        <p className="text-[9px] text-faint uppercase tracking-widest mb-3">date range</p>

        {/* Presets */}
        <div className="flex gap-2 flex-wrap mb-3">
          {PRESETS.map((p, i) => (
            <button key={i} onClick={() => applyPreset(i, p)} className={cn(
              "text-[11px] px-3 py-1.5 rounded-lg border transition-all",
              activePreset === i ? "border-teal-400/50 bg-teal-400/10 text-teal-400" : "border-subtle text-faint hover:border-subtle-hover hover:text-primary"
            )}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom range */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-faint" />
            <span className="text-[11px] text-faint">From</span>
            <input type="date" value={from} onChange={e => { setFrom(e.target.value); setActivePreset(-1) }}
              className="h-7 rounded border border-subtle bg-surface px-2 text-[11px] text-primary focus:outline-none focus:border-subtle-hover" />
          </div>
          <span className="text-faint text-[11px]">→</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-faint">To</span>
            <input type="date" value={to} onChange={e => { setTo(e.target.value); setActivePreset(-1) }}
              className="h-7 rounded border border-subtle bg-surface px-2 text-[11px] text-primary focus:outline-none focus:border-subtle-hover" />
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'total tasks',  value: rangeTasks.length },
          { label: 'completed',    value: doneTasks.length,  cls: doneTasks.length > 0 ? 'text-green-400' : '' },
          { label: 'completion',   value: `${completionPct}%`, cls: completionPct >= 70 ? 'text-green-400' : completionPct >= 40 ? 'text-amber-400' : 'text-red-400' },
        ].map(item => (
          <div key={item.label} className="rounded-xl border border-subtle bg-card px-4 py-3">
            <p className="text-[9px] text-faint uppercase tracking-widest mb-1.5">{item.label}</p>
            <p className={cn("font-display text-2xl md:text-3xl font-bold tracking-tight text-primary", item.cls)}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Tag breakdown chart */}
      {/* {Object.keys(tagBreakdown).length > 0 && (
        <div className="rounded-xl border border-subtle bg-card p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 size={13} className="text-faint" />
            <p className="text-[9px] text-faint uppercase tracking-widest">tag breakdown</p>
          </div>
          <div className="space-y-2.5">
            {Object.entries(tagBreakdown).sort((a,b) => b[1].total - a[1].total).map(([tag, { total, done }]) => {
              const meta = TAG_META[tag] || TAG_META.other
              const pct  = Math.round(done/total*100)
              return (
                <div key={tag} className="flex items-center gap-3">
                  <div className="w-14 flex-shrink-0">
                    <TaskChip tag={tag} />
                  </div>
                  <div className="flex-1 h-4 rounded-full bg-elevated overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(total/maxTagCount)*100}%`, background: TAG_BAR_COLOR[tag] || TAG_BAR_COLOR.other }}
                    />
                  </div>
                  <span className="text-[10px] text-faint w-16 text-right flex-shrink-0">{done}/{total} · {pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )} */}

      {/* Day by day */}
      {rangeTasks.length > 0 ? (
        <div className="rounded-xl border border-subtle bg-card p-4 mb-4">
          <p className="text-[9px] text-faint uppercase tracking-widest mb-3">day by day</p>
          <div className="space-y-4">
            {dates.map(date => {
              const dayTasks = rangeTasks.filter(t => t.date === date)
              if (!dayTasks.length) return null
              const doneCnt = dayTasks.filter(t => t.done).length
              return (
                <div key={date}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-medium text-primary">{formatDate(date)}</span>
                    <span className="text-[10px] text-faint">{doneCnt}/{dayTasks.length} done</span>
                  </div>
                  <div className="space-y-1">
                    {dayTasks.sort((a,b) => a.done - b.done).map(t => (
                      <div key={t.id} className="flex items-center gap-2">
                        <span className={cn("text-[10px] flex-shrink-0", t.done ? "text-green-400" : "text-faint")}>
                          {t.done ? "✓" : "○"}
                        </span>
                        <TaskChip tag={t.tag} />
                        <span className={cn("text-[11px] flex-1 truncate", t.done ? "text-faint line-through" : "text-primary")}>
                          {t.title}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Separator className="mt-3" />
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-faint text-xs border border-dashed border-subtle rounded-xl">
          <p className="text-2xl mb-2 opacity-30">[ ]</p>
          no tasks found in this date range
        </div>
      )}

      {/* Export */}
      {rangeTasks.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={copyMarkdown}>
            {copied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> copy as markdown</>}
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={downloadMarkdown}>
            <FileDown size={11} /> download .md
          </Button>
        </div>
      )}
    </div>
  )
}