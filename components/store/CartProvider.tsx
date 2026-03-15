'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { createStoreCart, getStoreCart, addItemToCart, updateCartItem, removeCartItem } from '@/lib/store-api'

interface CartItem {
  id: string
  variant_id: string
  title: string
  thumbnail: string | null
  quantity: number
  unit_price: number
  total: number
  variant: { title: string }
  product: { title: string; handle: string; thumbnail: string | null }
}

interface CartState {
  id: string | null
  items: CartItem[]
  subtotal: number
  total: number
  itemCount: number
  loading: boolean
}

interface CartContextType extends CartState {
  addToCart: (variantId: string, quantity?: number) => Promise<void>
  updateItem: (lineItemId: string, quantity: number) => Promise<void>
  removeItem: (lineItemId: string) => Promise<void>
  isOpen: boolean
  error: string | null
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

function parseCart(cart: any): Omit<CartState, 'loading'> {
  const items: CartItem[] = (cart?.items || []).map((item: any) => ({
    id: item.id,
    variant_id: item.variant_id,
    title: item.title || item.product_title || 'Product',
    thumbnail: item.thumbnail || null,
    quantity: item.quantity || 1,
    unit_price: item.unit_price || 0,
    total: item.total || (item.unit_price || 0) * (item.quantity || 1),
    variant: { title: item.variant_title || item.variant?.title || '' },
    product: {
      title: item.product_title || item.product?.title || item.title || '',
      handle: item.product_handle || item.product?.handle || '',
      thumbnail: item.thumbnail || item.product?.thumbnail || null,
    },
  }))

  return {
    id: cart?.id || null,
    items,
    subtotal: cart?.subtotal || cart?.item_subtotal || 0,
    total: cart?.total || cart?.subtotal || 0,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
  }
}

const CART_KEY = 'ct-cart-id'

function safeGetItem(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

function safeSetItem(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* storage blocked */ }
}

function safeRemoveItem(key: string) {
  try { localStorage.removeItem(key) } catch { /* storage blocked */ }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>({
    id: null, items: [], subtotal: 0, total: 0, itemCount: 0, loading: true,
  })
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cartIdRef = useRef<string | null>(null)

  useEffect(() => { cartIdRef.current = state.id }, [state.id])

  // Initialize
  useEffect(() => {
    const init = async () => {
      const storedId = safeGetItem(CART_KEY)
      if (storedId) {
        try {
          const { cart } = await getStoreCart(storedId)
          if (cart?.id) {
            cartIdRef.current = cart.id
            setState({ ...parseCart(cart), loading: false })
            return
          }
        } catch {
          safeRemoveItem(CART_KEY)
        }
      }
      setState(s => ({ ...s, loading: false }))
    }
    init()
  }, [])

  const ensureCart = useCallback(async (): Promise<string> => {
    if (cartIdRef.current) return cartIdRef.current
    const stored = safeGetItem(CART_KEY)
    if (stored) { cartIdRef.current = stored; return stored }
    const { cart } = await createStoreCart()
    cartIdRef.current = cart.id
    safeSetItem(CART_KEY, cart.id)
    setState(s => ({ ...s, id: cart.id }))
    return cart.id
  }, [])

  const addToCart = useCallback(async (variantId: string, quantity = 1) => {
    setState(s => ({ ...s, loading: true }))
    setError(null)
    try {
      const cartId = await ensureCart()
      const { cart } = await addItemToCart(cartId, variantId, quantity)
      setState({ ...parseCart(cart), loading: false })
      setIsOpen(true)
    } catch (err: any) {
      const msg = err?.message || 'Failed to add to cart'
      console.error('Add to cart failed:', msg, err)
      setError(msg)
      setState(s => ({ ...s, loading: false }))
      throw err
    }
  }, [ensureCart])

  const updateItem = useCallback(async (lineItemId: string, quantity: number) => {
    const cartId = cartIdRef.current
    if (!cartId) return
    setState(s => ({ ...s, loading: true }))
    try {
      const { cart } = await updateCartItem(cartId, lineItemId, quantity)
      setState({ ...parseCart(cart), loading: false })
    } catch (err) {
      console.error('Update cart failed:', err)
      setState(s => ({ ...s, loading: false }))
    }
  }, [])

  const removeItem = useCallback(async (lineItemId: string) => {
    const cartId = cartIdRef.current
    if (!cartId) return
    setState(s => ({ ...s, loading: true }))
    try {
      const { cart } = await removeCartItem(cartId, lineItemId)
      setState({ ...parseCart(cart), loading: false })
    } catch (err) {
      console.error('Remove from cart failed:', err)
      setState(s => ({ ...s, loading: false }))
    }
  }, [])

  return (
    <CartContext.Provider value={{
      ...state,
      addToCart, updateItem, removeItem,
      isOpen, error,
      openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen(o => !o),
    }}>
      {children}
    </CartContext.Provider>
  )
}
