"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Package, Users, ShoppingCart, TrendingUp, Settings } from "lucide-react"
import { ProductsManagement } from "./products-management"
import { OrdersManagement } from "./orders-management"
import { UsersManagement } from "./users-management"
import { CategoriesManagement } from "./categories-management"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock stats - replace with real API calls
  const stats = [
    {
      title: "Total Products",
      value: "24",
      change: "+2 this month",
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Total Orders",
      value: "156",
      change: "+12 this week",
      icon: ShoppingCart,
      color: "text-green-600",
    },
    {
      title: "Total Users",
      value: "89",
      change: "+5 this week",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Revenue",
      value: "₹45,230",
      change: "+8% from last month",
      icon: TrendingUp,
      color: "text-amber-600",
    },
  ]

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
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              <Settings className="h-3 w-3 mr-1" />
              Admin Panel
            </Badge>
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
              {stats.map((stat, index) => (
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
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Order #SM{1000 + i}</p>
                          <p className="text-sm text-gray-600">Customer {i}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{(Math.random() * 1000 + 500).toFixed(0)}</p>
                          <Badge variant="outline" className="text-xs">
                            {i === 1 ? "Pending" : i === 2 ? "Shipped" : "Delivered"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Low Stock Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Coconut Oil 500ml", stock: 5 },
                      { name: "Tejaswi Deepam Oil 250ml", stock: 3 },
                      { name: "Coconut Oil 1L", stock: 8 },
                    ].map((product, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">Stock running low</p>
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          {product.stock} left
                        </Badge>
                      </div>
                    ))}
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
