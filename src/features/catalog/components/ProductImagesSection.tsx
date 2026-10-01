import { useMemo } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ImageUploader, type UploadedImageItem } from "@/components/common/ImageUploader"
import { useAppDispatch } from "@/app/hooks"
import {
  postData as postProductImage,
  deleteData as deleteProductImage,
} from "@/features/catalog/slices/productImageSlice"
import type { ProductImage } from "@/features/catalog/types"

interface ProductImagesSectionProps {
  isEditing: boolean
  /** Id of the saved product being edited; undefined while creating. */
  productId: string | undefined
  /** Saved images of the product being edited. */
  images: ProductImage[]
  draftImages: UploadedImageItem[]
  setDraftImages: React.Dispatch<React.SetStateAction<UploadedImageItem[]>>
}

export function ProductImagesSection({
  isEditing,
  productId,
  images,
  draftImages,
  setDraftImages,
}: ProductImagesSectionProps) {
  const dispatch = useAppDispatch()

  // Computed display images for existing vs new
  const uploadedImageItems: UploadedImageItem[] = useMemo(() => {
    if (isEditing) {
      return images.map((img) => ({
        id: img.id,
        url: img.image,
        alt: img.alt_text,
        isPrimary: img.is_primary,
      }))
    }
    return draftImages
  }, [isEditing, images, draftImages])

  // --- Image Upload Handlers ---
  const handleAddImage = async (imageUrl: string, altText: string, isPrimary?: boolean) => {
    if (!isEditing) {
      setDraftImages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          url: imageUrl,
          alt: altText || "Product Image",
          isPrimary: isPrimary ?? prev.length === 0,
        },
      ])
      return
    }

    if (!productId) return
    try {
      await dispatch(
        postProductImage({
          payload: {
            product: productId,
            image: imageUrl,
            alt_text: altText,
            sort_order: images.length,
            is_primary: isPrimary ?? images.length === 0,
          },
        })
      ).unwrap()
      toast.success("Image uploaded successfully")
    } catch {
      toast.error("Failed to upload image")
    }
  }

  const handleImagesChange = (updatedList: UploadedImageItem[]) => {
    if (!isEditing) {
      setDraftImages(updatedList)
    } else {
      const currentIds = updatedList.map((i) => i.id)
      const removed = images.filter((img) => !currentIds.includes(img.id))
      removed.forEach((img) => {
        dispatch(deleteProductImage(img.id))
          .unwrap()
          .catch(() => toast.error("Failed to remove image"))
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle level={2}>Product Images</CardTitle>
        <CardDescription>
          Upload media files directly from your computer or provide URLs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ImageUploader
          images={uploadedImageItems}
          onImagesChange={handleImagesChange}
          onAddImage={handleAddImage}
          label="Upload Product Images"
          description="Drag & drop product images, or click to browse from your device"
        />
      </CardContent>
    </Card>
  )
}
