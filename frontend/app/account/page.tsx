"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { CustomerDashboard } from "@/components/account/customer-dashboard"

export default function AccountPage() {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Please log in</h2>
          <p className="text-muted-foreground">You need to be logged in to view your account.</p>
        </div>
      </div>
    )
  }

  return <CustomerDashboard />
}
