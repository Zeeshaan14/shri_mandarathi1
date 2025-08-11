import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Products } from "@/components/products"
import { ShopSection } from "@/components/shop/shop-section"
import { About } from "@/components/about"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"
import { FloatingContactWidget } from "@/components/floating-contact-widget"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Products />
        <ShopSection />
        <About />
        <Contact />
      </main>
      <Footer />
      <FloatingContactWidget />
    </div>
  )
}
