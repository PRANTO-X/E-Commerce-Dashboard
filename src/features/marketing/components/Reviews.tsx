import { useEffect, useState, useCallback } from "react"
import { CheckIcon, StarIcon, XIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import FilterToolbar from "@/components/common/FilterToolBar"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import { DataTable } from "@/components/common/data-table"
import { StatusBadge } from "@/components/common/StatusBadge"
import { PageHeading } from "@/components/common/PageHeading"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll, approveReview, rejectReview } from "@/features/marketing/slices/reviewSlice"
import { fetchAll as fetchAllProducts } from "@/features/catalog/slices/productSlice"
import type { Review, ReviewStatus } from "@/features/marketing/types"
import { toast } from "sonner"

const Reviews = () => {
  const dispatch = useAppDispatch()
  const { data: allReviews, isLoading, error } = useAppSelector((state) => state.reviews)
  const { data: products } = useAppSelector((state) => state.products)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<{ label: string; value: string } | null>(null)

  const loadReviews = useCallback(() => {
    dispatch(fetchAll())
  }, [dispatch])

  useEffect(() => {
    loadReviews()
    dispatch(fetchAllProducts({ page: 1, page_size: 100 }))
  }, [loadReviews, dispatch])

  const productName = (id: string) => products.find((p) => p.id === id)?.name ?? id

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ]

  const reviews = allReviews.filter((review) => {
    if (search) {
      const q = search.toLowerCase()
      if (!review.title.toLowerCase().includes(q) && !review.content.toLowerCase().includes(q)) return false
    }
    if (statusFilter && review.status !== statusFilter.value) return false
    return true
  })

  const handleApprove = async (review: Review) => {
    try {
      await dispatch(approveReview(review.id)).unwrap()
      toast.success("Review approved")
    } catch {
      toast.error("Failed to approve review")
    }
  }

  const handleReject = async (review: Review) => {
    try {
      await dispatch(rejectReview(review.id)).unwrap()
      toast.success("Review rejected")
    } catch {
      toast.error("Failed to reject review")
    }
  }

  const columns: ColumnDef<Review>[] = [
    {
      accessorKey: "product",
      header: "PRODUCT",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">{productName(row.getValue("product"))}</span>
      ),
    },
    {
      accessorKey: "title",
      header: "TITLE",
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.getValue("title")}</span>
      ),
    },
    {
      accessorKey: "rating",
      header: "RATING",
      cell: ({ row }) => {
        const rating = row.getValue("rating") as number
        return (
          <div className="flex items-center gap-0.5 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className={`h-3.5 w-3.5 ${i < rating ? "fill-current" : "text-muted-foreground opacity-30"}`} />
            ))}
          </div>
        )
      },
    },
    {
      accessorKey: "content",
      header: "COMMENT",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground line-clamp-2 max-w-xs block">
          {row.getValue("content")}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "DATE",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {new Date(row.getValue("created_at")).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("status") as ReviewStatus} />
      ),
    },
    {
      id: "actions",
      header: "ACTION",
      cell: ({ row }) => {
        const review = row.original
        return (
          <div className="flex items-center gap-3">
            <button
              title="Approve"
              className="disabled:opacity-30 cursor-pointer"
              disabled={review.status === "approved"}
              onClick={() => handleApprove(review)}
            >
              <CheckIcon className="h-4 w-4 text-green-500" />
            </button>
            <button
              title="Reject"
              className="disabled:opacity-30 cursor-pointer"
              disabled={review.status === "rejected"}
              onClick={() => handleReject(review)}
            >
              <XIcon className="h-4 w-4 text-red-500" />
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="section-container">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PageHeading
          title="Reviews & Moderation"
          description="Approve or reject customer product reviews."
        />
      </div>

      <FilterToolbar
        searchPlaceholder="search reviews..."
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
        data={reviews}
        isLoading={isLoading}
        error={error}
        onRetry={loadReviews}
        showPagination={false}
        minWidth="1080px"
        columnWidths={["180px", "180px", "110px", "260px", "140px", "110px", "100px"]}
      />
    </div>
  )
}

export default Reviews
