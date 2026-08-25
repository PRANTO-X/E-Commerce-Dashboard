import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  type LucideIcon,
} from "lucide-react"

import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { EmptyState } from "./EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircleIcon, Loader2Icon } from "lucide-react"
import { getApiErrorMessage } from "@/lib/api/client"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageSize?: number
  columnWidths?: string[]
  minWidth?: string
  showPagination?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: LucideIcon
  emptyActionLabel?: string
  onEmptyAction?: () => void
  /** True while the current page's data is being fetched. On first load (no data yet)
   * this renders skeleton rows; on a refetch with existing data it dims the table and
   * shows a small inline spinner instead of replacing the rows the user is looking at. */
  isLoading?: boolean
  /** Set when the fetch backing this table failed — from the slice's `error` field. */
  error?: unknown
  /** Shown as a "Retry" action on the error state, when the fetch can be re-dispatched. */
  onRetry?: () => void
  /** Server-side pagination mode: `data` is just the current page, and page changes are
   * driven by `onPageChange` (e.g. dispatching `fetchAll({page})`) instead of client-side slicing. */
  manualPagination?: boolean
  pageIndex?: number
  pageCount?: number
  totalCount?: number
  onPageChange?: (pageIndex: number) => void
  onRowClick?: (row: TData) => void
  getRowLink?: (row: TData) => string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 15,
  columnWidths,
  minWidth = "700px",
  showPagination = true,
  emptyTitle = "No records found",
  emptyDescription = "There are no items matching your criteria or available in this view.",
  emptyIcon,
  emptyActionLabel,
  onEmptyAction,
  isLoading = false,
  error = null,
  onRetry,
  manualPagination = false,
  pageIndex: controlledPageIndex = 0,
  pageCount: controlledPageCount = 1,
  totalCount,
  onPageChange,
  onRowClick,
  getRowLink,
}: DataTableProps<TData, TValue>) {
  const navigate = useNavigate()
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const headerScrollRef = React.useRef<HTMLDivElement>(null)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(manualPagination
      ? {
          manualPagination: true,
          pageCount: controlledPageCount,
          state: { pagination: { pageIndex: controlledPageIndex, pageSize } },
        }
      : {
          getPaginationRowModel: getPaginationRowModel(),
          initialState: { pagination: { pageSize } },
        }),
  })

  const pageIndex = manualPagination ? controlledPageIndex : table.getState().pagination.pageIndex
  const currentPageSize = manualPagination ? pageSize : table.getState().pagination.pageSize
  const pageCount = manualPagination ? controlledPageCount : table.getPageCount()
  const totalRows = manualPagination ? totalCount ?? data.length : table.getFilteredRowModel().rows.length
  const from = totalRows === 0 ? 0 : pageIndex * currentPageSize + 1
  const to = manualPagination
    ? Math.min(pageIndex * currentPageSize + data.length, totalRows)
    : Math.min((pageIndex + 1) * currentPageSize, totalRows)
  const canPreviousPage = manualPagination ? pageIndex > 0 : table.getCanPreviousPage()
  const canNextPage = manualPagination ? pageIndex < pageCount - 1 : table.getCanNextPage()

  const goToPage = (fn: () => void, targetIndex?: number) => {
    if (manualPagination) {
      if (targetIndex !== undefined) onPageChange?.(targetIndex)
    } else {
      fn()
    }
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Sync horizontal scroll between header and body
  const handleBodyScroll = () => {
    if (headerScrollRef.current && scrollRef.current) {
      headerScrollRef.current.scrollLeft = scrollRef.current.scrollLeft
    }
  }

  const widths = columnWidths ?? columns.map(() => "auto")

  const ColGroup = () => (
    <colgroup>
      {widths.map((w, i) => (
        <col key={i} style={{ width: w }} />
      ))}
    </colgroup>
  )

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-border dark:bg-card">

      {/* Header — horizontally scrollable but scrollbar hidden, synced with body */}
      <div
        ref={headerScrollRef}
        className="bg-card overflow-x-auto"
        style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
      >
        <div style={{ minWidth }}>
          <Table className="table-fixed w-full">
            <ColGroup />
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b-0 hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-xs font-medium text-muted-foreground uppercase tracking-wide py-3"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
          </Table>
        </div>
      </div>

      {/* Stale-data error banner — shown above existing rows when a refetch fails but we still have data to show */}
      {Boolean(error) && data.length > 0 && (
        <div className="flex items-center gap-2 border-b border-gray-100 bg-destructive/5 px-4 py-2 text-xs text-destructive dark:border-border">
          <AlertCircleIcon className="size-3.5 shrink-0" />
          <span className="flex-1">{getApiErrorMessage(error, "Couldn't refresh this data.")}</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="font-medium underline underline-offset-2 hover:no-underline"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Scrollable body — vertical + horizontal */}
      <div
        ref={scrollRef}
        onScroll={handleBodyScroll}
        className="overflow-auto max-h-[500px] table-scroll"
      >
        <div style={{ minWidth }}>
          <Table className="table-fixed w-full">
            <ColGroup />
            <TableBody
              className={cn(
                isLoading && data.length > 0 && "pointer-events-none opacity-60 transition-opacity"
              )}
            >
              {isLoading && data.length === 0 ? (
                Array.from({ length: Math.min(pageSize, 8) }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`} className="hover:bg-transparent">
                    {columns.map((_, j) => (
                      <TableCell key={j} className="py-3.5">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : error && data.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length} className="p-0 border-0">
                    <EmptyState
                      icon={AlertCircleIcon}
                      title="Couldn't load this data"
                      description={getApiErrorMessage(error)}
                      actionLabel={onRetry ? "Retry" : undefined}
                      onAction={onRetry}
                    />
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  const isClickable = Boolean(onRowClick || getRowLink)
                  return (
                    <TableRow
                      key={row.id}
                      onClick={(e) => {
                        if (!isClickable) return
                        const target = e.target as HTMLElement | null
                        if (
                          target?.closest("button") ||
                          target?.closest("a") ||
                          target?.closest("input") ||
                          target?.closest("select") ||
                          target?.closest("textarea") ||
                          target?.closest("[role='checkbox']") ||
                          target?.closest("[role='menuitem']") ||
                          target?.closest("[data-no-row-click]")
                        ) {
                          return
                        }
                        if (onRowClick) {
                          onRowClick(row.original)
                        } else if (getRowLink) {
                          navigate(getRowLink(row.original))
                        }
                      }}
                      className={cn(
                        "border-b border-gray-100 transition-colors last:border-0 dark:border-border",
                        isClickable
                          ? "cursor-pointer hover:bg-gray-50/90 active:bg-gray-100/70 dark:hover:bg-gray-800/60 dark:active:bg-gray-800/80"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3.5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length}
                    className="p-0 border-0"
                  >
                    <EmptyState
                      icon={emptyIcon}
                      title={emptyTitle}
                      description={emptyDescription}
                      actionLabel={emptyActionLabel}
                      onAction={onEmptyAction}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {showPagination && 
      <div className="flex items-center justify-center gap-4 border-t border-gray-100 bg-white px-4 py-2.5 text-center sm:justify-between flex-wrap dark:border-border dark:bg-card">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {isLoading && data.length > 0 && <Loader2Icon className="size-3 animate-spin" />}
          Showing <span className="font-medium text-foreground">{from}–{to}</span> of{" "}
          <span className="font-medium text-foreground">{totalRows}</span> results
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => goToPage(() => table.setPageIndex(0), 0)}
            disabled={!canPreviousPage}
          >
            <ChevronsLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => goToPage(() => table.previousPage(), pageIndex - 1)}
            disabled={!canPreviousPage}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>

          {Array.from({ length: pageCount }, (_, i) => i)
            .filter(
              (i) =>
                i === 0 ||
                i === pageCount - 1 ||
                Math.abs(i - pageIndex) <= 1
            )
            .reduce((acc: (number | string)[], i, idx, arr) => {
              if (idx > 0 && (arr[idx - 1] as number) + 1 < i) acc.push("...")
              acc.push(i)
              return acc
            }, [])
            .map((item, idx) =>
              item === "..." ? (
                <span key={`ellipsis-${idx}`} className="text-xs text-muted-foreground px-1">…</span>
              ) : (
                <Button
                  key={item}
                  variant={pageIndex === item ? "default" : "ghost"}
                  size="icon"
                  className="h-7 w-7 text-xs"
                  onClick={() => goToPage(() => table.setPageIndex(item as number), item as number)}
                >
                  {(item as number) + 1}
                </Button>
              )
            )}

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => goToPage(() => table.nextPage(), pageIndex + 1)}
            disabled={!canNextPage}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => goToPage(() => table.setPageIndex(pageCount - 1), pageCount - 1)}
            disabled={!canNextPage}
          >
            <ChevronsRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>}

    </div>
  )
}