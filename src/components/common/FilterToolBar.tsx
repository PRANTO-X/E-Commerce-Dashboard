import React from "react"
import { Button } from "@/components/ui/button"
import { Check, RotateCcw, Search } from "lucide-react"

interface FilterItem {
  component: React.ReactNode
}

interface FilterToolbarProps {
  searchPlaceholder?: string
  filters?: FilterItem[]
  datePicker?: React.ReactNode
  onApply?: () => void
  onReset?: () => void
  stacked?: boolean
}

const FilterToolbar = ({
  searchPlaceholder = "Search...",
  filters = [],
  datePicker,
  onApply,
  onReset,
  stacked = false,
}: FilterToolbarProps) => {
  const searchInput = (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        placeholder={searchPlaceholder}
        className="h-9 w-full rounded-xl border border-field-border bg-field-bg pl-10 pr-4 text-sm text-field-text placeholder:text-field-placeholder outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  )

  return (
    <div className="rounded-2xl border border-border bg-card/50 p-4 backdrop-blur-sm">
      {/* Desktop */}
      <div className="hidden xl:block">
        {stacked ? (
          <div className="flex flex-col gap-3 min-[1550px]:flex-row min-[1550px]:items-center">
            {/* Search full width on top, inline at 1550px+ */}
            <div className="w-full min-[1550px]:flex-1">{searchInput}</div>

            {/* Filters + buttons row below, flex-1 at 1550px+ */}
            <div className="flex items-center gap-3 min-[1550px]:flex-1 min-w-0">
              {/* Date Picker */}
              {datePicker && <>{datePicker}</>}

              {/* Dynamic Filters */}
              {filters.map((filter, index) => (
                <React.Fragment key={index}>
                  {index > 0 || datePicker ? (
                    <div className="h-8 w-px bg-border shrink-0" />
                  ) : null}
                  <div className="min-w-0 flex-1">{filter.component}</div>
                </React.Fragment>
              ))}

              {/* Buttons */}
              <div className="ml-auto flex items-center gap-3">
                <Button variant="apply" size="action" onClick={onApply}>
                  <Check className="size-5" />
                  Apply
                </Button>
                <Button variant="reset" size="action" onClick={onReset}>
                  <RotateCcw className="size-5" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {searchInput}

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
              <Button variant="apply" size="action" onClick={onApply}>
                <Check className="size-5" />
                Apply
              </Button>
              <Button variant="reset" size="action" onClick={onReset}>
                <RotateCcw className="size-5" />
                Reset
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile + Tablet */}
      <div className="grid grid-cols-1 gap-3 xl:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-xl border border-field-border bg-field-bg pl-10 pr-4 text-sm text-field-text placeholder:text-field-placeholder outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {datePicker}

        {filters.length > 0 && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filters.map((filter, index) => (
              <div key={index}>{filter.component}</div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button variant="apply" size="action" onClick={onApply}>
            <Check className="size-5" />
            Apply
          </Button>
          <Button variant="reset" size="action" onClick={onReset}>
            <RotateCcw className="size-5" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FilterToolbar
