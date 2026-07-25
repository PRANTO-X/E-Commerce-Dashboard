import { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import {
  products as seedProducts,
  categories as seedCategories,
  staffs as seedStaffs,
  roles as seedRoles,
  transactions as seedTransactions,
  inventory as seedInventory,
  orders as seedOrders,
  customers as seedCustomers,
  coupons as seedCoupons,
  campaigns as seedCampaigns,
  vendors as seedVendors,
  commissionRules as seedCommissionRules,
  reviews as seedReviews,
  defaultStoreSettings,
  defaultAuthSettings,
  type ProductItem,
  type Category,
  type Staff,
  type Role,
  type TransactionItem,
  type InventoryItem,
  type Order,
  type Customer,
  type Coupon,
  type Campaign,
  type Vendor,
  type CommissionRule,
  type Review,
  type StoreSettings,
  type AuthSettings,
} from "@/assets/Data"

/**
 * Generic in-memory CRUD store for one entity type, seeded from Data.ts.
 * Every action body is a plain state updater — swapping in real API calls
 * later only means touching these functions, not every page that calls them.
 */
function useEntityStore<T extends { id: string }>(seed: T[]) {
  const [items, setItems] = useState<T[]>(seed)

  const add = useCallback((item: T) => {
    setItems((prev) => [item, ...prev])
  }, [])

  const update = useCallback((id: string, patch: Partial<T>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }, [])

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const getById = useCallback((id: string) => items.find((item) => item.id === id), [items])

  return { items, add, update, remove, getById }
}

interface AppDataContextValue {
  products: ProductItem[]
  addProduct: (item: ProductItem) => void
  updateProduct: (id: string, patch: Partial<ProductItem>) => void
  deleteProduct: (id: string) => void
  getProductById: (id: string) => ProductItem | undefined

  categories: Category[]
  addCategory: (item: Category) => void
  updateCategory: (id: string, patch: Partial<Category>) => void
  deleteCategory: (id: string) => void
  getCategoryById: (id: string) => Category | undefined

  staffs: Staff[]
  addStaff: (item: Staff) => void
  updateStaff: (id: string, patch: Partial<Staff>) => void
  deleteStaff: (id: string) => void
  getStaffById: (id: string) => Staff | undefined

  roles: Role[]
  addRole: (item: Role) => void
  updateRole: (id: string, patch: Partial<Role>) => void
  deleteRole: (id: string) => void
  getRoleById: (id: string) => Role | undefined

  transactions: TransactionItem[]
  addTransaction: (item: TransactionItem) => void
  updateTransaction: (id: string, patch: Partial<TransactionItem>) => void
  deleteTransaction: (id: string) => void
  getTransactionById: (id: string) => TransactionItem | undefined

  inventory: InventoryItem[]
  addInventoryItem: (item: InventoryItem) => void
  updateInventoryItem: (id: string, patch: Partial<InventoryItem>) => void
  deleteInventoryItem: (id: string) => void
  getInventoryItemById: (id: string) => InventoryItem | undefined

  orders: Order[]
  addOrder: (item: Order) => void
  updateOrder: (id: string, patch: Partial<Order>) => void
  deleteOrder: (id: string) => void
  getOrderById: (id: string) => Order | undefined

  customers: Customer[]
  addCustomer: (item: Customer) => void
  updateCustomer: (id: string, patch: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  getCustomerById: (id: string) => Customer | undefined

  coupons: Coupon[]
  addCoupon: (item: Coupon) => void
  updateCoupon: (id: string, patch: Partial<Coupon>) => void
  deleteCoupon: (id: string) => void
  getCouponById: (id: string) => Coupon | undefined

  campaigns: Campaign[]
  addCampaign: (item: Campaign) => void
  updateCampaign: (id: string, patch: Partial<Campaign>) => void
  deleteCampaign: (id: string) => void
  getCampaignById: (id: string) => Campaign | undefined

  vendors: Vendor[]
  addVendor: (item: Vendor) => void
  updateVendor: (id: string, patch: Partial<Vendor>) => void
  deleteVendor: (id: string) => void
  getVendorById: (id: string) => Vendor | undefined

  commissionRules: CommissionRule[]
  addCommissionRule: (item: CommissionRule) => void
  updateCommissionRule: (id: string, patch: Partial<CommissionRule>) => void
  deleteCommissionRule: (id: string) => void
  getCommissionRuleById: (id: string) => CommissionRule | undefined

  reviews: Review[]
  addReview: (item: Review) => void
  updateReview: (id: string, patch: Partial<Review>) => void
  deleteReview: (id: string) => void
  getReviewById: (id: string) => Review | undefined

  settings: StoreSettings
  updateSettings: (patch: Partial<StoreSettings>) => void

  authSettings: AuthSettings
  updateAuthSettings: (patch: Partial<AuthSettings>) => void
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const productsStore = useEntityStore<ProductItem>(seedProducts)
  const categoriesStore = useEntityStore<Category>(seedCategories)
  const staffsStore = useEntityStore<Staff>(seedStaffs)
  const rolesStore = useEntityStore<Role>(seedRoles)
  const transactionsStore = useEntityStore<TransactionItem>(seedTransactions)
  const inventoryStore = useEntityStore<InventoryItem>(seedInventory)
  const ordersStore = useEntityStore<Order>(seedOrders)
  const customersStore = useEntityStore<Customer>(seedCustomers)
  const couponsStore = useEntityStore<Coupon>(seedCoupons)
  const campaignsStore = useEntityStore<Campaign>(seedCampaigns)
  const vendorsStore = useEntityStore<Vendor>(seedVendors)
  const commissionRulesStore = useEntityStore<CommissionRule>(seedCommissionRules)
  const reviewsStore = useEntityStore<Review>(seedReviews)

  const [settings, setSettings] = useState<StoreSettings>(defaultStoreSettings)
  const updateSettings = useCallback((patch: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const [authSettings, setAuthSettings] = useState<AuthSettings>(defaultAuthSettings)
  const updateAuthSettings = useCallback((patch: Partial<AuthSettings>) => {
    setAuthSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const value: AppDataContextValue = {
    products: productsStore.items,
    addProduct: productsStore.add,
    updateProduct: productsStore.update,
    deleteProduct: productsStore.remove,
    getProductById: productsStore.getById,

    categories: categoriesStore.items,
    addCategory: categoriesStore.add,
    updateCategory: categoriesStore.update,
    deleteCategory: categoriesStore.remove,
    getCategoryById: categoriesStore.getById,

    staffs: staffsStore.items,
    addStaff: staffsStore.add,
    updateStaff: staffsStore.update,
    deleteStaff: staffsStore.remove,
    getStaffById: staffsStore.getById,

    roles: rolesStore.items,
    addRole: rolesStore.add,
    updateRole: rolesStore.update,
    deleteRole: rolesStore.remove,
    getRoleById: rolesStore.getById,

    transactions: transactionsStore.items,
    addTransaction: transactionsStore.add,
    updateTransaction: transactionsStore.update,
    deleteTransaction: transactionsStore.remove,
    getTransactionById: transactionsStore.getById,

    inventory: inventoryStore.items,
    addInventoryItem: inventoryStore.add,
    updateInventoryItem: inventoryStore.update,
    deleteInventoryItem: inventoryStore.remove,
    getInventoryItemById: inventoryStore.getById,

    orders: ordersStore.items,
    addOrder: ordersStore.add,
    updateOrder: ordersStore.update,
    deleteOrder: ordersStore.remove,
    getOrderById: ordersStore.getById,

    customers: customersStore.items,
    addCustomer: customersStore.add,
    updateCustomer: customersStore.update,
    deleteCustomer: customersStore.remove,
    getCustomerById: customersStore.getById,

    coupons: couponsStore.items,
    addCoupon: couponsStore.add,
    updateCoupon: couponsStore.update,
    deleteCoupon: couponsStore.remove,
    getCouponById: couponsStore.getById,

    campaigns: campaignsStore.items,
    addCampaign: campaignsStore.add,
    updateCampaign: campaignsStore.update,
    deleteCampaign: campaignsStore.remove,
    getCampaignById: campaignsStore.getById,

    vendors: vendorsStore.items,
    addVendor: vendorsStore.add,
    updateVendor: vendorsStore.update,
    deleteVendor: vendorsStore.remove,
    getVendorById: vendorsStore.getById,

    commissionRules: commissionRulesStore.items,
    addCommissionRule: commissionRulesStore.add,
    updateCommissionRule: commissionRulesStore.update,
    deleteCommissionRule: commissionRulesStore.remove,
    getCommissionRuleById: commissionRulesStore.getById,

    reviews: reviewsStore.items,
    addReview: reviewsStore.add,
    updateReview: reviewsStore.update,
    deleteReview: reviewsStore.remove,
    getReviewById: reviewsStore.getById,

    settings,
    updateSettings,

    authSettings,
    updateAuthSettings,
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) {
    throw new Error("useAppData must be used within an AppDataProvider")
  }
  return ctx
}
