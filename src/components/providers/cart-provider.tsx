'use client'

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { syncCartToServer, serverCartToLocal, clearLocalCart } from '@/lib/cart-sync'

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  isLoading: boolean
  /** Set when an item is just added, for add-to-cart confirmation modal */
  lastAddedItem: (CartItem & { quantity: number }) | null
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'RESTORE_CART'; payload: CartState }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_LAST_ADDED' }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {

  switch (action.type) {
    case 'ADD_ITEM': {

      const existingItem = state.items.find(item => item.id === action.payload.id)
      let newItem: CartItem & { quantity: number }

      if (existingItem) {
        newItem = { ...existingItem, quantity: existingItem.quantity + 1 }
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id ? newItem : item
        )
        return {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          lastAddedItem: newItem
        }
      }

      newItem = { ...action.payload, quantity: 1 }
      const updatedItems = [...state.items, newItem]
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        lastAddedItem: newItem
      }
    }
    
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.id !== action.payload)
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      }
    }
    
    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0)
      
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      }
    }
    
    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
        itemCount: 0,
        isLoading: false,
        lastAddedItem: null
      }
    
    case 'RESTORE_CART':
      return { ...action.payload, lastAddedItem: null }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }
    
    case 'CLEAR_LAST_ADDED':
      return { ...state, lastAddedItem: null }
    
    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
    isLoading: false,
    lastAddedItem: null
  })
  const { data: session } = useSession()

  // Load cart from server or localStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        if (session?.user) {
          // User is logged in, load from server
          const response = await fetch('/api/cart')
          if (response.ok) {
            const { items: serverCartItems } = await response.json()
            const localCartItems = serverCartToLocal(serverCartItems)
            
            dispatch({ 
              type: 'RESTORE_CART', 
              payload: {
                items: localCartItems,
                total: localCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                itemCount: localCartItems.reduce((sum, item) => sum + item.quantity, 0),
                isLoading: false,
                lastAddedItem: null
              }
            })
          }
        } else {
          // User not logged in, load from localStorage
          if (typeof window !== 'undefined') {
            const savedCart = localStorage.getItem('cart')
            if (savedCart) {
              const parsedCart = JSON.parse(savedCart)

              if (parsedCart && typeof parsedCart === 'object' && Array.isArray(parsedCart.items)) {
                dispatch({ type: 'RESTORE_CART', payload: { ...parsedCart, lastAddedItem: null } })
              }
            }
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error loading cart:', error)
      }
    }

    loadCart()
  }, [session])

  // Sync cart to server when user logs in
  useEffect(() => {
    const syncCart = async () => {
      if (session?.user && state.items.length > 0) {
        try {
          await syncCartToServer(state.items, (session.user as any).id)
          clearLocalCart()

        } catch (error) {
          if (process.env.NODE_ENV === 'development') console.error('Error syncing cart to server:', error)
        }
      }
    }

    syncCart()
  }, [session, state.items])

  // Save cart to localStorage when not logged in (do not persist lastAddedItem)
  useEffect(() => {
    if (!session && typeof window !== 'undefined') {
      try {
        const { lastAddedItem: _, ...toSave } = state
        localStorage.setItem('cart', JSON.stringify(toSave))
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error saving cart to localStorage:', error)
      }
    }
  }, [state, session])

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
