import { prisma } from './prisma'
import { WishlistItem as PrismaWishlistItem } from '@prisma/client'

export type WishlistItem = PrismaWishlistItem & {
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  addedAt: Date
}

// Add item to wishlist
export const addToWishlist = async (productId: string, userId: string): Promise<void> => {

  try {
    const existingItem = await prisma.wishlistItem.findFirst({
      where: { userId, productId },
    })

    if (!existingItem) {
      await prisma.wishlistItem.create({ data: { userId, productId } })
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error adding to wishlist:', error)
    throw error
  }
}

// Remove item from wishlist
export const removeFromWishlist = async (productId: string, userId: string): Promise<void> => {

  try {
    await prisma.wishlistItem.deleteMany({ where: { userId, productId } })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error removing from wishlist:', error)
    throw error
  }
}

// Get user's wishlist
export const getUserWishlist = async (userId: string): Promise<WishlistItem[]> => {

  try {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            images: true,
            name: true,
            price: true,
            category: true,
          },
        },
      },
    })

    return wishlistItems.map(item => ({
      ...item,
      name: item.product.name,
      price: item.product.price,
      image: item.product.images[0] || '/placeholder-product.jpg',
      category: item.product.category,
      addedAt: item.createdAt,
    })) as WishlistItem[]

  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting wishlist:', error)
    throw error
  }
}

// Check if item is in wishlist
export const isInWishlist = async (productId: string, userId: string): Promise<boolean> => {

  try {
    const wishlistItem = await prisma.wishlistItem.findFirst({ where: { userId, productId } })
    return !!wishlistItem
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error checking wishlist:', error)
    return false
  }
}

// Toggle wishlist item (add if not present, remove if present)
export const toggleWishlistItem = async (productId: string, userId: string): Promise<boolean> => {

  try {
    const isInList = await isInWishlist(productId, userId)
    
    if (isInList) {
      await removeFromWishlist(productId, userId)
      return false // Item was removed
    } else {
      await addToWishlist(productId, userId)
      return true // Item was added
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error toggling wishlist item:', error)
    throw error
  }
}
