import { useState, useRef, useEffect } from "react"
import { CheckSquare, Square, Trash2, StickyNote, Pin, PinOff, Plus, X, Pencil, Check, Clock } from "lucide-react"
import TaskChip from "./TaskChip"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { PRIORITY_META, STATUS_META, cn, uid } from "@/lib/utils"
import EtaBadge from "./EtaBadge"

const STATUS_CYCLE = ['todo','inprogress','review','done']
const STATUS_SHORT = { todo:'todo', inprogress:'wip', review:'review', done:'done' }

function EditableTitle({ value, done, onSave }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal]         = useState(value)
  const inputRef              = useRef()

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])
  useEffect(() => { setVal(value) }, [value])

  const save = () => {
    const trimmed = val.trim()
    if (trimmed && trimmed !== value) onSave(trimmed)
    setEditing(false)
  }

  const cancel = () => { setVal(value); setEditing(false) }

  if (editing) {
    return (
      <div className="flex items-center gap-2 w-full">
        <input
          ref={inputRef}
          className="flex-1 rounded-md border border-subtle bg-surface px-2 py-1 text-[13px] text-primary focus:outline-none focus:border-subtle-hover"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') save()
            if (e.key === 'Escape') cancel()
          }}
        />
        <button onClick={save} className="text-green-400 hover:text-green-300 transition-colors flex-shrink-0">
          <Check size={13} />
        </button>
        <button onClick={cancel} className="text-faint hover:text-primary transition-colors flex-shrink-0">
          <X size={13} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 group/title w-full min-w-0">
      <p
        className={cn("text-[13px] leading-snug text-primary flex-1 min-w-0", done && "line-through text-faint")}
        onDoubleClick={() => !done && setEditing(true)}
        title="Double-click to edit"
      >
        {value}
      </p>
      {!done && (
        <button
          onClick={() => setEditing(true)}
          className="opacity-0 group-hover/title:opacity-100 text-faint hover:text-primary transition-all flex-shrink-0"
        >
          <Pencil size={10} />
        </button>
      )}
    </div>
  )
}

