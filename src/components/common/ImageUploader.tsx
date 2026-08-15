import React, { useState, useRef, useCallback } from "react"
import { UploadCloud, Link as LinkIcon, X, Star, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface UploadedImageItem {
  id: string
  url: string
  alt: string
  isPrimary?: boolean
  file?: File
}

interface ImageUploaderProps {
  images?: UploadedImageItem[]
  onImagesChange?: (images: UploadedImageItem[]) => void
  onAddImage?: (imageUrl: string, altText: string, isPrimary?: boolean) => void
  singleMode?: boolean
  label?: string
  description?: string
  className?: string
}

export function ImageUploader({
  images = [],
  onImagesChange,
  onAddImage,
  singleMode = false,
  label = "Upload Images",
  description = "Drag & drop image files (PNG, JPG, WEBP, GIF, SVG) or paste a URL",
  className,
}: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload")
  const [urlInput, setUrlInput] = useState("")
  const [altInput, setAltInput] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      Array.from(files).forEach((file) => {
        if (!file.type.startsWith("image/")) return

        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          if (!result) return

          const newImage: UploadedImageItem = {
            id: crypto.randomUUID(),
            url: result,
            alt: file.name.replace(/\.[^/.]+$/, ""),
            isPrimary: images.length === 0,
            file,
          }

          if (onAddImage) {
            onAddImage(result, newImage.alt, newImage.isPrimary)
          }

          if (onImagesChange) {
            if (singleMode) {
              onImagesChange([newImage])
            } else {
              onImagesChange([...images, newImage])
            }
          }
        }
        reader.readAsDataURL(file)
      })
    },
    [images, onAddImage, onImagesChange, singleMode]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
      e.target.value = "" // Reset input
    }
  }

  const handleAddUrl = () => {
    if (!urlInput.trim()) return

    const newImage: UploadedImageItem = {
      id: crypto.randomUUID(),
      url: urlInput.trim(),
      alt: altInput.trim() || "Product Image",
      isPrimary: images.length === 0,
    }

    if (onAddImage) {
      onAddImage(newImage.url, newImage.alt, newImage.isPrimary)
    }

    if (onImagesChange) {
      if (singleMode) {
        onImagesChange([newImage])
      } else {
        onImagesChange([...images, newImage])
      }
    }

    setUrlInput("")
    setAltInput("")
  }

  const handleRemoveImage = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!onImagesChange) return
    const updated = images.filter((img) => img.id !== id)
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true
    }
    onImagesChange(updated)
  }

  const handleSetPrimary = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!onImagesChange) return
    const updated = images.map((img) => ({
      ...img,
      isPrimary: img.id === id,
    }))
    onImagesChange(updated)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-foreground">{label}</label>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>

        <div className="flex rounded-lg bg-muted p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all",
              activeTab === "upload"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all",
              activeTab === "url"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            Image URL
          </button>
        </div>
      </div>

      {activeTab === "upload" ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5 scale-[0.99]"
              : "border-border/80 hover:border-primary/50 hover:bg-muted/30 bg-card/50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={!singleMode}
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload-input"
          />

          <div className="rounded-full bg-primary/10 p-3 text-primary mb-3">
            <UploadCloud className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              <span className="text-primary hover:underline">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, JPEG, WEBP, GIF or SVG (max 10MB each)
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2 rounded-xl border border-border p-3 bg-card/50">
          <div className="relative flex-1">
            <Input
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <div className="relative sm:w-1/3">
            <Input
              placeholder="Alt text (optional)"
              value={altInput}
              onChange={(e) => setAltInput(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleAddUrl}
            disabled={!urlInput.trim()}
            className="h-9"
          >
            Add
          </Button>
        </div>
      )}

      {/* Image Previews Gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
          {images.map((img) => (
            <div
              key={img.id}
              className={cn(
                "group relative rounded-lg overflow-hidden border bg-muted aspect-square transition-all shadow-xs",
                img.isPrimary ? "ring-2 ring-primary border-primary" : "border-border hover:border-foreground/30"
              )}
            >
              <img
                src={img.url}
                alt={img.alt || "Uploaded image"}
                className="h-full w-full object-cover"
                onError={(e) => {
                  // Fallback icon if URL is broken
                  (e.target as HTMLElement).style.display = "none"
                }}
              />

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!singleMode && (
                  <button
                    type="button"
                    title={img.isPrimary ? "Primary image" : "Set as primary"}
                    onClick={(e) => handleSetPrimary(img.id, e)}
                    className={cn(
                      "rounded-full p-1.5 text-white transition-colors cursor-pointer",
                      img.isPrimary
                        ? "bg-amber-500 hover:bg-amber-600"
                        : "bg-black/60 hover:bg-black/90"
                    )}
                  >
                    <Star className={cn("h-3.5 w-3.5", img.isPrimary && "fill-current")} />
                  </button>
                )}

                <button
                  type="button"
                  title="Remove image"
                  onClick={(e) => handleRemoveImage(img.id, e)}
                  className="rounded-full bg-red-600/90 p-1.5 text-white hover:bg-red-700 transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {img.isPrimary && !singleMode && (
                <span className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-xs">
                  <Check className="h-2.5 w-2.5" /> Primary
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
