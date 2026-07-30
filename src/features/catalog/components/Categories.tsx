import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { TableActions } from "@/components/common/TableActions"
import FilterToolbar from "@/components/common/FilterToolBar"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import type { Category } from "@/features/catalog/types"
import { DataTable } from "@/components/common/data-table"
import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll, deleteData } from "@/features/catalog/slices/categorySlice"
import { toast } from "sonner"

const Categories = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [page, setPage] = useState(1)
  const { data: categories, totalItems, meta } = useAppSelector((state) => state.categories)

  useEffect(() => {
    dispatch(fetchAll({ page }))
  }, [dispatch, page])

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ]

  const columns: ColumnDef<Category>[] = [
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
        const parentId = row.getValue("parent") as string | null
        const parent = categories.find((c) => c.id === parentId)

        return (
          <span className="text-sm text-muted-foreground">{parent?.name ?? "—"}</span>
        )
      },
    },

    {
      accessorKey: "sort_order",
      header: "SORT ORDER",
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.getValue("sort_order")}</span>
      ),
    },

    {
      accessorKey: "is_active",
      header: "STATUS",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean

        return (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              isActive
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {isActive ? "active" : "inactive"}
          </span>
        )
      },
    },

    {
      accessorKey: "created_at",
      header: "CREATED AT",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.getValue("created_at")).toLocaleDateString()}
        </span>
      ),
    },

    {
      id: "actions",
      header: "ACTION",
      cell: ({ row }) => {
        const category = row.original

        const handleDelete = async () => {
          try {
            await dispatch(deleteData(category.id)).unwrap()
            toast.success(`${category.name} deleted`)
          } catch {
            toast.error("Failed to delete category")
          }
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
        ]}
      />

      <DataTable
        columns={columns}
        data={categories}
        manualPagination
        pageIndex={page - 1}
        pageCount={meta?.totalPages ?? 1}
        totalCount={totalItems}
        onPageChange={(index) => setPage(index + 1)}
        columnWidths={[
          "220px", // CATEGORY NAME
          "160px", // SLUG
          "180px", // PARENT CATEGORY
          "120px", // SORT ORDER
          "120px", // STATUS
          "160px", // CREATED AT
          "120px", // ACTION
        ]}
      />
    </div>
  )
}

export default Categories
