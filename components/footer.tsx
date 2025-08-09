import Link from "next/link"
import { MapPin, Mail, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container px-4 mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img src="/sm-logo.jpeg" alt="SM Logo" className="h-12 w-auto rounded-lg" />
              <div>
                <h3 className="font-bold text-lg">Shri Mandarathi Products</h3>
                <p className="text-sm text-gray-400">Premium Oil & Flour Mill</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Providing pure, natural oil products with traditional methods and modern quality standards since 2023.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#home" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#products" className="text-gray-400 hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="#about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Our Products</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-400">Tejaswi Deepam Oil</span>
              </li>
              <li>
                <span className="text-gray-400">Pure Coconut Oil</span>
              </li>
              <li>
                <span className="text-gray-400">Traditional Oil Products</span>
              </li>
              <li>
                <span className="text-gray-400">Custom Orders</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
                <p className="text-gray-400 text-sm">
                  Nadur, Brahmavar taluk
                  <br />
                  Udupi district, Karnataka 576223
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <a href="tel:+919008496222" className="text-gray-400 hover:text-white text-sm transition-colors">
                  +91 9008496222
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <a
                  href="mailto:shrimandarathioilmill@gmail.com"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  shrimandarathioilmill@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">© 2024 Shri Mandarathi Products. All rights reserved.</p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <span>GST: 29BNGPM5441K1ZL</span>
              <span>FSSAI: 21224160000478</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
