import { useEffect, useState, useMemo, useCallback } from "react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"
import type { DateRange } from "react-day-picker"
import {
  DollarSign,
  Plus,
  Receipt,
  Building2,
  CreditCard,
  CheckCircle2,
  Clock,
  DownloadIcon,
  Layers,
  ArrowUpRight,
  Loader2,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Field, FieldLabel, FieldContent } from "@/components/ui/field"
import { DataTable } from "@/components/common/data-table"
import FilterToolbar from "@/components/common/FilterToolBar"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import { DatePicker } from "@/features/sales/components/DatePicker"
import { TableActions } from "@/components/common/TableActions"
import { ImageUploader, type UploadedImageItem } from "@/components/common/ImageUploader"
import { StatusBadge } from "@/components/common/StatusBadge"
import { PageHeading } from "@/components/common/PageHeading"
import { exportToCSV } from "@/utility/ExportToCsv"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  fetchAll,
  postData,
  deleteData,
  updateData,
} from "@/features/finance/slices/expenseSlice"
import type {
  Expense,
  ExpenseCategory,
  ExpensePaymentMethod,
  ExpenseStatus,
} from "@/features/finance/types"

const categoryConfig: Record<
  ExpenseCategory,
  { label: string; badgeClass: string }
> = {
  inventory: { label: "Inventory", badgeClass: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  shipping: { label: "Shipping & Logistics", badgeClass: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
  marketing: { label: "Marketing & Ads", badgeClass: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  payroll: { label: "Salaries & Payroll", badgeClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  software: { label: "Software & SaaS", badgeClass: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  utilities: { label: "Utilities & Rent", badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  packaging: { label: "Packaging Supplies", badgeClass: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  office: { label: "Office & Equipment", badgeClass: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
  tax: { label: "Taxes & Duties", badgeClass: "bg-red-500/10 text-red-500 border-red-500/20" },
  other: { label: "Miscellaneous", badgeClass: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
}

const paymentMethodLabels: Record<ExpensePaymentMethod, string> = {
  bank_transfer: "Bank Transfer",
  credit_card: "Credit Card",
  cash: "Cash",
  paypal: "PayPal",
  stripe: "Stripe",
  check: "Cheque",
}

const categoryFilterOptions = [
  { label: "All Categories", value: "all" },
  { label: "Inventory", value: "inventory" },
  { label: "Shipping & Logistics", value: "shipping" },
  { label: "Marketing & Ads", value: "marketing" },
  { label: "Salaries & Payroll", value: "payroll" },
  { label: "Software & SaaS", value: "software" },
  { label: "Utilities & Rent", value: "utilities" },
  { label: "Packaging Supplies", value: "packaging" },
  { label: "Office & Equipment", value: "office" },
  { label: "Taxes & Duties", value: "tax" },
  { label: "Miscellaneous", value: "other" },
]

const statusFilterOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Paid", value: "paid" },
  { label: "Approved", value: "approved" },
  { label: "Pending", value: "pending" },
  { label: "Rejected", value: "rejected" },
]

type FilterOption = {
  label: string
  value: string
}

const Expenses = () => {
  const dispatch = useAppDispatch()
  const { data: expenses, isLoading, error } = useAppSelector((state) => state.expenses)

  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<FilterOption | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<FilterOption | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  // Form Dialog State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form Fields
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<ExpenseCategory>("inventory")
  const [amount, setAmount] = useState("")
  const [vendor, setVendor] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<ExpensePaymentMethod>("credit_card")
  const [status, setStatus] = useState<ExpenseStatus>("paid")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [referenceNo, setReferenceNo] = useState("")
  const [receiptUrl, setReceiptUrl] = useState("")
  const [notes, setNotes] = useState("")

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

      let matchesDate = true
      if (dateRange?.from) {
        const itemDate = new Date(item.date)
        const fromDate = new Date(dateRange.from)
        fromDate.setHours(0, 0, 0, 0)
        if (dateRange.to) {
          const toDate = new Date(dateRange.to)
          toDate.setHours(23, 59, 59, 999)
          matchesDate = itemDate >= fromDate && itemDate <= toDate
        } else {
          matchesDate = itemDate >= fromDate
        }
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesDate
    })
  }, [expenses, search, selectedCategory, selectedStatus, dateRange])

  // Metrics calculations
  const metrics = useMemo(() => {
    const total = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
    const paid = expenses
      .filter((e) => e.status === "paid")
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
    const pending = expenses
      .filter((e) => e.status === "pending" || e.status === "approved")
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0)

    const categorySums: Record<string, number> = {}
    expenses.forEach((e) => {
      categorySums[e.category] = (categorySums[e.category] || 0) + Number(e.amount || 0)
    })

    const topCategoryKey = Object.keys(categorySums).reduce(
      (a, b) => (categorySums[a] > categorySums[b] ? a : b),
      "inventory"
    ) as ExpenseCategory

    return {
      total,
      paid,
      pending,
      count: expenses.length,
      topCategory: categoryConfig[topCategoryKey]?.label || "Inventory",
      topCategoryAmount: categorySums[topCategoryKey] || 0,
    }
  }, [expenses])

  const receiptImages: UploadedImageItem[] = useMemo(() => {
    return receiptUrl
      ? [
          {
            id: "expense-receipt",
            url: receiptUrl,
            alt: "Expense Receipt",
            isPrimary: true,
          },
        ]
      : []
  }, [receiptUrl])

  const handleOpenCreate = () => {
    setEditingExpense(null)
    setTitle("")
    setCategory("inventory")
    setAmount("")
    setVendor("")
    setPaymentMethod("credit_card")
    setStatus("paid")
    setDate(new Date().toISOString().slice(0, 10))
    setReferenceNo(`EXP-${Date.now().toString().slice(-6)}`)
    setReceiptUrl("")
    setNotes("")
    setIsFormOpen(true)
  }

  const handleOpenEdit = (exp: Expense) => {
    setEditingExpense(exp)
    setTitle(exp.title)
    setCategory(exp.category)
    setAmount(String(exp.amount))
    setVendor(exp.vendor)
    setPaymentMethod(exp.payment_method)
    setStatus(exp.status)
    setDate(exp.date)
    setReferenceNo(exp.reference_no || "")
    setReceiptUrl(exp.receipt_url || "")
    setNotes(exp.notes || "")
    setIsFormOpen(true)
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please provide an expense title")
      return
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid expense amount")
      return
    }
    if (!vendor.trim()) {
      toast.error("Please enter a vendor or payee name")
      return
    }

    setSubmitting(true)
    const payload = {
      title: title.trim(),
      category,
      amount: Number(amount),
      vendor: vendor.trim(),
      payment_method: paymentMethod,
      status,
      date,
      reference_no: referenceNo.trim() || undefined,
      receipt_url: receiptUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      created_at: editingExpense?.created_at || new Date().toISOString(),
    }

    try {
      if (editingExpense) {
        await dispatch(updateData({ id: editingExpense.id, payload })).unwrap()
        toast.success(`Expense "${title}" updated`)
      } else {
        await dispatch(postData({ payload })).unwrap()
        toast.success(`Expense "${title}" recorded successfully`)
      }
      setIsFormOpen(false)
    } catch {
      toast.error("Failed to save expense")
    } finally {
      setSubmitting(false)
    }
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
          <div
            className="relative h-10 w-12 cursor-pointer overflow-hidden rounded-md border border-border bg-muted/60 hover:ring-2 hover:ring-primary/40 transition-all flex items-center justify-center shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              setViewingExpense(row.original)
            }}
          >
            {url ? (
              <img src={url} alt="Receipt" className="h-full w-full object-cover" />
            ) : (
              <Receipt className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
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
          {new Date(row.getValue("date")).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
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
        <PageHeading
          title="Business Expenses"
          description="Track operational spending, vendor invoices, logistics costs, and upload payment receipts"
        />
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

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenditure</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${metrics.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Layers className="h-3 w-3" /> across {metrics.count} recorded entries
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cleared & Paid</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${metrics.paid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Settled liabilities with receipts
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending / Under Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              ${metrics.pending.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting authorization or clearing
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Spending Area</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground truncate">
              {metrics.topCategory}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ${metrics.topCategoryAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} total share
            </p>
          </CardContent>
        </Card>
      </div>

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

      {/* Record / Edit Expense Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              {editingExpense ? "Edit Expense Record" : "Record New Business Expense"}
            </DialogTitle>
            <DialogDescription>
              Record vendor payments, inventory costs, SaaS tools, and upload invoice receipts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Field>
              <FieldLabel htmlFor="exp-title">Expense Title / Description *</FieldLabel>
              <FieldContent>
                <Input
                  id="exp-title"
                  placeholder="e.g. Bulk Poly Mailer Bags Restock"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </FieldContent>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="exp-category">Expense Category *</FieldLabel>
                <FieldContent>
                  <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                    <SelectTrigger id="exp-category">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryConfig).map(([key, val]) => (
                        <SelectItem key={key} value={key}>
                          {val.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="exp-amount">Amount ($ USD) *</FieldLabel>
                <FieldContent>
                  <Input
                    id="exp-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </FieldContent>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="exp-vendor">Vendor / Payee *</FieldLabel>
                <FieldContent>
                  <Input
                    id="exp-vendor"
                    placeholder="e.g. DHL, Google, Supplier Ltd"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="exp-date">Expense Date *</FieldLabel>
                <FieldContent>
                  <Input
                    id="exp-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </FieldContent>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field>
                <FieldLabel htmlFor="exp-method">Payment Method</FieldLabel>
                <FieldContent>
                  <Select
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as ExpensePaymentMethod)}
                  >
                    <SelectTrigger id="exp-method">
                      <SelectValue placeholder="Payment Method" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(paymentMethodLabels).map(([key, val]) => (
                        <SelectItem key={key} value={key}>
                          {val}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="exp-status">Payment Status</FieldLabel>
                <FieldContent>
                  <Select value={status} onValueChange={(v) => setStatus(v as ExpenseStatus)}>
                    <SelectTrigger id="exp-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="exp-ref">Invoice / Ref #</FieldLabel>
                <FieldContent>
                  <Input
                    id="exp-ref"
                    placeholder="e.g. INV-9901"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                  />
                </FieldContent>
              </Field>
            </div>

            {/* Receipt Upload with ImageUploader */}
            <Field>
              <FieldLabel>Invoice / Receipt Attachment</FieldLabel>
              <FieldContent>
                <ImageUploader
                  singleMode
                  images={receiptImages}
                  onImagesChange={(imgs) => {
                    setReceiptUrl(imgs.length > 0 ? imgs[0].url : "")
                  }}
                  onAddImage={(url) => {
                    setReceiptUrl(url)
                  }}
                  label="Upload Invoice or Receipt"
                  description="Drop receipt photo from device, browse files, or provide invoice URL"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="exp-notes">Internal Notes & Context</FieldLabel>
              <FieldContent>
                <Textarea
                  id="exp-notes"
                  rows={2}
                  placeholder="Additional context, department allocation, or approval notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </FieldContent>
            </Field>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <CheckCircle2 className="h-4 w-4 mr-1.5" />}
              {editingExpense ? "Save Changes" : "Record Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense Detail View Modal */}
      <Dialog open={!!viewingExpense} onOpenChange={(open) => !open && setViewingExpense(null)}>
        {viewingExpense && (
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={categoryConfig[viewingExpense.category]?.badgeClass}
                >
                  {categoryConfig[viewingExpense.category]?.label}
                </Badge>
                <StatusBadge status={viewingExpense.status} />
              </div>
              <DialogTitle className="text-xl font-bold mt-2">{viewingExpense.title}</DialogTitle>
              <DialogDescription>
                Reference: <span className="font-mono">{viewingExpense.reference_no || "N/A"}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="rounded-lg bg-muted/40 p-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs block">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">
                    ${Number(viewingExpense.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block">Date Incurred</span>
                  <span className="font-semibold text-foreground">
                    {new Date(viewingExpense.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block">Vendor / Payee</span>
                  <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    {viewingExpense.vendor}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block">Payment Method</span>
                  <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                    <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                    {paymentMethodLabels[viewingExpense.payment_method]}
                  </span>
                </div>
              </div>

              {viewingExpense.receipt_url && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Attached Receipt / Invoice
                  </span>
                  <div className="relative h-48 w-full rounded-lg border border-border overflow-hidden bg-muted/30">
                    <img
                      src={viewingExpense.receipt_url}
                      alt="Receipt Document"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
              )}

              {viewingExpense.notes && (
                <div className="rounded-lg bg-muted/20 p-3 text-sm">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Notes & Description
                  </span>
                  <p className="text-muted-foreground text-xs">{viewingExpense.notes}</p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0 justify-between">
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => handleDelete(viewingExpense.id, viewingExpense.title)}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const exp = viewingExpense
                    setViewingExpense(null)
                    handleOpenEdit(exp)
                  }}
                >
                  Edit Record
                </Button>
                <Button onClick={() => setViewingExpense(null)}>Close</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}

export default Expenses
