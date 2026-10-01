import { z } from "zod"
import type { ExpenseCategory, ExpensePaymentMethod } from "./types"

export const categoryConfig: Record<ExpenseCategory, { label: string; badgeClass: string }> = {
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

export const paymentMethodLabels: Record<ExpensePaymentMethod, string> = {
  bank_transfer: "Bank Transfer",
  credit_card: "Credit Card",
  cash: "Cash",
  paypal: "PayPal",
  stripe: "Stripe",
  check: "Cheque",
}

export type FilterOption = {
  label: string
  value: string
}

export const categoryFilterOptions: FilterOption[] = [
  { label: "All Categories", value: "all" },
  ...Object.entries(categoryConfig).map(([value, { label }]) => ({ label, value })),
]

export const statusFilterOptions: FilterOption[] = [
  { label: "All Statuses", value: "all" },
  { label: "Paid", value: "paid" },
  { label: "Approved", value: "approved" },
  { label: "Pending", value: "pending" },
  { label: "Rejected", value: "rejected" },
]

const EXPENSE_CATEGORIES = [
  "inventory",
  "shipping",
  "marketing",
  "payroll",
  "software",
  "utilities",
  "office",
  "packaging",
  "tax",
  "other",
] as const satisfies readonly ExpenseCategory[]

const PAYMENT_METHODS = [
  "bank_transfer",
  "credit_card",
  "cash",
  "paypal",
  "stripe",
  "check",
] as const satisfies readonly ExpensePaymentMethod[]

export const expenseSchema = z.object({
  title: z.string().trim().min(1, "Please provide an expense title"),
  category: z.enum(EXPENSE_CATEGORIES),
  // Kept as the raw input string so an empty/partial entry never becomes NaN.
  amount: z
    .string()
    .trim()
    .refine((v) => v !== "" && Number.isFinite(Number(v)) && Number(v) > 0, "Please enter a valid expense amount"),
  vendor: z.string().trim().min(1, "Please enter a vendor or payee name"),
  payment_method: z.enum(PAYMENT_METHODS),
  status: z.enum(["paid", "pending", "approved", "rejected"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please pick the expense date"),
  reference_no: z.string(),
  receipt_url: z.string(),
  notes: z.string(),
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>
