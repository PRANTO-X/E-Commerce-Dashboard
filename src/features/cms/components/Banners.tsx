import { useEffect, useState } from "react"
import { toast } from "sonner"
import { PlusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Field, FieldLabel, FieldContent } from "@/components/ui/field"
import { DataTable } from "@/components/common/data-table"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll, postData } from "@/features/cms/slices/bannerSlice"
import type { HomepageBanner } from "@/features/cms/types"

const Banners = () => {
  const dispatch = useAppDispatch()
  const [page, setPage] = useState(1)
  const { data: banners, totalItems, meta } = useAppSelector((state) => state.banners)

  const [title, setTitle] = useState("")
  const [image, setImage] = useState("")
  const [targetUrl, setTargetUrl] = useState("")
  const [sortOrder, setSortOrder] = useState("0")
  const [isActive, setIsActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    dispatch(fetchAll({ page }))
  }, [dispatch, page])

  const handleCreate = async () => {
    if (!title.trim() || !image.trim()) return
    setSubmitting(true)
    try {
      await dispatch(
        postData({
          payload: {
            title: title.trim(),
            image: image.trim(),
            target_url: targetUrl.trim(),
            sort_order: Number(sortOrder) || 0,
            is_active: isActive,
          },
        })
      ).unwrap()
      toast.success(`${title} created`)
      setTitle("")
      setImage("")
      setTargetUrl("")
      setSortOrder("0")
      setIsActive(true)
    } catch {
      toast.error("Failed to create banner")
    } finally {
      setSubmitting(false)
    }
  }

  const columns: ColumnDef<HomepageBanner>[] = [
    {
      accessorKey: "image",
      header: "IMAGE",
      cell: ({ row }) => (
        <img src={row.getValue("image")} alt="banner" className="h-10 w-16 rounded object-cover" />
      ),
    },
    { accessorKey: "title", header: "TITLE" },
    { accessorKey: "target_url", header: "TARGET URL" },
    { accessorKey: "sort_order", header: "SORT" },
    {
      accessorKey: "is_active",
      header: "STATUS",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            row.getValue("is_active")
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {row.getValue("is_active") ? "active" : "inactive"}
        </span>
      ),
    },
  ]

  return (
    <div className="section-container">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Homepage Banners</h1>
        <p className="font-text text-accent-foreground text-sm mt-1">
          Manage promotional banners shown on the storefront homepage
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Banner</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="banner-title">Title</FieldLabel>
            <FieldContent>
              <Input id="banner-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="banner-image">Image URL</FieldLabel>
            <FieldContent>
              <Input id="banner-image" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="banner-target">Target URL</FieldLabel>
            <FieldContent>
              <Input id="banner-target" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="banner-sort">Sort Order</FieldLabel>
            <FieldContent>
              <Input id="banner-sort" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
            </FieldContent>
          </Field>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="banner-active">Active</FieldLabel>
            </FieldContent>
            <Switch id="banner-active" checked={isActive} onCheckedChange={setIsActive} />
          </Field>
        </CardContent>
        <CardContent className="pt-0">
          <Button onClick={handleCreate} disabled={submitting || !title.trim() || !image.trim()}>
            <PlusIcon className="h-4 w-4" />
            Create Banner
          </Button>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={banners}
        manualPagination
        pageIndex={page - 1}
        pageCount={meta?.totalPages ?? 1}
        totalCount={totalItems}
        onPageChange={(index) => setPage(index + 1)}
        columnWidths={["100px", "220px", "220px", "100px", "120px"]}
      />
    </div>
  )
}

export default Banners
