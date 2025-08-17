import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Factory, Award } from 'lucide-react'

export function About() {
  const stats = [
    { icon: Users, label: "Happy Customers", value: "1000+" },
    { icon: Factory, label: "Years in Business", value: "2+" },
    { icon: Award, label: "Quality Products", value: "100%" },
  ]

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">About Us</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Heritage of Quality & Trust
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Established with a commitment to providing pure, natural oil products, 
            Shri Mandarathi Products has been serving customers with excellence for over two decades.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Our Story</h3>
            <p className="text-gray-600 leading-relaxed">
              Founded in the heart of Karnataka, Shri Mandarathi Products began as a small family business 
              with a vision to provide the finest quality oil products. Our traditional oil mill in Nadur, 
              Brahmavar taluk, has been the cornerstone of our operations, where we combine time-tested 
              methods with modern quality standards.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We take pride in our commitment to purity, quality, and customer satisfaction. Every drop 
              of oil that leaves our mill is a testament to our dedication to excellence and our respect 
              for traditional craftsmanship.
            </p>
            
            <div className="flex items-center space-x-2 text-amber-600">
              <MapPin className="h-5 w-5" />
              <span className="font-medium">Located in Nadur, Brahmavar taluk, Udupi district</span>
            </div>
          </div>

          <div className="relative">
            <img
              src="/Screenshot 2025-08-14 210851.png size-40"
              alt="Traditional oil mill"
              className="rounded-2xl shadow-lg h-12"
            />
            <div className="absolute -bottom-6 -right-6 bg-white rounded-lg p-4 shadow-lg">
              <p className="text-lg font-bold text-amber-600">FSSAI Certified</p>
              <p className="text-sm text-gray-600">License: 21224160000478</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <stat.icon className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600">
                To provide pure, natural, and high-quality oil products that enhance the lives of our 
                customers while preserving traditional methods and supporting local communities.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Values</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-amber-600 rounded-full" />
                  <span>Commitment to purity and quality</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-amber-600 rounded-full" />
                  <span>Traditional methods with modern standards</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-amber-600 rounded-full" />
                  <span>Customer satisfaction and trust</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-amber-600 rounded-full" />
                  <span>Environmental responsibility</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
