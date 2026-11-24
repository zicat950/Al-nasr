import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const Ctx = createContext(null);

const load = (k) => {
  try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; }
};
const save = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ }
};

/** Wrap your app once:  <ShopProvider><App /></ShopProvider>  (inside <BrowserRouter>) */
export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() => load('alnasr-cart'));   // [{ id, qty }]
  const [wish, setWish] = useState(() => load('alnasr-wish'));   // [id]

  useEffect(() => save('alnasr-cart', cart), [cart]);
  useEffect(() => save('alnasr-wish', wish), [wish]);

  const addToCart = useCallback((id, qty = 1) => {
    setCart((c) => (c.some((x) => x.id === id)
      ? c.map((x) => (x.id === id ? { ...x, qty: x.qty + qty } : x))
      : [...c, { id, qty }]));
  }, []);
  const setQty = useCallback((id, qty) => {
    setCart((c) => (qty <= 0 ? c.filter((x) => x.id !== id) : c.map((x) => (x.id === id ? { ...x, qty } : x))));
  }, []);
  const removeFromCart = useCallback((id) => setCart((c) => c.filter((x) => x.id !== id)), []);
  const clearCart = useCallback(() => setCart([]), []);

  const addToWish = useCallback((id) => setWish((w) => (w.includes(id) ? w : [...w, id])), []);
  const removeFromWish = useCallback((id) => setWish((w) => w.filter((x) => x !== id)), []);

  const value = useMemo(() => ({
    cart, wish,
    cartCount: cart.reduce((n, x) => n + x.qty, 0),
    addToCart, setQty, removeFromCart, clearCart, addToWish, removeFromWish,
  }), [cart, wish, addToCart, setQty, removeFromCart, clearCart, addToWish, removeFromWish]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useShop = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useShop must be used inside <ShopProvider>');
  return v;
};