import { useState } from "react"

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

  const inputClass =
    "h-9 w-full min-w-0 rounded-lg border border-border bg-accent px-3 text-sm text-foreground transition-all outline-none placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-primary"

  return (
    <div className="flex items-center gap-2 w-full">
      {/* MIN */}
      <input
        type="number"
        placeholder="Min"
        value={range.min}
        onChange={(e) => handleChange("min", e.target.value)}
        className={inputClass}
      />

      <span className="text-muted-foreground shrink-0">-</span>

      {/* MAX */}
      <input
        type="number"
        placeholder="Max"
        value={range.max}
        onChange={(e) => handleChange("max", e.target.value)}
        className={inputClass}
      />
    </div>
  )
}