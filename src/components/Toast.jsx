import { useState, useEffect, useCallback } from "react"
import { CheckCircle, XCircle, WifiOff, X } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Toast store (singleton outside React) ────────────────────────────────────
let listeners = []
let toasts    = []
let nextId    = 0

export const toast = {
  success: (msg) => emit({ type: 'success', msg }),
  error:   (msg) => emit({ type: 'error',   msg }),
  offline: (msg) => emit({ type: 'offline', msg }),
}

function emit(t) {
  const item = { ...t, id: ++nextId }
  toasts = [...toasts, item]
  listeners.forEach(fn => fn([...toasts]))
  // auto dismiss success after 3s, errors after 5s
  setTimeout(() => dismiss(item.id), t.type === 'error' ? 5000 : 3000)
}

function dismiss(id) {
  toasts = toasts.filter(t => t.id !== id)
  listeners.forEach(fn => fn([...toasts]))
}

// ── Component ─────────────────────────────────────────────────────────────────
const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  offline: WifiOff,
}
const STYLES = {
  success: 'border-green-400/30 bg-green-400/10 text-green-400',
  error:   'border-red-400/30   bg-red-400/10   text-red-400',
  offline: 'border-amber-400/30 bg-amber-400/10 text-amber-400',
}

function ToastItem({ toast: t, onDismiss }) {
  const [visible, setVisible] = useState(false)
  const Icon = ICONS[t.type] || CheckCircle

  useEffect(() => {
    // mount → animate in
    requestAnimationFrame(() => setVisible(true))
  }, [])

  return (
    <div className={cn(
      "flex items-center gap-2.5 px-4 py-3 rounded-xl border text-[12px] font-medium shadow-lg",
      "transition-all duration-300",
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
      STYLES[t.type]
    )}>
      <Icon size={14} className="flex-shrink-0" />
      <span className="flex-1">{t.msg}</span>
      <button onClick={() => onDismiss(t.id)} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <X size={12} />
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const [items, setItems] = useState([])

  useEffect(() => {
    listeners.push(setItems)
    return () => { listeners = listeners.filter(fn => fn !== setItems) }
  }, [])

  if (!items.length) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {items.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  )
}