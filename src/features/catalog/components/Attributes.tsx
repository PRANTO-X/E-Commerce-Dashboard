import { useEffect, useState } from "react"
import { toast } from "sonner"
import { PlusIcon, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHeading } from "@/components/common/PageHeading"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  fetchAll as fetchAllAttributes,
  postData as postAttribute,
  deleteData as deleteAttribute,
} from "@/features/catalog/slices/attributeSlice"
import {
  fetchAll as fetchAllAttributeValues,
  postData as postAttributeValue,
  deleteData as deleteAttributeValue,
} from "@/features/catalog/slices/attributeValueSlice"

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const Attributes = () => {
  const dispatch = useAppDispatch()
  const { data: attributes } = useAppSelector((state) => state.attributes)
  const { data: attributeValues } = useAppSelector((state) => state.attributeValues)

  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(null)
  const [newAttributeName, setNewAttributeName] = useState("")
  const [newValue, setNewValue] = useState("")

  useEffect(() => {
    dispatch(fetchAllAttributes({ page: 1, page_size: 100 }))
    dispatch(fetchAllAttributeValues({ page: 1, page_size: 100 }))
  }, [dispatch])

  // Default-select the first attribute once loaded, derived during render rather than an effect.
  if (!selectedAttributeId && attributes.length > 0) {
    setSelectedAttributeId(attributes[0].id)
  }

  const selectedAttribute = attributes.find((a) => a.id === selectedAttributeId)
  const valuesForSelected = attributeValues.filter((v) => v.attribute === selectedAttributeId)

  const handleAddAttribute = async () => {
    const name = newAttributeName.trim()
    if (!name) return
    try {
      const created = await dispatch(
        postAttribute({ payload: { name, slug: slugify(name) } })
      ).unwrap()
      setNewAttributeName("")
      setSelectedAttributeId(created.id)
      toast.success(`${name} attribute created`)
    } catch {
      toast.error("Failed to create attribute")
    }
  }

  const handleDeleteAttribute = async (id: string, name: string) => {
    try {
      await dispatch(deleteAttribute(id)).unwrap()
      if (selectedAttributeId === id) setSelectedAttributeId(null)
      toast.success(`${name} deleted`)
    } catch {
      toast.error("Failed to delete attribute")
    }
  }

  const handleAddValue = async () => {
    const value = newValue.trim()
    if (!value || !selectedAttributeId) return
    try {
      await dispatch(
        postAttributeValue({
          payload: { attribute: selectedAttributeId, value, slug: slugify(value) },
        })
      ).unwrap()
      setNewValue("")
      toast.success(`${value} added`)
    } catch {
      toast.error("Failed to add value")
    }
  }

  const handleDeleteValue = async (id: string, value: string) => {
    try {
      await dispatch(deleteAttributeValue(id)).unwrap()
      toast.success(`${value} removed`)
    } catch {
      toast.error("Failed to remove value")
    }
  }

  return (
    <div className="section-container">
      <PageHeading
        title="Attributes"
        description="Define variant attributes (e.g. Color, Size) and their possible values"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Attributes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Color"
                value={newAttributeName}
                onChange={(e) => setNewAttributeName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddAttribute()}
              />
              <Button type="button" size="icon" onClick={handleAddAttribute} disabled={!newAttributeName.trim()}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col gap-1">
              {attributes.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">No attributes yet.</p>
              )}
              {attributes.map((attr) => (
                <div
                  key={attr.id}
                  onClick={() => setSelectedAttributeId(attr.id)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${
                    selectedAttributeId === attr.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"
                  }`}
                >
                  <span>{attr.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteAttribute(attr.id, attr.name)
                    }}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedAttribute ? `Values for "${selectedAttribute.name}"` : "Select an attribute"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {selectedAttribute ? (
              <>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Red"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddValue()}
                  />
                  <Button type="button" onClick={handleAddValue} disabled={!newValue.trim()}>
                    <PlusIcon className="h-4 w-4" />
                    Add Value
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {valuesForSelected.length === 0 && (
                    <p className="text-sm text-muted-foreground py-4">No values yet.</p>
                  )}
                  {valuesForSelected.map((val) => (
                    <Badge key={val.id} variant="outline" className="gap-2 py-1.5 px-3">
                      {val.value}
                      <button
                        type="button"
                        onClick={() => handleDeleteValue(val.id, val.value)}
                        className="text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Create or select an attribute to manage its values.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Attributes
