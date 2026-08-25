import { useEffect, useState, useMemo, useCallback } from "react"
import { toast } from "sonner"
import { PlusIcon, Image as ImageIcon, Sparkles, Loader2 } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { StatusBadge } from "@/components/common/StatusBadge"
import { Field, FieldLabel, FieldContent } from "@/components/ui/field"
import { DataTable } from "@/components/common/data-table"
import { ImageUploader, type UploadedImageItem } from "@/components/common/ImageUploader"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll, postData } from "@/features/cms/slices/blogPostSlice"
import type { BlogPost } from "@/features/cms/types"

const BlogPosts = () => {
  const dispatch = useAppDispatch()
  const [page, setPage] = useState(1)
  const { data: posts, totalItems, meta, isLoading, error } = useAppSelector((state) => state.blogPosts)

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [body, setBody] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const loadPosts = useCallback(() => {
    dispatch(fetchAll({ page }))
  }, [dispatch, page])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const uploadedImages: UploadedImageItem[] = useMemo(() => {
    return coverImage
      ? [
          {
            id: "blog-cover-preview",
            url: coverImage,
            alt: title || "Cover Image",
            isPrimary: true,
          },
        ]
      : []
  }, [coverImage, title])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTitle(val)
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""))
    }
  }

  const handleCreate = async () => {
    if (!title.trim() || !slug.trim() || !body.trim()) {
      toast.error("Please fill in title, slug, and content body")
      return
    }
    setSubmitting(true)
    try {
      await dispatch(
        postData({
          payload: {
            title: title.trim(),
            slug: slug.trim(),
            cover_image: coverImage.trim(),
            excerpt: excerpt.trim(),
            body: body.trim(),
            is_published: isPublished,
          },
        })
      ).unwrap()
      toast.success(`Post "${title}" created successfully`)
      setTitle("")
      setSlug("")
      setCoverImage("")
      setExcerpt("")
      setBody("")
      setIsPublished(false)
    } catch {
      toast.error("Failed to create blog post")
    } finally {
      setSubmitting(false)
    }
  }

  const columns: ColumnDef<BlogPost>[] = [
    {
      accessorKey: "cover_image",
      header: "COVER",
      cell: ({ row }) => (
        <div className="relative h-10 w-16 overflow-hidden rounded-md border border-border bg-muted">
          {row.getValue("cover_image") ? (
            <img
              src={row.getValue("cover_image")}
              alt={row.original.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "TITLE",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground">{row.getValue("title")}</span>
      ),
    },
    {
      accessorKey: "slug",
      header: "SLUG",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.getValue("slug")}</span>
      ),
    },
    {
      accessorKey: "is_published",
      header: "STATUS",
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("is_published") ? "published" : "draft"} />
      ),
    },
    {
      accessorKey: "created_at",
      header: "CREATED",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ]

  return (
    <div className="section-container space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Blog Posts</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Publish announcements, guides, and marketing articles with cover visuals to your storefront blog
        </p>
      </div>

      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Add Blog Post
          </CardTitle>
          <CardDescription>
            Compose a new blog article with cover graphic and SEO slug
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="post-title">Article Title</FieldLabel>
              <FieldContent>
                <Input
                  id="post-title"
                  placeholder="e.g. New Arrivals for Summer 2026"
                  value={title}
                  onChange={handleTitleChange}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="post-slug">URL Slug</FieldLabel>
              <FieldContent>
                <Input
                  id="post-slug"
                  placeholder="e.g. new-arrivals-summer-2026"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </FieldContent>
            </Field>
          </div>

          {/* Cover Image Uploader */}
          <Field>
            <FieldLabel>Article Cover Graphic</FieldLabel>
            <FieldContent>
              <ImageUploader
                singleMode
                images={uploadedImages}
                onImagesChange={(imgs) => {
                  setCoverImage(imgs.length > 0 ? imgs[0].url : "")
                }}
                onAddImage={(url) => {
                  setCoverImage(url)
                }}
                label="Upload Cover Image"
                description="Drag & drop your cover graphic, browse local files, or enter an image URL"
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="post-excerpt">Short Summary / Excerpt</FieldLabel>
            <FieldContent>
              <Textarea
                id="post-excerpt"
                rows={2}
                placeholder="A brief summary for previews and social sharing..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="post-body">Article Body</FieldLabel>
            <FieldContent>
              <Textarea
                id="post-body"
                rows={6}
                placeholder="Write the full post content here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </FieldContent>
          </Field>

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="post-published" className="cursor-pointer">
                  Publish Immediately
                </FieldLabel>
              </FieldContent>
              <Switch id="post-published" checked={isPublished} onCheckedChange={setIsPublished} />
            </Field>

            <Button
              onClick={handleCreate}
              disabled={submitting || !title.trim() || !slug.trim() || !body.trim()}
              size="lg"
              className="min-w-36"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <PlusIcon className="h-4 w-4 mr-2" />
              )}
              {submitting ? "Publishing..." : "Create Post"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={posts}
        isLoading={isLoading}
        error={error}
        onRetry={loadPosts}
        manualPagination
        pageIndex={page - 1}
        pageCount={meta?.totalPages ?? 1}
        totalCount={totalItems}
        onPageChange={(index) => setPage(index + 1)}
        minWidth="850px"
        columnWidths={["100px", "240px", "200px", "120px", "140px"]}
      />
    </div>
  )
}

export default BlogPosts
