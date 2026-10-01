// DEV-ONLY mock API adapter.
//
// The real backend this app points at (VITE_BACKEND_ORIGIN) is no longer deployed —
// Railway answers every route with `x-railway-fallback: true` and a 404 "Application
// not found". That makes the entire UI unverifiable: every list renders its error
// state, so layout, responsive and a11y work cannot be checked in a browser.
//
// This adapter synthesises plausible responses for every endpoint the app calls so
// the UI can be developed and reviewed locally. It is installed only when
// import.meta.env.DEV is true AND VITE_MOCK_API is not explicitly "false", so it is
// compiled out of production bundles entirely.
//
// It is a development scaffold, not a test fixture: it does not attempt to reproduce
// backend validation, auth, or error semantics.

import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios"

export const MOCK_API_ENABLED =
  import.meta.env.DEV && import.meta.env.VITE_MOCK_API !== "false"

/* ------------------------------------------------------------------ *
 * Deterministic pseudo-randomness — stable across reloads so the UI
 * doesn't reshuffle on every render/HMR cycle.
 * ------------------------------------------------------------------ */

function hash(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function rng(seed: string) {
  let state = hash(seed) || 1
  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    state >>>= 0
    return state / 4294967296
  }
}

const pick = <T,>(arr: readonly T[], r: () => number): T => arr[Math.floor(r() * arr.length) % arr.length]
const int = (r: () => number, min: number, max: number) => Math.floor(r() * (max - min + 1)) + min
const uuid = (seed: string) => {
  const r = rng(seed)
  const hex = () => Math.floor(r() * 16).toString(16).padStart(2, "0")
  return `${hex()}${hex()}${hex()}${hex()}-${hex()}${hex()}-4${hex()}${hex().slice(1, 3)}-${hex()}${hex()}${hex()}-${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}`
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString()
const daysAhead = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString()

/* ------------------------------------------------------------------ *
 * Inline SVG placeholder art — avoids any network dependency.
 * ------------------------------------------------------------------ */

function art(seed: string, w: number, h: number, label: string) {
  const r = rng(seed)
  const hue = int(r, 0, 359)
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0%" stop-color="hsl(${hue},58%,62%)"/>` +
    `<stop offset="100%" stop-color="hsl(${(hue + 48) % 360},52%,44%)"/>` +
    `</linearGradient></defs>` +
    `<rect width="${w}" height="${h}" fill="url(#g)"/>` +
    `<text x="50%" y="50%" font-family="system-ui,sans-serif" font-size="${Math.round(Math.min(w, h) / 6)}" ` +
    `font-weight="600" fill="rgba(255,255,255,0.92)" text-anchor="middle" dominant-baseline="middle">${label}</text>` +
    `</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const avatar = (seed: string, initials: string) => art(seed, 160, 160, initials)
const banner = (seed: string, label: string) => art(seed, 1200, 500, label)
const thumb = (seed: string, label: string) => art(seed, 240, 240, label)

/* ------------------------------------------------------------------ *
 * Vocabulary
 * ------------------------------------------------------------------ */

const FIRST = ["Ayesha", "Rahim", "Nusrat", "Tanvir", "Mehedi", "Farhana", "Sakib", "Tahmina", "Rifat", "Zarin", "Imran", "Sabrina", "Arif", "Nabila", "Hasan", "Rumana"]
const LAST = ["Hossain", "Rahman", "Islam", "Ahmed", "Chowdhury", "Karim", "Akter", "Uddin", "Haque", "Sultana", "Miah", "Begum", "Das", "Roy", "Sarker", "Huq"]
const PRODUCT_WORDS = ["Wireless", "Organic", "Premium", "Vintage", "Compact", "Ultra", "Classic", "Modern", "Portable", "Deluxe", "Eco", "Smart"]
const PRODUCT_NOUNS = ["Headphones", "Cotton Tote", "Ceramic Mug", "Desk Lamp", "Running Shoes", "Yoga Mat", "Leather Wallet", "Water Bottle", "Backpack", "Notebook", "Phone Stand", "Throw Blanket"]
const BRANDS = ["Nestmart", "Aurora", "Nimbus", "Vertex", "Lumen", "Kestrel", "Basalt", "Halcyon"]
const CITIES = ["Dhaka", "Chattogram", "Sylhet", "Khulna", "Rajshahi", "Mymensingh", "Cumilla", "Narayanganj"]
const COURIERS = ["Pathao", "Steadfast", "RedX", "eCourier"]
const PRODUCTS = PRODUCT_WORDS.flatMap((w) => PRODUCT_NOUNS.map((n) => `${w} ${n}`))
const COUPON_WORDS = ["WELCOME10", "SAVE20", "FREESHIP", "SUMMER25", "VIP30", "FLASH15", "BULK40", "NEWYEAR50"]

const name = (i: number) => `${FIRST[i % FIRST.length]} ${LAST[(i * 7 + 3) % LAST.length]}`
const initials = (i: number) => `${FIRST[i % FIRST.length][0]}${LAST[(i * 7 + 3) % LAST.length][0]}`
const money2 = (i: number) => (5 + ((i * 37) % 890)).toFixed(2)

/* ------------------------------------------------------------------ *
 * Resource generators
 *
 * Each returns a factory so ids are stable per index, letting detail
 * routes resolve the same object the list returned.
 * ------------------------------------------------------------------ */

const COUNT = 40

const category = (i: number) => ({
  id: uuid(`cat-${i}`),
  name: `${PRODUCT_NOUNS[i % PRODUCT_NOUNS.length]} ${["Essentials", "Pro", "Lite", "Max", "Plus"][i % 5]}`,
  slug: `category-${i}`,
  description: `A curated ${PRODUCT_NOUNS[i % PRODUCT_NOUNS.length].toLowerCase()} range for everyday use.`,
  parent: null as string | null,
  image: thumb(`cat-img-${i}`, PRODUCT_NOUNS[i % PRODUCT_NOUNS.length].slice(0, 3)),
  is_active: i % 7 !== 0,
  sort_order: i,
  created_at: daysAgo(400 - i),
  updated_at: daysAgo(30 - (i % 30)),
})

const product = (i: number) => ({
  ...category(i),
  id: uuid(`prod-${i}`),
  name: `${BRANDS[i % BRANDS.length]} ${PRODUCTS[i % PRODUCTS.length]}`,
  slug: `product-${i}`,
  category: uuid(`cat-${i % 12}`),
  base_price: money2(i),
  status: (["active", "active", "active", "draft", "inactive", "archived"] as const)[i % 6],
  product_type: (["physical", "physical", "digital", "bundle", "subscription"] as const)[i % 5],
  requires_shipping: i % 5 !== 2,
  is_downloadable: i % 5 === 2,
  is_recurring: i % 5 === 4,
  is_featured: i % 7 === 0,
  created_by: null,
})

const variant = (i: number) => ({
  id: uuid(`var-${i}`),
  product: uuid(`prod-${i}`),
  sku: `SKU-${1000 + i}`,
  name: `${["S", "M", "L", "XL"][i % 4]} / ${["Black", "Sand", "Olive", "Navy"][i % 4]}`,
  price: money2(i + 3),
  cost_price: (Number(money2(i + 3)) * 0.6).toFixed(2),
  stock_quantity: int(rng(`stock-${i}`), 0, 240),
  status: (i % 9 === 0 ? "inactive" : "active") as "active" | "inactive",
  image: thumb(`var-img-${i}`, "V"),
  options: [
    { attribute: uuid("attr-size"), attribute_name: "Size", value: `v-${i % 4}`, value_name: ["S", "M", "L", "XL"][i % 4] },
    { attribute: uuid("attr-color"), attribute_name: "Colour", value: `c-${i % 4}`, value_name: ["Black", "Sand", "Olive", "Navy"][i % 4] },
  ],
  created_at: daysAgo(300 - i),
  updated_at: daysAgo(20 - (i % 20)),
})

const customerBrief = (i: number) => ({
  id: uuid(`user-${i}`),
  email: `${FIRST[i % FIRST.length].toLowerCase()}.${LAST[(i * 7 + 3) % LAST.length].toLowerCase()}${i}@example.com`,
  first_name: FIRST[i % FIRST.length],
  last_name: LAST[(i * 7 + 3) % LAST.length],
})

const adminUser = (i: number) => ({
  ...customerBrief(i),
  role: (i % 6 === 0 ? "admin" : i % 3 === 0 ? "staff" : "customer") as "admin" | "staff" | "customer",
  phone: `+8801${int(rng(`ph-${i}`), 300000000, 999999999)}`,
  profile_picture: avatar(`av-${i}`, initials(i)),
  is_active: i % 8 !== 0,
  is_email_verified: i % 5 !== 0,
  is_superuser: i === 0,
  permissions: i % 6 === 0 ? ["*"] : ["products.view", "orders.view", "inventory.view"],
})

const orderItem = (i: number, oi: number) => ({
  id: uuid(`oi-${i}-${oi}`),
  product: uuid(`prod-${(i + oi) % COUNT}`),
  variant: uuid(`var-${(i + oi) % COUNT}`),
  product_name: `${BRANDS[(i + oi) % BRANDS.length]} ${PRODUCTS[(i + oi) % PRODUCTS.length]}`,
  variant_name: `${["S", "M", "L", "XL"][(i + oi) % 4]} / ${["Black", "Sand", "Olive", "Navy"][(i + oi) % 4]}`,
  sku: `SKU-${1000 + ((i + oi) % COUNT)}`,
  quantity: int(rng(`qty-${i}-${oi}`), 1, 4),
  unit_price: money2((i + oi) % COUNT),
  line_total: money2((i + oi) % COUNT),
  created_at: daysAgo(60 - i),
})

const order = (i: number) => {
  const r = rng(`order-${i}`)
  const itemCount = int(r, 1, 4)
  const items = Array.from({ length: itemCount }, (_, oi) => orderItem(i, oi))
  const subtotal = items.reduce((s, it) => s + Number(it.line_total) * it.quantity, 0)
  const shipping = Number((subtotal * 0.05).toFixed(2))
  const tax = Number((subtotal * 0.1).toFixed(2))
  const total = Number((subtotal + shipping + tax).toFixed(2))
  const status = (["placed", "processing", "shipped", "delivered", "delivered", "cancelled", "pending_payment"] as const)[i % 7]

  return {
    id: uuid(`order-${i}`),
    order_number: `NM-${10000 + i}`,
    customer: customerBrief(i),
    status,
    payment_status: (["paid", "paid", "paid", "pending", "failed", "refunded", "partially_refunded"] as const)[i % 7],
    payment_method: (i % 4 === 0 ? "cash_on_delivery" : "stripe") as "stripe" | "cash_on_delivery",
    cod_status: (i % 4 === 0 ? "pending_collection" : "not_applicable") as "not_applicable" | "pending_collection",
    subtotal: subtotal.toFixed(2),
    total_amount: total.toFixed(2),
    discount_amount: "0.00",
    shipping_cost: shipping.toFixed(2),
    tax_amount: tax.toFixed(2),
    cod_collected_amount: i % 4 === 0 ? total.toFixed(2) : "0.00",
    cod_collected_at: i % 4 === 0 ? daysAgo(10 - i) : null,
    customer_notes: i % 3 === 0 ? "Please call before delivery." : "",
    admin_notes: "",
    cancellation_reason: status === "cancelled" ? "Customer changed their mind" : "",
    cancelled_at: status === "cancelled" ? daysAgo(5) : null,
    cancelled_by: null,
    placed_at: daysAgo(60 - i),
    paid_at: status === "pending_payment" ? null : daysAgo(59 - i),
    shipped_at: ["shipped", "delivered"].includes(status) ? daysAgo(55 - i) : null,
    delivered_at: status === "delivered" ? daysAgo(50 - i) : null,
    created_at: daysAgo(60 - i),
    updated_at: daysAgo(58 - i),
    items,
    status_history: [
      { id: uuid(`osh-${i}-0`), from_status: "", to_status: "placed", changed_by: null, created_at: daysAgo(60 - i) },
      ...(status !== "placed" && status !== "pending_payment"
        ? [{ id: uuid(`osh-${i}-1`), from_status: "placed", to_status: status, changed_by: uuid("user-0"), created_at: daysAgo(58 - i) }]
        : []),
    ],
  }
}

const payment = (i: number) => ({
  id: uuid(`pay-${i}`),
  order: { id: uuid(`order-${i}`), order_number: `NM-${10000 + i}` },
  provider: (i % 4 === 0 ? "cash_on_delivery" : "stripe") as "stripe" | "cash_on_delivery",
  provider_payment_intent_id: i % 4 === 0 ? null : `pi_${uuid(`pi-${i}`).replace(/-/g, "").slice(0, 18)}`,
  amount: order(i).total_amount,
  currency: "BDT",
  status: (["succeeded", "succeeded", "succeeded", "pending", "failed", "cancelled"] as const)[i % 6],
  failure_reason: i % 6 === 4 ? "Card declined by issuer" : "",
  created_at: daysAgo(60 - i),
  processed_at: i % 6 === 3 ? null : daysAgo(59 - i),
})

const returnRequest = (i: number) => ({
  id: uuid(`ret-${i}`),
  return_number: `RET-${2000 + i}`,
  order: uuid(`order-${i}`),
  customer: uuid(`user-${i}`),
  status: (["pending_review", "approved", "rejected", "awaiting_return", "in_transit", "received", "processed", "refunded"] as const)[i % 8],
  reason: (["damaged", "wrong_item", "missing_item", "defective", "other"] as const)[i % 5],
  resolution: i % 3 === 0 ? null : ("refund" as "refund" | "replacement" | "store_credit"),
  comments: "Item arrived in poor condition.",
  admin_notes: "",
  rejection_reason: i % 8 === 2 ? "Outside the return window" : "",
  refund_amount: i % 3 === 0 ? null : money2(i + 11),
  items: [{ order_item: uuid(`oi-${i}-0`), quantity: 1, reason: "damaged" as const, condition_notes: "Box crushed" }],
  images: [thumb(`ret-img-${i}`, "R")],
  status_history: [{ from_status: "", to_status: "pending_review", reason: "Customer requested", created_at: daysAgo(20 - i) }],
  created_at: daysAgo(20 - i),
  updated_at: daysAgo(18 - i),
})

const coupon = (i: number) => ({
  id: uuid(`cpn-${i}`),
  code: `${COUPON_WORDS[i % COUPON_WORDS.length]}${i}`,
  description: `Promotional code ${COUPON_WORDS[i % COUPON_WORDS.length]}`,
  discount_type: (i % 3 === 0 ? "fixed_amount" : "percentage") as "percentage" | "fixed_amount",
  discount_value: i % 3 === 0 ? "150.00" : String(10 + (i % 4) * 5),
  min_order_value: String(500 + (i % 5) * 250),
  max_discount_amount: i % 3 === 0 ? null : "500.00",
  max_usage_count: i % 4 === 0 ? null : 100 + i,
  usage_count: int(rng(`cpn-use-${i}`), 0, 80),
  per_customer_limit: i % 2 === 0 ? 1 : 3,
  valid_from: daysAgo(30 - i),
  valid_until: daysAhead(60 - (i % 60)),
  is_active: i % 6 !== 0,
  created_at: daysAgo(45 - i),
  updated_at: daysAgo(10 - (i % 10)),
})

const campaign = (i: number) => ({
  id: uuid(`cmp-${i}`),
  name: `${["Monsoon", "Eid", "Year End", "Spring", "Flash", "Members"][i % 6]} ${["Sale", "Fest", "Drop", "Event"][i % 4]}`,
  slug: `campaign-${i}`,
  campaign_type: (["mega", "landing", "seasonal"] as const)[i % 3],
  status: (["active", "scheduled", "draft", "ended"] as const)[i % 4],
  starts_at: daysAgo(10 - (i % 20)),
  ends_at: daysAhead(20 + (i % 40)),
  hero_title: `Up to ${40 + (i % 5) * 10}% off`,
  banner_image: banner(`cmp-img-${i}`, `${40 + (i % 5) * 10}%`),
  metadata: {},
  created_at: daysAgo(25 - i),
  updated_at: daysAgo(5 - (i % 5)),
  deleted_at: null,
})

const flashSale = (i: number) => ({
  id: uuid(`fs-${i}`),
  name: `Flash ${["Drop", "Hour", "Weekend"][i % 3]} ${i + 1}`,
  starts_at: daysAgo(i % 4),
  ends_at: daysAhead(1 + (i % 5)),
  is_active: i % 3 !== 0,
  campaign: i % 2 === 0 ? uuid(`cmp-${i}`) : null,
  created_at: daysAgo(12 - i),
  updated_at: daysAgo(1),
})

const flashSaleItem = (i: number) => ({
  id: uuid(`fsi-${i}`),
  flash_sale: uuid(`fs-${i}`),
  variant: uuid(`var-${i}`),
  sale_price: (Number(money2(i)) * 0.7).toFixed(2),
  stock_limit: 50 + i,
  sold_quantity: int(rng(`fsi-sold-${i}`), 0, 50),
  created_at: daysAgo(8 - i),
  updated_at: daysAgo(1),
})

const groupBuy = (i: number) => ({
  id: uuid(`gb-${i}`),
  name: `${PRODUCTS[i % PRODUCTS.length]} Group Buy`,
  product: uuid(`prod-${i}`),
  target_quantity: 20 + (i % 5) * 10,
  current_quantity: int(rng(`gb-cur-${i}`), 0, 60),
  group_price: (Number(money2(i)) * 0.8).toFixed(2),
  starts_at: daysAgo(6 - i),
  ends_at: daysAhead(14 + (i % 14)),
  status: (["active", "draft", "completed", "failed"] as const)[i % 4],
  created_at: daysAgo(15 - i),
  updated_at: daysAgo(2),
})

const review = (i: number) => {
  const r = rng(`rev-${i}`)
  return {
    id: uuid(`rev-${i}`),
    product: uuid(`prod-${i}`),
    customer: uuid(`user-${i}`),
    order_item: uuid(`oi-${i}-0`),
    rating: int(r, 1, 5),
    title: pick(["Great quality", "Exactly as described", "Would buy again", "Not as expected", "Fast delivery"], r),
    content: "Packaging was sturdy and the item arrived two days early. Quality feels durable for the price.",
    status: (["pending", "approved", "approved", "rejected"] as const)[i % 4],
    images: i % 3 === 0 ? [{ image: thumb(`rev-img-${i}`, "R") }] : [],
    created_at: daysAgo(14 - i),
  }
}

const automation = (i: number) => ({
  id: uuid(`auto-${i}`),
  event_type: (["abandoned_cart", "back_in_stock", "price_drop"] as const)[i % 3],
  payload: { channel: "email", template: `tpl-${i % 4}` },
  scheduled_at: daysAhead(1 + (i % 7)),
  sent_at: i % 3 === 0 ? daysAgo(1) : null,
  cancelled_at: null,
  customer: uuid(`user-${i}`),
  product: i % 2 === 0 ? uuid(`prod-${i}`) : null,
  variant: i % 2 === 0 ? uuid(`var-${i}`) : null,
  created_at: daysAgo(9 - i),
  updated_at: daysAgo(1),
})

const bundleItem = (i: number) => ({
  id: uuid(`bi-${i}`),
  bundle: uuid(`prod-${i}`),
  variant: uuid(`var-${(i + 1) % COUNT}`),
  variant_sku: `SKU-${1001 + ((i + 1) % COUNT)}`,
  variant_name: "M / Black",
  quantity: 1 + (i % 3),
  created_at: daysAgo(30 - i),
  updated_at: daysAgo(5),
})

const productImage = (i: number) => ({
  id: uuid(`pi-${i}`),
  product: uuid(`prod-${i}`),
  image: thumb(`pimg-${i}`, "IMG"),
  alt_text: `${PRODUCTS[i % PRODUCTS.length]} product photo`,
  sort_order: i % 4,
  is_primary: i % 4 === 0,
})

const attribute = (i: number) => ({ id: uuid(`attr-${i}`), name: ["Size", "Colour", "Material", "Weight", "Fit"][i % 5], slug: ["size", "colour", "material", "weight", "fit"][i % 5] })
const attributeValue = (i: number) => ({ id: uuid(`av-${i}`), attribute: uuid(`attr-${i % 5}`), value: ["S", "M", "L", "Black", "Cotton", "Light"][i % 6], slug: `v-${i}` })

const warehouse = (i: number) => ({
  id: uuid(`wh-${i}`),
  name: `${CITIES[i % CITIES.length]} ${["Warehouse", "Hub", "Depot"][i % 3]}`,
  code: `WH-${100 + i}`,
  address: `House ${10 + i}, Road ${i + 2}, ${CITIES[i % CITIES.length]}`,
  city: CITIES[i % CITIES.length],
  is_branch: i % 3 === 0,
  is_active: i % 8 !== 0,
  created_at: daysAgo(200 - i),
})

const reservation = (i: number) => ({
  id: uuid(`res-${i}`),
  variant: uuid(`var-${i}`),
  user: uuid(`user-${i}`),
  order: i % 2 === 0 ? uuid(`order-${i}`) : null,
  quantity: 1 + (i % 3),
  status: (["active", "consumed", "released", "expired"] as const)[i % 4],
  expires_at: daysAhead(1 + (i % 5)),
  created_at: daysAgo(3 - (i % 3)),
  updated_at: daysAgo(1),
})

const courier = (i: number) => ({
  id: uuid(`cri-${i}`),
  provider: (["pathao", "steadfast", "redx", "ecourier"] as const)[i % 4],
  display_name: COURIERS[i % 4],
  is_active: i % 5 !== 0,
  base_url: `https://api.${["pathao", "steadfast", "redx", "ecourier"][i % 4]}.com`,
  created_at: daysAgo(150 - i),
  updated_at: daysAgo(20 - i),
})

