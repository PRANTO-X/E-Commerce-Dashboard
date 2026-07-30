import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DownloadIcon, PlusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { TableActions } from "@/components/common/TableActions"
import FilterToolbar from "@/components/common/FilterToolBar"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import {
  productStatusOptions,
  productStatusStyles,
  type Product,
  type ProductStatus,
} from "@/features/catalog/types"
import { PriceRangeFilter } from "./PriceRangeFilter"
import { DataTable } from "@/components/common/data-table"
import { useNavigate } from "react-router-dom"
import { exportToCSV } from "@/utility/ExportToCsv"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll, deleteData } from "@/features/catalog/slices/productSlice"
import { fetchAll as fetchAllCategories } from "@/features/catalog/slices/categorySlice"
import { toast } from "sonner"

const Products = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [page, setPage] = useState(1)
  const { data: products, totalItems, meta } = useAppSelector((state) => state.products)
  const { data: categories } = useAppSelector((state) => state.categories)

  useEffect(() => {
    dispatch(fetchAll({ page }))
  }, [dispatch, page])

  useEffect(() => {
    dispatch(fetchAllCategories({ page: 1, page_size: 100 }))
  }, [dispatch])

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—"

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "PRODUCT",
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
        <span className="text-sm text-muted-foreground">{row.getValue("slug")}</span>
      ),
    },

    {
      accessorKey: "category",
      header: "CATEGORY",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {categoryName(row.getValue("category"))}
        </span>
      ),
    },

    {
      accessorKey: "base_price",
      header: "PRICE",
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-foreground">
          ${Number(row.getValue("base_price")).toFixed(2)}
        </span>
      ),
    },

    {
      accessorKey: "product_type",
      header: "TYPE",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground capitalize">
          {row.getValue("product_type")}
        </span>
      ),
    },

    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const status = row.getValue("status") as ProductStatus

        return (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${productStatusStyles[status]}`}
          >
            {status}
          </span>
        )
      },
    },

    {
      accessorKey: "is_featured",
      header: "FEATURED",
      cell: ({ row }) => (row.getValue("is_featured") ? "Yes" : "No"),
    },

    {
      accessorKey: "created_at",
      header: "CREATED AT",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {new Date(row.getValue("created_at")).toLocaleDateString()}
        </span>
      ),
    },

    {
      id: "actions",
      header: "ACTION",
      cell: ({ row }) => {
        const product = row.original

        const handleDelete = async () => {
          try {
            await dispatch(deleteData(product.id)).unwrap()
            toast.success(`${product.name} deleted`)
          } catch {
            toast.error("Failed to delete product")
          }
        }

        return (
          <TableActions
            itemName={product.name}
            onDelete={handleDelete}
            editUrl={`/product_form/${product.id}`}
            viewUrl={`/product_detail/${product.id}`}
          />
        )
      },
    },
  ]

  const csvData = products.map((product) => ({
    ID: product.id,
    Name: product.name,
    Slug: product.slug,
    Category: categoryName(product.category),
    Price: product.base_price,
    Type: product.product_type,
    Status: product.status,
    Featured: product.is_featured,
    CreatedAt: product.created_at,
  }))

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

        <div className="flex gap-2">
          <Button
            variant="default"
            size="action"
            onClick={() => navigate("/product_form/new")}
          >
            <PlusIcon className="size-5" /> Add Product
          </Button>

          <Button
            variant="primary"
            size="action"
            onClick={() => exportToCSV(csvData, "Products")}
          >
            <DownloadIcon className="size-5" /> Export CSV
          </Button>
        </div>
      </div>

      <FilterToolbar
        searchPlaceholder="search product..."
        stacked
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
                frameworks={productStatusOptions}
              />
            ),
          },
          {
            component: (
              <ExampleComboboxCustomItems
                placeholder="categories"
                frameworks={categories.map((c) => ({ label: c.name, value: c.id }))}
              />
            ),
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={products}
        manualPagination
        pageIndex={page - 1}
        pageCount={meta?.totalPages ?? 1}
        totalCount={totalItems}
        onPageChange={(index) => setPage(index + 1)}
        columnWidths={[
          "220px", // PRODUCT
          "160px", // SLUG
          "140px", // CATEGORY
          "110px", // PRICE
          "110px", // TYPE
          "120px", // STATUS
          "100px", // FEATURED
          "150px", // CREATED AT
          "100px", // ACTION
        ]}
      />
    </div>
  )
}

export default Products
