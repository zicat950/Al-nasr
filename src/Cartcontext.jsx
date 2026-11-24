import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";

/**
 * Shared cart. Wrap the whole app once:
 *   <BrowserRouter><CartProvider><App /></CartProvider></BrowserRouter>
 * Items are saved in localStorage, so the cart survives refresh.
 */
const KEY = "alnasr-cart-v1";
const Ctx = createContext(null);

const load = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};

const MAX_QTY = 99;

function reducer(state, a) {
  switch (a.type) {
    case "add": {
      const qty = a.qty || 1;
      const found = state.some((x) => x.id === a.item.id);
      if (found) {
        return state.map((x) => (x.id === a.item.id ? { ...x, qty: Math.min(MAX_QTY, x.qty + qty) } : x));
      }
      const { id, name, category, price, slug, weight, image } = a.item;
      return [...state, { id, name, category, price, slug, weight, image, qty }];
    }
    case "qty":
      return state.map((x) => (x.id === a.id ? { ...x, qty: Math.max(1, Math.min(MAX_QTY, a.qty)) } : x));
    case "remove":
      return state.filter((x) => x.id !== a.id);
    case "clear":
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage full or blocked — cart still works for this session */
    }
  }, [items]);

  const add = useCallback((item, qty = 1) => dispatch({ type: "add", item, qty }), []);
  const setQty = useCallback((id, qty) => dispatch({ type: "qty", id, qty }), []);
  const remove = useCallback((id) => dispatch({ type: "remove", id }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((n, x) => n + x.qty, 0),
      subtotal: items.reduce((n, x) => n + x.qty * x.price, 0),
      add,
      setQty,
      remove,
      clear,
    }),
    [items, add, setQty, remove, clear]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

const EMPTY = { items: [], count: 0, subtotal: 0, add() {}, setQty() {}, remove() {}, clear() {} };

export function useCart() {
  const v = useContext(Ctx);
  if (!v) {
    // Never crash the page (white screen) if the provider is missing — just warn.
    console.warn("[AL NASR] <CartProvider> is missing. Wrap your app with it so the cart works.");
    return EMPTY;
  }
  return v;
}