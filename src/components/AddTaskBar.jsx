import { useState, useRef } from "react"
import { Plus, Clock, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const TAGS = ['feat','bug','review','infra','meet','doc','other']

// Format local datetime for input default
function localDateTimeValue(offsetHours = 2) {
  const d = new Date(Date.now() + offsetHours * 3600000)
  return d.toISOString().slice(0, 16)
}

export default function AddTaskBar({ onAdd }) {
  const [title,    setTitle]    = useState('')
  const [tag,      setTag]      = useState('feat')
  const [priority, setPriority] = useState('med')
  const [showEta,  setShowEta]  = useState(false)
  const [eta,      setEta]      = useState('')
  const ref = useRef()

  const submit = () => {
    if (!title.trim()) return
    onAdd({ title: title.trim(), tag, priority, eta: eta || null })
    setTitle(''); setEta(''); setShowEta(false)
    ref.current?.focus()
  }

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

        {/* ETA toggle */}
        <button
          onClick={() => { setShowEta(v => !v); if (!eta) setEta(localDateTimeValue()) }}
          className={cn(
            "flex-shrink-0 p-1.5 rounded-md transition-all",
            showEta || eta
              ? "text-teal-400 bg-teal-400/10"
              : "text-faint hover:text-primary hover:bg-elevated"
          )}
          title="Set ETA"
        >
          <Clock size={13} />
        </button>

        <Button size="sm" onClick={submit} className="gap-1.5 flex-shrink-0">
          <Plus size={13} /> add
        </Button>
      </div>

      {/* ETA row */}
      {showEta && (
        <div className="px-3 pb-2.5 pt-0 border-t border-subtle flex items-center gap-2 animate-fade-in">
          <Clock size={11} className="text-teal-400 flex-shrink-0" />
          <span className="text-[10px] text-faint">ETA</span>
          <input
            type="datetime-local"
            value={eta}
            onChange={e => setEta(e.target.value)}
            className="flex-1 h-7 rounded border border-subtle bg-surface px-2 text-[11px] text-primary focus:outline-none focus:border-subtle-hover"
          />
          <button
            onClick={() => { setEta(''); setShowEta(false) }}
            className="text-faint hover:text-red-400 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  )
}