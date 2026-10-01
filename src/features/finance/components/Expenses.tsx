import { useEffect, useState, useMemo, useCallback } from "react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"
import type { DateRange } from "react-day-picker"
import { format as formatDateFns } from "date-fns"
import { Plus, Receipt, Building2, CreditCard, DownloadIcon, HardDrive } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/common/data-table"
import FilterToolbar from "@/components/common/FilterToolBar"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import { DatePicker } from "@/features/sales/components/DatePicker"
import { TableActions } from "@/components/common/TableActions"
import { StatusBadge } from "@/components/common/StatusBadge"
import { PageHeading } from "@/components/common/PageHeading"
import { exportToCSV } from "@/lib/ExportToCsv"
import { parseDate } from "@/lib/format"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll, deleteData } from "@/features/finance/slices/expenseSlice"
import type { Expense, ExpenseCategory, ExpensePaymentMethod, ExpenseStatus } from "@/features/finance/types"
import {
  categoryConfig,
  categoryFilterOptions,
  paymentMethodLabels,
  statusFilterOptions,
  type FilterOption,
} from "@/features/finance/expenseConfig"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { ExpenseStatsCards } from "./ExpenseStatsCards"
import { ExpenseFormDialog } from "./ExpenseFormDialog"
import { ExpenseDetailDialog } from "./ExpenseDetailDialog"

/** Local calendar date of a picker value as "YYYY-MM-DD", comparable with `Expense.date`. */
const toLocalISODate = (d: Date) => formatDateFns(d, "yyyy-MM-dd")

