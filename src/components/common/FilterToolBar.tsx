import React, { useState } from "react"
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterItem {
  component: React.ReactNode
  /** Marks the filter as set, so a collapsed "More filters" button can show a count. */
  active?: boolean
  /** Gives the control a wider inline slot (e.g. a search-as-you-type picker). */
  wide?: boolean
}

interface FilterToolbarProps {
  searchPlaceholder?: string
  searchValue?: string
  /** Omit to hide the search box (for endpoints without text search). */
  onSearchChange?: (value: string) => void
  filters?: FilterItem[]
  datePicker?: React.ReactNode
  /**
   * How many controls (date picker first, then filters) stay on the toolbar row on wide
   * screens. The rest live in a "More filters" panel, so the row never wraps.
   */
  inlineCount?: number
}

const SEARCH_INPUT_CLASS =
  "h-11 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-800 dark:bg-white/5 dark:text-white/90 dark:placeholder:text-gray-500 dark:focus:bg-gray-700"

const TOGGLE_CLASS =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-gray-800"

const FilterToolbar = ({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filters = [],
  datePicker,
  inlineCount = 2,
}: FilterToolbarProps) => {
  const [panelOpen, setPanelOpen] = useState(false)
  // Some endpoints have no text search; the toolbar then holds only the filters.
  const hasSearch = Boolean(onSearchChange)

  // The date picker is treated as the first control so it gets an inline slot first.
  const controls: (FilterItem & { key: string; auto?: boolean })[] = [
    ...(datePicker ? [{ key: "date", component: datePicker, auto: true }] : []),
    ...filters.map((f, i) => ({ ...f, key: `filter-${i}` })),
  ]
  const inline = controls.slice(0, inlineCount)
  const overflow = controls.slice(inlineCount)
  const activeOverflow = overflow.filter((c) => c.active).length
  const activeAll = controls.filter((c) => c.active).length

  const searchInput = (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
      <input
        type="text"
        aria-label={searchPlaceholder}
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange?.(e.target.value)}
        className={SEARCH_INPUT_CLASS}
      />
    </div>
  )

  const toggle = (label: string, count: number, className?: string) => (
    <button
      type="button"
      onClick={() => setPanelOpen((v) => !v)}
      aria-expanded={panelOpen}
      className={cn(TOGGLE_CLASS, className)}
    >
      <SlidersHorizontal className="size-4 text-muted-foreground" />
      {label}
      {count > 0 && (
        <span className="rounded-full bg-primary-500/15 px-1.5 text-xs font-semibold text-primary-500">
          {count}
        </span>
      )}
      <ChevronDown
        className={cn("size-4 text-muted-foreground transition-transform", panelOpen && "rotate-180")}
      />
    </button>
  )

  return (
    <div className="mt-4 pt-4">
      {/* Desktop + Tablet: always a single row. */}
      <div className="hidden sm:block">
        <div className="flex items-center gap-3">
          {hasSearch ? (
            <div className="min-w-0 flex-1 lg:max-w-[380px]">{searchInput}</div>
          ) : (
            <div className="flex-1" />
          )}

          {/* Wide screens: the first few controls sit inline at a fixed width. */}
          {inline.length > 0 && (
            <div className={cn("hidden shrink-0 items-center gap-3 lg:flex", hasSearch ? "ml-auto" : "order-first")}>
              {inline.map((c) => (
                <div key={c.key} className={cn("shrink-0", c.auto ? "w-auto" : c.wide ? "w-64" : "w-44")}>
                  {c.component}
                </div>
              ))}
            </div>
          )}

          {/* Below lg every control moves into the panel; on lg+ only the overflow does. */}
          {controls.length > 0 && toggle("Filters", activeAll, cn("lg:hidden", inline.length === 0 && "ml-auto"))}
          {overflow.length > 0 && toggle("More filters", activeOverflow, "hidden lg:inline-flex")}
        </div>

        {panelOpen && controls.length > 0 && (
          <div
            className={cn(
              "mt-3 grid grid-cols-2 gap-3 rounded-lg border border-border bg-background/60 p-3 md:grid-cols-3 xl:grid-cols-4",
              overflow.length === 0 && "lg:hidden"
            )}
          >
            {controls.map((c, index) => (
              <div
                key={c.key}
                className={cn("min-w-0", index < inline.length && "lg:hidden", (c.auto || c.wide) && "col-span-2 md:col-span-1")}
              >
                {c.component}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-3 sm:hidden">
        {hasSearch && searchInput}

        {controls.length > 0 && (
          <>
            {toggle("Filters", activeAll)}

            {panelOpen && (
              <div className="flex flex-col gap-3">
                {controls.map((c) => (
                  <div key={c.key}>{c.component}</div>
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
