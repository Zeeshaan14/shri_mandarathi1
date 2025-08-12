"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Users, Eye, Shield, ShoppingBag, Calendar, Mail } from "lucide-react"
import { toast } from "sonner"
import { UsersApi } from "@/lib/api"
import { useAuthStore } from "@/lib/store"

interface User {
  id: string
  name: string
  email: string
  role: "ADMIN" | "CUSTOMER"
  createdAt: string
  updatedAt: string
  _count?: {
    orders: number
  }
  orders?: Array<{
    id: string
    total: number
    status: string
    createdAt: string
  }>
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const token = useAuthStore.getState().token
        const users = await UsersApi.list(token)
        setUsers(users)
      } catch (error: any) {
        toast.error("Failed to fetch users")
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const handleRoleUpdate = async (userId: string, newRole: "ADMIN" | "CUSTOMER") => {
    try {
      const token = useAuthStore.getState().token
      await UsersApi.updateRole(userId, newRole, token)
      setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
      toast.success(`User role updated to ${newRole}`)
    } catch (error) {
      toast.error("Failed to update user role")
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
    })
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

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
          <p className="text-gray-600">Manage customer accounts and permissions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Customers</p>
                <p className="text-2xl font-bold text-green-600">{users.filter((u) => u.role === "CUSTOMER").length}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-purple-600">{users.filter((u) => u.role === "ADMIN").length}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="CUSTOMER">Customers</SelectItem>
                <SelectItem value="ADMIN">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                        {user.role === "ADMIN" && <Shield className="h-3 w-3 mr-1" />}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <ShoppingBag className="h-4 w-4 text-gray-400" />
                        <span>{user._count?.orders || 0} orders</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{formatDate(user.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatDate(user.updatedAt)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>User Details - {user.name}</DialogTitle>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-6">
                                {/* User Info */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">User Information</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid grid-cols-2 gap-6">
                                      <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                          <div className="h-16 w-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                            {selectedUser.name.charAt(0).toUpperCase()}
                                          </div>
                                          <div>
                                            <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                                            <Badge variant={selectedUser.role === "ADMIN" ? "default" : "secondary"}>
                                              {selectedUser.role === "ADMIN" && <Shield className="h-3 w-3 mr-1" />}
                                              {selectedUser.role}
                                            </Badge>
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <div className="flex items-center space-x-2">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm">{selectedUser.email}</span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm">Joined {formatDate(selectedUser.createdAt)}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                          <h4 className="font-semibold mb-2">Account Statistics</h4>
                                          <div className="space-y-2">
                                            <div className="flex justify-between">
                                              <span className="text-sm text-gray-600">Total Orders:</span>
                                              <span className="font-medium">{selectedUser._count?.orders || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-sm text-gray-600">Account Status:</span>
                                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                                Active
                                              </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-sm text-gray-600">Last Updated:</span>
                                              <span className="text-sm">{formatDate(selectedUser.updatedAt)}</span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Role Management */}
                                        <div className="bg-amber-50 p-4 rounded-lg">
                                          <h4 className="font-semibold mb-2">Role Management</h4>
                                          <Select
                                            value={selectedUser.role}
                                            onValueChange={(value) =>
                                              handleRoleUpdate(selectedUser.id, value as "ADMIN" | "CUSTOMER")
                                            }
                                          >
                                            <SelectTrigger className="w-full">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="CUSTOMER">Customer</SelectItem>
                                              <SelectItem value="ADMIN">Admin</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Order History */}
                                {selectedUser.orders && selectedUser.orders.length > 0 && (
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg">Order History</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-4">
                                        {selectedUser.orders.map((order, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center justify-between p-4 border rounded-lg"
                                          >
                                            <div>
                                              <p className="font-medium">Order #{order.id.slice(-8).toUpperCase()}</p>
                                              <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                                            </div>
                                            <div className="text-right">
                                              <p className="font-medium">{formatPrice(order.total)}</p>
                                              <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleUpdate(user.id, value as "ADMIN" | "CUSTOMER")}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CUSTOMER">Customer</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
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
