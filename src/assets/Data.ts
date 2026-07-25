export const categoryOptions = [
  { label: "Electronics", value: "electronics" },
  { label: "Smartphones", value: "smartphones" },
  { label: "Laptops", value: "laptops" },
  { label: "Audio Devices", value: "audio" },
  { label: "Wearables", value: "wearables" },

  { label: "Clothing", value: "clothing" },
  { label: "Shoes", value: "shoes" },
  { label: "Accessories", value: "accessories" },

  { label: "Gaming", value: "gaming" },
  { label: "Home Appliances", value: "home_appliances" },

  { label: "Cameras", value: "cameras" },
  { label: "Furniture", value: "furniture" },
  { label: "Beauty & Health", value: "beauty_health" },
]

export const statusStyles = {
  active: "bg-green-500/10 text-green-400 border border-green-500/20",
  draft: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  archived: "bg-red-500/10 text-red-400 border border-red-500/20",
  inactive: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
} as const

export type ProductStatus = keyof typeof statusStyles

export interface ProductItem {
  id: string
  image: string
  product: string
  sku: string
  category: string
  price: number
  status: ProductStatus
  rating: number
  sales: number
  createdAt: string
  description?: string
  stock?: number
}

export const products: ProductItem[] = [
  {
    id: "P1001",
    image: "/images/product-1.jpg",
    product: "iPhone 15 Pro",
    sku: "APL-IP15P-256",
    category: "smartphones",
    price: 1199,
    status: "active",
    rating: 4.8,
    sales: 1520,
    createdAt: "2025-01-12",
    description: "Experience the ultimate iPhone with the A17 Pro chip, a titanium design, and a powerful new camera system.",
    stock: 45,
  },
  {
    id: "P1002",
    image: "/images/product-2.jpg",
    product: "Samsung Galaxy S24",
    sku: "SMS-S24-256",
    category: "smartphones",
    price: 1099,
    status: "active",
    rating: 4.7,
    sales: 1340,
    createdAt: "2025-02-05",
    description: "The Galaxy S24 features Galaxy AI, a stunning LTPO display, and an improved camera for capturing every moment.",
    stock: 32,
  },
  {
    id: "P1003",
    image: "/images/product-3.jpg",
    product: "MacBook Air M3",
    sku: "APL-MBA-M3",
    category: "laptops",
    price: 1499,
    status: "draft",
    rating: 4.9,
    sales: 980,
    createdAt: "2025-01-20",
    description: "The incredibly thin and fast MacBook Air with the M3 chip, designed for portability and performance.",
    stock: 15,
  },
  {
    id: "P1004",
    image: "/images/product-4.jpg",
    product: "Dell XPS 13",
    sku: "DLL-XPS13-2025",
    category: "laptops",
    price: 1299,
    status: "active",
    rating: 4.6,
    sales: 860,
    createdAt: "2024-12-15",
    description: "The Dell XPS 13 combines a stunning InfinityEdge display with the latest Intel Core processors for premium productivity.",
    stock: 20,
  },
  {
    id: "P1005",
    image: "/images/product-5.jpg",
    product: "Sony WH-1000XM5",
    sku: "SNY-WH1000XM5",
    category: "audio",
    price: 399,
    status: "active",
    rating: 4.8,
    sales: 2200,
    createdAt: "2025-03-10",
    description: "Industry-leading noise canceling and exceptional sound quality in a comfortable, modern design.",
    stock: 58,
  },
  {
    id: "P1006",
    image: "/images/product-6.jpg",
    product: "Apple AirPods Pro 2",
    sku: "APL-APP2",
    category: "audio",
    price: 249,
    status: "active",
    rating: 4.7,
    sales: 3100,
    createdAt: "2025-02-28",
    description: "AirPods Pro features up to 2x more Active Noise Cancellation, plus Adaptive Transparency, and Personalized Spatial Audio.",
    stock: 120,
  },
  {
    id: "P1007",
    image: "/images/product-7.jpg",
    product: "Nike Air Max 270",
    sku: "NKE-AM270",
    category: "shoes",
    price: 149,
    status: "active",
    rating: 4.5,
    sales: 1800,
    createdAt: "2024-11-11",
    description: "Nike's first lifestyle Air Max brings you style, comfort and big attitude.",
    stock: 85,
  },
  {
    id: "P1008",
    image: "/images/product-8.jpg",
    product: "Adidas Ultraboost 22",
    sku: "ADS-UB22",
    category: "shoes",
    price: 179,
    status: "draft",
    rating: 4.6,
    sales: 1400,
    createdAt: "2025-01-05",
    description: "A little extra push. The Ultraboost running shoes serve up comfort and responsiveness.",
    stock: 42,
  },
  {
    id: "P1009",
    image: "/images/product-9.jpg",
    product: "Leather Wallet",
    sku: "ACC-WLT-001",
    category: "accessories",
    price: 49,
    status: "active",
    rating: 4.3,
    sales: 500,
    createdAt: "2024-10-10",
    description: "Handcrafted genuine leather wallet with RFID protection and multiple card slots.",
    stock: 150,
  },
  {
    id: "P1010",
    image: "/images/product-10.jpg",
    product: "Smart Watch Series 9",
    sku: "APL-SW9",
    category: "wearables",
    price: 499,
    status: "active",
    rating: 4.7,
    sales: 2100,
    createdAt: "2025-03-01",
    description: "Smarter. Brighter. Mightier. Apple Watch Series 9 is more capable than ever.",
    stock: 64,
  },
  {
    id: "P1011",
    image: "/images/product-11.jpg",
    product: "Gaming Keyboard RGB",
    sku: "GMG-KB-RGB",
    category: "gaming",
    price: 89,
    status: "active",
    rating: 4.4,
    sales: 950,
    createdAt: "2025-01-18",
    description: "Mechanical gaming keyboard with customizable RGB backlighting and tactile switches.",
    stock: 38,
  },
  {
    id: "P1012",
    image: "/images/product-12.jpg",
    product: "Gaming Mouse Pro",
    sku: "GMG-MS-PRO",
    category: "gaming",
    price: 59,
    status: "active",
    rating: 4.6,
    sales: 1200,
    createdAt: "2025-02-02",
    description: "High-precision gaming mouse with adjustable DPI and ergonomic design.",
    stock: 72,
  },
  {
    id: "P1013",
    image: "/images/product-13.jpg",
    product: "Canon EOS R10",
    sku: "CNR-R10",
    category: "cameras",
    price: 999,
    status: "draft",
    rating: 4.8,
    sales: 670,
    createdAt: "2024-12-22",
    description: "A versatile mirrorless camera that's perfect for content creators and enthusiasts.",
    stock: 12,
  },
  {
    id: "P1014",
    image: "/images/product-14.jpg",
    product: "Sony Alpha A7 III",
    sku: "SNY-A7III",
    category: "cameras",
    price: 1999,
    status: "active",
    rating: 4.9,
    sales: 540,
    createdAt: "2025-01-08",
    description: "Full-frame mirrorless camera with outstanding imaging capability and high-speed performance.",
    stock: 8,
  },
  {
    id: "P1015",
    image: "/images/product-15.jpg",
    product: "Office Chair Ergonomic",
    sku: "FUR-CHAIR-ERG",
    category: "furniture",
    price: 199,
    status: "active",
    rating: 4.5,
    sales: 760,
    createdAt: "2024-09-30",
    description: "Maintain proper posture and stay comfortable during long work hours with this ergonomic office chair.",
    stock: 25,
  },
  {
    id: "P1016",
    image: "/images/product-16.jpg",
    product: "Wooden Study Desk",
    sku: "FUR-DESK-WOOD",
    category: "furniture",
    price: 249,
    status: "draft",
    rating: 4.4,
    sales: 620,
    createdAt: "2024-11-25",
    description: "Spacious and durable wooden study desk, perfect for home offices and students.",
    stock: 14,
  },
  {
    id: "P1017",
    image: "/images/product-17.jpg",
    product: "Face Serum Glow",
    sku: "BEA-SRM-GLW",
    category: "beauty_health",
    price: 29,
    status: "active",
    rating: 4.2,
    sales: 2400,
    createdAt: "2025-03-15",
    description: "A lightweight serum that brightens and hydrates for a glowing complexion.",
    stock: 200,
  },
  {
    id: "P1018",
    image: "/images/product-18.jpg",
    product: "Vitamin C Tablets",
    sku: "BEA-VITC-60",
    category: "beauty_health",
    price: 19,
    status: "active",
    rating: 4.3,
    sales: 3200,
    createdAt: "2025-02-10",
    description: "Daily Vitamin C supplement to support your immune system and overall health.",
    stock: 500,
  },
  {
    id: "P1019",
    image: "/images/product-19.jpg",
    product: "LED Desk Lamp",
    sku: "HAP-LAMP-LED",
    category: "home_appliances",
    price: 39,
    status: "active",
    rating: 4.5,
    sales: 1100,
    createdAt: "2024-10-28",
    description: "Dimmable LED desk lamp with multiple color modes and a built-in USB charging port.",
    stock: 48,
  },
  {
    id: "P1020",
    image: "/images/product-20.jpg",
    product: "Air Fryer 5L",
    sku: "HAP-AFRY-5L",
    category: "home_appliances",
    price: 129,
    status: "active",
    rating: 4.7,
    sales: 1950,
    createdAt: "2025-01-30",
    description: "Cook your favorite fried foods with little to no oil for a healthier alternative.",
    stock: 35,
  },
]

