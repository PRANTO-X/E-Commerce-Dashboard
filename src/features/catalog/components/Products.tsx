import { useEffect, useMemo, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { DownloadIcon, PlusIcon, Package, Boxes } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { TableActions } from "@/components/common/TableActions"
import FilterToolbar from "@/components/common/FilterToolBar"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import {
  productStatusOptions,
  type Product,
  type ProductStatus,
} from "@/features/catalog/types"
import { StatusBadge } from "@/components/common/StatusBadge"
import { PageHeading } from "@/components/common/PageHeading"
import { PriceRangeFilter } from "./PriceRangeFilter"
import { DataTable } from "@/components/common/data-table"
import { useNavigate } from "react-router-dom"
import { exportToCSV } from "@/utility/ExportToCsv"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll, deleteData } from "@/features/catalog/slices/productSlice"
import { fetchAll as fetchAllCategories } from "@/features/catalog/slices/categorySlice"
import { fetchAll as fetchAllProductImages } from "@/features/catalog/slices/productImageSlice"
import { toast } from "sonner"

const Products = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: products, isLoading, error } = useAppSelector((state) => state.products)
  const { data: categories } = useAppSelector((state) => state.categories)
  const { data: allImages } = useAppSelector((state) => state.productImages)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<{ label: string; value: string } | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<{ label: string; value: string } | null>(null)
  const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>({ min: null, max: null })

  const loadProducts = useCallback(() => {
    dispatch(fetchAll({ page: 1, page_size: 1000 }))
  }, [dispatch])

  useEffect(() => {
    // Backend list endpoints don't support filter query params (confirmed live) —
    // fetch everything once and filter/paginate client-side instead.
    loadProducts()
    dispatch(fetchAllProductImages({ page: 1, page_size: 1000 }))
  }, [loadProducts, dispatch])

  useEffect(() => {
    dispatch(fetchAllCategories({ page: 1, page_size: 100 }))
  }, [dispatch])

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—"

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ label: c.name, value: c.id })),
    [categories]
  )

  const filteredProducts = products.filter((product) => {
    if (search && !product.name.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter && product.status !== statusFilter.value) return false
    if (categoryFilter && product.category !== categoryFilter.value) return false
    const price = Number(product.base_price)
    if (priceRange.min !== null && price < priceRange.min) return false
    if (priceRange.max !== null && price > priceRange.max) return false
    return true
  })

  const columns: ColumnDef<Product>[] = [
    {
      id: "image",
      header: "IMAGE",
      cell: ({ row }) => {
        const product = row.original
        const primaryImage =
          allImages.find((img) => img.product === product.id && img.is_primary) ||
          allImages.find((img) => img.product === product.id)

        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/40 shadow-2xs">
            {primaryImage?.image ? (
              <img
                src={primaryImage.image}
                alt={primaryImage.alt_text || product.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none"
                }}
              />
            ) : (
              <Package className="h-5 w-5 text-muted-foreground/60" />
            )}
          </div>
        )
      },
    },

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
      cell: ({ row }) => {
        const type = row.getValue("product_type") as string
        if (type === "bundle") {
          return (
            <span className="inline-flex items-center rounded-full bg-purple-500/15 px-2.5 py-0.5 text-xs font-semibold text-purple-600 dark:text-purple-300 border border-purple-500/20">
              Bundle
            </span>
          )
        }
        return (
          <span className="text-sm text-muted-foreground capitalize">
            {type}
          </span>
        )
      },
    },

    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("status") as ProductStatus} />
      ),
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

  const csvData = filteredProducts.map((product) => ({
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
        <PageHeading
          title="Products"
          description="Manage your product catalog, pricing, variations, and combo bundles"
        />

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="action"
            onClick={() => navigate("/product_form/new?type=bundle")}
            className="border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30"
          >
            <Boxes className="size-5" /> Create Combo Bundle
          </Button>

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
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            component: (
              <PriceRangeFilter
                onChange={(range) => setPriceRange(range)}
              />
            ),
          },
          {
            component: (
              <ExampleComboboxCustomItems
                placeholder="status"
                frameworks={productStatusOptions}
                value={statusFilter}
                onValueChange={setStatusFilter}
              />
            ),
          },
          {
            component: (
              <ExampleComboboxCustomItems
                placeholder="categories"
                frameworks={categoryOptions}
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              />
            ),
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filteredProducts}
        isLoading={isLoading}
        error={error}
        onRetry={loadProducts}
        onRowClick={(product) => navigate(`/product_detail/${product.id}`)}
        minWidth="1220px"
        columnWidths={[
          "70px",  // IMAGE
          "200px", // PRODUCT
          "150px", // SLUG
          "140px", // CATEGORY
          "110px", // PRICE
          "110px", // TYPE
          "120px", // STATUS
          "90px",  // FEATURED
          "130px", // CREATED AT
          "100px", // ACTION
        ]}
      />
    </div>
  )
}

export default Products