const Expenses = () => {
  useDocumentTitle("Expenses")

  const dispatch = useAppDispatch()
  const { data: expenses, isLoading, error } = useAppSelector((state) => state.expenses)

  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<FilterOption | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<FilterOption | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  // Form Dialog State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  // Detail Modal State
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null)

  const loadExpenses = useCallback(() => {
    dispatch(fetchAll(undefined))
  }, [dispatch])

  useEffect(() => {
    loadExpenses()
  }, [loadExpenses])

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchesSearch =
        search === "" ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.vendor.toLowerCase().includes(search.toLowerCase()) ||
        (item.reference_no && item.reference_no.toLowerCase().includes(search.toLowerCase()))

      const matchesCategory =
        !selectedCategory ||
        selectedCategory.value === "all" ||
        item.category === selectedCategory.value

      const matchesStatus =
        !selectedStatus ||
        selectedStatus.value === "all" ||
        item.status === selectedStatus.value

      // `item.date` is a calendar date string; compare it against the picked range as
      // local "YYYY-MM-DD" strings so neither side is shifted by a UTC conversion.
      let matchesDate = true
      if (dateRange?.from) {
        const from = toLocalISODate(dateRange.from)
        const to = dateRange.to ? toLocalISODate(dateRange.to) : null
        matchesDate = item.date >= from && (to === null || item.date <= to)
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesDate
    })
  }, [expenses, search, selectedCategory, selectedStatus, dateRange])

  const handleOpenCreate = () => {
    setEditingExpense(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (exp: Expense) => {
    setEditingExpense(exp)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string, expTitle: string) => {
    if (!window.confirm(`Delete expense record "${expTitle}"?`)) return
    try {
      await dispatch(deleteData(id)).unwrap()
      toast.success("Expense deleted")
      if (viewingExpense?.id === id) {
        setViewingExpense(null)
      }
    } catch {
      toast.error("Failed to delete expense")
    }
  }

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "receipt_url",
      header: "RECEIPT",
      cell: ({ row }) => {
        const url = row.getValue("receipt_url") as string | undefined
        return (
          <button
            type="button"
            aria-label={`View receipt for ${row.original.title}`}
            className="relative h-10 w-12 cursor-pointer overflow-hidden rounded-md border border-border bg-muted/60 hover:ring-2 hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-all flex items-center justify-center shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              setViewingExpense(row.original)
            }}
          >
            {url ? (
              <img
                src={url}
                alt="Receipt"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <Receipt className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        )
      },
    },
    {
      accessorKey: "title",
      header: "EXPENSE DESCRIPTION",
      cell: ({ row }) => (
        <div className="pr-3 min-w-0">
          <p className="font-semibold text-foreground text-sm leading-snug line-clamp-2">
            {row.getValue("title")}
          </p>
          {row.original.reference_no && (
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              Ref: {row.original.reference_no}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "CATEGORY",
      cell: ({ row }) => {
        const cat = row.getValue("category") as ExpenseCategory
        const config = categoryConfig[cat] || categoryConfig.other
        return (
          <div className="pr-2">
            <Badge variant="outline" className={`${config.badgeClass} font-medium text-xs whitespace-nowrap inline-flex items-center`}>
              {config.label}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "vendor",
      header: "VENDOR / PAYEE",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground flex items-center gap-1.5 whitespace-nowrap truncate max-w-[170px]">
          <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="truncate">{row.getValue("vendor")}</span>
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: "AMOUNT",
      cell: ({ row }) => (
        <span className="font-bold text-foreground text-sm whitespace-nowrap">
          ${Number(row.getValue("amount")).toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      accessorKey: "date",
      header: "DATE",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {parseDate(row.getValue("date") as string)?.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }) ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "payment_method",
      header: "METHOD",
      cell: ({ row }) => {
        const method = row.getValue("payment_method") as ExpensePaymentMethod
        return (
          <span className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
            <CreditCard className="h-3 w-3 text-primary shrink-0" />
            {paymentMethodLabels[method] || method}
          </span>
        )
      },
    },
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("status") as ExpenseStatus} className="text-xs whitespace-nowrap" />
      ),
    },
    {
      id: "actions",
      header: "ACTIONS",
      cell: ({ row }) => (
        <TableActions
          itemName={row.original.title}
          onView={() => setViewingExpense(row.original)}
          onEdit={() => handleOpenEdit(row.original)}
          onDelete={() => handleDelete(row.original.id, row.original.title)}
        />
      ),
    },
  ]

  const csvExportData = useMemo(() => {
    return filteredExpenses.map((e) => ({
      ID: e.id,
      Title: e.title,
      Category: categoryConfig[e.category]?.label || e.category,
      Amount: e.amount,
      Vendor: e.vendor,
      PaymentMethod: paymentMethodLabels[e.payment_method] || e.payment_method,
      Status: e.status,
      Date: e.date,
      ReferenceNo: e.reference_no || "",
      Notes: e.notes || "",
    }))
  }, [filteredExpenses])

  return (
    <div className="section-container space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <PageHeading
            title="Business Expenses"
            description="Track operational spending, vendor invoices, logistics costs, and upload payment receipts"
          />
          <p className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-2 py-1 text-xs text-muted-foreground">
            <HardDrive className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Expenses are saved in this browser only — they aren't synced to the server or other devices.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            size="action"
            onClick={handleOpenCreate}
          >
            <Plus className="size-5" /> Record Expense
          </Button>

          <Button
            variant="primary"
            size="action"
            onClick={() => exportToCSV(csvExportData, "Expenses")}
          >
            <DownloadIcon className="size-5" /> Export CSV
          </Button>
        </div>
      </div>

      <ExpenseStatsCards expenses={expenses} />

      {/* Standard Dashboard Filter Toolbar */}
      <FilterToolbar
        searchPlaceholder="Search Expenses..."
        searchValue={search}
        onSearchChange={setSearch}
        datePicker={<DatePicker value={dateRange} onChange={setDateRange} />}
        filters={[
          {
            component: (
              <ExampleComboboxCustomItems
                frameworks={categoryFilterOptions}
                placeholder="Category"
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              />
            ),
          },
          {
            component: (
              <ExampleComboboxCustomItems
                frameworks={statusFilterOptions}
                placeholder="Status"
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              />
            ),
          },
        ]}
      />

      {/* Expenses DataTable with generous minWidth & defined columnWidths */}
      <div>
        <DataTable
          columns={columns}
          data={filteredExpenses}
          isLoading={isLoading}
          error={error}
          onRetry={loadExpenses}
          onRowClick={(exp) => setViewingExpense(exp)}
          minWidth="1260px"
          columnWidths={[
            "70px",
            "280px",
            "170px",
            "180px",
            "120px",
            "110px",
            "130px",
            "110px",
            "90px",
          ]}
        />
      </div>

      <ExpenseFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} expense={editingExpense} />

      <ExpenseDetailDialog
        expense={viewingExpense}
        onClose={() => setViewingExpense(null)}
        onEdit={(exp) => {
          setViewingExpense(null)
          handleOpenEdit(exp)
        }}
        onDelete={(exp) => handleDelete(exp.id, exp.title)}
      />
    </div>
  )
}

export default Expenses
