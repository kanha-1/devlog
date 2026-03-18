import { Badge } from "@/components/ui/badge"
import { TAG_META } from "@/lib/utils"
import { cn } from "@/lib/utils"

export default function TaskChip({ tag }) {
  const m = TAG_META[tag] || TAG_META.other
  return (
    <Badge className={cn(m.bg, m.color)}>
      {tag}
    </Badge>
  )
}
