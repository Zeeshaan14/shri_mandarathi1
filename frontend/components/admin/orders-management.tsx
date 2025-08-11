"use client"

import { useState, useEffect } from "react"
import { OrdersApi } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  ShoppingCart,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  MapPin,
  User,
} from "lucide-react"
import { toast } from "sonner"

interface Order {
  id: string
  userId: string
  user: {
    name: string
    email: string
    phone?: string
  }
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  total: number
  createdAt: string
  items: Array<{
    id: string
    quantity: number
    price: number
    variant: {
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

export function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const token = useAuthStore.getState().token;
        const orders = await OrdersApi.list(token || undefined);
        setOrders(orders);
      } catch (error) {
        toast.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const token = useAuthStore.getState().token;
      await OrdersApi.updateStatus(orderId, newStatus, token || undefined);
      setOrders(orders => orders.map(order => order.id === orderId ? { ...order, status: newStatus as any } : order));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error: any) {
      toast.error("Failed to update order status");
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />
      case "PAID":
        return <CheckCircle className="h-4 w-4" />
      case "SHIPPED":
        return <Truck className="h-4 w-4" />
      case "DELIVERED":
        return <Package className="h-4 w-4" />
      case "CANCELLED":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "PAID":
        return "bg-blue-100 text-blue-800"
      case "SHIPPED":
        return "bg-purple-100 text-purple-800"
      case "DELIVERED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
          <p className="text-gray-600">Track and manage customer orders</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { status: "PENDING", count: orders.filter((o) => o.status === "PENDING").length, color: "text-yellow-600" },
          { status: "PAID", count: orders.filter((o) => o.status === "PAID").length, color: "text-blue-600" },
          { status: "SHIPPED", count: orders.filter((o) => o.status === "SHIPPED").length, color: "text-purple-600" },
          {
            status: "DELIVERED",
            count: orders.filter((o) => o.status === "DELIVERED").length,
            color: "text-green-600",
          },
          { status: "CANCELLED", count: orders.filter((o) => o.status === "CANCELLED").length, color: "text-red-600" },
        ].map((stat) => (
          <Card key={stat.status}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.status}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                </div>
                <div className={stat.color}>{getStatusIcon(stat.status)}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders by ID, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-mono text-sm">#{order.id.slice(-8).toUpperCase()}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {order.user ? (
                          <>
                            <p className="font-medium">{order.user.name}</p>
                            <p className="text-sm text-gray-500">{order.user.email}</p>
                          </>
                        ) : (
                          <span className="text-red-500 text-xs">No user info</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item, index) => (
                          <div key={index} className="text-sm">
                            {item.variant.product ? (
                              <>
                                {item.quantity}x {item.variant.product.name} ({item.variant.size})
                              </>
                            ) : (
                              <span className="text-red-500 text-xs">No product info</span>
                            )}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-sm text-gray-500">+{order.items.length - 2} more items</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{formatPrice(order.total)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatDate(order.createdAt)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Order Details - #{order.id.slice(-8).toUpperCase()}</DialogTitle>
                            </DialogHeader>
                            {selectedOrder && (
                              <div className="space-y-6">
                                {/* Order Status Update */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Order Status</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="flex items-center space-x-4">
                                      <Badge className={getStatusColor(selectedOrder.status)}>
                                        {getStatusIcon(selectedOrder.status)}
                                        <span className="ml-1">{selectedOrder.status}</span>
                                      </Badge>
                                      <Select
                                        value={selectedOrder.status}
                                        onValueChange={(value) => handleStatusUpdate(selectedOrder.id, value)}
                                      >
                                        <SelectTrigger className="w-48">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="PENDING">Pending</SelectItem>
                                          <SelectItem value="PAID">Paid</SelectItem>
                                          <SelectItem value="SHIPPED">Shipped</SelectItem>
                                          <SelectItem value="DELIVERED">Delivered</SelectItem>
                                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Customer Info */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg flex items-center">
                                      <User className="h-5 w-5 mr-2" />
                                      Customer Information
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        {selectedOrder.user ? (
                                          <>
                                            <p className="font-medium">{selectedOrder.user.name}</p>
                                            <p className="text-sm text-gray-600">{selectedOrder.user.email}</p>
                                          </>
                                        ) : (
                                          <span className="text-red-500 text-xs">No user info</span>
                                        )}
                                      </div>
                                      <div>
                                        <div className="flex items-center space-x-2">
                                          <Phone className="h-4 w-4 text-gray-400" />
                                          <span className="text-sm">{selectedOrder.user?.phone || "N/A"}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Shipping Address */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg flex items-center">
                                      <MapPin className="h-5 w-5 mr-2" />
                                      Shipping Address
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-2">
                                      <p className="font-medium">{selectedOrder.shippingFullName}</p>
                                      <p className="text-sm text-gray-600">{selectedOrder.shippingPhone}</p>
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
                                  </CardContent>
                                </Card>

                                {/* Order Items */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Order Items</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-4">
                                      {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                                          <img
                                            src={item.variant.product.imageUrl || "/placeholder.svg"}
                                            alt={item.variant.product.name}
                                            className="h-16 w-16 object-contain rounded"
                                          />
                                          <div className="flex-1">
                                            <p className="font-medium">{item.variant.product.name}</p>
                                            <p className="text-sm text-gray-600">Size: {item.variant.size}</p>
                                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                          </div>
                                          <div className="text-right">
                                            <p className="font-medium">{formatPrice(item.price)}</p>
                                            <p className="text-sm text-gray-600">
                                              {formatPrice(item.price / item.quantity)} each
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t">
                                      <div className="flex justify-between items-center text-lg font-bold">
                                        <span>Total:</span>
                                        <span className="text-amber-600">{formatPrice(selectedOrder.total)}</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Select value={order.status} onValueChange={(value) => handleStatusUpdate(order.id, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="SHIPPED">Shipped</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
