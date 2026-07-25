import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckIcon, StarIcon, XIcon, MessageSquareIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import FilterToolbar from "@/components/common/FilterToolBar"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import { DataTable } from "@/components/common/data-table"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { type Review } from "@/assets/Data"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll, patchData } from "@/features/marketing/slices/reviewSlice"
import { toast } from "sonner"

const statusStyles = {
  pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  approved: "bg-green-500/10 text-green-400 border border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border border-red-500/20",
} as const

const Reviews = () => {
  const dispatch = useAppDispatch()
  const { data: reviews } = useAppSelector((state) => state.reviews)
  const [replyTarget, setReplyTarget] = useState<Review | null>(null)
  const [replyText, setReplyText] = useState("")

  useEffect(() => {
    dispatch(fetchAll())
  }, [dispatch])

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ]

  const openReply = (review: Review) => {
    setReplyTarget(review)
    setReplyText(review.sellerReply ?? "")
  }

  const handleSaveReply = () => {
    if (!replyTarget) return
    dispatch(patchData({ id: replyTarget.id, payload: { sellerReply: replyText.trim() || undefined } }))
    toast.success("Reply saved")
    setReplyTarget(null)
  }

  const columns: ColumnDef<Review>[] = [
    {
      accessorKey: "productName",
      header: "PRODUCT",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">{row.getValue("productName")}</span>
      ),
    },
    {
      accessorKey: "customerName",
      header: "CUSTOMER",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.getValue("customerName")}</span>
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
      accessorKey: "comment",
      header: "COMMENT",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground line-clamp-2 max-w-xs block">
          {row.getValue("comment")}
        </span>
      ),
    },
    {
      accessorKey: "date",
      header: "DATE",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">{row.getValue("date")}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const status = row.getValue("status") as Review["status"]
        return (
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}>
            {status}
          </span>
        )
      },
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
              onClick={() => {
                dispatch(patchData({ id: review.id, payload: { status: "approved" } }))
                toast.success("Review approved")
              }}
            >
              <CheckIcon className="h-4 w-4 text-green-500" />
            </button>
            <button
              title="Reject"
              className="disabled:opacity-30 cursor-pointer"
              disabled={review.status === "rejected"}
              onClick={() => {
                dispatch(patchData({ id: review.id, payload: { status: "rejected" } }))
                toast.success("Review rejected")
              }}
            >
              <XIcon className="h-4 w-4 text-red-500" />
            </button>
            <button title="Reply" className="cursor-pointer" onClick={() => openReply(review)}>
              <MessageSquareIcon className="h-4 w-4 text-primary" />
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="section-container">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Reviews & Moderation</h1>
          <p className="font-text text-accent-foreground text-sm mt-1">
            Approve, reject, and reply to customer product reviews.
          </p>
        </div>
      </div>

      <FilterToolbar
        searchPlaceholder="search reviews..."
        filters={[
          {
            component: <ExampleComboboxCustomItems placeholder="status" frameworks={statusOptions} />,
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={reviews}
        columnWidths={["180px", "160px", "110px", "260px", "140px", "110px", "120px"]}
      />

      <Dialog open={!!replyTarget} onOpenChange={(open) => !open && setReplyTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to {replyTarget?.customerName}'s review</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Write a public seller reply..."
            className="min-h-[120px] resize-none"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyTarget(null)}>Cancel</Button>
            <Button onClick={handleSaveReply}>Save Reply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Reviews
