import { useState, useEffect } from "react"
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

  useEffect(() => {
    onChange?.({
      min: range.min === "" ? null : Number(range.min),
      max: range.max === "" ? null : Number(range.max),
    })
  }, [range, onChange])

  const handleChange = (key: keyof PriceRange, value: string) => {
    setRange((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div className="flex items-center gap-2">
      {/* MIN */}
      <Input
        type="number"
        placeholder="Min"
        value={range.min}
        onChange={(e) => handleChange("min", e.target.value)}
        className="w-24"
      />

      <span className="text-muted-foreground">-</span>

      {/* MAX */}
      <Input
        type="number"
        placeholder="Max"
        value={range.max}
        onChange={(e) => handleChange("max", e.target.value)}
        className="w-24"
      />
    </div>
  )
}