const shipment = (i: number) => ({
  id: uuid(`shp-${i}`),
  order: uuid(`order-${i}`),
  order_number: `NM-${10000 + i}`,
  integration: uuid(`cri-${i % 4}`),
  provider: COURIERS[i % 4],
  provider_order_id: `PO${uuid(`po-${i}`).replace(/-/g, "").slice(0, 12).toUpperCase()}`,
  tracking_number: `TRK${1000000 + i * 7}`,
  status: (["booked", "booked", "draft", "failed"] as const)[i % 4],
})

const bannerItem = (i: number) => ({
  id: uuid(`bnr-${i}`),
  title: `${["Welcome", "Members Only", "New Season", "Clearance"][i % 4]} ${["Sale", "Offer", "Event"][i % 3]}`,
  image: banner(`bnr-img-${i}`, "BANNER"),
  target_url: `https://example.com/landing-${i}`,
  starts_at: daysAgo(5 - i),
  ends_at: daysAhead(25 + i),
  sort_order: i,
  is_active: i % 5 !== 0,
  created_at: daysAgo(40 - i),
  updated_at: daysAgo(3),
})

const blogPost = (i: number) => ({
  id: uuid(`blog-${i}`),
  title: `How to choose the right ${PRODUCT_NOUNS[i % PRODUCT_NOUNS.length].toLowerCase()}`,
  slug: `post-${i}`,
  excerpt: "A short practical guide covering materials, sizing and care.",
  body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  cover_image: banner(`blog-img-${i}`, "BLOG"),
  is_published: i % 4 !== 0,
  published_at: i % 4 === 0 ? null : daysAgo(12 - i),
  author: name(i),
  created_at: daysAgo(30 - i),
  updated_at: daysAgo(6 - (i % 6)),
  deleted_at: null,
})

