import React, { useState } from "react"
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react"

interface FilterItem {
  component: React.ReactNode
}

interface FilterToolbarProps {
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  filters?: FilterItem[]
  datePicker?: React.ReactNode
}

const FilterToolbar = ({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filters = [],
  datePicker,
}: FilterToolbarProps) => {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const hasFilters = Boolean(datePicker) || filters.length > 0

  const searchInput = (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
      <input
        type="text"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange?.(e.target.value)}
        className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-800 dark:bg-white/5 dark:text-white/90 dark:placeholder:text-gray-500 dark:focus:bg-gray-700"
      />
    </div>
  )

  return (
    <div className="mt-[18px] pt-4">
      {/* Desktop + Tablet */}
      <div className="hidden flex-wrap items-center justify-between gap-3 sm:flex">
        {/* Search — left side */}
        <div className="relative min-w-[220px] max-w-[380px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-800 dark:bg-white/5 dark:text-white/90 dark:placeholder:text-gray-500 dark:focus:bg-gray-700"
          />
        </div>

        {/* Filters — right side */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-3">
            {datePicker && <>{datePicker}</>}

            {filters.map((filter, index) => (
              <React.Fragment key={index}>
                {index > 0 || datePicker ? (
                  <div className="h-8 w-px bg-border shrink-0" />
                ) : null}
                <div className="min-w-0">{filter.component}</div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-3 sm:hidden">
        {searchInput}

        {hasFilters && (
          <>
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              Filters
              <ChevronDown
                className={`size-4 text-muted-foreground transition-transform ${filtersOpen ? "rotate-180" : ""}`}
              />
            </button>

            {filtersOpen && (
              <div className="flex flex-col gap-3">
                {datePicker && <>{datePicker}</>}

                {filters.map((filter, index) => (
                  <div key={index}>{filter.component}</div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default FilterToolbar
