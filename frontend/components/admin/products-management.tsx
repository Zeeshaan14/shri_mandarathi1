"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Search, Package, Eye, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import type { Product, Category } from "@/lib/types"
import { ProductsApi } from "@/lib/api"
import { useAuthStore } from "@/lib/store"

export function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    imageUrl: "",
    variations: [
      {
        size: "",
        price: "",
        stock: "",
        sku: "",
        imageUrl: "",
      },
    ],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([ProductsApi.list(), ProductsApi.categories()])
      setProducts(productsData || [])
      setCategories(categoriesData || [])
    } catch (error) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const token = useAuthStore((state) => state.token)

  const handleAddProduct = async () => {
    try {
      // Convert price and stock to numbers for each variation
      const variations = productForm.variations.map((v) => ({
        ...v,
        price: parseFloat(v.price),
        stock: parseInt(v.stock, 10),
      }))
      await ProductsApi.addProduct({
        name: productForm.name,
        description: productForm.description,
        categoryId: productForm.categoryId,
        imageUrl: productForm.imageUrl,
        variations,
      }, token || undefined)
      toast.success("Product added successfully!")
      setIsAddDialogOpen(false)
      resetForm()
      loadData()
    } catch (error: any) {
      toast.error(error?.message || "Failed to add product")
    }
  }

  const handleEditProduct = async () => {
    if (!editingProduct) return
    try {
      const variations = productForm.variations.map((v) => ({
        ...v,
        price: parseFloat(v.price),
        stock: parseInt(v.stock, 10),
      }))
      await ProductsApi.updateProduct(editingProduct.id, {
        name: productForm.name,
        description: productForm.description,
        categoryId: productForm.categoryId,
        imageUrl: productForm.imageUrl,
        variations,
      }, token || undefined)
      toast.success("Product updated successfully!")
      setIsEditDialogOpen(false)
      setEditingProduct(null)
      resetForm()
      loadData()
    } catch (error: any) {
      toast.error(error?.message || "Failed to update product")
    }
  }

  // When opening edit dialog, prefill form
  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description || "",
      categoryId: product.categoryId,
      imageUrl: product.imageUrl || "",
      variations: product.variations.map((v) => ({
        size: v.size,
        price: v.price.toString(),
        stock: v.stock.toString(),
        sku: v.sku || "",
        imageUrl: v.imageUrl || "",
      })),
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      await ProductsApi.deleteProduct(productId, token || undefined)
      toast.success("Product deleted successfully!")
      loadData()
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete product")
    }
  }

  const resetForm = () => {
    setProductForm({
      name: "",
      description: "",
      categoryId: "",
      imageUrl: "",
      variations: [
        {
          size: "",
          price: "",
          stock: "",
          sku: "",
          imageUrl: "",
        },
      ],
    })
  }

  const addVariation = () => {
    setProductForm({
      ...productForm,
      variations: [
        ...productForm.variations,
        {
          size: "",
          price: "",
          stock: "",
          sku: "",
          imageUrl: "",
        },
      ],
    })
  }

  const removeVariation = (index: number) => {
    if (productForm.variations.length > 1) {
      setProductForm({
        ...productForm,
        variations: productForm.variations.filter((_, i) => i !== index),
      })
    }
  }

  const updateVariation = (index: number, field: string, value: string) => {
    const updatedVariations = productForm.variations.map((variation, i) =>
      i === index ? { ...variation, [field]: value } : variation,
    )
    setProductForm({
      ...productForm,
      variations: updatedVariations,
    })
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
          <p className="text-gray-600">Manage your product catalog and inventory</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={productForm.categoryId}
                    onValueChange={(value) => setProductForm({ ...productForm, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Product Image URL</Label>
                <Input
                  id="imageUrl"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  placeholder="Enter image URL"
                />
              </div>

              {/* Variations */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Product Variations</Label>
                  <Button type="button" variant="outline" onClick={addVariation}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variation
                  </Button>
                </div>

                {productForm.variations.map((variation, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Variation {index + 1}</CardTitle>
                        {productForm.variations.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeVariation(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Size *</Label>
                          <Input
                            value={variation.size}
                            onChange={(e) => updateVariation(index, "size", e.target.value)}
                            placeholder="e.g., 250ml, 500ml, 1L"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Price (₹) *</Label>
                          <Input
                            type="number"
                            value={variation.price}
                            onChange={(e) => updateVariation(index, "price", e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Stock Quantity *</Label>
                          <Input
                            type="number"
                            value={variation.stock}
                            onChange={(e) => updateVariation(index, "stock", e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>SKU</Label>
                          <Input
                            value={variation.sku}
                            onChange={(e) => updateVariation(index, "sku", e.target.value)}
                            placeholder="Product SKU"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Variation Image URL</Label>
                        <Input
                          value={variation.imageUrl}
                          onChange={(e) => updateVariation(index, "imageUrl", e.target.value)}
                          placeholder="Enter variation image URL"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddProduct} className="bg-amber-600 hover:bg-amber-700">
                  Add Product
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Variations</TableHead>
                  <TableHead>Stock Status</TableHead>
                  <TableHead>Price Range</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const minPrice = Math.min(...product.variations.map((v) => v.price))
                  const maxPrice = Math.max(...product.variations.map((v) => v.price))
                  const totalStock = product.variations.reduce((sum, v) => sum + v.stock, 0)
                  const lowStockVariations = product.variations.filter((v) => v.stock <= 5)

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.imageUrl || "/placeholder.svg"}
                            alt={product.name}
                            className="h-12 w-12 object-contain rounded border"
                          />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{categories.find((c) => c.id === product.categoryId)?.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {product.variations.map((variation, index) => (
                            <div key={index} className="text-sm">
                              {variation.size} - {formatPrice(variation.price)}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{totalStock} total</span>
                            {lowStockVariations.length > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Low Stock
                              </Badge>
                            )}
                          </div>
                          {lowStockVariations.length > 0 && (
                            <div className="text-xs text-red-600">
                              {lowStockVariations.map((v) => `${v.size}: ${v.stock}`).join(", ")}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {minPrice === maxPrice
                          ? formatPrice(minPrice)
                          : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setViewingProduct(product)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
      {/* View Product Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {viewingProduct && (
            <div className="space-y-6">
              <div className="flex gap-6">
                <img
                  src={viewingProduct.imageUrl || "/placeholder.svg"}
                  alt={viewingProduct.name}
                  className="h-32 w-32 object-contain rounded border"
                />
                <div>
                  <h3 className="text-xl font-bold">{viewingProduct.name}</h3>
                  <p className="text-gray-600 mb-2">{viewingProduct.description}</p>
                  <Badge variant="outline">
                    {categories.find((c) => c.id === viewingProduct.categoryId)?.name}
                  </Badge>
                  <div className="text-xs text-gray-400 mt-2">
                    Created: {new Date(viewingProduct.createdAt).toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-gray-400">
                    Updated: {new Date(viewingProduct.updatedAt).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Variations</h4>
                <div className="space-y-2">
                  {viewingProduct.variations.map((v, i) => (
                    <div key={i} className="border rounded p-2 flex gap-4 items-center">
                      <div className="flex-1">
                        <div className="font-medium">{v.size}</div>
                        <div className="text-sm text-gray-500">Price: {formatPrice(v.price)}</div>
                        <div className="text-sm text-gray-500">Stock: {v.stock}</div>
                        {v.sku && <div className="text-xs text-gray-400">SKU: {v.sku}</div>}
                      </div>
                      {v.imageUrl && (
                        <img src={v.imageUrl} alt={v.size} className="h-12 w-12 object-contain rounded border" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input
                  id="edit-name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select
                  value={productForm.categoryId}
                  onValueChange={(value) => setProductForm({ ...productForm, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-imageUrl">Product Image URL</Label>
              <Input
                id="edit-imageUrl"
                value={productForm.imageUrl}
                onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                placeholder="Enter image URL"
              />
            </div>

            {/* Variations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Product Variations</Label>
                <Button type="button" variant="outline" onClick={addVariation}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variation
                </Button>
              </div>

              {productForm.variations.map((variation, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Variation {index + 1}</CardTitle>
                      {productForm.variations.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeVariation(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Size *</Label>
                        <Input
                          value={variation.size}
                          onChange={(e) => updateVariation(index, "size", e.target.value)}
                          placeholder="e.g., 250ml, 500ml, 1L"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Price (₹) *</Label>
                        <Input
                          type="number"
                          value={variation.price}
                          onChange={(e) => updateVariation(index, "price", e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Stock Quantity *</Label>
                        <Input
                          type="number"
                          value={variation.stock}
                          onChange={(e) => updateVariation(index, "stock", e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>SKU</Label>
                        <Input
                          value={variation.sku}
                          onChange={(e) => updateVariation(index, "sku", e.target.value)}
                          placeholder="Product SKU"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Variation Image URL</Label>
                      <Input
                        value={variation.imageUrl}
                        onChange={(e) => updateVariation(index, "imageUrl", e.target.value)}
                        placeholder="Enter variation image URL"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditProduct} className="bg-amber-600 hover:bg-amber-700">
                Update Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
