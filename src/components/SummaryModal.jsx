import { Copy, FileText } from "lucide-react"
import TaskChip from "./TaskChip"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog"
import { formatDateLong, cn } from "@/lib/utils"

function buildPlainText(date, done, open) {
  let t = `Work Summary — ${formatDateLong(date)}\n\n`
  if (done.length) { t += `COMPLETED (${done.length}):\n`; done.forEach(x => { t += `  ✓ [${x.tag}] ${x.title}\n` }) }
  if (open.length) { t += `\nIN PROGRESS / OPEN (${open.length}):\n`; open.forEach(x => { t += `  ○ [${x.tag}] ${x.title}\n` }) }
  return t
}

function buildMarkdown(date, done, open) {
  let m = `## Work Summary — ${formatDateLong(date)}\n\n`
  if (done.length) { m += `### ✅ Completed (${done.length})\n`; done.forEach(x => { m += `- \`${x.tag}\` ${x.title}\n` }) }
  if (open.length) { m += `\n### 🔄 In Progress / Open (${open.length})\n`; open.forEach(x => { m += `- \`${x.tag}\` ${x.title}\n` }) }
  return m
}

export default function SummaryModal({ date, tasks, open, onClose }) {
  const done = tasks.filter(t => t.done)
  const remaining = tasks.filter(t => !t.done)

  const copy = text => navigator.clipboard.writeText(text)

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Day Summary</DialogTitle>
          <DialogDescription>{formatDateLong(date)} · {done.length}/{tasks.length} completed</DialogDescription>
        </DialogHeader>

        {!tasks.length && (
          <p className="text-xs text-faint text-center py-8">no tasks logged for this day.</p>
        )}

        {done.length > 0 && (
          <div className="mb-4">
            <p className="text-[9px] text-green-400 uppercase tracking-widest font-medium mb-2">
              completed ({done.length})
            </p>
            <div className="space-y-1">
              {done.map(t => (
                <div key={t.id} className="flex items-start gap-2.5 py-1.5 border-b border-subtle last:border-0">
                  <span className="text-green-400 text-[11px] mt-0.5 flex-shrink-0">✓</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-accent leading-snug">{t.title}</p>
                    <div className="mt-1"><TaskChip tag={t.tag} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {remaining.length > 0 && (
          <div className="mb-4">
            <p className="text-[9px] text-amber-400 uppercase tracking-widest font-medium mb-2">
              open / in progress ({remaining.length})
            </p>
            <div className="space-y-1">
              {remaining.map(t => (
                <div key={t.id} className="flex items-start gap-2.5 py-1.5 border-b border-subtle last:border-0">
                  <span className="text-faint text-[11px] mt-0.5 flex-shrink-0">○</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-accent leading-snug">{t.title}</p>
                    <div className="mt-1"><TaskChip tag={t.tag} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        <div className="flex gap-2 mt-4 flex-wrap">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => copy(buildPlainText(date, done, remaining))}>
            <Copy size={11} /> copy as text
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => copy(buildMarkdown(date, done, remaining))}>
            <FileText size={11} /> copy as markdown
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
