import { useState } from "react"
import { CheckSquare, Square, ChevronRight, Trash2, StickyNote } from "lucide-react"
import TaskChip from "./TaskChip"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { PRIORITY_META, STATUS_META, cn } from "@/lib/utils"

const STATUS_CYCLE = ['todo','inprogress','review','done']
const STATUS_SHORT = { todo:'todo', inprogress:'wip', review:'review', done:'done' }

export default function TaskItem({ task, onToggle, onStatusChange, onDelete, onSaveNote }) {
  const [showNote, setShowNote] = useState(false)
  const [noteVal, setNoteVal]   = useState(task.note || '')
  const p = PRIORITY_META[task.priority]
  const s = STATUS_META[task.status]
  const others = STATUS_CYCLE.filter(x => x !== task.status)

  return (
    <div className={cn(
      "group relative flex items-start gap-3 rounded-xl border border-subtle bg-base-800 px-4 py-3 mb-2 transition-all hover:border-border-hover",
      task.done && "opacity-45"
    )}>
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className="mt-0.5 flex-shrink-0 text-faint hover:text-green-400 transition-colors"
      >
        {task.done
          ? <CheckSquare size={15} className="text-green-400" />
          : <Square size={15} />
        }
      </button>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-[13px] leading-snug text-accent", task.done && "line-through text-faint")}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <TaskChip tag={task.tag} />
          <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", p.dot)} />
          <span className="text-[10px] text-faint">{p.label}</span>
          <span className="text-[10px] text-base-500">·</span>
          <span className={cn("text-[10px]", s.color)}>{s.label}</span>
        </div>

        {/* Note display */}
        {task.note && !showNote && (
          <p className="mt-2 text-[11px] text-faint border-l-2 border-white/10 pl-2 leading-relaxed">
            {task.note}
          </p>
        )}

        {/* Note editor */}
        {showNote && (
          <div className="mt-2">
            <textarea
              className="w-full rounded-lg border border-subtle bg-base-700 px-3 py-2 text-[11px] text-muted placeholder:text-faint focus:border-border-hover focus:outline-none resize-none leading-relaxed"
              rows={2}
              value={noteVal}
              onChange={e => setNoteVal(e.target.value)}
              placeholder="Add context, PR link, or notes..."
              autoFocus
            />
            <div className="flex gap-2 mt-1.5">
              <Button size="xs" variant="outline" onClick={() => { onSaveNote(task.id, noteVal); setShowNote(false) }}>save</Button>
              <Button size="xs" variant="ghost" onClick={() => setShowNote(false)}>cancel</Button>
            </div>
          </div>
        )}
      </div>

      {/* Actions — visible on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" onClick={() => { setNoteVal(task.note||''); setShowNote(n=>!n) }}>
              <StickyNote size={12} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add note</TooltipContent>
        </Tooltip>

        {others.map(st => (
          <Tooltip key={st}>
            <TooltipTrigger asChild>
              <Button size="xs" variant="ghost" onClick={() => onStatusChange(task.id, st)}>
                → {STATUS_SHORT[st]}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to {STATUS_SHORT[st]}</TooltipContent>
          </Tooltip>
        ))}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="danger" onClick={() => onDelete(task.id)}>
              <Trash2 size={12} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete task</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
