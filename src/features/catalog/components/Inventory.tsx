import React from "react"
import { ActionButton } from "@/components/common/ActionButton"
import { DownloadIcon,Trash2Icon, EyeIcon } from "lucide-react"
import InventoryStatsCards from "./InventoryStatsCards"
import type { ColumnDef } from "@tanstack/react-table"
import FilterToolbar from "@/components/common/FilterToolBar"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import { DataTable } from "@/components/common/data-table"
import { categoryOptions } from "@/assets/Data"
import { TableActions } from "@/components/common/TableActions"
const Inventory = () => {
  const statusOptions = [
    { label: "In Stock", value: "in_stock" },
    { label: "Low Stock", value: "low_stock" },
    { label: "Out of Stock", value: "out_of_stock" },
  ]

 

  const statusStyles = {
    "In Stock": "bg-green-500/10 text-green-400 border border-green-500/20",

    "Low Stock": "bg-amber-500/10 text-amber-400 border border-amber-500/20",

    "Out of Stock": "bg-red-500/10 text-red-400 border border-red-500/20",
  } as const

  type stockStatus = keyof typeof statusStyles
  interface InventoryItem {
    id: string

    product: string
    image?: string

    sku: string
    category: string

    stock: number

    status: stockStatus

    price: number

    lastRestocked: string
  }

  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: "id",
      header: "PRODUCT ID",
      cell: ({ row }) => (
        <span className="font-medium text-primary text-sm">
          {row.getValue("id")}
        </span>
      ),
    },
    {
      accessorKey: "product",
      header: "PRODUCT",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">
          {row.getValue("product")}
        </span>
      ),
    },

    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("sku")}
        </span>
      ),
    },

    {
      accessorKey: "category",
      header: "CATEGORY",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("category")}
        </span>
      ),
    },

    {
      accessorKey: "stock",
      header: "STOCK",
      cell: ({ row }) => {
        const stock = row.getValue("stock") as number

        return (
          <span className="text-sm font-medium text-foreground">{stock}</span>
        )
      },
    },

    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const status = row.getValue("status") as stockStatus

        return (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              statusStyles[status]
            }`}
          >
            {status}
          </span>
        )
      },
    },

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

    {
      accessorKey: "lastRestocked",
      header: "LAST RESTOCKED",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {row.getValue("lastRestocked")}
        </span>
      ),
    },

    {
      id: "actions",
      header: "ACTION",
      cell: ({ row }) => {
        const product = row.original

        const handleDelete = () => {
          const confirmDelete = window.confirm(
            `Are you sure you want to delete ${product.product}?`,
          )

          if (confirmDelete) {
            console.log("Deleting:", product.id)
          }
        }

        return (
          <TableActions viewUrl={`/product_detail/${product.id  }`} onDelete={handleDelete}/>
        )
      },
    },
  ]

  const inventory: InventoryItem[] = [
    {
      id: "INV-001",
      product: "Nike Air Max",
      image: "",
      sku: "NK-AM-001",
      category: "Shoes",
      stock: 42,
      status: "In Stock",
      price: 129.99,
      lastRestocked: "2026-05-15",
    },
    {
      id: "INV-002",
      product: "Adidas Ultraboost",
      image: "",
      sku: "AD-UB-002",
      category: "Shoes",
      stock: 8,
      status: "Low Stock",
      price: 149.99,
      lastRestocked: "2026-05-11",
    },
    {
      id: "INV-003",
      product: "Apple AirPods Pro",
      image: "",
      sku: "AP-APP-003",
      category: "Electronics",
      stock: 0,
      status: "Out of Stock",
      price: 249.99,
      lastRestocked: "2026-05-01",
    },
    {
      id: "INV-004",
      product: "Samsung Galaxy Watch",
      image: "",
      sku: "SM-GW-004",
      category: "Wearables",
      stock: 25,
      status: "In Stock",
      price: 199.99,
      lastRestocked: "2026-05-18",
    },
    {
      id: "INV-005",
      product: "Sony WH-1000XM5",
      image: "",
      sku: "SY-WH-005",
      category: "Electronics",
      stock: 6,
      status: "Low Stock",
      price: 349.99,
      lastRestocked: "2026-05-12",
    },
    {
      id: "INV-006",
      product: "Puma Sports Hoodie",
      image: "",
      sku: "PM-HD-006",
      category: "Clothing",
      stock: 58,
      status: "In Stock",
      price: 59.99,
      lastRestocked: "2026-05-14",
    },
    {
      id: "INV-007",
      product: "Dell XPS 13",
      image: "",
      sku: "DL-XPS-007",
      category: "Laptops",
      stock: 4,
      status: "Low Stock",
      price: 1299.99,
      lastRestocked: "2026-05-10",
    },
    {
      id: "INV-008",
      product: "Logitech MX Master 3",
      image: "",
      sku: "LG-MX-008",
      category: "Accessories",
      stock: 37,
      status: "In Stock",
      price: 99.99,
      lastRestocked: "2026-05-09",
    },
    {
      id: "INV-009",
      product: "Canon EOS R50",
      image: "",
      sku: "CN-EOS-009",
      category: "Cameras",
      stock: 2,
      status: "Low Stock",
      price: 899.99,
      lastRestocked: "2026-05-08",
    },
    {
      id: "INV-010",
      product: "HP Pavilion Gaming",
      image: "",
      sku: "HP-PV-010",
      category: "Laptops",
      stock: 0,
      status: "Out of Stock",
      price: 1099.99,
      lastRestocked: "2026-04-28",
    },
    {
      id: "INV-011",
      product: "Asus ROG Keyboard",
      image: "",
      sku: "AS-ROG-011",
      category: "Accessories",
      stock: 15,
      status: "In Stock",
      price: 139.99,
      lastRestocked: "2026-05-17",
    },
    {
      id: "INV-012",
      product: "Levi's Denim Jacket",
      image: "",
      sku: "LV-DJ-012",
      category: "Clothing",
      stock: 11,
      status: "In Stock",
      price: 89.99,
      lastRestocked: "2026-05-13",
    },
    {
      id: "INV-013",
      product: "JBL Flip 6",
      image: "",
      sku: "JBL-F6-013",
      category: "Audio",
      stock: 3,
      status: "Low Stock",
      price: 119.99,
      lastRestocked: "2026-05-06",
    },
    {
      id: "INV-014",
      product: "iPhone 15 Pro",
      image: "",
      sku: "APL-IP15-014",
      category: "Smartphones",
      stock: 18,
      status: "In Stock",
      price: 1199.99,
      lastRestocked: "2026-05-19",
    },
    {
      id: "INV-015",
      product: "Google Pixel 9",
      image: "",
      sku: "GG-PX9-015",
      category: "Smartphones",
      stock: 0,
      status: "Out of Stock",
      price: 999.99,
      lastRestocked: "2026-04-20",
    },
    {
      id: "INV-016",
      product: "Under Armour Backpack",
      image: "",
      sku: "UA-BP-016",
      category: "Accessories",
      stock: 29,
      status: "In Stock",
      price: 49.99,
      lastRestocked: "2026-05-16",
    },
    {
      id: "INV-017",
      product: "Nintendo Switch OLED",
      image: "",
      sku: "NT-SW-017",
      category: "Gaming",
      stock: 5,
      status: "Low Stock",
      price: 349.99,
      lastRestocked: "2026-05-07",
    },
    {
      id: "INV-018",
      product: "Acer Nitro 5",
      image: "",
      sku: "AC-N5-018",
      category: "Laptops",
      stock: 21,
      status: "In Stock",
      price: 949.99,
      lastRestocked: "2026-05-15",
    },
    {
      id: "INV-019",
      product: "Fitbit Charge 6",
      image: "",
      sku: "FB-C6-019",
      category: "Wearables",
      stock: 1,
      status: "Low Stock",
      price: 179.99,
      lastRestocked: "2026-05-03",
    },
    {
      id: "INV-020",
      product: "Bose SoundLink Flex",
      image: "",
      sku: "BS-SLF-020",
      category: "Audio",
      stock: 13,
      status: "In Stock",
      price: 149.99,
      lastRestocked: "2026-05-18",
    },
  ]
  return (
    <div className="section-container">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">
            Inventory
          </h1>

          <p className="font-text text-accent-foreground text-sm mt-1">
            Manage enterprise assets and stock levels
          </p>
        </div>

        <ActionButton variant="download" icon={DownloadIcon}>
          Export CSV
        </ActionButton>
      </div>

      <InventoryStatsCards />

      <FilterToolbar
        filters={[
          {
            component: (
              <ExampleComboboxCustomItems
                frameworks={statusOptions}
                placeholder="Stock Status"
              />
            ),
          },
          {
            component: (
              <ExampleComboboxCustomItems
                frameworks={categoryOptions}
                placeholder="Categories"
              />
            ),
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={inventory}
        columnWidths={[
          "120px",
          "240px",
          "160px",
          "100px",
          "140px",
          "130px",
          "140px",
          "140px",
          "100px",
        ]}
      />
    </div>
  )
}

export default Inventory