export interface TimelineEvent {
  label: string
  date: string
  status: "completed" | "active" | "pending"
}

export interface ActivityLog {
  type: "system" | "staff"
  message: string
  date: string
}

export interface Order {
  id: string
  customer: string
  customerId: string
  email?: string
  phone?: string
  product: string
  amount: number
  discount: number
  shippingFee: number
  tax: number
  paymentMethod: string
  paymentStatus: "Paid" | "Pending" | "Failed" | "Refunded"
  fulfillmentStatus: "Shipped" | "Processing" | "Cancelled" | "Delivered" | "Unfulfilled"
  date: string
  shippingAddress?: string
  billingAddress?: string
  items?: Array<{
    id: string
    name: string
    price: number
    quantity: number
    image: string
  }>
  timeline: TimelineEvent[]
  activityLog: ActivityLog[]
}

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  totalOrders: number
  totalSpent: number
  status: "Active" | "Inactive"
  createdAt: string
  lastOrderAt?: string
  address?: string
  city?: string
  country?: string
  zipCode?: string
  notes?: string[]
}

export const customers: Customer[] = [
  {
    id: "CUST-001",
    name: "John Doe",
    email: "john@example.com",
    phone: "+8801712345678",
    avatar: "",
    totalOrders: 5,
    totalSpent: 320.5,
    status: "Active",
    createdAt: "2025-01-10",
    lastOrderAt: "2026-05-12",
    address: "123 Main St",
    city: "New York",
    country: "USA",
    zipCode: "10001"
  },
  {
    id: "CUST-002",
    name: "Sarah Khan",
    email: "sarah@example.com",
    phone: "+8801812345678",
    avatar: "",
    totalOrders: 2,
    totalSpent: 120.0,
    status: "Active",
    createdAt: "2025-02-14",
    lastOrderAt: "2026-04-20",
    address: "456 Oak Ave",
    city: "Los Angeles",
    country: "USA",
    zipCode: "90001"
  },
  {
    id: "CUST-004",
    name: "Ayesha Rahman",
    email: "ayesha@example.com",
    phone: "+8801612345678",
    avatar: "",
    totalOrders: 12,
    totalSpent: 980.75,
    status: "Active",
    createdAt: "2024-12-25",
    lastOrderAt: "2026-05-15",
    address: "789 Pine Rd",
    city: "Chicago",
    country: "USA",
    zipCode: "60601"
  }
]

