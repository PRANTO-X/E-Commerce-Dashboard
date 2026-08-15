export type ExpenseCategory =
  | "inventory"
  | "shipping"
  | "marketing"
  | "payroll"
  | "software"
  | "utilities"
  | "office"
  | "packaging"
  | "tax"
  | "other"

export type ExpensePaymentMethod =
  | "bank_transfer"
  | "credit_card"
  | "cash"
  | "paypal"
  | "stripe"
  | "check"

export type ExpenseStatus = "paid" | "pending" | "approved" | "rejected"

export interface Expense {
  id: string
  title: string
  category: ExpenseCategory
  amount: number
  vendor: string
  payment_method: ExpensePaymentMethod
  status: ExpenseStatus
  date: string
  receipt_url?: string
  notes?: string
  reference_no?: string
  created_at: string
}
