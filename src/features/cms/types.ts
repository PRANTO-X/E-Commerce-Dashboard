// Hand-transcribed from the OpenAPI schema (HomepageBanner/BlogPost/ContentPage).
// Banners and blog posts only support list+create (no per-id endpoints); pages have full CRUD.

export interface HomepageBanner {
  id: string
  title: string
  image: string
  target_url: string
  starts_at: string | null
  ends_at: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  body: string
  cover_image: string
  is_published: boolean
  published_at: string | null
  author: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type PageType = "landing" | "brand" | "static"

export interface ContentPage {
  id: string
  title: string
  slug: string
  page_type: PageType
  body: string
  hero_image: string
  is_published: boolean
  published_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}
