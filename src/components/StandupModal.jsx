import { useState } from "react"
import { Copy, Check, Zap, Clock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import TaskChip from "./TaskChip"
import { todayStr, formatDateLong, cn } from "@/lib/utils"

// ── Copy builders ─────────────────────────────────────────────────────────────
function buildPlainText(sections) {
  const today = todayStr()
  let t = `Today's Work Log — ${formatDateLong(today)}\n`
  t += `${'─'.repeat(44)}\n\n`

  sections.forEach(({ label, tasks }) => {
    if (!tasks.length) return
    t += `${label}\n`
    tasks.forEach(task => {
      t += `  • [${task.tag}] ${task.title}`
      if (task.eta) t += ` (ETA: ${new Date(task.eta).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })})`
      t += `\n`
      if (task.subtasks?.length) {
        task.subtasks.forEach(sub => {
          t += `      ${sub.done ? '✓' : '○'} ${sub.title}\n`
        })
      }
    })
    t += `\n`
  })
  return t.trim()
}

function buildMarkdown(sections) {
  const today = todayStr()
  let m = `## Today's Work Log — ${formatDateLong(today)}\n\n`

  sections.forEach(({ label, emoji, tasks }) => {
    if (!tasks.length) return
    m += `### ${emoji} ${label}\n`
    tasks.forEach(task => {
      m += `- \`${task.tag}\` **${task.title}**`
      if (task.eta) m += ` *(ETA: ${new Date(task.eta).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })})*`
      m += `\n`
      if (task.subtasks?.length) {
        task.subtasks.forEach(sub => {
          m += `  - [${sub.done ? 'x' : ' '}] ${sub.title}\n`
        })
      }
    })
    m += `\n`
  })
  return m.trim()
}

// ── Task row ──────────────────────────────────────────────────────────────────
function TaskRow({ task }) {
  const subtasks   = task.subtasks || []
  const subDone    = subtasks.filter(s => s.done).length
  const hasSubtasks = subtasks.length > 0

  return (
    <div className="py-2 border-b border-subtle last:border-0">
      <div className="flex items-center gap-2.5">
        <TaskChip tag={task.tag} />
        <span className="flex-1 text-[12px] text-primary truncate">{task.title}</span>
        {task.eta && (
          <span className="text-[10px] text-faint flex-shrink-0 flex items-center gap-1">
            <Clock size={9} />
            {new Date(task.eta).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
        )}
      </div>
      {hasSubtasks && (
        <div className="mt-1.5 ml-4 space-y-0.5">
          {subtasks.map(sub => (
            <div key={sub.id} className="flex items-center gap-1.5">
              <span className={cn("text-[10px]", sub.done ? "text-green-400" : "text-faint")}>
                {sub.done ? "✓" : "○"}
              </span>
              <span className={cn("text-[11px]", sub.done ? "text-faint line-through" : "text-muted")}>
                {sub.title}
              </span>
            </div>
          ))}
          <p className="text-[9px] text-faint mt-0.5">{subDone}/{subtasks.length} subtasks done</p>
        </div>
      )}
    </div>
  )
}

// ── Section card ──────────────────────────────────────────────────────────────
function Section({ emoji, label, labelClass, tasks, emptyHidden }) {
  if (!tasks.length && emptyHidden) return null
  return (
    <div className="rounded-xl border border-subtle bg-card overflow-hidden mb-3">
      <div className="flex items-center justify-between px-4 py-2 border-b border-subtle bg-surface">
        <div className="flex items-center gap-2">
          <span className="text-sm">{emoji}</span>
          <span className={cn("text-[11px] font-medium", labelClass)}>{label}</span>
        </div>
        <span className="text-[10px] text-faint bg-elevated px-2 py-0.5 rounded-full">{tasks.length}</span>
      </div>
      <div className="px-4">
        {tasks.length === 0
          ? <p className="text-[11px] text-faint py-3 text-center">nothing here</p>
          : tasks.map(t => <TaskRow key={t.id} task={t} />)
        }
      </div>
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function StandupModal({ open, onClose, tasks }) {
  const [copied, setCopied] = useState('')
  const today = todayStr()

  const todayTasks = tasks.filter(t => t.date === today)

  const done       = todayTasks.filter(t => t.status === 'done')
  const inProgress = todayTasks.filter(t => t.status === 'inprogress')
  const inReview   = todayTasks.filter(t => t.status === 'review')
  const todo       = todayTasks.filter(t => t.status === 'todo')
  const blockers   = todayTasks.filter(t => t.priority === 'high' && t.status !== 'done')

  const sections = [
    { emoji: '✅', label: 'Done',        labelClass: 'text-green-400',  tasks: done       },
    { emoji: '🔄', label: 'In Progress', labelClass: 'text-amber-400',  tasks: inProgress },
    { emoji: '👀', label: 'In Review',   labelClass: 'text-purple-400', tasks: inReview   },
    { emoji: '📋', label: 'Todo',        labelClass: 'text-faint',      tasks: todo       },
    { emoji: '🚧', label: 'Blockers',    labelClass: 'text-red-400',    tasks: blockers   },
  ]

  const copy = (content, type) => {
    navigator.clipboard.writeText(content)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap size={14} className="text-teal-400" />
            Today's Standup
          </DialogTitle>
          <DialogDescription>
            {formatDateLong(today)} · {done.length}/{todayTasks.length} tasks completed
          </DialogDescription>
        </DialogHeader>

        {todayTasks.length === 0 ? (
          <div className="text-center py-8 text-faint text-xs border border-dashed border-subtle rounded-xl">
            No tasks logged today yet
          </div>
        ) : (
          sections.map(sec => (
            <Section key={sec.label} {...sec} emptyHidden />
          ))
        )}

        <Separator />

        <div className="flex gap-2 mt-3 flex-wrap">
          <Button size="sm" variant="outline" className="gap-1.5"
            onClick={() => copy(buildPlainText(sections), 'text')}>
            {copied === 'text'
              ? <><Check size={11} /> Copied!</>
              : <><Copy size={11} /> copy as text</>}
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5"
            onClick={() => copy(buildMarkdown(sections), 'md')}>
            {copied === 'md'
              ? <><Check size={11} /> Copied!</>
              : <><Copy size={11} /> copy as markdown</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}