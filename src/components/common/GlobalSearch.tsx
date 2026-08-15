import React, { useState, useEffect, useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAppSelector } from "@/app/hooks"
import type { Expense } from "@/features/finance/types"
import {
  Search,
  LayoutDashboard,
  Boxes,
  PackagePlus,
  Layers,
  Warehouse,
  BookmarkCheck,
  SlidersHorizontal,
  ShoppingCart,
  Receipt,
  CreditCard,
  RotateCcw,
  Truck,
  Package,
  Users,
  User,
  UserCheck,
  Ticket,
  Megaphone,
  Zap,
  UsersRound,
  Workflow,
  Star,
  Image,
  BookOpen,
  FileText,
  BarChart3,
  Settings,
  ShieldAlert,
  KeyRound,
  Bell,
  History,
  CornerDownLeft,
  X,
} from "lucide-react"

export interface SearchDestination {
  id: string
  title: string
  subtitle?: string
  section: string
  url: string
  icon: React.ElementType
  keywords: string[]
}

const STATIC_ROUTES: SearchDestination[] = [
  // Home & Dashboard
  {
    id: "nav-dashboard",
    title: "Overview Dashboard",
    subtitle: "Main performance metrics & sales summary",
    section: "Navigation",
    url: "/",
    icon: LayoutDashboard,
    keywords: ["home", "dashboard", "overview", "analytics", "stats", "main"],
  },
  // Catalog
  {
    id: "nav-products",
    title: "Products Catalog",
    subtitle: "Browse, filter, and manage catalog items",
    section: "Catalog",
    url: "/products",
    icon: Boxes,
    keywords: ["products", "items", "goods", "catalog", "sku", "inventory"],
  },
  {
    id: "nav-product-new",
    title: "Add New Product",
    subtitle: "Create product, combo bundle, or variations",
    section: "Catalog",
    url: "/product_form/new",
    icon: PackagePlus,
    keywords: ["create product", "new product", "add product", "combo bundle", "variation"],
  },
  {
    id: "nav-categories",
    title: "Categories",
    subtitle: "Organize products into hierarchical categories",
    section: "Catalog",
    url: "/categories",
    icon: Layers,
    keywords: ["categories", "category", "collections", "taxonomy"],
  },
  {
    id: "nav-inventory",
    title: "Inventory Stock",
    subtitle: "Track on-hand, reserved, and available quantities",
    section: "Catalog",
    url: "/inventory",
    icon: Package,
    keywords: ["inventory", "stock", "quantity", "warehouse balance"],
  },
  {
    id: "nav-warehouses",
    title: "Warehouses",
    subtitle: "Fulfillment hubs and storage facilities",
    section: "Catalog",
    url: "/warehouses",
    icon: Warehouse,
    keywords: ["warehouses", "locations", "depots", "fulfillment"],
  },
  {
    id: "nav-reservations",
    title: "Stock Reservations",
    subtitle: "Orders holding reserved item quantities",
    section: "Catalog",
    url: "/inventory/reservations",
    icon: BookmarkCheck,
    keywords: ["reservations", "reserved stock", "held inventory"],
  },
  {
    id: "nav-attributes",
    title: "Attributes & Options",
    subtitle: "Colors, sizes, and custom specification types",
    section: "Catalog",
    url: "/attributes",
    icon: SlidersHorizontal,
    keywords: ["attributes", "options", "colors", "sizes", "specifications"],
  },
  // Sales & Finance
  {
    id: "nav-orders",
    title: "Orders",
    subtitle: "View and process customer transactions",
    section: "Sales",
    url: "/orders",
    icon: ShoppingCart,
    keywords: ["orders", "sales", "invoices", "purchases", "receipts"],
  },
  {
    id: "nav-expenses",
    title: "Business Expenses",
    subtitle: "Operational spending, receipts, and category breakdown",
    section: "Sales",
    url: "/expenses",
    icon: Receipt,
    keywords: ["expenses", "spending", "costs", "finance", "receipts", "budget", "operations"],
  },
  {
    id: "nav-payments",
    title: "Payments & Transactions",
    subtitle: "Gateway payments, captures, and refund logs",
    section: "Sales",
    url: "/payments",
    icon: CreditCard,
    keywords: ["payments", "transactions", "gateway", "stripe", "bkash", "refunds"],
  },
  {
    id: "nav-returns",
    title: "Returns & RMA",
    subtitle: "Process return requests and exchanges",
    section: "Sales",
    url: "/returns",
    icon: RotateCcw,
    keywords: ["returns", "refunds", "rma", "exchanges"],
  },
  {
    id: "nav-couriers",
    title: "Couriers & Delivery",
    subtitle: "Shipping providers and delivery partners",
    section: "Sales",
    url: "/couriers",
    icon: Truck,
    keywords: ["couriers", "delivery", "shipping partners", "logistics"],
  },
  {
    id: "nav-shipments",
    title: "Shipments & Tracking",
    subtitle: "Courier consignments and tracking numbers",
    section: "Sales",
    url: "/shipments",
    icon: Package,
    keywords: ["shipments", "tracking", "packages", "consignments"],
  },
  // Users
  {
    id: "nav-customers",
    title: "Customers",
    subtitle: "Registered accounts, profiles, and order history",
    section: "Users",
    url: "/customers",
    icon: Users,
    keywords: ["customers", "users", "clients", "buyers", "accounts"],
  },
  {
    id: "nav-staffs",
    title: "Staff Members",
    subtitle: "Admin accounts and access management",
    section: "Users",
    url: "/staffs",
    icon: UserCheck,
    keywords: ["staff", "staffs", "team", "employees", "administrators"],
  },
  // Marketing
  {
    id: "nav-coupons",
    title: "Coupons & Discounts",
    subtitle: "Promo codes, percentage, and fixed discounts",
    section: "Marketing",
    url: "/coupons",
    icon: Ticket,
    keywords: ["coupons", "discounts", "promo", "voucher", "promotions"],
  },
  {
    id: "nav-campaigns",
    title: "Marketing Campaigns",
    subtitle: "Seasonal promotions, banners, and targets",
    section: "Marketing",
    url: "/campaigns",
    icon: Megaphone,
    keywords: ["campaigns", "marketing", "promotions", "ad campaigns"],
  },
  {
    id: "nav-flash-sales",
    title: "Flash Sales",
    subtitle: "Time-limited discounted deal events",
    section: "Marketing",
    url: "/flash-sales",
    icon: Zap,
    keywords: ["flash sales", "limited time", "hot deals", "countdown"],
  },
  {
    id: "nav-group-buys",
    title: "Group Buys",
    subtitle: "Tiered community quantity discounts",
    section: "Marketing",
    url: "/group-buys",
    icon: UsersRound,
    keywords: ["group buys", "bulk orders", "community deals"],
  },
  {
    id: "nav-automations",
    title: "Marketing Automations",
    subtitle: "Email triggers, cart recovery, and workflows",
    section: "Marketing",
    url: "/automations",
    icon: Workflow,
    keywords: ["automations", "triggers", "workflows", "drip emails"],
  },
  {
    id: "nav-reviews",
    title: "Customer Reviews",
    subtitle: "Product feedback, ratings, and moderation",
    section: "Marketing",
    url: "/reviews",
    icon: Star,
    keywords: ["reviews", "ratings", "feedback", "testimonials", "stars"],
  },
  // CMS
  {
    id: "nav-banners",
    title: "Homepage Banners",
    subtitle: "Hero sliders, promo banners, and category links",
    section: "CMS",
    url: "/banners",
    icon: Image,
    keywords: ["banners", "hero slider", "homepage banner", "promos"],
  },
  {
    id: "nav-blog-posts",
    title: "Blog Posts",
    subtitle: "Content marketing, articles, and updates",
    section: "CMS",
    url: "/blog-posts",
    icon: BookOpen,
    keywords: ["blog", "posts", "articles", "news", "stories"],
  },
  {
    id: "nav-pages",
    title: "Content Pages",
    subtitle: "About us, Terms, Privacy Policy, and static pages",
    section: "CMS",
    url: "/pages",
    icon: FileText,
    keywords: ["pages", "static pages", "terms", "privacy", "about"],
  },
  // Analytics
  {
    id: "nav-reports",
    title: "Analytics & Reports",
    subtitle: "Financial trends, top products, and revenue graphs",
    section: "Analytics",
    url: "/reports",
    icon: BarChart3,
    keywords: ["reports", "analytics", "revenue", "sales stats", "charts"],
  },
  // System
  {
    id: "nav-profile",
    title: "Administrator Profile",
    subtitle: "Personal information, security credentials, and permissions",
    section: "System",
    url: "/profile",
    icon: User,
    keywords: ["profile", "account", "my profile", "admin profile", "avatar", "password", "user", "me"],
  },
  {
    id: "nav-settings",
    title: "General Settings",
    subtitle: "Store logo, WhatsApp number, and social links",
    section: "System",
    url: "/settings",
    icon: Settings,
    keywords: ["settings", "general settings", "store logo", "whatsapp", "social media", "store details"],
  },
  {
    id: "nav-auth-settings",
    title: "Authentication Settings",
    subtitle: "OTP, Social login, and password policies",
    section: "System",
    url: "/auth-settings",
    icon: KeyRound,
    keywords: ["auth settings", "security", "otp", "login methods", "passwords"],
  },
  {
    id: "nav-roles",
    title: "Roles & Permissions",
    subtitle: "Granular access controls and staff privileges",
    section: "System",
    url: "/roles",
    icon: ShieldAlert,
    keywords: ["roles", "permissions", "access control", "privileges"],
  },
  {
    id: "nav-notifications",
    title: "Notifications",
    subtitle: "System alerts and customer broadcast logs",
    section: "System",
    url: "/notifications",
    icon: Bell,
    keywords: ["notifications", "alerts", "system messages"],
  },
  {
    id: "nav-audit-logs",
    title: "Audit Logs",
    subtitle: "Track administrative activities and events",
    section: "System",
    url: "/audit-logs",
    icon: History,
    keywords: ["audit logs", "logs", "activity history", "security events"],
  },
]