export const orders: Order[] = [
  {
    id: "ORD-0012",
    customer: "John Doe",
    customerId: "CUST-001",
    email: "john@example.com",
    phone: "+8801712345678",
    product: "iPhone 15 Pro",
    amount: 1199.0,
    discount: 100,
    shippingFee: 0,
    tax: 54.95,
    paymentMethod: "Visa Card ending in •••• 4242",
    paymentStatus: "Paid",
    fulfillmentStatus: "Shipped",
    date: "Oct 24, 2023",
    shippingAddress: "123 Main St, New York, NY 10001",
    billingAddress: "123 Main St, New York, NY 10001",
    items: [
      {
        id: "P1001",
        name: "iPhone 15 Pro",
        price: 1199.0,
        quantity: 1,
        image: "/images/product-1.jpg",
      }
    ],
    timeline: [
      { label: "Order Placed", date: "Oct 24, 2023 - 10:30 AM", status: "completed" },
      { label: "Payment Verified", date: "Oct 24, 2023 - 10:35 AM", status: "completed" },
      { label: "Processing", date: "Oct 24, 2023 - 02:15 PM", status: "completed" },
      { label: "Shipped", date: "Oct 25, 2023 - 09:00 AM", status: "active" },
      { label: "Delivered", date: "TBD", status: "pending" },
    ],
    activityLog: [
      { type: "system", message: "Order status changed from 'Processing' to 'Shipped' by Admin.", date: "Oct 25, 2023 - 09:00 AM" },
      { type: "staff", message: "Customer requested to leave the package at the front porch.", date: "Oct 24, 2023 - 11:20 AM" },
    ]
  },
  {
    id: "ORD-0013",
    customer: "Sarah Khan",
    customerId: "CUST-002",
    email: "sarah@example.com",
    phone: "+8801812345678",
    product: "Sony WH-1000XM5",
    amount: 399.0,
    discount: 0,
    shippingFee: 15.0,
    tax: 19.95,
    paymentMethod: "MasterCard ending in •••• 5521",
    paymentStatus: "Pending",
    fulfillmentStatus: "Processing",
    date: "Oct 23, 2023",
    shippingAddress: "456 Oak Ave, Los Angeles, CA 90001",
    billingAddress: "456 Oak Ave, Los Angeles, CA 90001",
    items: [
      {
        id: "P1005",
        name: "Sony WH-1000XM5",
        price: 399.0,
        quantity: 1,
        image: "/images/product-5.jpg",
      }
    ],
    timeline: [
      { label: "Order Placed", date: "Oct 23, 2023 - 11:00 AM", status: "completed" },
      { label: "Payment Pending", date: "Oct 23, 2023 - 11:05 AM", status: "active" },
      { label: "Processing", date: "TBD", status: "pending" },
    ],
    activityLog: [
      { type: "system", message: "Order created.", date: "Oct 23, 2023 - 11:00 AM" },
    ]
  },
  {
    id: "ORD-0014",
    customer: "Ayesha Rahman",
    customerId: "CUST-004",
    email: "ayesha@example.com",
    phone: "+8801612345678",
    product: "MacBook Air M3",
    amount: 1499.0,
    discount: 50,
    shippingFee: 0,
    tax: 65.2,
    paymentMethod: "bKash",
    paymentStatus: "Paid",
    fulfillmentStatus: "Delivered",
    date: "Oct 22, 2023",
    shippingAddress: "789 Pine Rd, Chicago, IL 60601",
    billingAddress: "789 Pine Rd, Chicago, IL 60601",
    items: [
      { id: "P1003", name: "MacBook Air M3", price: 1499.0, quantity: 1, image: "/images/product-3.jpg" },
    ],
    timeline: [
      { label: "Order Placed", date: "Oct 22, 2023 - 09:00 AM", status: "completed" },
      { label: "Delivered", date: "Oct 24, 2023 - 03:00 PM", status: "completed" },
    ],
    activityLog: [
      { type: "system", message: "Order delivered.", date: "Oct 24, 2023 - 03:00 PM" },
    ]
  },
  {
    id: "ORD-0015",
    customer: "John Doe",
    customerId: "CUST-001",
    email: "john@example.com",
    phone: "+8801712345678",
    product: "Gaming Mouse Pro",
    amount: 59.0,
    discount: 0,
    shippingFee: 5,
    tax: 3.2,
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Failed",
    fulfillmentStatus: "Cancelled",
    date: "Oct 21, 2023",
    shippingAddress: "123 Main St, New York, NY 10001",
    billingAddress: "123 Main St, New York, NY 10001",
    items: [
      { id: "P1012", name: "Gaming Mouse Pro", price: 59.0, quantity: 1, image: "/images/product-12.jpg" },
    ],
    timeline: [
      { label: "Order Placed", date: "Oct 21, 2023 - 01:00 PM", status: "completed" },
      { label: "Cancelled", date: "Oct 21, 2023 - 04:00 PM", status: "active" },
    ],
    activityLog: [
      { type: "system", message: "Payment failed, order auto-cancelled.", date: "Oct 21, 2023 - 04:00 PM" },
    ]
  },
]

