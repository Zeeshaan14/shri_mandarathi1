"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react"
import { useCartStore, useAuthStore } from "@/lib/store"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export function CartSidebar() {
  const { items, removeItem, updateQuantity, getTotalItems, getTotalPrice, clearCart, fetchCart, updateCartItemApi, removeCartItemApi, clearCartApi } =
    useCartStore()
  const { user, isAuthenticated } = useAuthStore()

  const handleDecrease = async (variantId: string, quantity: number) => {
    const item = items.find((i) => i.variantId === variantId)
    if (!item) return
    updateQuantity(variantId, Math.max(1, quantity))
    if (isAuthenticated && user?.id && item.id) {
      try {
        await updateCartItemApi(item.id, variantId, Math.max(1, quantity))
      } catch {}
    }
  }

  const handleIncrease = async (variantId: string, quantity: number) => {
    const item = items.find((i) => i.variantId === variantId)
    if (!item) return
    updateQuantity(variantId, quantity)
    if (isAuthenticated && user?.id && item.id) {
      try {
        await updateCartItemApi(item.id, variantId, quantity)
      } catch {}
    }
  }

  const handleRemove = async (variantId: string) => {
    const item = items.find((i) => i.variantId === variantId)
    removeItem(variantId)
    if (isAuthenticated && user?.id) {
      try {
        await removeCartItemApi(item?.id || "", variantId)
      } catch {}
    }
  }

  const handleClear = async () => {
    clearCart()
    if (isAuthenticated && user?.id) {
      try {
        await clearCartApi(user.id)
      } catch {}
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price)
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative bg-transparent">
          <ShoppingCart className="h-4 w-4" />
          {getTotalItems() > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {getTotalItems()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({getTotalItems()} items)</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.variantId} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <img
                      src={item.variant.imageUrl || "/placeholder.svg"}
                      alt={item.variant.product?.name}
                      className="h-16 w-16 object-contain rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.variant.product?.name}</h4>
                      <p className="text-sm text-gray-500">{item.variant.size}</p>
                      <p className="text-sm font-medium text-amber-600">{formatPrice(item.variant.price)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => handleDecrease(item.variantId, Math.max(1, item.quantity - 1))}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => handleIncrease(item.variantId, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 bg-transparent"
                        onClick={() => handleRemove(item.variantId)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-amber-600">{formatPrice(getTotalPrice())}</span>
                </div>

                <div className="space-y-2">
                  <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" onClick={clearCart}>
                    Clear Cart
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