export const GlobalSearch: React.FC = () => {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Redux entities for dynamic lookup
  const products = useAppSelector((state) => state.products.data)
  const orders = useAppSelector((state) => state.orders.data)
  const customers = useAppSelector((state) => state.customers.data)
  const expenses = useAppSelector((state) => state.expenses.data)

  // Register global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Compute matched items
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      // Return top quick links
      return STATIC_ROUTES.slice(0, 8)
    }

    const matchedStatic: SearchDestination[] = STATIC_ROUTES.filter((route) => {
      const titleMatch = route.title.toLowerCase().includes(q)
      const subtitleMatch = route.subtitle?.toLowerCase().includes(q)
      const sectionMatch = route.section.toLowerCase().includes(q)
      const keywordMatch = route.keywords.some((k) => k.includes(q))
      return titleMatch || subtitleMatch || sectionMatch || keywordMatch
    })

    const dynamicResults: SearchDestination[] = []

    // Match products
    if (products && products.length > 0) {
      products.forEach((prod) => {
        if (
          prod.name?.toLowerCase().includes(q) ||
          prod.slug?.toLowerCase().includes(q) ||
          prod.description?.toLowerCase().includes(q)
        ) {
          dynamicResults.push({
            id: `prod-${prod.id}`,
            title: prod.name,
            subtitle: `Product • $${prod.base_price || "0.00"} • Status: ${prod.status}`,
            section: "Products",
            url: `/product_detail/${prod.id}`,
            icon: Boxes,
            keywords: [prod.name, prod.slug || ""],
          })
        }
      })
    }

    // Match orders
    if (orders && orders.length > 0) {
      orders.forEach((order) => {
        const custName = order.customer
          ? [order.customer.first_name, order.customer.last_name].filter(Boolean).join(" ") || order.customer.email
          : "Customer"

        if (
          order.order_number?.toLowerCase().includes(q) ||
          order.status?.toLowerCase().includes(q) ||
          custName.toLowerCase().includes(q)
        ) {
          dynamicResults.push({
            id: `ord-${order.id}`,
            title: `Order #${order.order_number}`,
            subtitle: `Order • ${custName} • ${order.status} • $${order.total_amount || "0.00"}`,
            section: "Orders",
            url: `/order_detail/${order.id}`,
            icon: ShoppingCart,
            keywords: [order.order_number, custName],
          })
        }
      })
    }

    // Match customers
    if (customers && customers.length > 0) {
      customers.forEach((cust) => {
        const name = [cust.first_name, cust.last_name].filter(Boolean).join(" ")
        if (
          name.toLowerCase().includes(q) ||
          cust.email?.toLowerCase().includes(q) ||
          cust.phone?.toLowerCase().includes(q)
        ) {
          dynamicResults.push({
            id: `cust-${cust.id}`,
            title: name || cust.email,
            subtitle: `Customer • ${cust.email} • ${cust.phone || "No phone"}`,
            section: "Customers",
            url: `/customer_detail/${cust.id}`,
            icon: Users,
            keywords: [name, cust.email, cust.phone || ""],
          })
        }
      })
    }

    // Match expenses
    if (expenses && expenses.length > 0) {
      expenses.forEach((exp: Expense) => {
        if (
          exp.title?.toLowerCase().includes(q) ||
          exp.category?.toLowerCase().includes(q) ||
          exp.vendor?.toLowerCase().includes(q)
        ) {
          dynamicResults.push({
            id: `exp-${exp.id}`,
            title: exp.title,
            subtitle: `Expense • ${exp.category} • ${exp.vendor || "Vendor"} • $${exp.amount.toFixed(2)}`,
            section: "Expenses",
            url: `/expenses`,
            icon: Receipt,
            keywords: [exp.title, exp.category, exp.vendor || ""],
          })
        }
      })
    }

    return [...matchedStatic, ...dynamicResults.slice(0, 6)]
  }, [query, products, orders, customers, expenses])

  // Reset selection index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results.length])

  const handleSelect = (destination: SearchDestination) => {
    navigate(destination.url)
    setIsOpen(false)
    setQuery("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex])
      } else if (query.trim()) {
        // Smart fallback: try to find matching route by query
        const q = query.trim().toLowerCase()
        const fallback = STATIC_ROUTES.find((r) => r.keywords.some((k) => k.includes(q)) || r.title.toLowerCase().includes(q))
        if (fallback) {
          handleSelect(fallback)
        } else {
          navigate("/products")
          setIsOpen(false)
        }
      }
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Box (previous design) */}
      <div className="relative flex items-center w-full">
        <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search product, order, customer..."
          className="h-10 w-full rounded-lg border border-gray-200 bg-gray-100 pl-9 pr-13 text-sm text-gray-900 transition-all focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-gray-400 dark:border-[#16312b] dark:bg-white/5 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:bg-gray-700"
        />
        {query ? (
          <button
            onClick={() => {
              setQuery("")
              inputRef.current?.focus()
            }}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
        <span className="pointer-events-none absolute right-2 top-1/2 inline-flex h-7 w-9 -translate-y-1/2 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-400 dark:border-[#16312b] dark:bg-white/5">
          ⌘K
        </span>
      </div>

      {/* Instant Search Results Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 w-full rounded-xl border border-border bg-popover/95 text-popover-foreground shadow-xl backdrop-blur-md z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="flex items-center justify-between border-b border-border/60 px-3 py-2 text-[11px] font-medium text-muted-foreground bg-muted/30">
            <span>{query ? `Results for "${query}"` : "Quick Navigation"}</span>
            <div className="flex items-center gap-1.5">
              <span>Navigate</span>
              <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">↑↓</kbd>
              <span>Select</span>
              <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">↵</kbd>
            </div>
          </div>

          <div className="max-h-[360px] overflow-y-auto p-1.5 divide-y divide-border/20">
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Search className="size-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm font-medium text-foreground">No matches found</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Try searching for products, orders, expenses, customers, or settings.
                </p>
              </div>
            ) : (
              results.map((item, index) => {
                const isSelected = index === selectedIndex
                const IconComponent = item.icon

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => handleSelect(item)}
                    className={`group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-primary/10 text-primary dark:bg-primary/20"
                        : "text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                          isSelected
                            ? "border-primary/30 bg-primary/20 text-primary"
                            : "border-border bg-background text-muted-foreground group-hover:text-foreground"
                        }`}
                      >
                        <IconComponent className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium text-foreground leading-snug">
                            {item.title}
                          </p>
                          <span className="shrink-0 rounded bg-muted/80 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            {item.section}
                          </span>
                        </div>
                        {item.subtitle && (
                          <p className="truncate text-xs text-muted-foreground mt-0.5">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CornerDownLeft className="size-3.5 text-muted-foreground" />
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="border-t border-border/60 bg-muted/20 px-3 py-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Press <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">Esc</kbd> to close</span>
            <span className="text-primary font-medium flex items-center gap-1">
              NestmartIT Workspace
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
