import React from "react"
import { ActionButton } from "./ActionButton"
import { Check, RotateCcw } from "lucide-react"

interface FilterItem {
  component: React.ReactNode
}

interface FilterToolbarProps {
  searchPlaceholder?: string
  filters?: FilterItem[]
  datePicker?: React.ReactNode
  onApply?: () => void
  onReset?: () => void
}

const FilterToolbar = ({
  searchPlaceholder = "Search...",
  filters = [],
  datePicker,
  onApply,
  onReset,
}: FilterToolbarProps) => {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-4 backdrop-blur-sm">
      {/* Desktop */}
      <div className="hidden xl:flex items-center gap-3">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="h-11 w-full rounded-xl border border-border bg-transparent px-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Date Picker */}
        {datePicker && (
          <>
            <div className="h-8 w-px bg-border" />
            {datePicker}
          </>
        )}

        {/* Dynamic Filters */}
        {filters.map((filter, index) => (
          <React.Fragment key={index}>
            <div className="h-8 w-px bg-border" />
            <div>{filter.component}</div>
          </React.Fragment>
        ))}

        {/* Buttons */}
        <div className="ml-auto flex items-center gap-3">
          <ActionButton variant="apply" icon={Check}>Apply</ActionButton>
          <ActionButton variant="reset" icon={RotateCcw}>Reset</ActionButton>
        </div>
      </div>

      {/* Mobile + Tablet */}
      <div className="grid grid-cols-1 gap-3 xl:hidden">
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="h-11 w-full rounded-xl border border-border bg-transparent px-4 text-sm outline-none transition-all focus:border-primary"
        />

        {datePicker}

        {filters.length > 0 && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filters.map((filter, index) => (
              <div key={index}>{filter.component}</div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <ActionButton variant="apply" icon={Check}>Apply</ActionButton>
          <ActionButton variant="reset" icon={RotateCcw}>Reset</ActionButton>
        </div>
      </div>
    </div>
  )
}

export default FilterToolbar