const contentPage = (i: number) => ({
  id: uuid(`page-${i}`),
  title: ["About Us", "Privacy Policy", "Return Policy", "Careers", "Contact"][i % 5],
  slug: ["about", "privacy", "returns", "careers", "contact"][i % 5],
  page_type: (["static", "landing", "brand"] as const)[i % 3],
  body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  hero_image: banner(`page-img-${i}`, "PAGE"),
  is_published: i % 5 !== 0,
  published_at: daysAgo(20 - i),
  metadata: {},
  created_at: daysAgo(60 - i),
  updated_at: daysAgo(10 - (i % 10)),
  deleted_at: null,
})

const notification = (i: number) => ({
  id: uuid(`ntf-${i}`),
  user: uuid(`user-${i}`),
  user_email: customerBrief(i).email,
  channel: (["email", "sms", "in_app"] as const)[i % 3],
  notification_type: ["order_placed", "order_shipped", "password_reset", "promo"][i % 4],
  subject: `Your order NM-${10000 + i} is ${["confirmed", "on the way", "delivered"][i % 3]}`,
  body: "Thanks for shopping with Nestmart. You can track your order from your account.",
  status: (["sent", "sent", "pending", "failed"] as const)[i % 4],
  sent_at: i % 4 === 2 ? null : daysAgo(1 - (i % 5)),
  created_at: daysAgo(2 - (i % 5)),
})

