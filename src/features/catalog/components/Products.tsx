import React from "react"
import { ActionButton } from "@/components/common/ActionButton"
import { PlusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { TableActions } from "@/components/common/TableActions"
import FilterToolbar from "@/components/common/FilterToolBar"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import { categoryOptions } from "@/assets/Data"
import { PriceRangeFilter } from "./PriceRangeFilter"

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

        return <TableActions onDelete={handleDelete} />
      },
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
    </div>
  )
}

export default Products
