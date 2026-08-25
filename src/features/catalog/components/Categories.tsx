import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { TableActions } from "@/components/common/TableActions"
import FilterToolbar from "@/components/common/FilterToolBar"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import type { Category } from "@/features/catalog/types"
import { DataTable } from "@/components/common/data-table"
import { StatusBadge } from "@/components/common/StatusBadge"
import { PageHeading } from "@/components/common/PageHeading"
import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll, deleteData } from "@/features/catalog/slices/categorySlice"
import { toast } from "sonner"

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

const Categories = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: categories, isLoading, error } = useAppSelector((state) => state.categories)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<{ label: string; value: string } | null>(null)

  const loadCategories = useCallback(() => {
    dispatch(fetchAll({ page: 1, page_size: 1000 }))
  }, [dispatch])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const filteredCategories = categories.filter((category) => {
    if (search && !category.name.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter && category.is_active !== (statusFilter.value === "active")) return false
    return true
  })

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
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("is_active") ? "active" : "inactive"} />
      ),
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
        <PageHeading
          title="Categories"
          description="Organize and manage product categories to structure your catalog efficiently"
        />

        <Button variant="apply" size="action" onClick={() => navigate("/category_form/new")}>
          <PlusIcon className="size-5" />
          Add Category
        </Button>
      </div>

      <FilterToolbar
        searchPlaceholder="search category..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            component: (
              <ExampleComboboxCustomItems
                placeholder="status"
                frameworks={statusOptions}
                value={statusFilter}
                onValueChange={setStatusFilter}
              />
            ),
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filteredCategories}
        isLoading={isLoading}
        error={error}
        onRetry={loadCategories}
        onRowClick={(category) => navigate(`/category_form/${category.id}`)}
        minWidth="1080px"
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
