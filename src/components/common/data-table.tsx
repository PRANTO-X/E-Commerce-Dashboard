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
} from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageSize?: number
  columnWidths?: string[]
  minWidth?: string
  showPagination?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 15,
  columnWidths,
  minWidth = "700px",
  showPagination = true,
}: DataTableProps<TData, TValue>) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const headerScrollRef = React.useRef<HTMLDivElement>(null)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize },
    },
  })

  const { pageIndex, pageSize: currentPageSize } = table.getState().pagination
  const totalRows = table.getFilteredRowModel().rows.length
  const from = pageIndex * currentPageSize + 1
  const to = Math.min((pageIndex + 1) * currentPageSize, totalRows)

  const goToPage = (fn: () => void) => {
    fn()
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
    <div className="flex flex-col rounded-lg border border-border overflow-clip">

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

      {/* Scrollable body — vertical + horizontal */}
      <div
        ref={scrollRef}
        onScroll={handleBodyScroll}
        className="overflow-auto max-h-[500px] table-scroll"
      >
        <div style={{ minWidth }}>
          <Table className="table-fixed w-full">
            <ColGroup />
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b border-border hover:bg-muted/40 transition-colors last:border-0"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {showPagination && 
      <div className="bg-card border-t border-border text-center px-4 py-2.5 flex items-center justify-center sm:justify-between gap-4 flex-wrap">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-medium text-foreground">{from}–{to}</span> of{" "}
          <span className="font-medium text-foreground">{totalRows}</span> results
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => goToPage(() => table.setPageIndex(0))}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => goToPage(() => table.previousPage())}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>

          {Array.from({ length: table.getPageCount() }, (_, i) => i)
            .filter(
              (i) =>
                i === 0 ||
                i === table.getPageCount() - 1 ||
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
                  onClick={() => goToPage(() => table.setPageIndex(item as number))}
                >
                  {(item as number) + 1}
                </Button>
              )
            )}

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => goToPage(() => table.nextPage())}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => goToPage(() => table.setPageIndex(table.getPageCount() - 1))}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>}

    </div>
  )
}