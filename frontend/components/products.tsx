import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Droplets, Leaf, Award, Phone } from "lucide-react"

export function Products() {
  const products = [
    {
      name: "Tejaswi Deepam Oil",
      description:
        "Premium quality oil perfect for traditional lamps and religious ceremonies. Made with the finest ingredients for a pure, long-lasting flame that brings divine light to your prayers.",
      image: "/tejaswi-oil.jpeg",
      features: ["Long burning", "Smokeless", "Pure ingredients", "Traditional recipe"],
      category: "Lamp Oil",
    },
    {
      name: "Sri Mandarathi Pure Coconut Oil",
      description:
        "Extracted from fresh coconuts using traditional methods. Perfect for cooking, hair care, and skincare. No additives, no preservatives - just pure, natural goodness.",
      image: "/product-bottle-3.jpeg",
      features: ["100% Pure", "Cold pressed", "No chemicals", "Multi-purpose"],
      category: "Coconut Oil",
    },
  ]

  return (
    <section id="products" className="py-20 bg-white">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Our Products
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Premium Quality Oil Products</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our range of pure, natural oil products crafted with traditional methods and modern quality
            standards.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {products.map((product, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gradient-to-br from-amber-50 to-orange-50 p-8">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{product.category}</Badge>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <CardTitle className="text-xl">{product.name}</CardTitle>
                <CardDescription className="text-base">{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {product.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2 text-sm">
                        <div className="h-2 w-2 bg-amber-600 rounded-full" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-amber-600 hover:bg-amber-700">
                    <Phone className="mr-2 h-4 w-4" />
                    Call for Pricing
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Product Gallery Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Our Production</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img src="/tejaswi-oil.jpeg" alt="Tejaswi Deepam Oil bottles" className="w-full h-64 object-cover" />
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img
                src="/product-bottle-1.jpeg"
                alt="Sri Mandarathi Coconut Oil in natural setting"
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img
                src="/product-shelf.webp"
                alt="Production line of Sri Mandarathi products"
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img
                src="/coconut-clipart.png"
                alt="Fresh coconuts"
                className="w-full h-64 object-contain bg-gradient-to-br from-green-50 to-amber-50 p-4"
              />
            </div>
          </div>
        </div>

        <div className="bg-amber-50 rounded-2xl p-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Droplets className="h-12 w-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Pure Extraction</h3>
              <p className="text-gray-600">Traditional methods ensure maximum purity and quality</p>
            </div>
            <div>
              <Leaf className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Natural Process</h3>
              <p className="text-gray-600">No chemicals or artificial additives used</p>
            </div>
            <div>
              <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Quality Certified</h3>
              <p className="text-gray-600">FSSAI approved and quality tested</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