export interface Category {
  id: string
  name: string
  slug: string
  parent?: string | null
  products: number
  status: "active" | "draft" | "inactive"
  createdAt: string
}

export const categories: Category[] = [
  { id: "C1001", name: "Electronics", slug: "electronics", parent: null, products: 120, status: "active", createdAt: "2025-01-10" },
  { id: "C1002", name: "Smartphones", slug: "smartphones", parent: "Electronics", products: 45, status: "active", createdAt: "2025-01-12" },
  { id: "C1003", name: "Laptops", slug: "laptops", parent: "Electronics", products: 32, status: "active", createdAt: "2025-01-15" },
  { id: "C1004", name: "Audio Devices", slug: "audio-devices", parent: "Electronics", products: 28, status: "active", createdAt: "2025-02-01" },
  { id: "C1005", name: "Wearables", slug: "wearables", parent: "Electronics", products: 18, status: "active", createdAt: "2025-02-05" },
  { id: "C1006", name: "Gaming", slug: "gaming", parent: null, products: 60, status: "active", createdAt: "2025-02-10" },
  { id: "C1007", name: "Consoles", slug: "consoles", parent: "Gaming", products: 12, status: "active", createdAt: "2025-02-12" },
  { id: "C1008", name: "Accessories", slug: "gaming-accessories", parent: "Gaming", products: 25, status: "active", createdAt: "2025-02-15" },
  { id: "C1009", name: "Clothing", slug: "clothing", parent: null, products: 90, status: "active", createdAt: "2025-01-20" },
  { id: "C1010", name: "Men Fashion", slug: "men-fashion", parent: "Clothing", products: 40, status: "active", createdAt: "2025-01-22" },
  { id: "C1011", name: "Women Fashion", slug: "women-fashion", parent: "Clothing", products: 50, status: "active", createdAt: "2025-01-25" },
  { id: "C1012", name: "Shoes", slug: "shoes", parent: null, products: 70, status: "active", createdAt: "2025-01-28" },
  { id: "C1013", name: "Sneakers", slug: "sneakers", parent: "Shoes", products: 30, status: "active", createdAt: "2025-02-01" },
  { id: "C1014", name: "Formal Shoes", slug: "formal-shoes", parent: "Shoes", products: 20, status: "inactive", createdAt: "2025-02-03" },
  { id: "C1015", name: "Home Appliances", slug: "home-appliances", parent: null, products: 55, status: "active", createdAt: "2025-02-10" },
  { id: "C1016", name: "Kitchen Appliances", slug: "kitchen-appliances", parent: "Home Appliances", products: 22, status: "active", createdAt: "2025-02-12" },
  { id: "C1017", name: "Furniture", slug: "furniture", parent: null, products: 40, status: "active", createdAt: "2025-02-18" },
  { id: "C1018", name: "Office Furniture", slug: "office-furniture", parent: "Furniture", products: 15, status: "draft", createdAt: "2025-02-20" },
  { id: "C1019", name: "Beauty & Health", slug: "beauty-health", parent: null, products: 65, status: "active", createdAt: "2025-02-25" },
  { id: "C1020", name: "Skincare", slug: "skincare", parent: "Beauty & Health", products: 28, status: "active", createdAt: "2025-02-28" },
]

