"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Package, Users, ShoppingCart, TrendingUp, Settings } from "lucide-react"
import ProductsManagement from "./products-management"
import OrdersManagement from "./orders-management"
import UsersManagement from "./users-management"
import { CategoriesManagement } from "./categories-management"
import { ProductsApi, OrdersApi, UsersApi } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    revenue: 0,
    recentOrders: [],
    lowStockProducts: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        const token = useAuthStore.getState().token

        // Fetch all data in parallel
        const [products, orders, users] = await Promise.all([
          ProductsApi.list(token),
          OrdersApi.list(token),
          UsersApi.list(token),
        ])

        console.log("[v0] Dashboard data:", { products, orders, users })

        // ✅ Calculate revenue dynamically from order items
        const totalRevenue = Array.isArray(orders)
          ? orders.reduce((sum, order) => {
              const orderTotal = Array.isArray(order.items)
                ? order.items.reduce(
                    (orderSum, item) => orderSum + (item.price || 0) * (item.quantity || 0),
                    0
                  )
                : 0
              return sum + orderTotal
            }, 0)
          : 0

        // ✅ Recent orders (last 5) — only ID, customer, status
        const recentOrders = Array.isArray(orders)
          ? orders.slice(0, 5).map((order) => ({
              id: order.id,
              customerName: order.user?.name || "Unknown Customer",
              status: order.status || "PENDING",
            }))
          : []

        // Low stock products (assuming stock < 10)
        const lowStockProducts = Array.isArray(products)
          ? products
              .filter((product) => {
                const totalStock =
                  product.variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) || 0
                return totalStock < 10
              })
              .slice(0, 5)
              .map((product) => ({
                name: product.name,
                stock:
                  product.variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) || 0,
              }))
          : []

        setStats({
          totalProducts: Array.isArray(products) ? products.length : 0,
          totalOrders: Array.isArray(orders) ? orders.length : 0,
          totalUsers: Array.isArray(users) ? users.length : 0,
          revenue: totalRevenue,
          recentOrders,
          lowStockProducts,
        })
      } catch (error) {
        console.error("[v0] Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statsCards = [
    {
      title: "Total Products",
      value: loading ? "..." : stats.totalProducts.toString(),
      change: `${stats.totalProducts} products`,
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Total Orders",
      value: loading ? "..." : stats.totalOrders.toString(),
      change: `${stats.totalOrders} orders`,
      icon: ShoppingCart,
      color: "text-green-600",
    },
    {
      title: "Total Users",
      value: loading ? "..." : stats.totalUsers.toString(),
      change: `${stats.totalUsers} registered`,
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Revenue",
      value: loading ? "..." : `₹${stats.revenue.toLocaleString()}`,
      change: `Total revenue`,
      icon: TrendingUp,
      color: "text-amber-600",
    },
  ]

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/sm-logo.jpeg" alt="SM Logo" className="h-10 w-auto rounded-lg" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Manage your products, orders, and customers</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <Settings className="h-3 w-3 mr-1" />
                Admin Panel
              </Badge>
              <Button asChild variant="outline" size="sm">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-4 text-gray-500">Loading recent orders...</div>
                    ) : stats.recentOrders.length > 0 ? (
                      stats.recentOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">#{order.id.slice(-8).toUpperCase()}</p>
                            <p className="text-sm text-gray-600">{order.customerName}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">No recent orders</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Low Stock Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-4 text-gray-500">Loading stock information...</div>
                    ) : stats.lowStockProducts.length > 0 ? (
                      stats.lowStockProducts.map((product, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">Stock running low</p>
                          </div>
                          <Badge variant="destructive" className="text-xs">
                            {product.stock} left
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">All products well stocked</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <ProductsManagement />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
