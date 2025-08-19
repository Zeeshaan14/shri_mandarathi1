"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ShoppingCart, Truck, CreditCard, Phone, MapPin, User, Loader2 } from "lucide-react"
import { useCartStore, useAuthStore } from "@/lib/store"
import { AddressesApi, OrdersApi } from "@/lib/api"
import { toast } from "sonner"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart, clearCartApi } = useCartStore()
  const { isAuthenticated, user, token } = useAuthStore() as any
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [hasAddress, setHasAddress] = useState(false)
  const prefilledOnceRef = useRef(false)

  const [formData, setFormData] = useState({
    // Customer Info
    name: user?.name || "",
    email: user?.email || "",
    phone: "",

    // Shipping Address
    address: "",
    city: "",
    state: "Karnataka",
    pincode: "",
    landmark: "",

    // Order Notes
    notes: "",
  })

  useEffect(() => {
    if (items.length === 0) {
      router.push("/")
    }
  }, [items, router])

  // Prefill from saved default address if available
  useEffect(() => {
    const prefill = async () => {
      try {
        if (!isAuthenticated || !token) return
        const addresses: any[] = await AddressesApi.list(token)
        setHasAddress((addresses?.length || 0) > 0)
        if (prefilledOnceRef.current) return
        if (addresses && addresses.length > 0) {
          const def = addresses.find((a: any) => a.isDefault) || addresses[0]
          if (def) {
            setFormData((prev) => ({
              ...prev,
              name: def.fullName || user?.name || prev.name,
              email: user?.email || prev.email,
              phone: def.phone || prev.phone,
              address: def.line1 || prev.address,
              landmark: def.line2 || prev.landmark,
              city: def.city || prev.city,
              state: def.state || prev.state,
              pincode: def.postalCode || prev.pincode,
            }))
            prefilledOnceRef.current = true
          }
        }
      } catch {
        // ignore silently
      }
    }
    prefill()
  }, [isAuthenticated, token, user])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price)
  }

  const deliveryCharge = getTotalPrice() >= 500 ? 0 : 50
  const totalAmount = getTotalPrice() + deliveryCharge

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!agreeToTerms) {
      toast.error("Please accept the terms and conditions")
      return
    }

    setIsLoading(true)

    try {
      if (!isAuthenticated || !user?.id || !token) {
        toast.error("Please login to place order")
        return
      }

      // If this is the first time, save the entered address as default
      if (!hasAddress) {
        try {
          await AddressesApi.create(
            {
              fullName: formData.name,
              phone: formData.phone,
              line1: formData.address,
              line2: formData.landmark || "",
              city: formData.city,
              state: formData.state,
              postalCode: formData.pincode,
              country: "India",
              isDefault: true,
            },
            token,
          )
          setHasAddress(true)
        } catch {
          // do not block order on address save failure
        }
      }

      const payload = {
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        shipping: {
          fullName: formData.name,
          phone: formData.phone,
          line1: formData.address,
          line2: formData.landmark || "",
          city: formData.city,
          state: formData.state,
          postalCode: formData.pincode,
          country: "India",
        },
      }

      await OrdersApi.create(payload, token)

      // Clear server-side cart if user is authenticated
      try {
        if (isAuthenticated && user?.id && clearCartApi) {
          await clearCartApi(user.id)
        }
      } catch {}

      clearCart()
      toast.success("Order placed successfully!")
      router.push("/order-success")
    } catch (error) {
      toast.error("Failed to place order. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container px-4 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-amber-600 hover:text-amber-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Shop</span>
          </Link>
          <div className="flex items-center space-x-3">
            <img src="/sm-logo.jpeg" alt="SM Logo" className="h-12 w-auto rounded-lg" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
              <p className="text-gray-600">Complete your order</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-amber-600" />
                    <span>Customer Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 9876543210"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-amber-600" />
                    <span>Shipping Address</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="House/Flat No., Street Name, Area"
                      rows={2}
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="State"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">PIN Code *</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="576223"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="landmark">Landmark (Optional)</Label>
                    <Input
                      id="landmark"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      placeholder="Near temple, school, etc."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-amber-600" />
                    <span>Payment Method</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Cash on Delivery</p>
                            <p className="text-sm text-gray-500">Pay when you receive your order</p>
                          </div>
                          <Truck className="h-5 w-5 text-gray-400" />
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg opacity-50">
                      <RadioGroupItem value="online" id="online" disabled />
                      <Label htmlFor="online" className="flex-1 cursor-not-allowed">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Online Payment</p>
                            <p className="text-sm text-gray-500">Coming soon - UPI, Cards, Net Banking</p>
                          </div>
                          <CreditCard className="h-5 w-5 text-gray-400" />
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any special instructions for delivery..."
                    rows={3}
                  />
                </CardContent>
              </Card>

              {/*  and Conditions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-2">
                    <Checkbox id="terms" checked={agreeToTerms} onCheckedChange={(v) => setAgreeToTerms(Boolean(v))} />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      I agree to the{" "}
                      <Link href="/terms-of-service" className="text-amber-600 hover:text-amber-700">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <a href="/privacy-policy" className="text-blue-500 underline">
                        Privacy Policy
                      </a>
                      . I understand that this is a Cash on Delivery order and payment will be collected upon delivery.
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Place Order Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-amber-600 hover:bg-amber-700"
                disabled={isLoading || !agreeToTerms}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing Order...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Place Order - {formatPrice(totalAmount)}
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex items-center space-x-3">
                      <img
                        src={item.variant.imageUrl || "/placeholder.svg"}
                        alt={item.variant.product?.name}
                        className="h-12 w-12 object-contain rounded border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.variant.product?.name}</p>
                        <p className="text-xs text-gray-500">{item.variant.size}</p>
                        <p className="text-xs text-amber-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-sm">{formatPrice(item.variant.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Charges</span>
                    <span className={deliveryCharge === 0 ? "text-green-600" : ""}>
                      {deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}
                    </span>
                  </div>
                  {deliveryCharge === 0 && <p className="text-xs text-green-600">Free delivery on orders above ₹500</p>}
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-amber-600">{formatPrice(totalAmount)}</span>
                </div>

                {/* Delivery Info */}
                <div className="bg-amber-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm">
                    <Truck className="h-4 w-4 text-amber-600" />
                    <span className="font-medium">Estimated Delivery</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">2-3 business days</p>
                </div>

                {/* Contact Info */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Need Help?</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Call us at +91 9008496222</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
