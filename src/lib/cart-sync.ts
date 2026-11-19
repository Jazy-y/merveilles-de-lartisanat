import { CartItem } from '@/types/domain'
import { createCSRFHeaders } from './csrf-client'

export interface LocalCartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

export interface ServerCartItem {
  id: string
  userId: string
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    images: string[]
    isActive: boolean
    stock: number
  }
}

/**
 * Sync localStorage cart with server cart
 */
export async function syncCartToServer(
  localCartItems: LocalCartItem[],
  userId: string
): Promise<ServerCartItem[]> {
  try {
    // Get current server cart
    const serverResponse = await fetch('/api/cart')
    const { items: serverCartItems } = await serverResponse.json()
    
    // Create a map of server cart items for quick lookup
    const serverCartMap = new Map<string, ServerCartItem>(
      serverCartItems.map((item: ServerCartItem) => [item.productId, item])
    )
    
    const syncPromises: Promise<Response>[] = []
    
    // Process each local cart item
    for (const localItem of localCartItems) {
      const serverItem = serverCartMap.get(localItem.id)
      
      if (serverItem) {
        // Item exists on server, update quantity if different
        if (serverItem.quantity !== localItem.quantity) {
          syncPromises.push(
            fetch('/api/cart', {
              method: 'PUT',
              headers: await createCSRFHeaders(),
              body: JSON.stringify({
                productId: localItem.id,
                quantity: localItem.quantity
              })
            })
          )
        }
      } else {
        // Item doesn't exist on server, add it
        syncPromises.push(
          fetch('/api/cart', {
            method: 'POST',
            headers: await createCSRFHeaders(),
            body: JSON.stringify({
              productId: localItem.id,
              quantity: localItem.quantity
            })
          })
        )
      }
    }
    
    // Wait for all sync operations to complete
    await Promise.all(syncPromises)
    
    // Return updated server cart
    const updatedResponse = await fetch('/api/cart')
    const { items: updatedServerCart } = await updatedResponse.json()
    
    return updatedServerCart
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error syncing cart to server:', error)
    return []
  }
}

/**
 * Convert server cart items to local cart format
 */
export function serverCartToLocal(serverCartItems: ServerCartItem[]): LocalCartItem[] {
  return serverCartItems.map(item => ({
    id: item.productId,
    name: item.product.name,
    price: item.product.price,
    image: item.product.images[0] || '',
    quantity: item.quantity
  }))
}

/**
 * Clear localStorage cart after successful sync
 */
export function clearLocalCart(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cart')
  }
}
