import { useEffect, useState, useMemo } from "react"
import { toast } from "sonner"
import { PlusIcon, Tag, Sparkles, Image as ImageIcon, Loader2 } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, FieldContent } from "@/components/ui/field"
import { DataTable } from "@/components/common/data-table"
import { ImageUploader, type UploadedImageItem } from "@/components/common/ImageUploader"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll as fetchAllBanners, postData } from "@/features/cms/slices/bannerSlice"
import { fetchAll as fetchAllCategories } from "@/features/catalog/slices/categorySlice"
import type { HomepageBanner } from "@/features/cms/types"

const Banners = () => {
  const dispatch = useAppDispatch()
  const [page, setPage] = useState(1)
  const { data: banners, totalItems, meta } = useAppSelector((state) => state.banners)
  const { data: categories } = useAppSelector((state) => state.categories)

  const [title, setTitle] = useState("")
  const [image, setImage] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [sortOrder, setSortOrder] = useState("0")
  const [isActive, setIsActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    dispatch(fetchAllBanners({ page }))
    dispatch(fetchAllCategories({ page: 1, page_size: 1000 }))
  }, [dispatch, page])

  // Map category ID or slug to target_url
  const targetUrl = useMemo(() => {
    if (!selectedCategoryId) return "/products"
    const cat = categories.find((c) => c.id === selectedCategoryId)
    return cat ? `/category/${cat.slug || cat.id}` : `/category/${selectedCategoryId}`
  }, [selectedCategoryId, categories])

  const uploadedImages: UploadedImageItem[] = useMemo(() => {
    return image
      ? [
          {
            id: "banner-image-preview",
            url: image,
            alt: title || "Banner Image",
            isPrimary: true,
          },
        ]
      : []
  }, [image, title])

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a banner title")
      return
    }
    if (!image.trim()) {
      toast.error("Please upload or provide an image for the banner")
      return
    }

    setSubmitting(true)
    try {
      await dispatch(
        postData({
          payload: {
            title: title.trim(),
            image: image.trim(),
            target_url: targetUrl,
            sort_order: Number(sortOrder) || 0,
            is_active: isActive,
          },
        })
      ).unwrap()
      toast.success(`Banner "${title}" created successfully`)
      setTitle("")
      setImage("")
      setSelectedCategoryId("")
      setSortOrder("0")
      setIsActive(true)
    } catch {
      toast.error("Failed to create banner")
    } finally {
      setSubmitting(false)
    }
  }

  // Helper to resolve category name from target_url
  const getCategoryNameFromUrl = (url: string) => {
    if (!url) return "All Products"
    const match = url.match(/\/category\/(.+)/)
    if (match && match[1]) {
      const slugOrId = match[1]
      const found = categories.find((c) => c.slug === slugOrId || c.id === slugOrId)
      if (found) return found.name
      return slugOrId.charAt(0).toUpperCase() + slugOrId.slice(1).replace(/[-_]/g, " ")
    }
    return url === "/products" ? "All Products" : url
  }

  const columns: ColumnDef<HomepageBanner>[] = [
    {
      accessorKey: "image",
      header: "BANNER IMAGE",
      cell: ({ row }) => (
        <div className="relative h-12 w-24 overflow-hidden rounded-lg border border-border bg-muted">
          {row.getValue("image") ? (
            <img
              src={row.getValue("image")}
              alt={row.original.title || "Banner"}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageIcon className="h-5 w-5" />
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "BANNER TITLE",
      cell: ({ row }) => (
        <div>
          <span className="font-semibold text-foreground">{row.getValue("title")}</span>
        </div>
      ),
    },
    {
      accessorKey: "target_url",
      header: "TARGET CATEGORY",
      cell: ({ row }) => {
        const catName = getCategoryNameFromUrl(row.getValue("target_url"))
        return (
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-medium">
            <Tag className="h-3 w-3 mr-1" />
            {catName}
          </Badge>
        )
      },
    },
    {
      accessorKey: "sort_order",
      header: "SORT",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.getValue("sort_order")}</span>
      ),
    },
    {
      accessorKey: "is_active",
      header: "STATUS",
      cell: ({ row }) => {
        const active = row.getValue("is_active") as boolean
        return (
          <Badge
            variant="outline"
            className={
              active
                ? "bg-green-500/10 text-green-500 border-green-500/20"
                : "bg-red-500/10 text-red-500 border-red-500/20"
            }
          >
            {active ? "Active" : "Inactive"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "CREATED AT",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ]

  return (
    <div className="section-container space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Homepage Banners</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage featured storefront banners, targeted category links, and promotional campaigns
        </p>
      </div>

      {/* Add Banner Form Card */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Add Promotional Banner
          </CardTitle>
          <CardDescription>
            Upload a banner graphic and link it directly to a product category on the storefront
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="banner-title">Banner Title</FieldLabel>
              <FieldContent>
                <Input
                  id="banner-title"
                  placeholder="e.g. Summer Mega Sale - 40% Off"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </FieldContent>
            </Field>

            {/* Target Category Selector instead of raw URL */}
            <Field>
              <FieldLabel htmlFor="banner-category">Target Category</FieldLabel>
              <FieldContent>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger id="banner-category">
                    <SelectValue placeholder="Choose target category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products (Catalog Root)</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
          </div>

          {/* Image Uploader Component */}
          <Field>
            <FieldLabel>Banner Graphic Image</FieldLabel>
            <FieldContent>
              <ImageUploader
                singleMode
                images={uploadedImages}
                onImagesChange={(imgs) => {
                  setImage(imgs.length > 0 ? imgs[0].url : "")
                }}
                onAddImage={(url) => {
                  setImage(url)
                }}
                label="Upload Banner Graphic"
                description="Drag & drop your banner image file, browse from computer, or paste an image URL"
              />
            </FieldContent>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/50 items-center">
            <Field>
              <FieldLabel htmlFor="banner-sort">Display Sort Order</FieldLabel>
              <FieldContent>
                <Input
                  id="banner-sort"
                  type="number"
                  min="0"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  placeholder="0"
                  className="w-32"
                />
              </FieldContent>
            </Field>

            <Field orientation="horizontal" className="sm:justify-end">
              <FieldContent>
                <FieldLabel htmlFor="banner-active" className="cursor-pointer">
                  Active on Homepage
                </FieldLabel>
              </FieldContent>
              <Switch id="banner-active" checked={isActive} onCheckedChange={setIsActive} />
            </Field>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleCreate}
              disabled={submitting || !title.trim() || !image.trim()}
              size="lg"
              className="min-w-36"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <PlusIcon className="h-4 w-4 mr-2" />
              )}
              {submitting ? "Creating Banner..." : "Create Banner"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Banners List Table */}
      <DataTable
        columns={columns}
        data={banners}
        manualPagination
        pageIndex={page - 1}
        pageCount={meta?.totalPages ?? 1}
        totalCount={totalItems}
        onPageChange={(index) => setPage(index + 1)}
        minWidth="900px"
        columnWidths={["130px", "220px", "200px", "90px", "110px", "130px"]}
      />
    </div>
  )
}

export default Banners
