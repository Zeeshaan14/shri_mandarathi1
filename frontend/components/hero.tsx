import { Button } from "@/components/ui/button"
import { ArrowRight, Award, Leaf, Shield } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section id="home" className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/coconut-trees.jpeg')`,
        }}
      />

      <div className="container px-4 mx-auto relative z-10">
        {/* Use flex layout instead of grid */}
        <div className="relative flex flex-col lg:flex-row items-start justify-between">
          {/* Left: Text Content */}
          <div className="z-10 max-w-xl space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img
                  src="/sm-logo.jpeg"
                  alt="SM Logo"
                  className="h-16 w-auto rounded-lg bg-white p-1"
                />
                <span className="text-sm font-medium text-white bg-amber-600 px-3 py-1 rounded-full">
                  Since 1995
                </span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                Pure & Natural
                <span className="text-amber-400 block">Coconut Oil</span>
              </h1>
              <p className="text-lg text-gray-200 max-w-lg">
                Experience the finest quality coconut oil from our heritage mill in Karnataka. Crafted with care using
                traditional methods, delivered with trust.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700">
                <Link href="#products">
                  View Products <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-gray-900 bg-transparent"
              >
                <Link href="#contact">Contact Us</Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <Award className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">FSSAI Certified</p>
              </div>
              <div className="text-center">
                <Leaf className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">100% Natural</p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">Quality Assured</p>
              </div>
            </div>
          </div>

          {/* Right: Bottle Image */}
          {/* Right: Enlarged Bottle Image */}
<div className="absolute right-0 bottom-0 hidden lg:block">
  <div className="h-[450px] w-[450px] p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden ml-6">
    <img
      src="/product-bottle-2.jpeg"
      alt="Sri Mandarathi Pure Coconut Oil"
      className="h-full rounded-2xl "
    />
  </div>
  <div className="absolute -bottom-8 -left-8 bg-white rounded-lg p-4 shadow-lg">
    <p className="text-3xl font-bold text-amber-600">25+</p>
    <p className="text-sm text-gray-600">Years of Excellence</p>
  </div>
</div>

        </div>
      </div>
    </section>
  )
}
