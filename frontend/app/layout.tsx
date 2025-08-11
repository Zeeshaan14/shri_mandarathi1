import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import ClientCartHydrator from "./providers/ClientCartHydrator"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Shri Mandarathi Products - Premium Oil & Flour Mill",
  description:
    "Pure, natural oil products crafted with traditional methods. Tejaswi Deepam Oil and Pure Coconut Oil from Karnataka.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <ClientCartHydrator />
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