const notificationPref = (i: number) => ({
  id: uuid(`npref-${i}`),
  user: uuid(`user-${i}`),
  user_email: customerBrief(i).email,
  order_updates_email: true,
  order_updates_sms: i % 2 === 0,
  promotions_email: i % 3 !== 0,
  promotions_sms: false,
  created_at: daysAgo(90),
  updated_at: daysAgo(20),
})

const auditLog = (i: number) => ({
  id: uuid(`aud-${i}`),
  actor: uuid(`user-${i % 5}`),
  actor_email: customerBrief(i % 5).email,
  action: ["create", "update", "delete", "login"][i % 4],
  target_type: ["Product", "Order", "Category", "User"][i % 4],
  target_id: uuid(`prod-${i}`),
  changes: { field: "name", from: "Old value", to: "New value" },
  metadata: {},
  ip_address: `103.${int(rng(`ip-${i}`), 0, 255)}.${int(rng(`ip2-${i}`), 0, 255)}.${int(rng(`ip3-${i}`), 1, 254)}`,
  user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  created_at: daysAgo(1 - (i % 10)),
})

// Expenses are seed-only (expenseSlice passes no `endpoint`, so it never hits the
// network), so there is deliberately no mock generator for them here.

const variantStock = (i: number) => ({
  variant_id: uuid(`var-${i}`),
  sku: `SKU-${1000 + i}`,
  physical_stock: int(rng(`vs-${i}`), 0, 200),
  active_reservations: int(rng(`vr-${i}`), 0, 12),
  net_available: int(rng(`vn-${i}`), 0, 190),
})

