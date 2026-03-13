'use client'

import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react'
import { createCart, getCart, addToCart, removeFromCart, updateCartItem } from './medusa'

export interface CartItem {
  id: string
  variant_id: string
  product_id: string
  product_title: string
  product_handle: string
  variant_title?: string
  thumbnail?: string
  quantity: number
  price: number
  subtotal: number
}

export interface CartState {
  id: string | null
  items: CartItem[]
  total: number
  subtotal: number
  label: string | null
}

interface CartContextType {
  cart: CartState
  isLoading: boolean
  error: string | null
  addItem: (variantId: string, quantity: number) => Promise<void>
  removeItem: (lineItemId: string) => Promise<void>
  updateItem: (lineItemId: string, quantity: number) => Promise<void>
  syncCart: () => Promise<void>
  clearError: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_ID_STORAGE_KEY = 'crunchtime-cart-id'

const emptyCart: CartState = {
  id: null,
  items: [],
  total: 0,
  subtotal: 0,
  label: null,
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(emptyCart)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize cart on mount
  useEffect(() => {
    const initCart = async () => {
      try {
        const storedCartId = localStorage.getItem(CART_ID_STORAGE_KEY)
        let cartId = storedCartId

        if (cartId) {
          // Try to load existing cart
          const response = await getCart(cartId)
          if (response?.cart) {
            const medusaCart = response.cart
            setCart({
              id: medusaCart.id,
              items: (medusaCart.items || []).map((item: any) => ({
                id: item.id,
                variant_id: item.variant_id,
                product_id: item.product_id,
                product_title: item.product_title || '',
                product_handle: item.product?.handle || '',
                variant_title: item.variant_title,
                thumbnail: item.thumbnail,
                quantity: item.quantity,
                price: item.unit_price || 0,
                subtotal: (item.unit_price || 0) * item.quantity,
              })),
              total: medusaCart.total || 0,
              subtotal: medusaCart.subtotal || 0,
              label: null,
            })
          }
        } else {
          // Create new cart
          const response = await createCart()
          if (response?.cart) {
            cartId = response.cart.id
            localStorage.setItem(CART_ID_STORAGE_KEY, cartId)
            setCart({
              id: cartId,
              items: [],
              total: 0,
              subtotal: 0,
              label: null,
            })
          }
        }
      } catch (err) {
        console.error('Failed to initialize cart:', err)
        setError('Failed to load cart')
      }
    }

    initCart()
  }, [])

  const syncCart = useCallback(async () => {
    if (!cart.id) return

    try {
      const response = await getCart(cart.id)
      if (response?.cart) {
        const medusaCart = response.cart
        setCart({
          id: medusaCart.id,
          items: (medusaCart.items || []).map((item: any) => ({
            id: item.id,
            variant_id: item.variant_id,
            product_id: item.product_id,
            product_title: item.product_title || '',
            product_handle: item.product?.handle || '',
            variant_title: item.variant_title,
            thumbnail: item.thumbnail,
            quantity: item.quantity,
            price: item.unit_price || 0,
            subtotal: (item.unit_price || 0) * item.quantity,
          })),
          total: medusaCart.total || 0,
          subtotal: medusaCart.subtotal || 0,
          label: null,
        })
      }
    } catch (err) {
      console.error('Failed to sync cart:', err)
      setError('Failed to sync cart')
    }
  }, [cart.id])

  const addItem = useCallback(
    async (variantId: string, quantity: number = 1) => {
      if (!cart.id) {
        setError('Cart not initialized')
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        console.log(`Adding variant ${variantId} (qty: ${quantity}) to cart ${cart.id}`)
        const response = await addToCart(cart.id, variantId, quantity)

        if (response?.cart) {
          const medusaCart = response.cart
          setCart({
            id: medusaCart.id,
            items: (medusaCart.items || []).map((item: any) => ({
              id: item.id,
              variant_id: item.variant_id,
              product_id: item.product_id,
              product_title: item.product_title || '',
              product_handle: item.product?.handle || '',
              variant_title: item.variant_title,
              thumbnail: item.thumbnail,
              quantity: item.quantity,
              price: item.unit_price || 0,
              subtotal: (item.unit_price || 0) * item.quantity,
            })),
            total: medusaCart.total || 0,
            subtotal: medusaCart.subtotal || 0,
            label: null,
          })
        } else {
          setError('Failed to add item: No response from server')
        }
      } catch (err: any) {
        const message = err?.message || 'Failed to add item to cart'
        console.error('addItem error:', message, err)
        setError(message)
      } finally {
        setIsLoading(false)
      }
    },
    [cart.id]
  )

  const removeItem = useCallback(
    async (lineItemId: string) => {
      if (!cart.id) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await removeFromCart(cart.id, lineItemId)
        if (response?.cart) {
          const medusaCart = response.cart
          setCart({
            id: medusaCart.id,
            items: (medusaCart.items || []).map((item: any) => ({
              id: item.id,
              variant_id: item.variant_id,
              product_id: item.product_id,
              product_title: item.product_title || '',
              product_handle: item.product?.handle || '',
              variant_title: item.variant_title,
              thumbnail: item.thumbnail,
              quantity: item.quantity,
              price: item.unit_price || 0,
              subtotal: (item.unit_price || 0) * item.quantity,
            })),
            total: medusaCart.total || 0,
            subtotal: medusaCart.subtotal || 0,
            label: null,
          })
        }
      } catch (err: any) {
        console.error('removeItem error:', err)
        setError(err?.message || 'Failed to remove item')
      } finally {
        setIsLoading(false)
      }
    },
    [cart.id]
  )

  const updateItem = useCallback(
    async (lineItemId: string, quantity: number) => {
      if (!cart.id) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await updateCartItem(cart.id, lineItemId, quantity)
        if (response?.cart) {
          const medusaCart = response.cart
          setCart({
            id: medusaCart.id,
            items: (medusaCart.items || []).map((item: any) => ({
              id: item.id,
              variant_id: item.variant_id,
              product_id: item.product_id,
              product_title: item.product_title || '',
              product_handle: item.product?.handle || '',
              variant_title: item.variant_title,
              thumbnail: item.thumbnail,
              quantity: item.quantity,
              price: item.unit_price || 0,
              subtotal: (item.unit_price || 0) * item.quantity,
            })),
            total: medusaCart.total || 0,
            subtotal: medusaCart.subtotal || 0,
            label: null,
          })
        }
      } catch (err: any) {
        console.error('updateItem error:', err)
        setError(err?.message || 'Failed to update item')
      } finally {
        setIsLoading(false)
      }
    },
    [cart.id]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        error,
        addItem,
        removeItem,
        updateItem,
        syncCart,
        clearError,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
