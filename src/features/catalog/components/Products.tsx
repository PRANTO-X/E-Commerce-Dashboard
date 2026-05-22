import React from "react"
import { ActionButton } from "@/components/common/ActionButton"
import { PlusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { TableActions } from "@/components/common/TableActions"
import FilterToolbar from "@/components/common/FilterToolBar"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import { categoryOptions } from "@/assets/Data"
import { PriceRangeFilter } from "./PriceRangeFilter"
import { DataTable } from "@/components/common/data-table"

const Products = () => {
  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Draft", value: "draft" },
    { label: "Inactive", value: "inactive" },
  ]
  const statusStyles = {
    active: "bg-green-500/10 text-green-400 border border-green-500/20",
    draft: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    archived: "bg-red-500/10 text-red-400 border border-red-500/20",
  } as const

  type ProductStatus = keyof typeof statusStyles

  interface ProductItem {
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
  }
  const columns: ColumnDef<ProductItem>[] = [
    {
      accessorKey: "id",
      header: "PRODUCT ID",
      cell: ({ row }) => (
        <span className="font-medium text-primary text-sm">
          {row.getValue("id")}
        </span>
      ),
    },
    // IMAGE
    {
      accessorKey: "image",
      header: "IMAGE",
      cell: ({ row }) => (
        <img
          src={row.getValue("image")}
          alt="product"
          className="h-10 w-10 rounded-md object-cover"
        />
      ),
    },

    // PRODUCT
    {
      accessorKey: "product",
      header: "PRODUCT",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">
          {row.getValue("product")}
        </span>
      ),
    },

    // SKU
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("sku")}
        </span>
      ),
    },

    // CATEGORY
    {
      accessorKey: "category",
      header: "CATEGORY",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("category")}
        </span>
      ),
    },

    // PRICE
    {
      accessorKey: "price",
      header: "PRICE",
      cell: ({ row }) => {
        const price = row.getValue("price") as number

        return (
          <span className="text-sm font-semibold text-foreground">
            ${price.toFixed(2)}
          </span>
        )
      },
    },

    // STATUS
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const status = row.getValue("status") as ProductStatus

        return (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}
          >
            {status}
          </span>
        )
      },
    },

    // RATING
    {
      accessorKey: "rating",
      header: "RATING",
      cell: ({ row }) => {
        const rating = row.getValue("rating") as number

        return (
          <span className="text-sm text-foreground">
            ⭐ {rating.toFixed(1)}
          </span>
        )
      },
    },

    // SALES
    {
      accessorKey: "sales",
      header: "SALES",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("sales")}
        </span>
      ),
    },

    // CREATED AT
    {
      accessorKey: "createdAt",
      header: "CREATED AT",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {row.getValue("createdAt")}
        </span>
      ),
    },

    // ACTION
    {
      id: "actions",
      header: "ACTION",
      cell: ({ row }) => {
        const product = row.original

        const handleDelete = () => {
          if (confirm(`Delete ${product.product}?`)) {
            console.log("Deleting:", product.id)
          }
        }

        return <TableActions onDelete={handleDelete} editUrl="/product_form/id" viewUrl="/product_detail/id"/>
      },
    },
  ]
  const products: ProductItem[] = [
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
    },
  ]

  return (
    <div className="section-container">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">
            Products
          </h1>

          <p className="font-text text-accent-foreground text-sm mt-1">
            Manage your product catalog, pricing, and availability
          </p>
        </div>

        <ActionButton variant="download" icon={PlusIcon}>
          Add Product
        </ActionButton>
      </div>

      <FilterToolbar
        searchPlaceholder="search product..."
        filters={[
          {
            component: (
              <PriceRangeFilter
                onChange={(range) => {
                  console.log("Price range:", range)
                }}
              />
            ),
          },
          {
            component: (
              <ExampleComboboxCustomItems
                placeholder="status"
                frameworks={statusOptions}
              />
            ),
          },
          {
            component: (
              <ExampleComboboxCustomItems
                placeholder="categories"
                frameworks={categoryOptions}
              />
            ),
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={products}
        columnWidths={[
          "90px", // ID
          "70px", // IMAGE
          "240px", // PRODUCT
          "140px", // SKU
          "140px", // CATEGORY
          "110px", // PRICE
          "120px", // STATUS
          "100px", // RATING
          "110px", // SALES
          "150px", // CREATED AT
          "100px", // ACTION
        ]}
      />
    </div>
  )
}

export default Products
