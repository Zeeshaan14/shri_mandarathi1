export interface User {
  id: string
  name: string
  email: string
  role: "ADMIN" | "CUSTOMER"
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  description?: string
  categoryId: string
  category?: Category
  imageUrl?: string
  variations: ProductVariant[]
  createdAt: Date
  updatedAt: Date
}

export interface ProductVariant {
  id: string
  productId: string
  product?: Product
  size: string
  price: number
  stock: number
  sku?: string
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  userId: string
  user?: User
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  total: number
  items: OrderItem[]
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  variantId: string
  variant?: ProductVariant
  quantity: number
  price: number
}

export interface CartItem {
  variantId: string
  variant: ProductVariant
  quantity: number
}
