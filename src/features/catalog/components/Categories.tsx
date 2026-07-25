import React from "react"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { TableActions } from "@/components/common/TableActions"
import FilterToolbar from "@/components/common/FilterToolBar"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import { categoryOptions, type Category } from "@/assets/Data"
import { DataTable } from "@/components/common/data-table"
import { useNavigate } from "react-router-dom"
import { useAppData } from "@/store/AppDataProvider"
import { toast } from "sonner"

const Categories = () => {
  const navigate = useNavigate()
  const { categories, deleteCategory } = useAppData()

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
  type CategoryItem = Category
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
          deleteCategory(category.id)
          toast.success(`${category.name} deleted`)
        }

        return <TableActions itemName={category.name} onDelete={handleDelete} editUrl={`/category_form/${category.id}`}/>
      },
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

        <Button variant="primary" size="action" onClick={() => navigate("/category_form/new")}>
          <PlusIcon className="size-5" />
          Add Category
        </Button>
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
