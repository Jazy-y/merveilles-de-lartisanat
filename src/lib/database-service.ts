import { prisma } from './prisma';

// Product types (matching the existing interface)
export interface Product {
  id?: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  images: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Order types
export interface Order {
  id?: string
  userId: string
  total: number
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  paymentMethod?: string
  paymentId?: string
  shippingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  }
  createdAt: Date
  updatedAt: Date
}

// Cart types
export interface CartItem {
  id?: string
  userId: string
  productId: string
  quantity: number
  createdAt: Date
}

// User types
export interface User {
  id?: string
  name?: string
  email: string
  role: 'ADMIN' | 'CLIENT'
  createdAt: Date
  updatedAt: Date
}

// Workshop types
export interface Workshop {
  id?: string
  title: string
  description: string
  location: string
  date?: Date
  price: number
  slots: number
  availableSlots: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface WorkshopBooking {
  id?: string
  workshopId: string
  userId: string
  slots: number
  totalPrice: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  createdAt: Date
}

// Training types
export interface Training {
  id?: string
  title: string
  description: string
  location: string
  date: Date
  price: number
  slots: number
  availableSlots: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TrainingBooking {
  id?: string
  trainingId: string
  userId: string
  slots: number
  totalPrice: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  createdAt: Date
}

// Review types
export interface Review {
  id?: string
  productId: string
  userId: string
  rating: number
  comment?: string
  createdAt: Date
}

// Wishlist types
export interface WishlistItem {
  id?: string
  userId: string
  productId: string
  createdAt: Date
}

// Product operations
export const getProducts = async (): Promise<Product[]> => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return products;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting products:', error);
    return [];
  }
};

export const getProduct = async (id: string): Promise<Product | null> => {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });
    
    return product;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting product:', error);
    return null;
  }
};

export const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const newProduct = await prisma.product.create({
      data: product,
    });
    
    return newProduct.id;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<void> => {
  try {
    await prisma.product.update({
      where: {
        id,
      },
      data: {
        ...product,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await prisma.product.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error deleting product:', error);
    throw error;
  }
};

// Cart operations
export const getCartItems = async (userId: string): Promise<CartItem[]> => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId,
      },
      include: {
        product: {
          select: {
            name: true,
            price: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return cartItems.map(item => ({
      id: item.id,
      userId: item.userId,
      productId: item.productId,
      quantity: item.quantity,
      createdAt: item.createdAt,
    }));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting cart items:', error);
    return [];
  }
};

export const addToCart = async (cartItem: Omit<CartItem, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: cartItem.userId,
          productId: cartItem.productId,
        },
      },
    });
    
    if (existingCartItem) {
      const updatedCartItem = await prisma.cartItem.update({
        where: {
          id: existingCartItem.id,
        },
        data: {
          quantity: existingCartItem.quantity + cartItem.quantity,
        },
      });
      return updatedCartItem.id;
    } else {
      const newCartItem = await prisma.cartItem.create({
        data: cartItem,
      });
      return newCartItem.id;
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error adding to cart:', error);
    throw error;
  }
};

export const updateCartItem = async (id: string, quantity: number): Promise<void> => {
  try {
    await prisma.cartItem.update({
      where: {
        id,
      },
      data: {
        quantity,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error updating cart item:', error);
    throw error;
  }
};

export const removeFromCart = async (id: string): Promise<void> => {
  try {
    await prisma.cartItem.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error removing from cart:', error);
    throw error;
  }
};

// Order operations
export const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const newOrder = await prisma.order.create({
      data: order as any,
    });
    
    return newOrder.id;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrders = async (userId: string): Promise<Order[]> => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return orders as any;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting orders:', error);
    return [];
  }
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });
    
    return order as any;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting order by ID:', error);
    return null;
  }
};

// User operations
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    
    return user as User | null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting user by ID:', error);
    return null;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    
    return user as User | null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting user by email:', error);
    return null;
  }
};

export const createUser = async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const newUser = await prisma.user.create({
      data: user,
    });
    
    return newUser.id;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error creating user:', error);
    throw error;
  }
};

// Workshop operations
export const getWorkshops = async (): Promise<Workshop[]> => {
  try {
    const workshops = await prisma.workshop.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return workshops as Workshop[];
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting workshops:', error);
    return [];
  }
};

export const getWorkshopById = async (id: string): Promise<Workshop | null> => {
  try {
    const workshop = await prisma.workshop.findUnique({
      where: {
        id,
      },
    });
    
    return workshop;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting workshop by ID:', error);
    return null;
  }
};

export const createWorkshopBooking = async (booking: Omit<WorkshopBooking, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const newBooking = await prisma.workshopBooking.create({
      data: booking,
    });
    
    return newBooking.id;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error creating workshop booking:', error);
    throw error;
  }
};

// Training operations
export const getTrainings = async (): Promise<Training[]> => {
  try {
    const trainings = await prisma.training.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return trainings as unknown as Training[];
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting trainings:', error);
    return [];
  }
};

export const getTrainingById = async (id: string): Promise<Training | null> => {
  try {
    const training = await prisma.training.findUnique({
      where: {
        id,
      },
    });
    
    return training as unknown as Training | null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting training by ID:', error);
    return null;
  }
};

export const createTrainingBooking = async (booking: Omit<TrainingBooking, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const newBooking = await prisma.trainingBooking.create({
      data: booking,
    });
    
    return newBooking.id;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error creating training booking:', error);
    throw error;
  }
};

// Review operations
export const getProductReviews = async (productId: string): Promise<Review[]> => {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        productId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return reviews as any;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting product reviews:', error);
    return [];
  }
};

export const createReview = async (review: Omit<Review, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const newReview = await prisma.review.create({
      data: review,
    });
    
    return newReview.id;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error creating review:', error);
    throw error;
  }
};

// Wishlist operations
export const getWishlistItems = async (userId: string): Promise<WishlistItem[]> => {
  try {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        userId,
      },
      include: {
        product: {
          select: {
            name: true,
            price: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return wishlistItems as any;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error getting wishlist items:', error);
    return [];
  }
};

export const addToWishlist = async (wishlistItem: Omit<WishlistItem, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const existingWishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: wishlistItem.userId,
          productId: wishlistItem.productId,
        },
      },
    });
    
    if (existingWishlistItem) {
      return existingWishlistItem.id;
    } else {
      const newWishlistItem = await prisma.wishlistItem.create({
        data: wishlistItem,
      });
      return newWishlistItem.id;
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const removeFromWishlist = async (userId: string, productId: string): Promise<void> => {
  try {
    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error removing from wishlist:', error);
    throw error;
  }
};

