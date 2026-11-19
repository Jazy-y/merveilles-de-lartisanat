'use client'

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { createCSRFHeaders } from '@/lib/csrf-client'

interface WishlistItem {
  id: string
  product: {
    id: string
    name: string
    price: number
    images: string[]
    category: string
  }
  addedAt: string
}

interface WishlistState {
  items: WishlistItem[]
  isLoading: boolean
  error: string | null
}

interface WishlistAction {
  type: 'SET_ITEMS' | 'SET_LOADING' | 'SET_ERROR' | 'CLEAR_ERROR'
  payload?: WishlistItem[] | boolean | string | null
}

const WishlistContext = createContext<{
  state: WishlistState
  toggleItem: (product: {
    id: string
    name: string
    price: number
    images: string[]
    category: string
  }) => Promise<boolean>
  isInWishlist: (productId: string) => Promise<boolean>
} | null>(null)

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload as WishlistItem[], isLoading: false, error: null }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload as boolean, error: null }
    case 'SET_ERROR':
      return { ...state, error: action.payload as string, isLoading: false }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(wishlistReducer, { 
    items: [], 
    isLoading: true, 
    error: null 
  })
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user

  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        try {
          const res = await fetch('/api/wishlist');
          if (res.ok) {
            const data = await res.json();
            dispatch({ type: 'SET_ITEMS', payload: data.wishlistItems })
          }
        } catch (error) {
          dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch wishlist' })
        }
      }
    }
    fetchWishlist();
  }, [user])

  const toggleItem = async (product: {
    id: string
    name: string
    price: number
    images: string[]
    category: string
  }): Promise<boolean> => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push('/auth/signin')
      return false
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const wishlistItem = state.items.find(item => item.product.id === product.id);
      if (wishlistItem) {
        const res = await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: await createCSRFHeaders(),
          body: JSON.stringify({ wishlistItemId: wishlistItem.id }),
        });
        if (res.ok) {
          dispatch({ type: 'SET_ITEMS', payload: state.items.filter(item => item.product.id !== product.id) })
          return false;
        }
      } else {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: await createCSRFHeaders(),
          body: JSON.stringify({ productId: product.id }),
        });
        if (res.ok) {
          const data = await res.json();
          dispatch({ type: 'SET_ITEMS', payload: [...state.items, data.wishlistItem] })
          return true;
        }
      }
      return false;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error toggling wishlist item:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update wishlist' })
      return false
    }
  }

  const checkIsInWishlist = async (productId: string): Promise<boolean> => {
    return state.items.some(item => item.product.id === productId);
  }

  return (
    <WishlistContext.Provider value={{ 
      state, 
      toggleItem, 
      isInWishlist: checkIsInWishlist 
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}