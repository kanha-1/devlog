import { useState, useRef } from "react"
import { Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const TAGS = ['feat','bug','review','infra','meet','doc','other']

export default function AddTaskBar({ onAdd }) {
  const [title, setTitle]       = useState('')
  const [tag, setTag]           = useState('feat')
  const [priority, setPriority] = useState('med')
  const ref = useRef()

  const submit = () => {
    if (!title.trim()) return
    onAdd({ title: title.trim(), tag, priority })
    setTitle('')
    ref.current?.focus()
  }

  return (
    <div className="flex gap-2 mb-6 rounded-xl border border-subtle bg-card px-3 py-2 items-center focus-within:border-subtle-hover transition-colors">
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
      <Button size="sm" onClick={submit} className="gap-1.5 flex-shrink-0">
        <Plus size={13} /> add
      </Button>
    </div>
  )
}
