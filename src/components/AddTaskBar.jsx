import { useState, useRef } from "react"
import { Plus, Clock, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const TAGS = ['feat','bug','review','infra','meet','doc','other']

function localDateTimeValue(offsetHours = 2) {
  const d   = new Date(Date.now() + offsetHours * 3600000)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function AddTaskBar({ onAdd }) {
  const [title,      setTitle]      = useState('')
  const [tag,        setTag]        = useState('feat')
  const [priority,   setPriority]   = useState('med')
  const [showEta,    setShowEta]    = useState(false)
  const [etaInput,   setEtaInput]   = useState('')   // raw datetime-local value
  const [etaLocked,  setEtaLocked]  = useState(null) // confirmed ISO string
  const ref = useRef()

  const openEta = () => {
    setEtaInput(localDateTimeValue())
    setShowEta(true)
  }

  const confirmEta = () => {
    if (!etaInput) return
    setEtaLocked(new Date(etaInput).toISOString())
    setShowEta(false)
  }

  const clearEta = () => {
    setEtaInput('')
    setEtaLocked(null)
    setShowEta(false)
  }

  const submit = () => {
    if (!title.trim()) return
    // If ETA row is open and user presses Enter on title, confirm ETA first
    const finalEta = showEta && etaInput
      ? new Date(etaInput).toISOString()
      : etaLocked

    onAdd({ title: title.trim(), tag, priority, eta: finalEta || null })
    setTitle('')
    setEtaInput('')
    setEtaLocked(null)
    setShowEta(false)
    ref.current?.focus()
  }

  const hasEta = !!etaLocked

  return (
    <div className="mb-6 rounded-xl border border-subtle bg-card transition-colors focus-within:border-subtle-hover">

      {/* Main row */}
      <div className="flex gap-2 px-3 py-2 items-center">
        <Input
          ref={ref}
          className="flex-1 border-none bg-transparent px-0 focus:ring-0 h-7 text-[13px]"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Add a task...  e.g. fix null pointer in auth service"
          autoFocus
        />
        <Select value={tag} onChange={e => setTag(e.target.value)} className="h-7 text-[11px] hidden sm:block">
          {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Select value={priority} onChange={e => setPriority(e.target.value)} className="h-7 text-[11px]">
          <option value="high">! high</option>
          <option value="med">~ med</option>
          <option value="low">low</option>
        </Select>

        {/* Clock button — shows ETA state */}
        <button
          type="button"
          onClick={hasEta ? clearEta : openEta}
          className={cn(
            "flex-shrink-0 p-1.5 rounded-md transition-all flex items-center gap-1",
            hasEta
              ? "text-teal-400 bg-teal-400/10"
              : showEta
                ? "text-teal-400 bg-teal-400/10"
                : "text-faint hover:text-primary hover:bg-elevated"
          )}
          title={hasEta ? "Clear ETA" : "Set ETA"}
        >
          <Clock size={13} />
          {hasEta && (
            <span className="text-[9px] font-medium hidden sm:inline">
              {new Date(etaLocked).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
          )}
        </button>

        <Button size="sm" onClick={submit} className="gap-1.5 flex-shrink-0">
          <Plus size={13} /> add
        </Button>
      </div>

      {/* ETA picker row — only shown when setting */}
      {showEta && (
        <div className="px-3 pb-3 pt-1 border-t border-subtle animate-fade-in">
          <p className="text-[9px] text-faint uppercase tracking-widest mb-2">Set ETA for this task</p>
          <div className="flex items-center gap-2">
            <Clock size={11} className="text-teal-400 flex-shrink-0" />
            <input
              type="datetime-local"
              value={etaInput}
              onChange={e => setEtaInput(e.target.value)}
              className="flex-1 h-8 rounded-lg border border-subtle bg-surface px-2 text-[12px] text-primary focus:outline-none focus:border-subtle-hover"
              autoFocus
            />
            {/* Confirm tick */}
            <button
              type="button"
              onClick={confirmEta}
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-teal-400/15 text-teal-400 hover:bg-teal-400/25 transition-colors flex items-center justify-center"
              title="Confirm ETA"
            >
              <Check size={13} />
            </button>
            {/* Cancel X */}
            <button
              type="button"
              onClick={clearEta}
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-elevated text-faint hover:text-red-400 hover:bg-red-400/10 transition-colors flex items-center justify-center"
              title="Cancel ETA"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}