"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store"
import { Package, MapPin, CreditCard, User } from "lucide-react"
import Link from "next/link"

interface RecentOrder {
  id: string
  status: string
  total: number
  createdAt: string
  items: Array<{
    id: string
    quantity: number
    variant: {
      product: {
        name: string
      }
      size: string
    }
  }>
}

export function AccountOverview() {
  const { user } = useAuthStore()
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    savedAddresses: 0,
  })

  useEffect(() => {
    // Mock data - replace with actual API calls
    setRecentOrders([
      {
        id: "1",
        status: "DELIVERED",
        total: 450.0,
        createdAt: "2024-01-15T10:30:00Z",
        items: [
          {
            id: "1",
            quantity: 2,
            variant: {
              product: { name: "Coconut Oil" },
              size: "500ml",
            },
          },
        ],
      },
      {
        id: "2",
        status: "SHIPPED",
        total: 320.0,
        createdAt: "2024-01-10T14:20:00Z",
        items: [
          {
            id: "2",
            quantity: 1,
            variant: {
              product: { name: "Wheat Flour" },
              size: "1kg",
            },
          },
        ],
      },
    ])

    setStats({
      totalOrders: 12,
      totalSpent: 5420.0,
      savedAddresses: 2,
    })
  }, [])

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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Welcome back, {user?.name}!
          </CardTitle>
          <CardDescription>Here's an overview of your account activity</CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Lifetime orders placed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lifetime spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Addresses</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.savedAddresses}</div>
            <p className="text-xs text-muted-foreground">Delivery addresses</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest order activity</CardDescription>
          </div>
          <Button asChild variant="outline">
            <Link href="#" onClick={() => {}}>
              View All Orders
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium">Order #{order.id}</span>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {order.items.map((item, index) => (
                      <span key={item.id}>
                        {item.quantity}x {item.variant.product.name} ({item.variant.size})
                        {index < order.items.length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">₹{order.total.toFixed(2)}</div>
                  <Button variant="ghost" size="sm" className="mt-1">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
