import React from "react"
import { ActionButton } from "@/components/common/ActionButton"
import { PlusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { TableActions } from "@/components/common/TableActions"
import FilterToolbar from "@/components/common/FilterToolBar"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import { categoryOptions } from "@/assets/Data"
import { DataTable } from "@/components/common/data-table"

const Categories = () => {
  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Draft", value: "draft" },
    { label: "Inactive", value: "inactive" },
  ]
  const statusStyles = {
    active: "bg-green-500/10 text-green-400 border border-green-500/20",
    draft: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    inactive: "bg-red-500/10 text-red-400 border border-red-500/20",
  } as const

  type categoryStatus = keyof typeof statusStyles
  interface CategoryItem {
    id: string
    name: string
    slug: string
    parent?: string | null
    products: number
    status: categoryStatus
    createdAt: string
  }
  const columns: ColumnDef<CategoryItem>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-primary">
          {row.getValue("id")}
        </span>
      ),
    },

    {
      accessorKey: "name",
      header: "CATEGORY NAME",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">
          {row.getValue("name")}
        </span>
      ),
    },

    {
      accessorKey: "slug",
      header: "SLUG",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("slug")}
        </span>
      ),
    },

    {
      accessorKey: "parent",
      header: "PARENT CATEGORY",
      cell: ({ row }) => {
        const parent = row.getValue("parent") as string | null

        return (
          <span className="text-sm text-muted-foreground">{parent || "—"}</span>
        )
      },
    },

    {
      accessorKey: "products",
      header: "PRODUCTS",
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.getValue("products")}</span>
      ),
    },

    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const status = row.getValue("status") as categoryStatus

        return (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}
          >
            {status}
          </span>
        )
      },
    },

    {
      accessorKey: "createdAt",
      header: "CREATED AT",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("createdAt")}
        </span>
      ),
    },

    {
      id: "actions",
      header: "ACTION",
      cell: ({ row }) => {
        const category = row.original

        const handleDelete = () => {
          if (confirm(`Delete ${category.name}?`)) {
            console.log("Deleting:", category.id)
          }
        }

        return <TableActions onDelete={handleDelete} editUrl="/category_form/id"/>
      },
    },
  ]

  const categories: CategoryItem[] = [
    {
      id: "C1001",
      name: "Electronics",
      slug: "electronics",
      parent: null,
      products: 120,
      status: "active",
      createdAt: "2025-01-10",
    },
    {
      id: "C1002",
      name: "Smartphones",
      slug: "smartphones",
      parent: "Electronics",
      products: 45,
      status: "active",
      createdAt: "2025-01-12",
    },
    {
      id: "C1003",
      name: "Laptops",
      slug: "laptops",
      parent: "Electronics",
      products: 32,
      status: "active",
      createdAt: "2025-01-15",
    },
    {
      id: "C1004",
      name: "Audio Devices",
      slug: "audio-devices",
      parent: "Electronics",
      products: 28,
      status: "active",
      createdAt: "2025-02-01",
    },
    {
      id: "C1005",
      name: "Wearables",
      slug: "wearables",
      parent: "Electronics",
      products: 18,
      status: "active",
      createdAt: "2025-02-05",
    },
    {
      id: "C1006",
      name: "Gaming",
      slug: "gaming",
      parent: null,
      products: 60,
      status: "active",
      createdAt: "2025-02-10",
    },
    {
      id: "C1007",
      name: "Consoles",
      slug: "consoles",
      parent: "Gaming",
      products: 12,
      status: "active",
      createdAt: "2025-02-12",
    },
    {
      id: "C1008",
      name: "Accessories",
      slug: "gaming-accessories",
      parent: "Gaming",
      products: 25,
      status: "active",
      createdAt: "2025-02-15",
    },
    {
      id: "C1009",
      name: "Clothing",
      slug: "clothing",
      parent: null,
      products: 90,
      status: "active",
      createdAt: "2025-01-20",
    },
    {
      id: "C1010",
      name: "Men Fashion",
      slug: "men-fashion",
      parent: "Clothing",
      products: 40,
      status: "active",
      createdAt: "2025-01-22",
    },
    {
      id: "C1011",
      name: "Women Fashion",
      slug: "women-fashion",
      parent: "Clothing",
      products: 50,
      status: "active",
      createdAt: "2025-01-25",
    },
    {
      id: "C1012",
      name: "Shoes",
      slug: "shoes",
      parent: null,
      products: 70,
      status: "active",
      createdAt: "2025-01-28",
    },
    {
      id: "C1013",
      name: "Sneakers",
      slug: "sneakers",
      parent: "Shoes",
      products: 30,
      status: "active",
      createdAt: "2025-02-01",
    },
    {
      id: "C1014",
      name: "Formal Shoes",
      slug: "formal-shoes",
      parent: "Shoes",
      products: 20,
      status: "inactive",
      createdAt: "2025-02-03",
    },
    {
      id: "C1015",
      name: "Home Appliances",
      slug: "home-appliances",
      parent: null,
      products: 55,
      status: "active",
      createdAt: "2025-02-10",
    },
    {
      id: "C1016",
      name: "Kitchen Appliances",
      slug: "kitchen-appliances",
      parent: "Home Appliances",
      products: 22,
      status: "active",
      createdAt: "2025-02-12",
    },
    {
      id: "C1017",
      name: "Furniture",
      slug: "furniture",
      parent: null,
      products: 40,
      status: "active",
      createdAt: "2025-02-18",
    },
    {
      id: "C1018",
      name: "Office Furniture",
      slug: "office-furniture",
      parent: "Furniture",
      products: 15,
      status: "draft",
      createdAt: "2025-02-20",
    },
    {
      id: "C1019",
      name: "Beauty & Health",
      slug: "beauty-health",
      parent: null,
      products: 65,
      status: "active",
      createdAt: "2025-02-25",
    },
    {
      id: "C1020",
      name: "Skincare",
      slug: "skincare",
      parent: "Beauty & Health",
      products: 28,
      status: "active",
      createdAt: "2025-02-28",
    },
  ]
  return (
    <div className="section-container">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">
            Categories
          </h1>

          <p className="font-text text-accent-foreground text-sm mt-1">
            Organize and manage product categories to structure your catalog
            efficiently
          </p>
        </div>

        <ActionButton variant="download" icon={PlusIcon}>
          Add Category
        </ActionButton>
      </div>

      <FilterToolbar
        searchPlaceholder="search category..."
        filters={[
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
        data={categories}
        columnWidths={[
          "80px", // ID
          "220px", // CATEGORY NAME
          "160px", // SLUG
          "180px", // PARENT CATEGORY
          "120px", // PRODUCTS
          "120px", // STATUS
          "160px", // CREATED AT
          "120px", // ACTION
        ]}
      />
    </div>
  )
}

export default Categories
