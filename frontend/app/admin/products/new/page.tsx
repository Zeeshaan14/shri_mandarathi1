"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuthStore } from "@/lib/store"
import { ProductsApi } from "@/lib/api"
import type { Category } from "@/lib/types"

export default function NewProductPage() {
  const router = useRouter()
  const { token } = useAuthStore()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [variations, setVariations] = useState<Array<{ size: string; price: string; stock: string; sku?: string }>>([
    { size: "250ml", price: "0", stock: "0" },
  ])

  const handleAddVariation = () => setVariations((v) => [...v, { size: "", price: "", stock: "" }])
  const handleRemoveVariation = (idx: number) => setVariations((v) => v.filter((_, i) => i !== idx))
  const handleVarChange = (idx: number, key: string, value: string) =>
    setVariations((v) => v.map((it, i) => (i === idx ? { ...it, [key]: value } : it)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setIsSubmitting(true)
    try {
      const form = new FormData()
      form.append("name", name)
      form.append("description", description)
      form.append("categoryId", categoryId)
      // variations as JSON string that backend can parse
      form.append("variations", JSON.stringify(
        variations.map((v) => ({
          size: v.size,
          price: Number(v.price),
          stock: Number(v.stock),
          sku: v.sku || null,
        }))
      ))
      if (imageFile) form.append("image", imageFile)

      await ProductsApi.createMultipart(form, token || undefined)
      router.push("/")
    } catch (err) {
      console.error(err)
      alert("Failed to create product")
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await ProductsApi.categories()
        setCategories(cats || [])
        if (!categoryId && cats?.length) setCategoryId(cats[0].id)
      } catch (e) {
        console.error("Failed to load categories", e)
      }
    }
    loadCategories()
  }, [])

  return (
    <div className="container max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Variations</Label>
                <Button type="button" variant="outline" onClick={handleAddVariation}>Add</Button>
              </div>
              {variations.map((v, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-3 items-end">
                  <div>
                    <Label>Size</Label>
                    <Input value={v.size} onChange={(e) => handleVarChange(idx, "size", e.target.value)} />
                  </div>
                  <div>
                    <Label>Price</Label>
                    <Input type="number" step="0.01" value={v.price} onChange={(e) => handleVarChange(idx, "price", e.target.value)} />
                  </div>
                  <div>
                    <Label>Stock</Label>
                    <Input type="number" value={v.stock} onChange={(e) => handleVarChange(idx, "stock", e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="destructive" onClick={() => handleRemoveVariation(idx)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>

            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Create Product"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