const warehouseStock = (i: number) => ({
  id: uuid(`wst-${i}`),
  warehouse: uuid(`wh-${i % 8}`),
  variant: uuid(`var-${i}`),
  quantity: int(rng(`wq-${i}`), 0, 300),
  safety_stock: 10 + (i % 20),
  available_quantity: int(rng(`wa-${i}`), 0, 280),
  created_at: daysAgo(100),
})

const inventoryTxn = (i: number) => ({
  id: uuid(`txn-${i}`),
  variant: uuid(`var-${i}`),
  transaction_type: (["order_placed", "cancellation", "return_received", "refund", "manual_adjustment", "correction"] as const)[i % 6],
  quantity_changed: int(rng(`tc-${i}`), -12, 24),
  stock_before: int(rng(`tb-${i}`), 20, 200),
  stock_after: int(rng(`ta-${i}`), 20, 220),
  reference_type: "order",
})

/* ------------------------------------------------------------------ *
 * Analytics aggregates
 * ------------------------------------------------------------------ */

function salesSeries() {
  return Array.from({ length: 12 }, (_, i) => {
    const r = rng(`sales-${i}`)
    return { period: daysAgo((11 - i) * 30).slice(0, 7), order_count: int(r, 40, 260), revenue: Number((int(r, 200_000, 900_000)).toFixed(2)) }
  })
}

