import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, X, ArrowLeft, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "./CartContext";
import { DATES_PRODUCTS, WEIGHTS, WEIGHT_LABELS, CURRENCY } from "./datesData";
import { NUTS_PRODUCTS } from "./nutsData";
import { BRANDS, SNACKS } from "./chocolateData";
import "./Wishlist.css";

/* Same storage key + event the Dates and Nuts pages use when you tap the heart */
const WISH_KEY = "alnasr_wishlist";

/* Chocolates + snacks: one fixed price, no weight options */
const CHOCOLATE_PRODUCTS = [...BRANDS.flatMap((b) => b.products), ...SNACKS].map((p) => ({
  id: p.id,
  name: p.fullName,
  desc: p.brand ? `${p.brand} chocolate` : "Treats & snacks",
  img: p.img,
  price: p.price, // fixed price → no weight picker
  category: p.brand || "Chocolates",
}));

/* Every shop product in one list, each tagged with its category */
const ALL_PRODUCTS = [
  ...DATES_PRODUCTS.map((p) => ({ ...p, category: "Dates" })),
  ...NUTS_PRODUCTS.map((p) => ({ ...p, category: "Nuts & Dry Fruits" })),
  ...CHOCOLATE_PRODUCTS,
];

const readWish = () => {
  try {
    const v = JSON.parse(localStorage.getItem(WISH_KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

/* Image with a soft fallback */
function Photo({ src, alt }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) return <div className="wl-ph" role="img" aria-label={alt} />;
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}

/**
 * Wishlist page — route: /wishlist
 * Shows every product hearted on the Dates page AND the Nuts & Dry Fruits page.
 */
export default function Wishlist() {
  const { add } = useCart();
  const [ids, setIds] = useState(readWish);
  const [sel, setSel] = useState({}); // chosen weight per product (default 250g)
  const [toast, setToast] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* stay in sync if the wishlist changes in another tab / component */
  useEffect(() => {
    const sync = () => setIds(readWish());
    window.addEventListener("alnasr:wishlist", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("alnasr:wishlist", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const save = useCallback((next) => {
    setIds(next);
    try {
      localStorage.setItem(WISH_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
    window.dispatchEvent(new CustomEvent("alnasr:wishlist", { detail: next }));
  }, []);

  const remove = (id) => save(ids.filter((x) => x !== id));
  const clearAll = () => save([]);

  /* products in the order they were hearted; unknown ids are ignored */
  const items = ids
    .map((id) => ALL_PRODUCTS.find((p) => p.id === id))
    .filter(Boolean);

  const addToCart = (p) => {
    const fixed = p.price != null; // chocolates: no weight
    const weight = fixed ? "" : sel[p.id] || WEIGHTS[0];
    add(
      {
        id: fixed ? p.id : `${p.id}-${weight}`,
        name: p.name,
        category: p.category, // "Dates", "Nuts & Dry Fruits" or the chocolate brand
        slug: p.id,
        weight,
        price: fixed ? p.price : p.prices[weight],
        image: p.img,
      },
      1
    );
    setToast(`${p.name}${weight ? ` · ${weight}` : ""} added to your cart`);
  };

  /* ---------- empty ---------- */
  if (items.length === 0) {
    return (
      <main className="wl wl-empty">
        <Heart size={44} strokeWidth={1.1} aria-hidden="true" />
        <h1 className="wl-title">Your wishlist is empty</h1>
        <p className="wl-muted">Tap the heart on any product to save it here.</p>
        <div className="wl-empty-links">
          <Link to="/dates" className="wl-btn">Shop dates</Link>
          <Link to="/nuts-dry-fruits" className="wl-btn">Shop nuts &amp; dry fruits</Link>
          <Link to="/" className="wl-btn wl-btn-ghost">Back to home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="wl">
      <div className="wl-head">
        <div>
          <p className="wl-eyebrow">AL-NASR</p>
          <h1 className="wl-title">My wishlist</h1>
          <p className="wl-muted">
            {items.length} {items.length === 1 ? "product" : "products"} saved
          </p>
        </div>
        <div className="wl-head-actions">
          <Link to="/dates" className="wl-back"><ArrowLeft size={16} /> Continue shopping</Link>
          <button type="button" className="wl-clear" onClick={clearAll}>Clear wishlist</button>
        </div>
      </div>

      <ul className="wl-grid">
        {items.map((p) => {
          const fixed = p.price != null;
          const weight = sel[p.id] || WEIGHTS[0];
          const price = fixed ? p.price : p.prices[weight];
          return (
            <li className="wl-card" key={p.id}>
              <div className="wl-img">
                <Photo src={p.img} alt={p.name} />
                <button
                  type="button"
                  className="wl-remove"
                  onClick={() => remove(p.id)}
                  aria-label={`Remove ${p.name} from wishlist`}
                >
                  <X size={16} />
                </button>
              </div>

              <h2>{p.name}</h2>
              <p className="wl-desc">{p.desc}</p>

              {!fixed && (
                <div className="wl-weights" role="radiogroup" aria-label={`Weight for ${p.name}`}>
                  {WEIGHTS.map((w) => (
                    <button
                      key={w}
                      type="button"
                      role="radio"
                      aria-checked={weight === w}
                      className={weight === w ? "active" : ""}
                      onClick={() => setSel((s) => ({ ...s, [p.id]: w }))}
                      title={WEIGHT_LABELS[w]}
                    >
                      {w === "250g" ? "250g" : "1 KG"}
                    </button>
                  ))}
                </div>
              )}

              <div className="wl-foot">
                <strong>{CURRENCY}{price.toLocaleString("en-IN")}</strong>
                <button type="button" className="wl-btn wl-add" onClick={() => addToCart(p)}>
                  <ShoppingBag size={15} /> Add to Cart
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="wl-toast"
            role="status"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Check size={16} /> {toast}
            <Link to="/cart" className="wl-toast-link">View cart</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}