export interface Staff {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: string
  status: "Active" | "Inactive" | "On Leave"
  joinedAt: string
}

export const staffs: Staff[] = [
  { id: "STAFF-001", name: "Alice Johnson", email: "alice@example.com", phone: "+8801712345671", avatar: "", role: "Admin", status: "Active", joinedAt: "2024-01-15" },
  { id: "STAFF-002", name: "Bob Smith", email: "bob@example.com", phone: "+8801812345672", avatar: "", role: "Manager", status: "Active", joinedAt: "2024-02-20" },
  { id: "STAFF-003", name: "Charlie Davis", email: "charlie@example.com", phone: "+8801912345673", avatar: "", role: "Sales", status: "Inactive", joinedAt: "2024-03-05" },
  { id: "STAFF-004", name: "Diana Prince", email: "diana@example.com", phone: "+8801612345674", avatar: "", role: "Support", status: "Active", joinedAt: "2024-04-10" },
  { id: "STAFF-005", name: "Edward Norton", email: "edward@example.com", phone: "+8801512345675", avatar: "", role: "Editor", status: "On Leave", joinedAt: "2024-05-12" },
  { id: "STAFF-006", name: "Fiona Gallagher", email: "fiona@example.com", phone: "+8801711122231", avatar: "", role: "Sales", status: "Active", joinedAt: "2024-06-18" },
  { id: "STAFF-007", name: "George Miller", email: "george@example.com", phone: "+8801811122232", avatar: "", role: "Manager", status: "Active", joinedAt: "2024-07-22" },
  { id: "STAFF-008", name: "Hannah Abbott", email: "hannah@example.com", phone: "+8801911122233", avatar: "", role: "Support", status: "Inactive", joinedAt: "2024-08-05" },
  { id: "STAFF-009", name: "Ian Wright", email: "ian@example.com", phone: "+8801611122234", avatar: "", role: "Editor", status: "Active", joinedAt: "2024-09-15" },
  { id: "STAFF-010", name: "Julia Roberts", email: "julia@example.com", phone: "+8801511122235", avatar: "", role: "Sales", status: "Active", joinedAt: "2024-10-01" },
]

