import { Button } from "@/components/ui/button"
import { ArrowRight, Award, Leaf, Shield } from 'lucide-react'
import Link from "next/link"

export function Hero() {
  return (
    <section id="home" className="relative py-20 lg:py-32 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container px-4 mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-amber-600">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-600 text-white font-bold text-xl">
                  SM
                </div>
                <span className="text-sm font-medium">Since 2023</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Pure & Natural
                <span className="text-amber-600 block">Oil Products</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-lg">
                Experience the finest quality coconut oil and traditional oil products from our heritage mill in Karnataka. 
                Crafted with care, delivered with trust.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700">
                <Link href="#products">
                  View Products <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#contact">Contact Us</Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <Award className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium">FSSAI Certified</p>
              </div>
              <div className="text-center">
                <Leaf className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium">100% Natural</p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Quality Assured</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-amber-200 to-orange-200 p-8">
              <img
                src="/coconut-oil-mill.png"
                alt="Premium coconut oil products"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white rounded-lg p-4 shadow-lg">
              <p className="text-2xl font-bold text-amber-600">25+</p>
              <p className="text-sm text-gray-600">Years of Excellence</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