const analyticsSummary = () => {
  const total = salesSeries().reduce((s, p) => s + p.order_count, 0)
  const revenue = salesSeries().reduce((s, p) => s + p.revenue, 0)
  return {
    total_orders: total,
    total_revenue: revenue.toFixed(2),
    average_order_value: (revenue / total).toFixed(2),
    return_rate: "3.4",
  }
}

/* ------------------------------------------------------------------ *
 * Routing
 * ------------------------------------------------------------------ */

type Factory = (i: number) => unknown

/**
 * Analytics aggregates. These are single payloads under `data`, never lists, so they're
 * matched by exact path ahead of the list-factory table below — registering them there
 * would wrap the envelope a second time as `{count, results: [{data: ...}]}` and break
 * `unwrapEnvelope`.
 */
const ANALYTICS: Record<string, () => unknown> = {
  "/admin/analytics/summary/": () => ({ data: analyticsSummary() }),
  "/admin/analytics/sales/": () => ({ data: salesSeries() }),
  "/admin/analytics/returns/": () => ({
    data: { total_orders: 1240, total_returns: 42, return_rate: "3.4" },
  }),
  "/admin/analytics/products/top/": () => ({
    data: Array.from({ length: 8 }, (_, i) => ({
      product__id: uuid(`prod-${i}`),
      product__name: `${BRANDS[i % BRANDS.length]} ${PRODUCTS[i % PRODUCTS.length]}`,
      total_quantity: 400 - i * 37,
      total_revenue: 900_000 - i * 80_000,
    })),
  }),
}

/** Endpoint path fragment -> generator. Order matters: first match wins. */
const ROUTES: Array<[string, Factory]> = [
  ["/admin/catalog/products/", product],
  ["/admin/catalog/categories/", category],
  ["/admin/catalog/variants/", variant],
  ["/admin/catalog/product-images/", productImage],
  ["/admin/catalog/attribute-values/", attributeValue],
  ["/admin/catalog/attributes/", attribute],
  ["/admin/catalog/bundle-items/", bundleItem],

  ["/admin/inventory/warehouses/stock/", warehouseStock],
  ["/admin/inventory/warehouses/", warehouse],
  ["/admin/inventory/reservations/", reservation],
  ["/admin/inventory/adjustments/", inventoryTxn],
  ["/admin/orders/", order],
  ["/admin/payments/", payment],
  ["/admin/returns/", returnRequest],
  ["/admin/reviews/", review],
  ["/admin/coupons/", coupon],

  ["/admin/users/", adminUser],
  ["/admin/staff/", adminUser],

  ["/admin/shipping/couriers/shipments/", shipment],
  ["/admin/shipping/couriers/", courier],

  ["/admin/marketing/flash-sale-items/", flashSaleItem],
  ["/admin/marketing/flash-sales/", flashSale],
  ["/admin/marketing/group-buys/", groupBuy],
  ["/admin/marketing/campaigns/", campaign],
  ["/admin/marketing/automations/", automation],

  ["/admin/cms/banners/", bannerItem],
  ["/admin/cms/blog-posts/", blogPost],
  ["/admin/cms/pages/", contentPage],

  ["/admin/notifications/preferences/", notificationPref],
  ["/admin/notifications/", notification],
  ["/admin/audit/logs/", auditLog],
]

/**
 * Endpoints consumed by hand-rolled slices that call `unwrapEnvelope` rather than
 * `unwrapList`. Those slices get the whole collection under `data` and have no
 * pagination, so they must NOT receive the DRF `{count, results}` shape.
 */
const ENVELOPED = [
  "/admin/inventory/adjustments/",
  "/admin/inventory/reservations/",
  "/admin/inventory/warehouses/stock/",
  "/admin/inventory/warehouses/",
  "/admin/coupons/",
  "/admin/reviews/",
  "/admin/notifications/preferences/",
  "/admin/notifications/",
  "/admin/payments/",
  "/admin/returns/",
  "/admin/shipping/couriers/shipments/",
  "/admin/shipping/couriers/",
  "/admin/users/",
  "/admin/staff/",
]

/** Per-variant inventory sub-resources, keyed off the variant id in the path. */
const VARIANT_SUB_RESOURCES = /^\/admin\/inventory\/variants\/([^/]+)\/(stock|transactions|warehouse-stock)\/$/

/** Detail lookups: endpoint prefix -> id-to-index resolver. */
const DETAIL_ROUTES: Array<[string, (id: string) => number]> = [
  ["/admin/catalog/products/", (id) => detailIndex(product, id)],
  ["/admin/catalog/categories/", (id) => detailIndex(category, id)],
  ["/admin/catalog/variants/", (id) => detailIndex(variant, id)],
  ["/admin/catalog/attributes/", (id) => detailIndex(attribute, id)],
  ["/admin/catalog/attribute-values/", (id) => detailIndex(attributeValue, id)],
  ["/admin/orders/", (id) => detailIndex(order, id)],
  ["/admin/payments/", (id) => detailIndex(payment, id)],
  ["/admin/returns/", (id) => detailIndex(returnRequest, id)],
  ["/admin/reviews/", (id) => detailIndex(review, id)],
  ["/admin/users/", (id) => detailIndex(adminUser, id)],
  ["/admin/staff/", (id) => detailIndex(adminUser, id)],
  ["/admin/coupons/", (id) => detailIndex(coupon, id)],
  ["/admin/marketing/campaigns/", (id) => detailIndex(campaign, id)],
  ["/admin/marketing/flash-sales/", (id) => detailIndex(flashSale, id)],
  ["/admin/marketing/group-buys/", (id) => detailIndex(groupBuy, id)],
  ["/admin/marketing/automations/", (id) => detailIndex(automation, id)],
  ["/admin/cms/pages/", (id) => detailIndex(contentPage, id)],
  ["/admin/inventory/warehouses/", (id) => detailIndex(warehouse, id)],
  ["/admin/inventory/reservations/", (id) => detailIndex(reservation, id)],
  ["/admin/notifications/", (id) => detailIndex(notification, id)],
  ["/admin/audit/logs/", (id) => detailIndex(auditLog, id)],
]

