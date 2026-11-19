export interface UserProfile {
  id: string
  name?: string
  email: string
  image?: string
  role: 'ADMIN' | 'CLIENT'
  createdAt: string
  updatedAt: string
}

export interface WishlistItemDTO {
  id: string
  userId: string
  productId: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  addedAt: string
}

export interface ReviewDTO {
  id: string
  productId: string
  userId: string
  rating: number
  comment?: string
  createdAt: string
}

export interface OrderDTO {
  id: string
  userId: string
  total: number
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

