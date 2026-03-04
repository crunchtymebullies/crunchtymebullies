'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
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
    title: item.title || item.product?.title || 'Product',
    thumbnail: item.thumbnail || item.product?.thumbnail || null,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total: item.total || item.unit_price * item.quantity,
    variant: { title: item.variant?.title || '' },
    product: {
      title: item.product?.title || '',
      handle: item.product?.handle || '',
      thumbnail: item.product?.thumbnail || null,
    },
  }))

  return {
    id: cart?.id || null,
    items,
    subtotal: cart?.subtotal || 0,
    total: cart?.total || 0,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
  }
}

const CART_KEY = 'ct-cart-id'

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>({
    id: null, items: [], subtotal: 0, total: 0, itemCount: 0, loading: true,
  })
  const [isOpen, setIsOpen] = useState(false)

  // Initialize cart
  useEffect(() => {
    const init = async () => {
      const storedId = localStorage.getItem(CART_KEY)
      if (storedId) {
        try {
          const { cart } = await getStoreCart(storedId)
          setState({ ...parseCart(cart), loading: false })
          return
        } catch {
          localStorage.removeItem(CART_KEY)
        }
      }
      setState(s => ({ ...s, loading: false }))
    }
    init()
  }, [])

  const ensureCart = useCallback(async (): Promise<string> => {
    if (state.id) return state.id
    const { cart } = await createStoreCart()
    localStorage.setItem(CART_KEY, cart.id)
    setState(s => ({ ...s, id: cart.id }))
    return cart.id
  }, [state.id])

  const addToCart = useCallback(async (variantId: string, quantity = 1) => {
    setState(s => ({ ...s, loading: true }))
    try {
      const cartId = await ensureCart()
      const { cart } = await addItemToCart(cartId, variantId, quantity)
      setState({ ...parseCart(cart), loading: false })
      setIsOpen(true)
    } catch (err) {
      console.error('Add to cart failed:', err)
      setState(s => ({ ...s, loading: false }))
    }
  }, [ensureCart])

  const updateItem = useCallback(async (lineItemId: string, quantity: number) => {
    if (!state.id) return
    setState(s => ({ ...s, loading: true }))
    try {
      const { cart } = await updateCartItem(state.id, lineItemId, quantity)
      setState({ ...parseCart(cart), loading: false })
    } catch (err) {
      console.error('Update cart failed:', err)
      setState(s => ({ ...s, loading: false }))
    }
  }, [state.id])

  const removeItem = useCallback(async (lineItemId: string) => {
    if (!state.id) return
    setState(s => ({ ...s, loading: true }))
    try {
      const { cart } = await removeCartItem(state.id, lineItemId)
      setState({ ...parseCart(cart), loading: false })
    } catch (err) {
      console.error('Remove from cart failed:', err)
      setState(s => ({ ...s, loading: false }))
    }
  }, [state.id])

  return (
    <CartContext.Provider value={{
      ...state,
      addToCart, updateItem, removeItem,
      isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen(o => !o),
    }}>
      {children}
    </CartContext.Provider>
  )
}
