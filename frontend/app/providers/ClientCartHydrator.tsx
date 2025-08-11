"use client"

import { useEffect } from "react"
import { useAuthStore, useCartStore } from "@/lib/store"

export default function ClientCartHydrator() {
  const { user, isAuthenticated } = useAuthStore()
  const fetchCart = useCartStore((s) => s.fetchCart)

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchCart(user.id)
    }
  }, [isAuthenticated, user?.id, fetchCart])

  return null
}


