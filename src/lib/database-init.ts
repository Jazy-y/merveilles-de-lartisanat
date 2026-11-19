import { prisma } from './prisma'

// Product types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  images: string[]
  featured: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  description?: string
}

// Order types
export interface Order {
  id: string
  userId: string
  total: number
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  paymentMethod?: string
  paymentId?: string
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  shippingAddress: {
    firstName: string
    lastName: string
    company?: string
    address1: string
    address2?: string
    city: string
    state: string
    zipCode: string
    country: string
    phone?: string
  }
  items: Array<{
    id: string
    productId: string
    quantity: number
    price: number
    product: Product
  }>
  createdAt: Date
  updatedAt: Date
}

// Blog types
export interface BlogArticle {
  id: string
  slug: string
  title: string
  content: string
  published: boolean
  authorId: string
  likes: number
  createdAt: Date
  updatedAt: Date
}

// Workshop types
export interface Workshop {
  id: string
  title: string
  description: string
  location: string
  schedule: string
  hours: string
  duration: string
  price: number
  slots: number
  availableSlots: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface WorkshopBooking {
  id: string
  workshopId: string
  userId: string
  slots: number
  totalPrice: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUSED'
  createdAt: Date
  selectedDate?: string | null
  participantName?: string | null
  participantEmail?: string | null
  participantPhone?: string | null
  notes?: string | null
  adminMessage?: string | null
}

// Training types
export interface Training {
  id: string;
  title: string;
  description: string;
  duration: string;
  format: string;
  level: string;
  price: number;
  images: string[];
  category: string;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingEnrollment {
  id: string
  trainingId: string
  userId: string
  slots: number
  totalPrice: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUSED'
  createdAt: Date
  selectedDate?: string | null
  participantName?: string | null
  participantEmail?: string | null
  participantPhone?: string | null
  notes?: string | null
  adminMessage?: string | null
}

// User types
export interface User {
  id: string
  name?: string
  email: string
  role: 'ADMIN' | 'CLIENT'
  createdAt: Date
  updatedAt: Date
}

// Product operations
export const getProducts = async (): Promise<Product[]> => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })
    return products
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting products:', error)
    return []
  }
}

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    })
    return product
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting product:', error)
    return null
  }
}

export const getCategories = async (): Promise<Category[]> => {
  try {
    // For now, return hardcoded categories. You can add a Category model later
    return [
      { id: '1', name: 'Bijoux', description: 'Artisan jewelry' },
      { id: '2', name: 'Broderie', description: 'Embroidery works' },
      { id: '3', name: 'Mosaïque', description: 'Mosaic art' },
    ]
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting categories:', error)
    return []
  }
}

// Order operations
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const response = await fetch('/api/orders/my-orders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.orders || [];
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting user orders:', error)
    return []
  }
}

export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return orders.map((order: any) => ({
      ...order,
      paymentMethod: order.paymentMethod || undefined,
      paymentId: order.paymentId || undefined,
      shippingAddress: order.shippingAddress as any, // Cast JsonValue to expected type
      items: order.orderItems.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: item.product,
      })),
      paymentStatus: 'paid' as const, // Default for now
    }))
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting all orders:', error)
    return []
  }
}

// User operations
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return users.map((user: any) => ({
      ...user,
      name: user.name || undefined,
    }))
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting users:', error)
    return []
  }
}

export const getUserCount = async (): Promise<number> => {
  try {
    const count = await prisma.user.count()
    return count
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting user count:', error)
    return 0
  }
}

export const updateUserRole = async (userId: string, role: 'ADMIN' | 'CLIENT'): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error updating user role:', error)
    throw error
  }
}

// Workshop operations
export const getAllWorkshopBookings = async (): Promise<WorkshopBooking[]> => {
  try {
    const bookings = await prisma.workshopBooking.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return bookings
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting workshop bookings:', error)
    return []
  }
}

export const getUserWorkshopBookings = async (userId: string): Promise<WorkshopBooking[]> => {
  try {
    const bookings = await prisma.workshopBooking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return bookings
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting user workshop bookings:', error)
    return []
  }
}

export const getWorkshopById = async (id: string): Promise<Workshop | null> => {
  try {
    const workshop = await prisma.workshop.findUnique({
      where: { id },
    })
    return workshop as Workshop | null
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting workshop:', error)
    return null
  }
}

export const updateWorkshopBookingStatus = async (id: string, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'): Promise<void> => {
  try {
    await prisma.workshopBooking.update({
      where: { id },
      data: { status },
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error updating workshop booking status:', error)
    throw error
  }
}

// Training operations
export const getAllTrainingEnrollments = async (): Promise<TrainingEnrollment[]> => {
  try {
    const enrollments = await prisma.trainingBooking.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return enrollments
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting training enrollments:', error)
    return []
  }
}

export const getUserTrainingEnrollments = async (userId: string): Promise<TrainingEnrollment[]> => {
  try {
    const enrollments = await prisma.trainingBooking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return enrollments
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting user training enrollments:', error)
    return []
  }
}

export const getTrainingById = async (id: string): Promise<Training | null> => {
  try {
    const training = await prisma.training.findUnique({
      where: { id },
    })
    return training as Training | null
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting training:', error)
    return null
  }
}

export const updateTrainingEnrollmentStatus = async (id: string, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'): Promise<void> => {
  try {
    await prisma.trainingBooking.update({
      where: { id },
      data: { status },
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error updating training enrollment status:', error)
    throw error
  }
}

export const addTraining = async (training: Omit<Training, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const newTraining = await prisma.training.create({
      data: training,
    })
    return newTraining.id
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error adding training:', error)
    throw error
  }
}

// Database initialization
export const initializeDatabase = async (): Promise<void> => {
  try {
    // This function can be used to seed initial data

  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error initializing database:', error)
    throw error
  }
}

