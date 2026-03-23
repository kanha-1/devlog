import { useState, useEffect, useRef } from "react"
import { Save, Trash2, Plus, ChevronDown, ChevronRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "./Toast"
import { cn, todayStr } from "@/lib/utils"

const LS_KEY = 'devlog-scratchpad-v1'

function loadNotes() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveNotes(notes) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(notes)) } catch {}
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
}

function timeAgo(ts) {
  const diff = Date.now() - ts
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)    return 'just now'
  if (mins < 60)   return `${mins}m ago`
  if (hours < 24)  return `${hours}h ago`
  if (days < 7)    return `${days}d ago`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function NoteCard({ note, onUpdate, onDelete }) {
  const [editing,  setEditing]  = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [val,      setVal]      = useState(note.content)
  const taRef = useRef()

  useEffect(() => { if (editing) taRef.current?.focus() }, [editing])

  const save = () => {
    if (!val.trim()) return
    onUpdate(note.id, val)
    setEditing(false)
    toast.success("Note saved")
  }

  const cancel = () => { setVal(note.content); setEditing(false) }

  const preview = note.content.split('\n')[0].slice(0, 80)
  const hasMore = note.content.length > 80 || note.content.includes('\n')

  return (
    <div className={cn(
      "rounded-xl border bg-card transition-all",
      editing ? "border-subtle-hover" : "border-subtle hover:border-subtle-hover"
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-subtle">
        <Clock size={10} className="text-faint flex-shrink-0" />
        <span className="text-[10px] text-faint flex-1">{timeAgo(note.updatedAt)}</span>
        {note.tag && (
          <span className="text-[9px] bg-elevated text-faint px-2 py-0.5 rounded-full">{note.tag}</span>
        )}
        <button
          onClick={() => onDelete(note.id)}
          className="text-faint hover:text-red-400 transition-colors p-0.5"
        >
          <Trash2 size={11} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {editing ? (
          <div>
            <textarea
              ref={taRef}
              className="w-full bg-surface border border-subtle rounded-lg px-3 py-2 text-[12px] text-primary placeholder:text-faint focus:outline-none focus:border-subtle-hover resize-none leading-relaxed"
              rows={6}
              value={val}
              onChange={e => setVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Escape') cancel()
                if (e.key === 's' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); save() }
              }}
              placeholder="Write anything — ideas, links, thoughts..."
            />
            <div className="flex gap-2 mt-2">
              <Button size="xs" onClick={save} className="gap-1">
                <Save size={10} /> save
              </Button>
              <Button size="xs" variant="ghost" onClick={cancel}>cancel</Button>
              <span className="text-[10px] text-faint self-center ml-auto">⌘S to save · Esc to cancel</span>
            </div>
          </div>
        ) : (
          <div onClick={() => setEditing(true)} className="cursor-pointer">
            <p className="text-[12px] text-primary leading-relaxed whitespace-pre-wrap">
              {expanded || !hasMore ? note.content : preview + (hasMore ? '...' : '')}
            </p>
            {hasMore && (
              <button
                onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
                className="flex items-center gap-1 text-[10px] text-faint hover:text-primary mt-1.5 transition-colors"
              >
                {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                {expanded ? 'collapse' : 'expand'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ScratchpadView() {
  const [notes,  setNotes]  = useState(loadNotes)
  const [newVal, setNewVal] = useState('')
  const [newTag, setNewTag] = useState('')
  const [filter, setFilter] = useState('all')
  const inputRef = useRef()

  const tags = [...new Set(notes.map(n => n.tag).filter(Boolean))]

  const addNote = () => {
    if (!newVal.trim()) return
    const note = {
      id: uid(), content: newVal.trim(),
      tag: newTag.trim() || null,
      createdAt: Date.now(), updatedAt: Date.now()
    }
    const next = [note, ...notes]
    setNotes(next); saveNotes(next)
    setNewVal(''); setNewTag('')
    toast.success("Idea saved to scratchpad")
    inputRef.current?.focus()
  }

  const updateNote = (id, content) => {
    const next = notes.map(n => n.id === id ? { ...n, content, updatedAt: Date.now() } : n)
    setNotes(next); saveNotes(next)
  }

  const deleteNote = (id) => {
    const next = notes.filter(n => n.id !== id)
    setNotes(next); saveNotes(next)
    toast.success("Note deleted")
  }

  const filtered = filter === 'all' ? notes : notes.filter(n => n.tag === filter)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <h2 className="font-display text-lg font-bold text-primary tracking-tight">Scratchpad</h2>
        <p className="text-[11px] text-faint mt-0.5">private space for ideas, links, raw thoughts — not tracked as tasks</p>
      </div>

      {/* Add note */}
      <div className="rounded-xl border border-subtle bg-card mb-5 focus-within:border-subtle-hover transition-colors">
        <textarea
          ref={inputRef}
          className="w-full bg-transparent px-4 pt-3 pb-2 text-[13px] text-primary placeholder:text-faint focus:outline-none resize-none leading-relaxed"
          rows={3}
          value={newVal}
          onChange={e => setNewVal(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addNote()
          }}
          placeholder="Dump an idea, paste a link, write a thought...  ⌘Enter to save"
        />
        <div className="flex items-center gap-2 px-4 pb-3 border-t border-subtle pt-2">
          <input
            className="flex-1 h-7 rounded-lg border border-subtle bg-surface px-2 text-[11px] text-primary placeholder:text-faint focus:outline-none focus:border-subtle-hover"
            placeholder="tag (optional) e.g. idea, link, read-later"
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addNote()}
          />
          <Button size="sm" onClick={addNote} className="gap-1.5 flex-shrink-0">
            <Plus size={12} /> add
          </Button>
        </div>
      </div>

      {/* Tag filter */}
      {tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          <button
            onClick={() => setFilter('all')}
            className={cn("text-[10px] px-3 py-1.5 rounded-lg border transition-all",
              filter === 'all' ? "border-teal-400/50 bg-teal-400/10 text-teal-400" : "border-subtle text-faint hover:text-primary"
            )}
          >
            all ({notes.length})
          </button>
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={cn("text-[10px] px-3 py-1.5 rounded-lg border transition-all",
                filter === tag ? "border-teal-400/50 bg-teal-400/10 text-teal-400" : "border-subtle text-faint hover:text-primary"
              )}
            >
              {tag} ({notes.filter(n => n.tag === tag).length})
            </button>
          ))}
        </div>
      )}

      {/* Notes list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-faint text-xs border border-dashed border-subtle rounded-xl">
          <p className="text-3xl mb-3 opacity-20">💡</p>
          nothing here yet — dump your first idea above
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(note => (
            <NoteCard key={note.id} note={note} onUpdate={updateNote} onDelete={deleteNote} />
          ))}
        </div>
      )}
    </div>
  )
}