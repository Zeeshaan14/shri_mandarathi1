"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import { ProductCard } from "./product-card"
import type { Product, Category } from "@/lib/types"

// Mock data - replace with actual API calls
const mockCategories: Category[] = [
  { id: "1", name: "Coconut Oil", createdAt: new Date(), updatedAt: new Date() },
  { id: "2", name: "Lamp Oil", createdAt: new Date(), updatedAt: new Date() },
]

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Sri Mandarathi Pure Coconut Oil",
    description:
      "100% pure coconut oil extracted using traditional methods. Perfect for cooking, hair care, and skincare.",
    categoryId: "1",
    category: mockCategories[0],
    imageUrl: "Gemini_Generated_Image_byjofcbyjofcbyjo.png",
    variations: [
      {
        id: "1-1",
        productId: "1",
        size: "250ml",
        price: 150,
        stock: 50,
        sku: "SM-CO-250",
        imageUrl: "Gemini_Generated_Image_byjofcbyjofcbyjo.png",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "1-2",
        productId: "1",
        size: "500ml",
        price: 280,
        stock: 30,
        sku: "SM-CO-500",
        imageUrl: "/product-bottle-1.jpeg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "1-3",
        productId: "1",
        size: "1L",
        price: 520,
        stock: 25,
        sku: "SM-CO-1000",
        imageUrl: "/product-bottle-2.jpeg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Tejaswi Deepam Oil",
    description:
      "Premium quality oil perfect for traditional lamps and religious ceremonies. Long-lasting and smokeless.",
    categoryId: "2",
    category: mockCategories[1],
    imageUrl: "/tej.png",
    variations: [
      {
        id: "2-1",
        productId: "2",
        size: "500ml",
        price: 180,
        stock: 40,
        sku: "TJ-DO-500",
        imageUrl: "/tej.png",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2-2",
        productId: "2",
        size: "1L",
        price: 340,
        stock: 20,
        sku: "TJ-DO-1000",
        imageUrl: "/tej.png",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export function ShopSection() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts)
  const [categories] = useState<Category[]>(mockCategories)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")

  useEffect(() => {
    let filtered = products

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.categoryId === selectedCategory)
    }

    // Sort products
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "price-low":
          return Math.min(...a.variations.map((v) => v.price)) - Math.min(...b.variations.map((v) => v.price))
        case "price-high":
          return Math.max(...b.variations.map((v) => v.price)) - Math.max(...a.variations.map((v) => v.price))
        default:
          return 0
      }
    })

    setFilteredProducts(filtered)
  }, [products, searchTerm, selectedCategory, sortBy])

  return (
    <section id="shop" className="py-20 bg-gray-50">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Online Shop
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Shop Our Products</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse our premium collection of pure, natural oil products. Order online for convenient home delivery.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full lg:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
            <Button
              variant="outline"
              className="mt-4 bg-transparent"
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
                setSortBy("name")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