export interface Role {
  id: string
  name: string
  description: string
  usersCount: number
  type: "System" | "Custom"
  permissions: string[]
  level: "High" | "Medium" | "Low"
}

export const roles: Role[] = [
  { id: "1", name: "Administrator", description: "Full access to all system features and settings.", usersCount: 2, type: "System", permissions: ["Full Access"], level: "High" },
  { id: "2", name: "Manager", description: "Can manage products, orders, and view reports.", usersCount: 5, type: "Custom", permissions: ["Products", "Orders", "Reports", "Customers"], level: "Medium" },
  { id: "3", name: "Support", description: "Can view orders and handle customer inquiries.", usersCount: 8, type: "Custom", permissions: ["Orders (View)", "Customers (View)", "Chat"], level: "Low" },
  { id: "4", name: "Editor", description: "Can manage catalog content and blog posts.", usersCount: 3, type: "Custom", permissions: ["Products", "Categories", "Blog"], level: "Medium" },
]

export type TransactionPaymentMethod = "card" | "paypal" | "stripe" | "cash"

export interface TransactionItem {
  id: string
  customer: string
  orderId: string
  paymentMethod: TransactionPaymentMethod
  amount: number
  status: "paid" | "pending" | "failed" | "refunded"
  date: string
}

export const transactions: TransactionItem[] = [
  { id: "TXN1001", customer: "John Smith", orderId: "ORD5001", paymentMethod: "card", amount: 249.99, status: "paid", date: "2025-05-01 10:24 AM" },
  { id: "TXN1002", customer: "Emma Johnson", orderId: "ORD5002", paymentMethod: "paypal", amount: 89.5, status: "pending", date: "2025-05-01 11:12 AM" },
  { id: "TXN1003", customer: "Michael Brown", orderId: "ORD5003", paymentMethod: "stripe", amount: 520, status: "paid", date: "2025-05-02 09:18 AM" },
  { id: "TXN1004", customer: "Sophia Davis", orderId: "ORD5004", paymentMethod: "cash", amount: 45, status: "failed", date: "2025-05-02 02:41 PM" },
  { id: "TXN1005", customer: "Daniel Wilson", orderId: "ORD5005", paymentMethod: "card", amount: 1299.99, status: "paid", date: "2025-05-03 08:55 AM" },
  { id: "TXN1006", customer: "Olivia Martinez", orderId: "ORD5006", paymentMethod: "paypal", amount: 72.49, status: "refunded", date: "2025-05-03 01:30 PM" },
  { id: "TXN1007", customer: "William Anderson", orderId: "ORD5007", paymentMethod: "stripe", amount: 340, status: "paid", date: "2025-05-04 03:22 PM" },
  { id: "TXN1008", customer: "Ava Thomas", orderId: "ORD5008", paymentMethod: "card", amount: 15.99, status: "pending", date: "2025-05-04 06:40 PM" },
  { id: "TXN1009", customer: "James Taylor", orderId: "ORD5009", paymentMethod: "cash", amount: 230, status: "paid", date: "2025-05-05 10:05 AM" },
  { id: "TXN1010", customer: "Isabella Moore", orderId: "ORD5010", paymentMethod: "paypal", amount: 480, status: "failed", date: "2025-05-05 12:11 PM" },
]

