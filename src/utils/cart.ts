export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  company: string;
}

const KEY = "cart_items";

export const getCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

export const setCart = (items: CartItem[]) => {
  localStorage.setItem(KEY, JSON.stringify(items));
};

export const addToCart = (item: Omit<CartItem, "quantity">, qty = 1) => {
  const cart = getCart();
  const idx = cart.findIndex((i) => i.id === item.id);
  if (idx >= 0) {
    cart[idx] = { ...cart[idx], quantity: cart[idx].quantity + qty };
  } else {
    cart.push({ ...item, quantity: Math.max(1, qty) });
  }
  setCart(cart);
  return cart;
};

export const updateQuantity = (id: string, delta: number) => {
  const cart = getCart().map((i) => (i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  setCart(cart);
  return cart;
};

export const removeFromCart = (id: string) => {
  const cart = getCart().filter((i) => i.id !== id);
  setCart(cart);
  return cart;
};

export const clearCart = () => setCart([]);
