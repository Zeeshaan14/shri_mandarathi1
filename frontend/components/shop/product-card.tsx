"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Star, Plus, Minus } from "lucide-react"
import type { Product, ProductVariant } from "@/lib/types"
import { useCartStore, useAuthStore } from "@/lib/store"
import { useState } from "react"
import { toast } from "sonner"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(product.variations[0] || null)
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)
  const addToCartApi = useCartStore((state) => state.addToCartApi)
  const { user, isAuthenticated } = useAuthStore()

  const handleAddToCart = async () => {
    if (!selectedVariant) return
    // Update local store immediately for snappy UX
    addItem({ variantId: selectedVariant.id, variant: selectedVariant, quantity })
    // If authenticated, sync with backend cart
    if (isAuthenticated && user?.id) {
      try {
        await addToCartApi(user.id, selectedVariant.id, quantity)
      } catch (e) {
        // rollback not implemented; fetchCart on next open ensures consistency
        console.error("Failed to sync cart", e)
      }
    }
    toast.success(`Added ${product.name} (${selectedVariant.size}) to cart!`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price)
  }

  const incrementQuantity = () => {
    if (selectedVariant && quantity < selectedVariant.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <CardHeader className="p-0">
        <div className="aspect-square bg-gradient-to-br from-amber-50 to-orange-50 relative overflow-hidden">
          <img
            src={selectedVariant?.imageUrl || product.imageUrl || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-contain p-6 hover:scale-105 transition-transform duration-300"
          />
          {selectedVariant && selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Only {selectedVariant.stock} left
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          {/* Product Name and Description */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2">{product.name}</h3>
            {product.description && (
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{product.description}</p>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-sm text-gray-500 ml-2">(4.8)</span>
          </div>

          {/* Size Selection */}
          {product.variations.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Size:</label>
              <Select
                value={selectedVariant?.id}
                onValueChange={(value) => {
                  const variant = product.variations.find((v) => v.id === value)
                  setSelectedVariant(variant || null)
                  setQuantity(1) // Reset quantity when variant changes
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {product.variations.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      <div className="flex justify-between items-center w-full">
                        <span>{variant.size}</span>
                        <span className="ml-4 font-medium">{formatPrice(variant.price)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Price and Stock */}
          {selectedVariant && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-2xl font-bold text-amber-600">{formatPrice(selectedVariant.price)}</span>
                  <div className="text-sm text-gray-500">
                    {selectedVariant.sku && <span>SKU: {selectedVariant.sku}</span>}
                  </div>
                </div>
                <Badge variant={selectedVariant.stock > 0 ? "default" : "destructive"} className="shrink-0">
                  {selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : "Out of Stock"}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto">
        <div className="w-full space-y-3">
          {/* Quantity Selector */}
          <div className="flex items-center justify-center space-x-3">
            <span className="text-sm font-medium text-gray-700">Qty:</span>
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none"
                onClick={incrementQuantity}
                disabled={!selectedVariant || quantity >= selectedVariant.stock}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stock === 0}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
            size="lg"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {selectedVariant?.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>

          {/* Total Price Preview */}
          {selectedVariant && quantity > 1 && (
            <div className="text-center text-sm text-gray-600">
              Total:{" "}
              <span className="font-semibold text-amber-600">{formatPrice(selectedVariant.price * quantity)}</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