export interface InventoryItem {
  id: string
  product: string
  image?: string
  sku: string
  category: string
  stock: number
  status: "In Stock" | "Low Stock" | "Out of Stock"
  price: number
  lastRestocked: string
}

export const inventory: InventoryItem[] = [
  { id: "INV-001", product: "Nike Air Max", image: "", sku: "NK-AM-001", category: "Shoes", stock: 42, status: "In Stock", price: 129.99, lastRestocked: "2026-05-15" },
  { id: "INV-002", product: "Adidas Ultraboost", image: "", sku: "AD-UB-002", category: "Shoes", stock: 8, status: "Low Stock", price: 149.99, lastRestocked: "2026-05-11" },
  { id: "INV-003", product: "Apple AirPods Pro", image: "", sku: "AP-APP-003", category: "Electronics", stock: 0, status: "Out of Stock", price: 249.99, lastRestocked: "2026-05-01" },
  { id: "INV-004", product: "Samsung Galaxy Watch", image: "", sku: "SM-GW-004", category: "Wearables", stock: 25, status: "In Stock", price: 199.99, lastRestocked: "2026-05-18" },
  { id: "INV-005", product: "Sony WH-1000XM5", image: "", sku: "SY-WH-005", category: "Electronics", stock: 6, status: "Low Stock", price: 349.99, lastRestocked: "2026-05-12" },
  { id: "INV-006", product: "Puma Sports Hoodie", image: "", sku: "PM-HD-006", category: "Clothing", stock: 58, status: "In Stock", price: 59.99, lastRestocked: "2026-05-14" },
  { id: "INV-007", product: "Dell XPS 13", image: "", sku: "DL-XPS-007", category: "Laptops", stock: 4, status: "Low Stock", price: 1299.99, lastRestocked: "2026-05-10" },
  { id: "INV-008", product: "Logitech MX Master 3", image: "", sku: "LG-MX-008", category: "Accessories", stock: 37, status: "In Stock", price: 99.99, lastRestocked: "2026-05-09" },
  { id: "INV-009", product: "Canon EOS R50", image: "", sku: "CN-EOS-009", category: "Cameras", stock: 2, status: "Low Stock", price: 899.99, lastRestocked: "2026-05-08" },
  { id: "INV-010", product: "HP Pavilion Gaming", image: "", sku: "HP-PV-010", category: "Laptops", stock: 0, status: "Out of Stock", price: 1099.99, lastRestocked: "2026-04-28" },
]

export interface Coupon {
  id: string
  code: string
  type: "percent" | "fixed" | "free_shipping"
  value: number
  minOrderAmount?: number
  usageLimit: number
  usedCount: number
  expiryDate: string
  status: "active" | "scheduled" | "expired" | "disabled"
  createdAt: string
}

export const coupons: Coupon[] = [
  { id: "CPN-001", code: "WELCOME10", type: "percent", value: 10, minOrderAmount: 50, usageLimit: 500, usedCount: 214, expiryDate: "2026-12-31", status: "active", createdAt: "2026-01-05" },
  { id: "CPN-002", code: "FREESHIP", type: "free_shipping", value: 0, minOrderAmount: 30, usageLimit: 1000, usedCount: 812, expiryDate: "2026-09-30", status: "active", createdAt: "2026-02-01" },
  { id: "CPN-003", code: "SAVE20", type: "fixed", value: 20, minOrderAmount: 100, usageLimit: 300, usedCount: 300, expiryDate: "2026-06-01", status: "expired", createdAt: "2025-11-20" },
  { id: "CPN-004", code: "EID2026", type: "percent", value: 25, minOrderAmount: 40, usageLimit: 2000, usedCount: 0, expiryDate: "2026-09-15", status: "scheduled", createdAt: "2026-07-01" },
  { id: "CPN-005", code: "VIP15", type: "percent", value: 15, usageLimit: 100, usedCount: 42, expiryDate: "2026-08-31", status: "active", createdAt: "2026-03-12" },
]

