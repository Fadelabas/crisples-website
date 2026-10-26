const STORAGE_KEY = 'crisples-cart-v1';

function readCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed)
      ? parsed.filter((item) => item && typeof item.id === 'string' && Number(item.quantity) > 0)
      : [];
  } catch {
    return [];
  }
}

let cart = readCart();
const listeners = new Set();

function commit() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  listeners.forEach((listener) => listener(getCart()));
}

export function getCart() {
  return cart.map((item) => ({ ...item }));
}

export function getCartCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export function addToCart(id, quantity = 1) {
  const amount = Math.max(1, Number.parseInt(quantity, 10) || 1);
  const existing = cart.find((item) => item.id === id);
  if (existing) existing.quantity += amount;
  else cart.push({ id, quantity: amount });
  commit();
}

export function updateQuantity(id, quantity) {
  const amount = Number.parseInt(quantity, 10) || 0;
  if (amount <= 0) cart = cart.filter((item) => item.id !== id);
  else cart = cart.map((item) => (item.id === id ? { ...item, quantity: amount } : item));
  commit();
}

export function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  commit();
}

export function clearCart() {
  cart = [];
  commit();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
