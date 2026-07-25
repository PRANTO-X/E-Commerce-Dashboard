import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DownloadIcon, PlusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { TableActions } from "@/components/common/TableActions"
import FilterToolbar from "@/components/common/FilterToolBar"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import { categoryOptions, statusStyles, type ProductItem, type ProductStatus } from "@/assets/Data"
import { PriceRangeFilter } from "./PriceRangeFilter"
import { DataTable } from "@/components/common/data-table"
import { useNavigate } from "react-router-dom"
import { exportToCSV } from "@/utility/ExportToCsv"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll, deleteData } from "@/features/catalog/slices/productSlice"
import { toast } from "sonner"
const Products = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: products } = useAppSelector((state) => state.products)

  useEffect(() => {
    dispatch(fetchAll())
  }, [dispatch])

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Draft", value: "draft" },
    { label: "Inactive", value: "inactive" },
  ]

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
          dispatch(deleteData(product.id))
          toast.success(`${product.product} deleted`)
        }

        return (
          <TableActions
            itemName={product.product}
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
  Product: product.product,
  SKU: product.sku,
  Category: product.category,
  Price: product.price,
  Status: product.status,
  Rating: product.rating,
  Sales: product.sales,
  CreatedAt: product.createdAt,
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
          onClick={() => exportToCSV(csvData,'Products')}
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
