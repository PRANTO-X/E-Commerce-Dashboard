import { useState } from "react"
import { Input } from "@/components/ui/input"

type PriceRange = {
  min: string
  max: string
}

type PriceRangeFilterProps = {
  onChange?: (range: { min: number | null; max: number | null }) => void
}

export function PriceRangeFilter({ onChange }: PriceRangeFilterProps) {
  const [range, setRange] = useState<PriceRange>({
    min: "",
    max: "",
  })

  const handleChange = (key: keyof PriceRange, value: string) => {
    const next = { ...range, [key]: value }
    setRange(next)
    onChange?.({
      min: next.min === "" ? null : Number(next.min),
      max: next.max === "" ? null : Number(next.max),
    })
  }

  return (
    <div className="flex items-center gap-2 w-full">
      {/* MIN */}
      <Input
        type="number"
        placeholder="Min"
        value={range.min}
        onChange={(e) => handleChange("min", e.target.value)}
        className="flex-1 h-9"
      />

      <span className="text-muted-foreground shrink-0">-</span>

      {/* MAX */}
      <Input
        type="number"
        placeholder="Max"
        value={range.max}
        onChange={(e) => handleChange("max", e.target.value)}
        className="flex-1 h-9"
      />
    </div>
  )
}