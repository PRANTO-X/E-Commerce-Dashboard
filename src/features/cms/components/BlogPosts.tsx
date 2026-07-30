import { useEffect, useState } from "react"
import { toast } from "sonner"
import { PlusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Field, FieldLabel, FieldContent } from "@/components/ui/field"
import { DataTable } from "@/components/common/data-table"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll, postData } from "@/features/cms/slices/blogPostSlice"
import type { BlogPost } from "@/features/cms/types"

const BlogPosts = () => {
  const dispatch = useAppDispatch()
  const [page, setPage] = useState(1)
  const { data: posts, totalItems, meta } = useAppSelector((state) => state.blogPosts)

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [body, setBody] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    dispatch(fetchAll({ page }))
  }, [dispatch, page])

  const handleCreate = async () => {
    if (!title.trim() || !slug.trim() || !body.trim()) return
    setSubmitting(true)
    try {
      await dispatch(
        postData({
          payload: {
            title: title.trim(),
            slug: slug.trim(),
            excerpt: excerpt.trim(),
            body: body.trim(),
            is_published: isPublished,
          },
        })
      ).unwrap()
      toast.success(`${title} created`)
      setTitle("")
      setSlug("")
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
    { accessorKey: "title", header: "TITLE" },
    { accessorKey: "slug", header: "SLUG" },
    {
      accessorKey: "is_published",
      header: "STATUS",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            row.getValue("is_published")
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
          }`}
        >
          {row.getValue("is_published") ? "published" : "draft"}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "CREATED",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.getValue("created_at")).toLocaleDateString()}
        </span>
      ),
    },
  ]

  return (
    <div className="section-container">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Blog Posts</h1>
        <p className="font-text text-accent-foreground text-sm mt-1">
          Publish articles and announcements to your storefront blog
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Blog Post</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="post-title">Title</FieldLabel>
            <FieldContent>
              <Input id="post-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="post-slug">Slug</FieldLabel>
            <FieldContent>
              <Input id="post-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
            </FieldContent>
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="post-excerpt">Excerpt</FieldLabel>
            <FieldContent>
              <Textarea id="post-excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
            </FieldContent>
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="post-body">Body</FieldLabel>
            <FieldContent>
              <Textarea id="post-body" rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
            </FieldContent>
          </Field>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="post-published">Published</FieldLabel>
            </FieldContent>
            <Switch id="post-published" checked={isPublished} onCheckedChange={setIsPublished} />
          </Field>
        </CardContent>
        <CardContent className="pt-0">
          <Button onClick={handleCreate} disabled={submitting || !title.trim() || !slug.trim() || !body.trim()}>
            <PlusIcon className="h-4 w-4" />
            Create Post
          </Button>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={posts}
        manualPagination
        pageIndex={page - 1}
        pageCount={meta?.totalPages ?? 1}
        totalCount={totalItems}
        onPageChange={(index) => setPage(index + 1)}
        columnWidths={["240px", "180px", "120px", "140px"]}
      />
    </div>
  )
}

export default BlogPosts
