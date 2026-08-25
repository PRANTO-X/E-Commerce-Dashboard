import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { TableActions } from "@/components/common/TableActions"
import { DataTable } from "@/components/common/data-table"
import { StatusBadge } from "@/components/common/StatusBadge"
import { PageHeading } from "@/components/common/PageHeading"
import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll, deleteData } from "@/features/cms/slices/pageSlice"
import type { ContentPage } from "@/features/cms/types"
import { toast } from "sonner"

const Pages = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [page, setPage] = useState(1)
  const { data: pages, totalItems, meta, isLoading, error } = useAppSelector((state) => state.pages)

  const loadPages = useCallback(() => {
    dispatch(fetchAll({ page }))
  }, [dispatch, page])

  useEffect(() => {
    loadPages()
  }, [loadPages])

  const columns: ColumnDef<ContentPage>[] = [
    { accessorKey: "title", header: "TITLE" },
    { accessorKey: "slug", header: "SLUG" },
    {
      accessorKey: "page_type",
      header: "TYPE",
      cell: ({ row }) => <span className="capitalize">{row.getValue("page_type")}</span>,
    },
    {
      accessorKey: "is_published",
      header: "STATUS",
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("is_published") ? "published" : "draft"} />
      ),
    },
    {
      id: "actions",
      header: "ACTION",
      cell: ({ row }) => {
        const contentPage = row.original
        const handleDelete = async () => {
          try {
            await dispatch(deleteData(contentPage.id)).unwrap()
            toast.success(`${contentPage.title} deleted`)
          } catch {
            toast.error("Failed to delete page")
          }
        }
        return (
          <TableActions
            itemName={contentPage.title}
            onDelete={handleDelete}
            editUrl={`/page_form/${contentPage.id}`}
          />
        )
      },
    },
  ]

  return (
    <div className="section-container">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PageHeading
          title="Content Pages"
          description="Manage static and landing pages shown on the storefront"
        />
        <Button variant="primary" size="action" onClick={() => navigate("/page_form/new")}>
          <PlusIcon className="size-5" /> Add Page
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={pages}
        isLoading={isLoading}
        error={error}
        onRetry={loadPages}
        onRowClick={(contentPage) => navigate(`/page_form/${contentPage.id}`)}
        manualPagination
        pageIndex={page - 1}
        pageCount={meta?.totalPages ?? 1}
        totalCount={totalItems}
        onPageChange={(index) => setPage(index + 1)}
        minWidth="800px"
        columnWidths={["240px", "180px", "120px", "130px", "120px"]}
      />
    </div>
  )
}

export default Pages
