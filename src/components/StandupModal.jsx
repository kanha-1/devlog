import { Copy, Check, Zap } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { todayStr, yesterdayStr, formatDateShort } from "@/lib/utils"

function buildStandup(tasks) {
  const today     = todayStr()
  const yesterday = yesterdayStr()

  const yesterdayDone = tasks.filter(t => t.date === yesterday && t.done)
  const todayPlanned  = tasks.filter(t => t.date === today && !t.done)
  const blockers      = tasks.filter(t => t.date === today && t.priority === 'high' && !t.done)

  let text = `🗓 Standup — ${formatDateShort(today)}\n\n`

  text += `✅ Yesterday (${formatDateShort(yesterday)}):\n`
  if (yesterdayDone.length)
    yesterdayDone.forEach(t => { text += `  • [${t.tag}] ${t.title}\n` })
  else
    text += `  • No completed tasks logged\n`

  text += `\n🎯 Today:\n`
  if (todayPlanned.length)
    todayPlanned.forEach(t => { text += `  • [${t.tag}] ${t.title}\n` })
  else
    text += `  • No tasks planned yet\n`

  text += `\n🚧 Blockers:\n`
  if (blockers.length)
    blockers.forEach(t => { text += `  • [${t.tag}] ${t.title}\n` })
  else
    text += `  • None\n`

  return text
}

function buildMarkdown(tasks) {
  const today     = todayStr()
  const yesterday = yesterdayStr()
  const yesterdayDone = tasks.filter(t => t.date === yesterday && t.done)
  const todayPlanned  = tasks.filter(t => t.date === today && !t.done)
  const blockers      = tasks.filter(t => t.date === today && t.priority === 'high' && !t.done)

  let md = `## 🗓 Standup — ${formatDateShort(today)}\n\n`
  md += `### ✅ Yesterday\n`
  if (yesterdayDone.length) yesterdayDone.forEach(t => { md += `- \`${t.tag}\` ${t.title}\n` })
  else md += `- No completed tasks logged\n`
  md += `\n### 🎯 Today\n`
  if (todayPlanned.length) todayPlanned.forEach(t => { md += `- \`${t.tag}\` ${t.title}\n` })
  else md += `- No tasks planned yet\n`
  md += `\n### 🚧 Blockers\n`
  if (blockers.length) blockers.forEach(t => { md += `- \`${t.tag}\` ${t.title}\n` })
  else md += `- None\n`
  return md
}

export default function StandupModal({ open, onClose, tasks }) {
  const [copied, setCopied] = useState('')
  const text = buildStandup(tasks)
  const md   = buildMarkdown(tasks)

  const copy = (content, type) => {
    navigator.clipboard.writeText(content)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Zap size={14} className="text-teal-400" /> Quick Standup</DialogTitle>
          <DialogDescription>Auto-generated from your yesterday + today tasks</DialogDescription>
        </DialogHeader>

        <pre className="rounded-lg bg-surface border border-subtle p-4 text-[11px] text-primary leading-relaxed whitespace-pre-wrap font-mono overflow-auto max-h-72">
          {text}
        </pre>

        <Separator />
        <div className="flex gap-2 mt-4 flex-wrap">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => copy(text, 'text')}>
            {copied === 'text' ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> copy as text</>}
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => copy(md, 'md')}>
            {copied === 'md' ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> copy as markdown</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
