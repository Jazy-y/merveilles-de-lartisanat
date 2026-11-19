'use client'

export interface CartProduct {
  id: string
  name: string
  price: number
  images: string[]
}

export interface CartItem extends CartProduct {
  quantity: number;
}

const CART_KEY = 'cart';

export const getCart = (): CartItem[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
};

export const addToCart = (product: CartProduct, quantity: number = 1) => {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === product.id);

  let newCart;
  if (existingItem) {
    newCart = cart.map(item =>
      item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
    );
  } else {
    newCart = [...cart, { ...product, quantity }];
  }

  localStorage.setItem(CART_KEY, JSON.stringify(newCart));
  window.dispatchEvent(new Event('storage'));
};

export const removeFromCart = (productId: string) => {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('storage'));
};

export const updateCartItemQuantity = (productId: string, quantity: number) => {
  let cart = getCart();
  if (quantity <= 0) {
    cart = cart.filter(item => item.id !== productId);
  } else {
    cart = cart.map(item => (item.id === productId ? { ...item, quantity } : item));
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('storage'));
};

export const clearCart = () => {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event('storage'));
};

export const getCartTotal = () => {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
};