/** Reverse an entity's uuid back to its generating index. */
function detailIndex(factory: Factory, id: string): number {
  for (let i = 0; i < COUNT; i++) {
    const row = factory(i) as { id?: string }
    if (row.id === id) return i
  }
  return 0
}

/* ------------------------------------------------------------------ *
 * Adapter
 * ------------------------------------------------------------------ */

function parseParams(config: InternalAxiosRequestConfig): URLSearchParams {
  const raw = config.params
  if (!raw) return new URLSearchParams()
  if (typeof raw === "string") return new URLSearchParams(raw)
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (v !== undefined && v !== null) sp.set(k, String(v))
  }
  return sp
}

/* ------------------------------------------------------------------ *
 * Session overlay
 *
 * Generated rows are derived from their index, so a write would otherwise be forgotten on
 * the next read and a form would appear to save nothing. Mutations are therefore recorded
 * in memory and replayed on top of the generated data, which keeps create/edit/delete
 * behaving like a real backend for the lifetime of the dev session.
 * ------------------------------------------------------------------ */

type Row = Record<string, unknown>

/** Patches applied to a generated row, keyed by `${collection}${id}`. */
const overlay = new Map<string, Row>()
/** Ids deleted this session, keyed the same way. */
const removed = new Set<string>()
/** Rows created this session, since they have no generator index. */
const createdRows: Array<{ collection: string; row: Row }> = []

const rowKey = (collection: string, id: string) => `${collection}${id}`

/** Status changes implied by action endpoints whose response body carries no fields. */
const ACTION_PATCH: Record<string, Row> = {
  approve: { status: "approved" },
  reject: { status: "rejected" },
  cancel: { status: "cancelled" },
  process: { status: "processed" },
  refund: { status: "refunded" },
  "mark-received": { status: "received" },
  activate: { is_active: true },
  deactivate: { is_active: false },
  "soft-delete": { is_deleted: true, is_active: false },
}

function applyOverlay(collection: string, row: Row): Row | null {
  const id = String(row.id)
  if (removed.has(rowKey(collection, id))) return null
  const patch = overlay.get(rowKey(collection, id))
  return patch ? { ...row, ...patch } : row
}

/** Generated rows for a collection with this session's writes replayed on top. */
function collectionRows(collection: string, factory: Factory): Row[] {
  const rows: Row[] = []
  for (let i = 0; i < COUNT; i++) {
    const row = applyOverlay(collection, factory(i) as Row)
    if (row) rows.push(row)
  }
  for (const created of createdRows) {
    if (created.collection === collection) rows.push(created.row)
  }
  return rows
}

/**
 * Splits a mutation path into the collection it addresses, the record id, and any trailing
 * action segment — e.g. `/admin/reviews/abc/approve/` -> collection `/admin/reviews/`,
 * id `abc`, action `approve`. An empty id means the path addresses the collection itself.
 */
function resolveTarget(path: string): { collection: string; id: string; action: string } | null {
  const trimmed = path.endsWith("/") ? path.slice(0, -1) : path
  let best: { collection: string; rest: string } | null = null

  for (const [collection] of ROUTES) {
    if (`${trimmed}/` === collection) return { collection, id: "", action: "" }
    if (!trimmed.startsWith(collection) || trimmed.length <= collection.length) continue
    const rest = trimmed.slice(collection.length)
    if (!best || collection.length > best.collection.length) best = { collection, rest }
  }

  if (!best) return null
  const segments = best.rest.split("/")
  return { collection: best.collection, id: segments[0], action: segments.slice(1).join("/") }
}

function parsePayload(payload: unknown): Row {
  if (typeof payload === "string") {
    try {
      const parsed = JSON.parse(payload)
      return parsed && typeof parsed === "object" ? (parsed as Row) : {}
    } catch {
      return {}
    }
  }
  return payload && typeof payload === "object" ? (payload as Row) : {}
}

function recordMutation(collection: string, id: string, action: string, payload: Row): Row {
  const existing = overlay.get(rowKey(collection, id)) ?? {}
  const patch = { ...(ACTION_PATCH[action] ?? {}), ...payload }
  overlay.set(rowKey(collection, id), { ...existing, ...patch })
  return patch
}

function listResponse(url: string, items: unknown[], params: URLSearchParams, total: number) {
  const base = url.split("?")[0]

  if (ENVELOPED.some((prefix) => base.startsWith(prefix))) {
    return { data: items, message: "OK" }
  }

  const page = Math.max(1, Number(params.get("page") ?? 1))
  const pageSize = Math.max(1, Number(params.get("page_size") ?? params.get("pageSize") ?? 20))
  const start = (page - 1) * pageSize
  const slice = items.slice(start, start + pageSize)
  const mk = (p: number) => `${base}?page=${p}&page_size=${pageSize}`

  return {
    count: total,
    next: start + pageSize < total ? mk(page + 1) : null,
    previous: page > 1 ? mk(page - 1) : null,
    results: slice,
  }
}

