import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search as SearchIcon, ShoppingBag, Check } from "lucide-react";
import { useCart } from "./CartContext";
import { ALL_PRODUCTS, formatPrice, searchProducts } from "./searchCatalog";
import "./Search.css";

/**
 * Search results page — route: /search?q=...
 * Searches EVERY product (dates, nuts, chocolates, hampers, drinks…) — see searchCatalog.js.
 * Each result has "Add to bag" and "Buy now" (adds, then opens the cart).
 * Pass your own list with <Search products={myProducts} />.
 */
export default function Search({ products = ALL_PRODUCTS }) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { add } = useCart();

  const q = (params.get("q") || "").trim();
  const [text, setText] = useState(q);
  const [cat, setCat] = useState("all");
  const [justAdded, setJustAdded] = useState(null);
  const [picked, setPicked] = useState({}); // product id → chosen size index

  useEffect(() => setText(q), [q]);
  useEffect(() => setCat("all"), [q]);
  useEffect(() => {
    if (!justAdded) return undefined;
    const id = setTimeout(() => setJustAdded(null), 1600);
    return () => clearTimeout(id);
  }, [justAdded]);

  const found = useMemo(() => searchProducts(products, q), [q, products]);

  const cats = useMemo(() => {
    const m = new Map();
    found.forEach((p) => m.set(p.category, (m.get(p.category) || 0) + 1));
    return [...m.entries()];
  }, [found]);

  const results = cat === "all" ? found : found.filter((p) => p.category === cat);

  const submit = (e) => {
    e.preventDefault();
    const next = text.trim();
    setParams(next ? { q: next } : {});
  };

  /* the cart item for the chosen size of a product */
  const lineFor = (p) => {
    const v = p.variants[picked[p.id] || 0];
    return {
      id: v && v.label ? `${p.id}-${v.label.toLowerCase().replace(/\s+/g, "")}` : p.id,
      name: p.name,
      price: v ? v.price : 0,
      category: p.category,
      weight: v ? v.label : "",
      image: p.image || null,
    };
  };
  const addToBag = (p) => {
    add(lineFor(p), 1);
    setJustAdded(p.id);
  };
  const buyNow = (p) => {
    add(lineFor(p), 1);
    navigate("/cart");
  };

  return (
    <main className="sr-page">
      <div className="sr">
        <form className="sr-form" onSubmit={submit} role="search">
          <SearchIcon size={20} strokeWidth={1.4} aria-hidden="true" />
          <input
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search dates, nuts, chocolates, hampers, drinks…"
            aria-label="Search products"
          />
          <button type="submit">Search</button>
        </form>

        <h1 className="sr-title">
          {q ? <>Results for “{q}”</> : "All products"}
          <span>{results.length} {results.length === 1 ? "product" : "products"}</span>
        </h1>

        {cats.length > 1 && (
          <div className="sr-chips" role="group" aria-label="Filter by category">
            <button type="button" className={cat === "all" ? "on" : ""} onClick={() => setCat("all")}>
              All <em>{found.length}</em>
            </button>
            {cats.map(([c, n]) => (
              <button key={c} type="button" className={cat === c ? "on" : ""} onClick={() => setCat(c)}>
                {c} <em>{n}</em>
              </button>
            ))}
          </div>
        )}

        {results.length === 0 ? (
          <div className="sr-empty">
            <p>No products found. Try a shorter word, or browse a collection.</p>
            <div>
              <Link to="/dates">Dates</Link>
              <Link to="/nuts-dry-fruits">Nuts &amp; Dry Fruits</Link>
              <Link to="/chocolates">Chocolates</Link>
              <Link to="/gift-hampers">Gift Hampers</Link>
              <Link to="/drinks-beverages">Drinks</Link>
            </div>
          </div>
        ) : (
          <ul className="sr-grid">
            {results.map((p) => {
              const vi = picked[p.id] || 0;
              const v = p.variants[vi];
              return (
                <li key={p.id} className="sr-card">
                  <div className="sr-thumb" aria-hidden="true">
                    {p.image ? <img src={p.image} alt="" loading="lazy" /> : <span>{p.name.slice(0, 2)}</span>}
                  </div>
                  <div className="sr-body">
                    <span className="sr-cat">{p.category}</span>
                    <h2 className="sr-name">{p.name}</h2>
                    {p.sub && <span className="sr-meta">{p.sub}</span>}
                    {p.variants.length > 1 ? (
                      <select
                        className="sr-select"
                        value={vi}
                        aria-label={`${p.name} size`}
                        onChange={(e) => setPicked((s) => ({ ...s, [p.id]: +e.target.value }))}
                      >
                        {p.variants.map((x, i) => (
                          <option key={x.label + i} value={i}>{x.label || "Standard"}</option>
                        ))}
                      </select>
                    ) : (
                      v && v.label && <span className="sr-meta">{v.label}</span>
                    )}
                    {v && <strong className="sr-price">{formatPrice(v.price)}</strong>}
                  </div>
                  {v ? (
                    <div className="sr-actions">
                      <button type="button" className="sr-btn sr-btn-ghost" onClick={() => addToBag(p)}>
                        {justAdded === p.id ? <><Check size={15} /> Added</> : <><ShoppingBag size={15} /> Add to bag</>}
                      </button>
                      <button type="button" className="sr-btn" onClick={() => buyNow(p)}>Buy now</button>
                    </div>
                  ) : (
                    <div className="sr-actions sr-actions-one">
                      <Link className="sr-btn" to={p.to}>View in {p.category}</Link>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}