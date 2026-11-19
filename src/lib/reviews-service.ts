import { prisma } from './prisma'

interface Review {
  id: string
  productId: string
  userId: string
  rating: number
  comment: string | null
  createdAt: Date
  user?: {
    name: string | null
    email: string | null
  }
}

type Unsubscribe = () => void

/**
 * Subscribe to product reviews with polling (using Prisma/PostgreSQL)
 * @param productId - The product ID to subscribe to
 * @param callback - Callback function that receives the reviews array
 * @returns Unsubscribe function
 */
export function subscribeToProductReviews(
  productId: string,
  callback: (reviews: Review[]) => void
): Unsubscribe {
  let isActive = true
  let pollInterval: NodeJS.Timeout | null = null

  const fetchReviews = async () => {
    if (!isActive) return

    try {
      // Use API route to fetch reviews (since Prisma can't be used directly in client components)
      const response = await fetch(`/api/products/${productId}/reviews`)
      if (response.ok) {
        const data = await response.json()
        if (isActive) {
          callback(data.reviews || [])
        }
      } else {
        if (isActive) {
          callback([])
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error fetching reviews:', error)
      if (isActive) {
        callback([])
      }
    }
  }

  // Initial fetch
  fetchReviews()

  // Poll every 5 seconds for updates
  pollInterval = setInterval(fetchReviews, 5000)

  // Return unsubscribe function
  return () => {
    isActive = false
    if (pollInterval) {
      clearInterval(pollInterval)
    }
  }
}

/**
 * Get reviews for a product (one-time fetch)
 */
export async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    const response = await fetch(`/api/products/${productId}/reviews`)
    if (response.ok) {
      const data = await response.json()
      return data.reviews || []
    }
    return []
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error fetching reviews:', error)
    return []
  }
}