function EditableSubtask({ sub, onSave, onToggle, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal]         = useState(sub.title)
  const inputRef              = useRef()

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  const save = () => {
    const trimmed = val.trim()
    if (trimmed && trimmed !== sub.title) onSave(sub.id, trimmed)
    setEditing(false)
  }

  const cancel = () => { setVal(sub.title); setEditing(false) }

  return (
    <div className="flex items-center gap-2 group/sub">
      <button onClick={() => onToggle(sub.id)} className="flex-shrink-0 text-faint hover:text-green-400 transition-colors">
        {sub.done ? <CheckSquare size={12} className="text-green-400" /> : <Square size={12} />}
      </button>

      {editing ? (
        <>
          <input
            ref={inputRef}
            className="flex-1 h-6 rounded border border-subtle bg-surface px-2 text-[11px] text-primary focus:outline-none focus:border-subtle-hover"
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') save()
              if (e.key === 'Escape') cancel()
            }}
          />
          <button onClick={save} className="text-green-400 hover:text-green-300 transition-colors flex-shrink-0"><Check size={11} /></button>
          <button onClick={cancel} className="text-faint hover:text-primary transition-colors flex-shrink-0"><X size={11} /></button>
        </>
      ) : (
        <>
          <span
            className={cn("text-[11px] flex-1 min-w-0 cursor-pointer", sub.done ? "line-through text-faint" : "text-primary")}
            onDoubleClick={() => !sub.done && setEditing(true)}
            title="Double-click to edit"
          >
            {sub.title}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-all">
            {!sub.done && (
              <button onClick={() => setEditing(true)} className="text-faint hover:text-primary transition-colors">
                <Pencil size={9} />
              </button>
            )}
            <button onClick={() => onDelete(sub.id)} className="text-faint hover:text-red-400 transition-colors">
              <X size={10} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function TaskItem({ task, onToggle, onStatusChange, onDelete, onSaveNote, onTogglePin, onUpdateSubtasks, onEditTitle, onUpdateEta }) {
  const [showNote,   setShowNote]   = useState(false)
  const [noteVal,    setNoteVal]    = useState(task.note || '')
  const [showSubs,   setShowSubs]   = useState(false)
  const [newSub,     setNewSub]     = useState('')
  const [editingEta, setEditingEta] = useState(false)
  const [etaVal,     setEtaVal]     = useState(task.eta || '')

  const p        = PRIORITY_META[task.priority]
  const s        = STATUS_META[task.status]
  const others   = STATUS_CYCLE.filter(x => x !== task.status)
  const subtasks = task.subtasks || []
  const subDone  = subtasks.filter(s => s.done).length

  const addSubtask = () => {
    if (!newSub.trim()) return
    onUpdateSubtasks(task.id, [...subtasks, { id: uid(), title: newSub.trim(), done: false }])
    setNewSub('')
  }

  const toggleSubtask = (sid) => {
    onUpdateSubtasks(task.id, subtasks.map(s => s.id === sid ? { ...s, done: !s.done } : s))
  }

  const editSubtask = (sid, newTitle) => {
    onUpdateSubtasks(task.id, subtasks.map(s => s.id === sid ? { ...s, title: newTitle } : s))
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
      {task.pinned && <span className="absolute top-2 right-2 text-amber-400 opacity-40"><Pin size={10} /></span>}

      {/* Checkbox */}
      <button onClick={() => onToggle(task.id)} className="mt-0.5 flex-shrink-0 text-faint hover:text-green-400 transition-colors">
        {task.done ? <CheckSquare size={15} className="text-green-400" /> : <Square size={15} />}
      </button>

      {/* Body */}
      <div className="flex-1 min-w-0">

        {/* Editable title */}
        <EditableTitle
          value={task.title}
          done={task.done}
          onSave={(newTitle) => onEditTitle(task.id, newTitle)}
        />

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
          <EtaBadge eta={task.eta} done={task.done} />
        </div>

        {/* ETA editor */}
        {editingEta && (
          <div className="mt-2 flex items-center gap-2 animate-fade-in">
            <Clock size={11} className="text-teal-400 flex-shrink-0" />
            <span className="text-[10px] text-faint">ETA</span>
            <input
              type="datetime-local"
              value={etaVal}
              onChange={e => setEtaVal(e.target.value)}
              className="flex-1 h-7 rounded border border-subtle bg-surface px-2 text-[11px] text-primary focus:outline-none focus:border-subtle-hover"
              autoFocus
            />
            <Button size="xs" variant="outline" onClick={() => { onUpdateEta(task.id, etaVal || null); setEditingEta(false) }}>save</Button>
            <Button size="xs" variant="ghost" onClick={() => { onUpdateEta(task.id, null); setEtaVal(''); setEditingEta(false) }}>clear</Button>
          </div>
        )}

        {/* Note display */}
        {task.note && !showNote && (
          <p className="mt-2 text-[11px] text-faint border-l-2 border-subtle pl-2 leading-relaxed">{task.note}</p>
        )}

        {/* Note editor */}
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
        {showSubs && (
          <div className="mt-3 space-y-1.5 animate-fade-in">
            {subtasks.map(sub => (
              <EditableSubtask
                key={sub.id}
                sub={sub}
                onSave={editSubtask}
                onToggle={toggleSubtask}
                onDelete={deleteSubtask}
              />
            ))}
            <div className="flex items-center gap-2 mt-2">
              <input
                className="flex-1 h-6 rounded bg-surface border border-subtle px-2 text-[11px] text-primary placeholder:text-faint focus:outline-none focus:border-subtle-hover"
                placeholder="add subtask... press Enter"
                value={newSub}
                onChange={e => setNewSub(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSubtask()}
              />
              <Button size="xs" variant="ghost" onClick={addSubtask}><Plus size={10} /></Button>
            </div>
          </div>
        )}
      </div>

      {/* Actions on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" onClick={() => { setShowSubs(v => !v) }}><Plus size={12} /></Button>
          </TooltipTrigger>
          <TooltipContent>Subtasks</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" onClick={() => { setNoteVal(task.note||''); setShowNote(n => !n) }}><StickyNote size={12} /></Button>
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
            <Button size="icon" variant="ghost" onClick={() => { setEtaVal(task.eta || ''); setEditingEta(e => !e) }}>
              <Clock size={12} className={task.eta ? 'text-teal-400' : ''} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{task.eta ? 'Edit ETA' : 'Set ETA'}</TooltipContent>
        </Tooltip>
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