"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem, User } from "./types"
import { CartApi } from "./api"

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  fetchCart: (userId: string) => Promise<void>
  addToCartApi: (userId: string, variantId: string, quantity: number) => Promise<void>
  updateCartItemApi: (cartItemId: string, variantId: string, quantity: number) => Promise<void>
  removeCartItemApi: (cartItemId: string, variantId: string) => Promise<void>
  clearCartApi: (userId: string) => Promise<void>
}

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) =>
        set((state) => {
          const existingItem = state.items.find((item) => item.variantId === newItem.variantId)
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.variantId === newItem.variantId ? { ...item, quantity: item.quantity + newItem.quantity } : item,
              ),
            }
          }
          return { items: [...state.items, newItem] }
        }),
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        })),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((item) => (item.variantId === variantId ? { ...item, quantity } : item)),
        })),
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.quantity, 0)
      },
      getTotalPrice: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.variant.price * item.quantity, 0)
      },
      fetchCart: async (userId: string) => {
        const token = useAuthStore.getState().token || undefined
        if (!token) return
        const result = await CartApi.get(userId, token)
        const cartData = result.cart || result // Handle both formats for backward compatibility
        const items = (cartData.items || []).map((ci: any) => ({
          id: ci.id,
          variantId: ci.variantId,
          variant: {
            ...ci.variant,
            price: typeof ci.variant.price === "string" ? Number(ci.variant.price) : ci.variant.price,
          },
          quantity: ci.quantity,
        })) as CartItem[]
        set({ items })
      },
      addToCartApi: async (userId: string, variantId: string, quantity: number) => {
        const token = useAuthStore.getState().token || undefined
        if (!token) return
        const res = await CartApi.add(variantId, quantity, token)
        if (res?.item) {
          await get().fetchCart(userId)
        }
      },
      updateCartItemApi: async (cartItemId: string, variantId: string, quantity: number) => {
        const { token, user } = useAuthStore.getState()
        if (!token) return
        let idToUse = cartItemId
        if (!idToUse && user?.id) {
          // fetch latest to resolve id
          await get().fetchCart(user.id)
          const refreshed = get().items.find((i) => i.variantId === variantId)
          idToUse = refreshed?.id || ""
        }
        if (!idToUse) return
        await CartApi.updateItem(idToUse, quantity, token)
        set((state) => ({
          items: state.items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
        }))
      },
      removeCartItemApi: async (cartItemId: string, variantId: string) => {
        const { token, user } = useAuthStore.getState()
        if (!token) return
        let idToUse = cartItemId
        if (!idToUse && user?.id) {
          await get().fetchCart(user.id)
          const refreshed = get().items.find((i) => i.variantId === variantId)
          idToUse = refreshed?.id || ""
        }
        if (!idToUse) return
        await CartApi.removeItem(idToUse, token)
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }))
      },
      clearCartApi: async (userId: string) => {
        const token = useAuthStore.getState().token || undefined
        if (!token) return
        await CartApi.clear(userId, token)
        set({ items: [] })
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => {
        // Clear auth state
        set({ user: null, token: null, isAuthenticated: false })
        // Also clear any locally persisted cart items to avoid showing another user's cart
        try {
          useCartStore.getState().clearCart()
        } catch {}
      },
    }),
    {
      name: "auth-storage",
      version: 2,
      migrate: (persistedState: any, version) => {
        if (version < 2) {
          return { user: null, token: null, isAuthenticated: false }
        }
        if (!persistedState?.token) {
          return { user: null, token: null, isAuthenticated: false }
        }
        return persistedState
      },
    },
  ),
)
