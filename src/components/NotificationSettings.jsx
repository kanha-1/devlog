import { useState, useEffect } from "react"
import { Bell, BellOff, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { requestPermission, getPermission, getReminderSettings, saveReminderSettings, scheduleDailyReminder, clearReminders, sendNotification } from "@/lib/notifications"
import { cn } from "@/lib/utils"

const REMINDER_TIMES = [
  { label: 'Morning standup', hour: 9,  minute: 0  },
  { label: 'Midday check-in', hour: 12, minute: 0  },
  { label: 'End of day',      hour: 17, minute: 30 },
  { label: 'Custom',          hour: null, minute: null },
]

export default function NotificationSettings({ open, onClose, getTasks }) {
  const [permission,  setPermission]  = useState(getPermission())
  const [settings,    setSettings]    = useState(getReminderSettings())
  const [customHour,  setCustomHour]  = useState(settings.hour)
  const [customMin,   setCustomMin]   = useState(settings.minute)
  const [saved,       setSaved]       = useState(false)

  useEffect(() => {
    if (open) {
      setPermission(getPermission())
      const s = getReminderSettings()
      setSettings(s)
      setCustomHour(s.hour)
      setCustomMin(s.minute)
    }
  }, [open])

  const handleRequestPermission = async () => {
    const result = await requestPermission()
    setPermission(result)
  }

  const handleSave = () => {
    const newSettings = { ...settings, hour: customHour, minute: customMin }
    saveReminderSettings(newSettings)
    setSettings(newSettings)
    if (newSettings.enabled && permission === 'granted') {
      scheduleDailyReminder(customHour, customMin, getTasks)
    } else {
      clearReminders()
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleTest = () => {
    sendNotification('devlog test', 'Notifications are working! 🎉')
  }

  const isUnsupported = permission === 'unsupported'
  const isDenied = permission === 'denied'
  const isGranted = permission === 'granted'

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogDescription>Daily reminders to keep on top of your tasks</DialogDescription>
        </DialogHeader>

        {/* Permission status */}
        <div className={cn(
          "flex items-center gap-3 rounded-lg p-3 mb-4",
          isGranted   && "bg-green-400/10 border border-green-400/20",
          isDenied    && "bg-red-400/10 border border-red-400/20",
          isUnsupported && "bg-surface border border-subtle",
          !isGranted && !isDenied && !isUnsupported && "bg-amber-400/10 border border-amber-400/20"
        )}>
          <Bell size={16} className={cn(
            isGranted    && "text-green-400",
            isDenied     && "text-red-400",
            !isGranted && !isDenied && "text-amber-400"
          )} />
          <div className="flex-1">
            <p className="text-xs font-medium text-primary">
              {isGranted    && "Notifications enabled"}
              {isDenied     && "Notifications blocked"}
              {isUnsupported && "Not supported in this browser"}
              {!isGranted && !isDenied && !isUnsupported && "Permission not granted yet"}
            </p>
            <p className="text-[10px] text-faint mt-0.5">
              {isDenied && "Go to browser settings to re-enable"}
              {isUnsupported && "Try Chrome or Firefox"}
              {!isGranted && !isDenied && !isUnsupported && "Click below to allow notifications"}
            </p>
          </div>
        </div>

        {/* iOS tip */}
        <div className="bg-surface rounded-lg p-3 mb-4 border border-subtle">
          <p className="text-[10px] text-faint leading-relaxed">
            <span className="text-primary font-medium">On iPhone:</span> Open this app in Safari → tap Share → "Add to Home Screen" → install → open from home screen → allow notifications when prompted. Requires iOS 16.4+.
          </p>
        </div>

        {!isGranted && !isDenied && !isUnsupported && (
          <Button className="w-full mb-4" onClick={handleRequestPermission}>
            Enable notifications
          </Button>
        )}

        {/* Reminder toggle */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-primary">Daily reminder</p>
            <p className="text-[10px] text-faint">Get a nudge about open tasks</p>
          </div>
          <button
            onClick={() => setSettings(s => ({ ...s, enabled: !s.enabled }))}
            className={cn(
              "relative w-10 h-5 rounded-full transition-colors",
              settings.enabled && isGranted ? "bg-teal-400" : "bg-elevated"
            )}
            disabled={!isGranted}
          >
            <span className={cn(
              "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform",
              settings.enabled && isGranted && "translate-x-5"
            )} />
          </button>
        </div>

        {/* Time picker */}
        {settings.enabled && isGranted && (
          <div className="mb-4 animate-fade-in">
            <p className="text-[10px] text-faint uppercase tracking-widest mb-2">reminder time</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {REMINDER_TIMES.filter(t => t.hour !== null).map(t => (
                <button
                  key={t.label}
                  onClick={() => { setCustomHour(t.hour); setCustomMin(t.minute) }}
                  className={cn(
                    "text-[11px] px-3 py-2 rounded-lg border transition-all text-left",
                    customHour === t.hour && customMin === t.minute
                      ? "border-teal-400/50 bg-teal-400/10 text-teal-400"
                      : "border-subtle text-muted hover:border-subtle-hover"
                  )}
                >
                  <span className="block font-medium">{t.label}</span>
                  <span className="text-[10px] opacity-70">{String(t.hour).padStart(2,'0')}:{String(t.minute).padStart(2,'0')}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-faint">Custom time:</span>
              <input
                type="number" min={0} max={23} value={customHour}
                onChange={e => setCustomHour(parseInt(e.target.value))}
                className="w-14 text-center h-7 rounded border border-subtle bg-elevated text-xs text-primary focus:outline-none"
              />
              <span className="text-faint">:</span>
              <input
                type="number" min={0} max={59} value={customMin}
                onChange={e => setCustomMin(parseInt(e.target.value))}
                className="w-14 text-center h-7 rounded border border-subtle bg-elevated text-xs text-primary focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button className="flex-1 gap-1.5" onClick={handleSave}>
            {saved ? <><Check size={12} /> Saved!</> : "Save settings"}
          </Button>
          {isGranted && (
            <Button variant="outline" onClick={handleTest}>Test</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
