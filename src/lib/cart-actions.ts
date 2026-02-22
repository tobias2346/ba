'use client';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  features: string[];
  iconName?: string; // <- guardamos el nombre del icono, no el componente
  quantity: number;
};


const CART_KEY = 'cart';

export const getCart = (): CartItem[] => {

  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Error reading cart:', err);
    return [];
  }
};

export const saveCart = (cart: CartItem[]) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (err) {
    console.error('Error saving cart:', err);
  }
};

export const addToCart = (item: CartItem) => {
  const cart = getCart();
  const existing = cart.find((p) => p.id === item.id);

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }

  saveCart(cart);
};

export const removeFromCart = (id: string) => {
  const cart = getCart().filter((item) => item.id !== id);
  saveCart(cart);
};

export const updateQuantity = (id: string, quantity: number) => {
  const cart = getCart().map((item) =>
    item.id === id ? { ...item, quantity } : item
  );
  saveCart(cart);
};

export const clearCart = () => {
  saveCart([]);
};