export interface Campaign {
  id: string
  name: string
  type: "flash_sale" | "mega_event" | "seasonal"
  bannerImage?: string
  startDate: string
  endDate: string
  productIds: string[]
  status: "draft" | "scheduled" | "active" | "ended"
  description?: string
  createdAt: string
}

export const campaigns: Campaign[] = [
  {
    id: "CMP-001",
    name: "Eid Mega Sale",
    type: "mega_event",
    bannerImage: "/images/product-1.jpg",
    startDate: "2026-08-01",
    endDate: "2026-08-10",
    productIds: ["P1001", "P1002", "P1005"],
    status: "scheduled",
    description: "Store-wide mega event with early-bird teaser and doorbuster deals.",
    createdAt: "2026-06-10",
  },
  {
    id: "CMP-002",
    name: "Weekend Flash Sale",
    type: "flash_sale",
    bannerImage: "/images/product-6.jpg",
    startDate: "2026-07-24",
    endDate: "2026-07-26",
    productIds: ["P1006", "P1009"],
    status: "active",
    description: "48-hour flash discounts on best-selling accessories.",
    createdAt: "2026-07-15",
  },
  {
    id: "CMP-003",
    name: "New Year Clearance",
    type: "seasonal",
    bannerImage: "/images/product-15.jpg",
    startDate: "2026-01-01",
    endDate: "2026-01-07",
    productIds: ["P1015", "P1016"],
    status: "ended",
    description: "Year-end clearance for furniture and home items.",
    createdAt: "2025-12-15",
  },
]

export interface Review {
  id: string
  productId: string
  productName: string
  customerId: string
  customerName: string
  rating: number
  comment: string
  photoUrl?: string
  status: "pending" | "approved" | "rejected"
  sellerReply?: string
  date: string
}

export const reviews: Review[] = [
  { id: "REV-001", productId: "P1001", productName: "iPhone 15 Pro", customerId: "CUST-001", customerName: "John Doe", rating: 5, comment: "Excellent build quality and camera. Worth every penny.", status: "approved", date: "2026-05-14" },
  { id: "REV-002", productId: "P1005", productName: "Sony WH-1000XM5", customerId: "CUST-002", customerName: "Sarah Khan", rating: 4, comment: "Great noise cancellation, a bit pricey though.", status: "pending", date: "2026-07-20" },
  { id: "REV-003", productId: "P1003", productName: "MacBook Air M3", customerId: "CUST-004", customerName: "Ayesha Rahman", rating: 2, comment: "Received a unit with a scratched lid, requesting replacement.", status: "pending", photoUrl: "/images/product-3.jpg", date: "2026-07-22" },
  { id: "REV-004", productId: "P1012", productName: "Gaming Mouse Pro", customerId: "CUST-001", customerName: "John Doe", rating: 1, comment: "This review contains spam links, flagging for removal.", status: "rejected", date: "2026-06-30" },
]

export interface StoreSettings {
  storeName: string
  supportEmail: string
  storeAddress: string
  storePhone: string
  vatId: string
  notifications: {
    orderUpdates: boolean
    inventoryAlerts: boolean
    customerReviews: boolean
  }
  maintenanceMode: boolean
}

export const defaultStoreSettings: StoreSettings = {
  storeName: "My Awesome Store",
  supportEmail: "support@mystore.com",
  storeAddress: "123 Commerce St, Tech City, 54321, US",
  storePhone: "+1 (555) 000-0000",
  vatId: "US123456789",
  notifications: {
    orderUpdates: true,
    inventoryAlerts: true,
    customerReviews: false,
  },
  maintenanceMode: false,
}

export interface AuthSettings {
  loginMethods: {
    email: boolean
    google: boolean
    apple: boolean
  }
  minPasswordLength: string
  passwordPolicies: {
    special: boolean
    numbers: boolean
    uppercase: boolean
  }
  sessionTimeout: string
  multiDeviceLogin: boolean
  force2FA: boolean
  primary2FAMethod: string
}

export const defaultAuthSettings: AuthSettings = {
  loginMethods: {
    email: true,
    google: true,
    apple: false,
  },
  minPasswordLength: "8",
  passwordPolicies: {
    special: true,
    numbers: true,
    uppercase: true,
  },
  sessionTimeout: "24h",
  multiDeviceLogin: true,
  force2FA: false,
  primary2FAMethod: "app",
}
