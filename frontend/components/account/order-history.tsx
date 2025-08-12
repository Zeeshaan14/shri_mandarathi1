"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Search, Package, Calendar, MapPin, Phone, User } from "lucide-react"
import { OrdersApi } from "@/lib/api"
import { useAuthStore } from "@/lib/store"

interface Order {
  id: string
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  total: number
  createdAt: string
  updatedAt: string
  items: Array<{
    id: string
    quantity: number
    price: number
    variant: {
      id: string
      size: string
      product: {
        name: string
        imageUrl?: string
      }
    }
  }>
  shippingFullName?: string
  shippingPhone?: string
  shippingLine1?: string
  shippingLine2?: string
  shippingCity?: string
  shippingState?: string
  shippingPostalCode?: string
  shippingCountry?: string
}

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const token = useAuthStore((s) => s.token)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const apiOrders: any[] = await OrdersApi.list(token || undefined)
        const normalized: Order[] = (apiOrders || []).map((o) => ({
          id: o.id,
          status: o.status,
          total: typeof o.total === "string" ? Number(o.total) : o.total,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
          items: (o.items || []).map((it: any) => ({
            id: it.id,
            quantity: it.quantity,
            price: typeof it.price === "string" ? Number(it.price) : it.price,
            variant: {
              id: it.variant.id,
              size: it.variant.size,
              product: {
                name: it.variant.product?.name || "",
                imageUrl: it.variant.product?.imageUrl,
              },
            },
          })),
          shippingFullName: o.shippingFullName,
          shippingPhone: o.shippingPhone,
          shippingLine1: o.shippingLine1,
          shippingLine2: o.shippingLine2,
          shippingCity: o.shippingCity,
          shippingState: o.shippingState,
          shippingPostalCode: o.shippingPostalCode,
          shippingCountry: o.shippingCountry,
        }))
        setOrders(normalized)
        setFilteredOrders(normalized)
      } catch (e) {
        setOrders([])
        setFilteredOrders([])
      }
    }
    fetchOrders()
  }, [token])

  useEffect(() => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items.some((item) => item.variant.product.name.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800"
      case "SHIPPED":
        return "bg-blue-100 text-blue-800"
      case "PAID":
        return "bg-yellow-100 text-yellow-800"
      case "PENDING":
        return "bg-gray-100 text-gray-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusProgress = (status: string) => {
    switch (status) {
      case "PENDING":
        return 25
      case "PAID":
        return 50
      case "SHIPPED":
        return 75
      case "DELIVERED":
        return 100
      case "CANCELLED":
        return 0
      default:
        return 0
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>Track and manage all your orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search orders or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-lg">Order {order.id}</h3>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Ordered: {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Package className="h-4 w-4" />
                            {order.items.length} item{order.items.length > 1 ? "s" : ""}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                              <img
                                src={item.variant.product.imageUrl || "/placeholder.svg"}
                                alt={item.variant.product.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                              <span className="text-sm">
                                {item.quantity}x {item.variant.product.name} ({item.variant.size})
                              </span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="flex items-center justify-center bg-gray-100 rounded-lg p-2 text-sm text-gray-600">
                              +{order.items.length - 3} more
                            </div>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Order Progress</span>
                            <span>{getStatusProgress(order.status)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${getStatusProgress(order.status)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-bold">₹{order.total.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">Total Amount</div>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => setSelectedOrder(order)}>
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Order Details - {order.id}</DialogTitle>
                              <DialogDescription>Complete information about your order</DialogDescription>
                            </DialogHeader>

                            {selectedOrder && (
                              <div className="space-y-6">
                                {/* Order Status */}
                                <div>
                                  <h4 className="font-semibold mb-2">Order Status</h4>
                                  <div className="flex items-center gap-3">
                                    <Badge className={getStatusColor(selectedOrder.status)}>
                                      {selectedOrder.status}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      Last updated: {new Date(selectedOrder.updatedAt).toLocaleString()}
                                    </span>
                                  </div>
                                </div>

                                <Separator />

                                {/* Order Items */}
                                <div>
                                  <h4 className="font-semibold mb-3">Order Items</h4>
                                  <div className="space-y-3">
                                    {selectedOrder.items.map((item) => (
                                      <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                                        <img
                                          src={item.variant.product.imageUrl || "/placeholder.svg"}
                                          alt={item.variant.product.name}
                                          className="w-16 h-16 rounded object-cover"
                                        />
                                        <div className="flex-1">
                                          <h5 className="font-medium">{item.variant.product.name}</h5>
                                          <p className="text-sm text-muted-foreground">Size: {item.variant.size}</p>
                                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-semibold">₹{item.price.toFixed(2)}</div>
                                          <div className="text-sm text-muted-foreground">
                                            ₹{(item.price / item.quantity).toFixed(2)} each
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <Separator />

                                {/* Shipping Address */}
                                <div>
                                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Shipping Address
                                  </h4>
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      <User className="h-4 w-4" />
                                      <span className="font-medium">{selectedOrder.shippingFullName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Phone className="h-4 w-4" />
                                      <span>{selectedOrder.shippingPhone}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      <p>{selectedOrder.shippingLine1}</p>
                                      {selectedOrder.shippingLine2 && <p>{selectedOrder.shippingLine2}</p>}
                                      <p>
                                        {selectedOrder.shippingCity}, {selectedOrder.shippingState}{" "}
                                        {selectedOrder.shippingPostalCode}
                                      </p>
                                      <p>{selectedOrder.shippingCountry}</p>
                                    </div>
                                  </div>
                                </div>

                                <Separator />

                                {/* Order Summary */}
                                <div>
                                  <h4 className="font-semibold mb-3">Order Summary</h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span>Subtotal</span>
                                      <span>₹{selectedOrder.total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Shipping</span>
                                      <span>Free</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-semibold text-lg">
                                      <span>Total</span>
                                      <span>₹{selectedOrder.total.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
