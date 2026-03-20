import { useState } from "react"
import { CheckSquare, Square, Trash2, StickyNote, Pin, PinOff, Plus, X } from "lucide-react"
import TaskChip from "./TaskChip"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { PRIORITY_META, STATUS_META, cn, uid } from "@/lib/utils"

const STATUS_CYCLE = ['todo','inprogress','review','done']
const STATUS_SHORT = { todo:'todo', inprogress:'wip', review:'review', done:'done' }

export default function TaskItem({ task, onToggle, onStatusChange, onDelete, onSaveNote, onTogglePin, onUpdateSubtasks }) {
  const [showNote,     setShowNote]     = useState(false)
  const [noteVal,      setNoteVal]      = useState(task.note || '')
  const [showSubs,     setShowSubs]     = useState(false)
  const [newSub,       setNewSub]       = useState('')
  const p = PRIORITY_META[task.priority]
  const s = STATUS_META[task.status]
  const others = STATUS_CYCLE.filter(x => x !== task.status)
  const subtasks = task.subtasks || []
  const subDone = subtasks.filter(s => s.done).length

  const addSubtask = () => {
    if (!newSub.trim()) return
    const updated = [...subtasks, { id: uid(), title: newSub.trim(), done: false }]
    onUpdateSubtasks(task.id, updated)
    setNewSub('')
  }

  const toggleSubtask = (sid) => {
    const updated = subtasks.map(s => s.id === sid ? { ...s, done: !s.done } : s)
    onUpdateSubtasks(task.id, updated)
  }

  const deleteSubtask = (sid) => {
    onUpdateSubtasks(task.id, subtasks.filter(s => s.id !== sid))
  }

  return (
    <div className={cn(
      "group relative flex items-start gap-3 rounded-xl border border-subtle bg-card px-4 py-3 mb-2 transition-all hover:border-subtle-hover",
      task.done && "opacity-45",
      task.pinned && "border-amber-400/30 bg-amber-400/5"
    )}>
      {/* Pin indicator */}
      {task.pinned && <span className="absolute top-2 right-2 text-amber-400 opacity-40"><Pin size={10} /></span>}

      {/* Checkbox */}
      <button onClick={() => onToggle(task.id)} className="mt-0.5 flex-shrink-0 text-faint hover:text-green-400 transition-colors">
        {task.done ? <CheckSquare size={15} className="text-green-400" /> : <Square size={15} />}
      </button>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-[13px] leading-snug text-primary", task.done && "line-through text-faint")}>
          {task.title}
        </p>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <TaskChip tag={task.tag} />
          <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", p.dot)} />
          <span className="text-[10px] text-faint">{p.label}</span>
          <span className="text-[10px] text-faint opacity-40">·</span>
          <span className={cn("text-[10px]", s.color)}>{s.label}</span>
          {subtasks.length > 0 && (
            <button onClick={() => setShowSubs(v => !v)} className="text-[10px] text-faint hover:text-primary transition-colors ml-1">
              {subDone}/{subtasks.length} subtasks
            </button>
          )}
        </div>

        {/* Note */}
        {task.note && !showNote && (
          <p className="mt-2 text-[11px] text-faint border-l-2 border-subtle pl-2 leading-relaxed">{task.note}</p>
        )}
        {showNote && (
          <div className="mt-2">
            <textarea
              className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-[11px] text-primary placeholder:text-faint focus:border-subtle-hover focus:outline-none resize-none leading-relaxed"
              rows={2} value={noteVal} onChange={e => setNoteVal(e.target.value)}
              placeholder="Add context, PR link, or notes..." autoFocus
            />
            <div className="flex gap-2 mt-1.5">
              <Button size="xs" variant="outline" onClick={() => { onSaveNote(task.id, noteVal); setShowNote(false) }}>save</Button>
              <Button size="xs" variant="ghost" onClick={() => setShowNote(false)}>cancel</Button>
            </div>
          </div>
        )}

        {/* Subtasks */}
        {(showSubs || subtasks.length === 0 && showSubs) && (
          <div className="mt-3 space-y-1 animate-fade-in">
            {subtasks.map(sub => (
              <div key={sub.id} className="flex items-center gap-2 group/sub">
                <button onClick={() => toggleSubtask(sub.id)} className="flex-shrink-0 text-faint hover:text-green-400 transition-colors">
                  {sub.done ? <CheckSquare size={12} className="text-green-400" /> : <Square size={12} />}
                </button>
                <span className={cn("text-[11px] flex-1 text-primary", sub.done && "line-through text-faint")}>{sub.title}</span>
                <button onClick={() => deleteSubtask(sub.id)} className="opacity-0 group-hover/sub:opacity-100 text-faint hover:text-red-400 transition-all">
                  <X size={10} />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2">
              <input
                className="flex-1 h-6 rounded bg-surface border border-subtle px-2 text-[11px] text-primary placeholder:text-faint focus:outline-none focus:border-subtle-hover"
                placeholder="add subtask..."
                value={newSub}
                onChange={e => setNewSub(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSubtask()}
              />
              <Button size="xs" variant="ghost" onClick={addSubtask}><Plus size={10} /></Button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" onClick={() => setShowSubs(v => !v)}><Plus size={12} /></Button>
          </TooltipTrigger>
          <TooltipContent>Subtasks</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" onClick={() => { setNoteVal(task.note||''); setShowNote(n=>!n) }}><StickyNote size={12} /></Button>
          </TooltipTrigger>
          <TooltipContent>Note</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" onClick={() => onTogglePin(task.id)}>
              {task.pinned ? <PinOff size={12} className="text-amber-400" /> : <Pin size={12} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{task.pinned ? 'Unpin' : 'Pin to top'}</TooltipContent>
        </Tooltip>
        {others.map(st => (
          <Tooltip key={st}>
            <TooltipTrigger asChild>
              <Button size="xs" variant="ghost" onClick={() => onStatusChange(task.id, st)}>→ {STATUS_SHORT[st]}</Button>
            </TooltipTrigger>
            <TooltipContent>Move to {STATUS_SHORT[st]}</TooltipContent>
          </Tooltip>
        ))}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="danger" onClick={() => onDelete(task.id)}><Trash2 size={12} /></Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