function detailResponse(base: string) {
  // Only treat `base` as a detail request when EXACTLY ONE extra path segment follows the
  // collection prefix. Nested sub-resources such as /admin/notifications/preferences/ or
  // /admin/inventory/warehouses/stock/ also start with a detail prefix, and must fall
  // through to the list router instead of resolving to a single object.
  //
  // Collection prefixes end with "/", and callers request details as `.../{id}/` (also
  // trailing-slashed, matching the backend), so strip that final slash first — otherwise
  // the id segment would still contain a "/" and look like a nested sub-resource.
  const path = base.endsWith("/") ? base.slice(0, -1) : base
  let prefix = ""

  for (const candidate of DETAIL_ROUTES.map(([p]) => p)) {
    if (!path.startsWith(candidate) || path.length <= candidate.length) continue
    const id = path.slice(candidate.length)
    if (!id || id.includes("/")) continue
    // Longest prefix wins so e.g. /attribute-values/ beats a shorter sibling.
    if (candidate.length > prefix.length) prefix = candidate
  }

  if (!prefix) return null

  // Longest-prefix-wins across BOTH routers. A collection can own a sub-resource that also
  // looks like a detail (e.g. /admin/notifications/{id} vs /admin/notifications/preferences/).
  // If a list route matches more specifically, it isn't a detail — hand it to the list router.
  for (const [candidate] of ROUTES) {
    const normalized = candidate.endsWith("/") ? candidate.slice(0, -1) : candidate
    if (path.startsWith(normalized) && normalized.length > prefix.length) return null
  }

  const factory = ROUTES.find(([p]) => p === prefix)?.[1]
  if (!factory) return null
  const id = path.slice(prefix.length)
  const row = collectionRows(prefix, factory).find((candidate) => candidate.id === id)
  if (!row) return null
  return { data: row, message: "OK" }
}

/** Resolve a request into a mock body, or null to fall through to a 404. */
function resolveBody(method: string, url: string, params: URLSearchParams, payload: unknown): unknown {
  const base = url.split("?")[0]

  if (base.startsWith("/customer/auth/")) {
    const me = adminUser(0)
    if (base.includes("login")) {
      return { data: { access: `mock.${uuid("access")}`, refresh: `mock.${uuid("refresh")}`, user: me }, message: "OK" }
    }
    if (base.includes("me")) return { data: me, message: "OK" }
    if (base.includes("refresh")) return { data: { access: `mock.${uuid("access2")}` }, message: "OK" }
    return { data: {}, message: "OK" }
  }

  // Per-variant inventory sub-resources: /admin/inventory/variants/{variantId}/{stock,
  // transactions, warehouse-stock}/. Keyed off the variant id in the path so the figures
  // line up with the variant the user clicked into.
  const variantSubResource = base.match(VARIANT_SUB_RESOURCES)
  if (variantSubResource) {
    const [, variantId, resource] = variantSubResource
    const i = detailIndex(variant, variantId)
    if (resource === "stock") return { data: variantStock(i), message: "OK" }
    if (resource === "transactions") {
      return { data: Array.from({ length: 12 }, (_, k) => inventoryTxn(i * 12 + k)), message: "OK" }
    }
    return {
      data: Array.from({ length: 5 }, (_, k) => ({ ...warehouseStock(i * 5 + k), variant: variantId })),
      message: "OK",
    }
  }

  if (method === "GET") {
    const analytics = ANALYTICS[base]
    if (analytics) return analytics()

    const detail = detailResponse(base)
    if (detail) return detail

    for (const [prefix, factory] of ROUTES) {
      if (!base.startsWith(prefix)) continue
      const items = collectionRows(prefix, factory)
      return listResponse(url, items, params, items.length)
    }

    return null
  }

  // Mutations: record the change in the session overlay and echo back the stored row, so a
  // form's own edit survives the refetch that usually follows a save.
  if (["POST", "PUT", "PATCH"].includes(method)) {
    const body = parsePayload(payload)
    const target = resolveTarget(base)
    if (!target) return { data: { id: uuid(`new-${createdRows.length}`), ...body }, message: "OK" }

    if (!target.id) {
      const factory = ROUTES.find(([p]) => p === target.collection)?.[1]
      const index = COUNT + createdRows.length
      const template = factory ? (factory(index) as Row) : {}
      const row = { ...template, ...body, id: uuid(`new-${index}`) } as Row
      createdRows.push({ collection: target.collection, row })
      return { data: row, message: "OK" }
    }

    recordMutation(target.collection, target.id, target.action, body)
    const factory = ROUTES.find(([p]) => p === target.collection)?.[1]
    const stored = factory
      ? collectionRows(target.collection, factory).find((candidate) => candidate.id === target.id)
      : undefined
    return { data: stored ?? { id: target.id, ...body }, message: "OK" }
  }

  if (method === "DELETE") {
    const target = resolveTarget(base)
    if (target?.id) removed.add(rowKey(target.collection, target.id))
    return { data: null, message: "Deleted" }
  }

  return null
}

export const mockAdapter: AxiosAdapter = async (config) => {
  const method = (config.method ?? "get").toUpperCase()
  const rawUrl = config.url ?? ""
  const base = rawUrl.startsWith("http") ? new URL(rawUrl).pathname : rawUrl.split("?")[0]
  const params = parseParams(config)

  const body = resolveBody(method, base, params, config.data)

  if (body === null) {
    const notFound: AxiosResponse = {
      data: { detail: `No mock route for ${method} ${base}` },
      status: 404,
      statusText: "Not Found",
      headers: {},
      config,
    }
    return notFound
  }

  // Keep payload objects (form posts) intact; only JSON strings need parsing.
  if (config.data && typeof config.data === "string") {
    try {
      config.data = JSON.parse(config.data)
    } catch {
      /* leave as-is */
    }
  }

  // Small delay so loading/skeleton states are actually observable.
  await new Promise((r) => setTimeout(r, 120 + Math.random() * 180))

  const response: AxiosResponse = {
    data: body,
    status: 200,
    statusText: "OK",
    headers: {},
    config,
  }
  return response
}
