import { Component, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Plus,
} from "lucide-react";

/* 👇 YOUR LOGO IMAGE – change the file name/extension if different */
import logo from "./assets/logo.png";

import { useCart } from "./CartContext";
import { ALL_PRODUCTS as PRODUCTS } from "./searchCatalog"; // every product on the site (see searchCatalog.js)
import "./Navbar.css";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const ANNOUNCEMENTS = [
  "A WORLD OF FINE TASTES & THOUGHTFUL GIFTING",
  "COMPLIMENTARY GIFT PACKAGING ON SELECTED COLLECTIONS",
  "DISCOVER THE ART OF PREMIUM GIFTING",
];

/*
  ROUTES USED BY THIS NAVBAR (each one needs a <Route> in your router):
  /  /about  /dates  /nuts-dry-fruits  /chocolates  /gift-hampers
  /drinks-beverages  /contact  /search  /cart  /account  /wishlist
  The "?type=..." parts are only query strings — they never need their own route.
*/
const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  {
    label: "Dates",
    to: "/dates",
    mega: {
      title: "The Date Collection",
      blurb: "Hand-selected from the finest groves of Arabia.",
      image: "/menu/dates.jpg",
      cta: { label: "Shop All Dates", to: "/dates" },
      links: [
        { label: "Premium Arabian Dates", to: "/dates?type=premium-arabian" },
        { label: "Ajwa Dates", to: "/dates?type=ajwa" },
        { label: "Medjool Dates", to: "/dates?type=medjool" },
        { label: "Safawi Dates", to: "/dates?type=safawi" },
        { label: "Mabroom Dates", to: "/dates?type=mabroom" },
        { label: "Stuffed Dates", to: "/dates?type=stuffed" },
        { label: "Date Gift Collections", to: "/dates?type=gift-collections" },
      ],
    },
  },
  {
    label: "Nuts & Dry Fruits",
    to: "/nuts-dry-fruits",
    mega: {
      title: "Nuts & Dry Fruits",
      blurb: "Freshly sourced, carefully roasted, beautifully packed.",
      image: "/menu/nuts.jpg",
      cta: { label: "Shop All Nuts", to: "/nuts-dry-fruits" },
      links: [
        { label: "Almonds", to: "/nuts-dry-fruits?type=almonds" },
        { label: "Cashews", to: "/nuts-dry-fruits?type=cashews" },
        { label: "Pistachios", to: "/nuts-dry-fruits?type=pistachios" },
        { label: "Walnuts", to: "/nuts-dry-fruits?type=walnuts" },
        { label: "Hazelnuts", to: "/nuts-dry-fruits?type=hazelnuts" },
        { label: "Pecans", to: "/nuts-dry-fruits?type=pecans" },
        { label: "Dried Fruits", to: "/nuts-dry-fruits?type=dried-fruits" },
        { label: "Mixed Nuts", to: "/nuts-dry-fruits?type=mixed-nuts" },
      ],
    },
  },
  {
    label: "Chocolates",
    to: "/chocolates",
    mega: {
      title: "Fine Chocolates",
      blurb: "Rich cocoa meets the sweetness of heritage dates.",
      image: "/menu/chocolates.jpg",
      cta: { label: "Shop Chocolates", to: "/chocolates" },
      links: [
        { label: "Premium Chocolates", to: "/chocolates?type=premium" },
        { label: "Chocolate Dates", to: "/chocolates?type=chocolate-dates" },
        { label: "Assorted Chocolate Boxes", to: "/chocolates?type=assorted-boxes" },
        { label: "Nut Chocolates", to: "/chocolates?type=nut-chocolates" },
        { label: "Luxury Chocolate Collections", to: "/chocolates?type=luxury" },
      ],
    },
  },
  {
    label: "Gift Hampers & Customised Gifts",
    to: "/gift-hampers",
    mega: {
      title: "Gift Hampers",
      blurb: "Curated for every celebration, wrapped with care.",
      image: "/menu/hampers.jpg",
      cta: { label: "Explore Hampers", to: "/gift-hampers" },
      links: [
        { label: "Premium Gift Hampers", to: "/gift-hampers?type=premium" },
        { label: "Corporate Gift Hampers", to: "/gift-hampers?type=corporate" },
        { label: "Festive Hampers", to: "/gift-hampers?type=festive" },
        { label: "Celebration Hampers", to: "/gift-hampers?type=celebration" },
        { label: "Wedding Gift Hampers", to: "/gift-hampers?type=wedding" },
        { label: "Luxury Gift Boxes", to: "/gift-hampers?type=luxury-boxes" },
        { label: "Customised & Personalised Gifts", to: "/gift-hampers?type=customised" },
      ],
    },
  },
  {
    label: "DRINKS & BEVERAGES",
    to: "/drinks-beverages",
    mega: {
      title: "Drinks & Beverages",
      blurb: "Fresh juices, energy drinks, sparkling and premium bottles.",
      image: "/menu/drinks.jpg",
      cta: { label: "Explore Drinks", to: "/drinks-beverages" },
      links: [
        { label: "Fresh Juices", to: "/drinks-beverages?type=juices" },
        { label: "Energy Drinks", to: "/drinks-beverages?type=energy" },
        { label: "Sparkling Drinks", to: "/drinks-beverages?type=sparkling" },
        { label: "Premium Beverages", to: "/drinks-beverages?type=premium" },
        { label: "AL-NASR Collection", to: "/drinks-beverages?type=collection" },
      ],
    },
  },
  { label: "Contact", to: "/contact" },
];

const POPULAR_SEARCHES = ["Ajwa Dates", "Gift Hampers", "Pistachios", "Chocolate Dates"];

/* ------------------------------------------------------------------ */
/*  SMALL PIECES                                                       */
/* ------------------------------------------------------------------ */

/** Minimal Islamic eight-point star – tiny ornament in the mega menu */
const StarMark = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="nb-star">
    <rect x="5" y="5" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1" />
    <rect
      x="5"
      y="5"
      width="14"
      height="14"
      transform="rotate(45 12 12)"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    />
  </svg>
);

/** TEMPORARY DEBUG: shows any crash as a red box at the bottom of the screen (click it to close).
    Set to false once the problem is fixed. */
const DEBUG_ERRORS = false;

/** menu images live in /public/menu — prefix the site base path (e.g. "/Al-nasr/") so they load */
const asset = (p) => {
  let base = "/";
  try { base = import.meta.env.BASE_URL || "/"; } catch (e) { /* not Vite */ }
  return base.replace(/\/$/, "") + p;
};

/** If anything inside the mega menu ever throws, hide ONLY the menu — never blank the whole page. */
class MegaBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error, info) { console.error("[Navbar] mega menu error:", error, info); }
  render() { return this.state.failed ? null : this.props.children; }
}

/** Logo image */
const Logo = ({ onClick }) => (
  <Link to="/" className="nb-logo" aria-label="AL NASR – Home" onClick={onClick}>
    <img src={logo} alt="AL NASR" className="nb-logo-img" draggable="false" />
  </Link>
);

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */

export default function Navbar({
  /* optional overrides — by default the badge reads the shared cart */
  cartCount,
  wishlistCount = 0,
  products = PRODUCTS,
  onCartClick,
  /** true on pages with a full-bleed hero: navbar starts transparent and the hero sits under it */
  transparentOnTop = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const cart = useCart();
  const bagCount = cartCount ?? cart.count;

  const [announceIndex, setAnnounceIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [activeMega, setActiveMega] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const navRef = useRef(null);
  const searchInputRef = useRef(null);
  const megaTimer = useRef(null);
  const badgeRef = useRef(null);
  const prevCount = useRef(bagCount);

  /* temporary: show crashes on screen instead of a black page */
  useEffect(() => {
    if (!DEBUG_ERRORS) return undefined;
    const show = (msg) => {
      let box = document.getElementById("nb-debug");
      if (!box) {
        box = document.createElement("pre");
        box.id = "nb-debug";
        box.style.cssText =
          "position:fixed;left:0;right:0;bottom:0;z-index:2147483647;margin:0;padding:14px 16px;max-height:55vh;overflow:auto;background:#7a0b0b;color:#fff;font:12px/1.5 monospace;white-space:pre-wrap;cursor:pointer";
        box.onclick = () => box.remove();
        document.body.appendChild(box);
      }
      box.textContent = "ERROR (click to close)\n" + msg;
    };
    const onErr = (e) =>
      show(`${e.message}\n${e.filename || ""}:${e.lineno || ""}\n${(e.error && e.error.stack) || ""}`.slice(0, 2000));
    const onRej = (e) => show("Promise error: " + String((e.reason && (e.reason.stack || e.reason.message)) || e.reason).slice(0, 2000));
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    return () => {
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
    };
  }, []);

  /* announcement rotation */
  useEffect(() => {
    const id = setInterval(
      () => setAnnounceIndex((i) => (i + 1) % ANNOUNCEMENTS.length),
      4200
    );
    return () => clearInterval(id);
  }, []);

  /* scroll state – navbar ALWAYS stays visible; this only switches the style */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* navbar entrance (GSAP) */
  useEffect(() => {
    if (!navRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".nb-left .nb-logo", { y: -14, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.15 });
      gsap.from(".nb-link-item", {
        y: -12,
        opacity: 0,
        duration: 0.7,
        stagger: 0.06,
        ease: "power3.out",
        delay: 0.3,
      });
      gsap.from(".nb-actions > *", {
        y: -12,
        opacity: 0,
        duration: 0.6,
        stagger: 0.07,
        ease: "power3.out",
        delay: 0.55,
      });
    }, navRef);
    return () => ctx.revert();
  }, []);

  /* cart badge pop when count increases */
  useEffect(() => {
    if (bagCount > prevCount.current && badgeRef.current) {
      gsap.fromTo(
        badgeRef.current,
        { scale: 1.6 },
        { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" }
      );
    }
    prevCount.current = bagCount;
  }, [bagCount]);

  /* close everything on route change */
  useEffect(() => {
    setActiveMega(null);
    setMobileOpen(false);
    setSearchOpen(false);
    setQuery("");
  }, [location.pathname, location.search]);

  /* lock body scroll while overlays are open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, searchOpen]);

  /* escape key */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setActiveMega(null);
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 250);
  }, [searchOpen]);

  /* mega menu hover with small intent delay */
  const openMega = useCallback((label) => {
    clearTimeout(megaTimer.current);
    setActiveMega(label);
  }, []);
  const closeMega = useCallback(() => {
    clearTimeout(megaTimer.current);
    megaTimer.current = setTimeout(() => setActiveMega(null), 140);
  }, []);

  /* search suggestions */
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const words = q.split(/\s+/).filter(Boolean);
    return products
      .filter((p) => {
        const hay = `${p.name} ${p.category || ""}`.toLowerCase();
        return words.every((w) => hay.includes(w));
      })
      .slice(0, 6);
  }, [query, products]);

  const goSearch = (text) => {
    const q = text.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const submitSearch = (e) => {
    e?.preventDefault();
    goSearch(query);
  };

  const handleCart = () => {
    if (onCartClick) onCartClick();
    else navigate("/cart");
  };

  const solid = scrolled || !transparentOnTop || activeMega || mobileOpen;
  const activeItem = NAV_ITEMS.find((n) => n.label === activeMega);

  /* Everything lives inside ONE wrapper element (display: contents → no layout change).
     Without it, React inserts the backdrop / search / menu next to the page's own elements,
     and GSAP's ScrollTrigger pin-spacers move those → "insertBefore ... not a child of this node". */
  return (
    <div className="nb-root">
      {/* ---------------- FIXED SHELL: announcement + navbar ---------------- */}
      <div className={`nb-shell ${scrolled ? "is-scrolled" : ""}`}>
        {/* announcement bar (collapses smoothly after scrolling) */}
        <div className="nb-announce" role="region" aria-label="Announcements">
          <div className="nb-announce-inner">
            <AnimatePresence mode="wait">
              <motion.p
                key={announceIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                aria-live="polite"
              >
                {ANNOUNCEMENTS[announceIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* main nav */}
        <header
          ref={navRef}
          className={`nb ${solid ? "is-solid" : "is-clear"}`}
          onMouseLeave={closeMega}
        >
          <div className="nb-bar">
            {/* left */}
            <div className="nb-left">
              <button
                className="nb-icon-btn nb-burger"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(true)}
              >
                <Menu size={22} strokeWidth={1.4} />
              </button>
              <Logo />
            </div>

            {/* center */}
            <nav className="nb-center" aria-label="Primary">
              <ul className="nb-links">
                {NAV_ITEMS.map((item) => (
                  <li
                    key={item.label}
                    className="nb-link-item"
                    onMouseEnter={() => (item.mega ? openMega(item.label) : setActiveMega(null))}
                  >
                    {item.mega ? (
                      <div className="nb-link-wrap">
                        <NavLink
                          to={item.to}
                          end
                          className={({ isActive }) =>
                            `nb-link ${isActive ? "is-active" : ""} ${activeMega === item.label ? "is-open" : ""}`
                          }
                        >
                          {item.label}
                        </NavLink>
                        <button
                          className="nb-chevron"
                          aria-label={`Toggle ${item.label} menu`}
                          aria-expanded={activeMega === item.label}
                          aria-haspopup="true"
                          onClick={() =>
                            setActiveMega(activeMega === item.label ? null : item.label)
                          }
                          onFocus={() => openMega(item.label)}
                        >
                          <ChevronDown size={12} strokeWidth={1.6} />
                        </button>
                      </div>
                    ) : (
                      <NavLink
                        to={item.to}
                        end
                        className={({ isActive }) => `nb-link ${isActive ? "is-active" : ""}`}
                      >
                        {item.label}
                      </NavLink>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* right */}
            <div className="nb-actions">
              <button className="nb-icon-btn" aria-label="Search" onClick={() => setSearchOpen(true)}>
                <Search size={20} strokeWidth={1.4} />
              </button>
              <Link to="/account" className="nb-icon-btn nb-hide-sm" aria-label="My account">
                <User size={20} strokeWidth={1.4} />
              </Link>
              <Link to="/wishlist" className="nb-icon-btn nb-hide-sm" aria-label={`Wishlist, ${wishlistCount} items`}>
                <Heart size={20} strokeWidth={1.4} />
                {wishlistCount > 0 && <span className="nb-badge nb-badge-soft">{wishlistCount}</span>}
              </Link>
              <button className="nb-icon-btn" aria-label={`Shopping bag, ${bagCount} items`} onClick={handleCart}>
                <ShoppingBag size={20} strokeWidth={1.4} />
                <span ref={badgeRef} className={`nb-badge ${bagCount === 0 ? "is-empty" : ""}`}>
                  {bagCount}
                </span>
              </button>
            </div>
          </div>

          {/* ---------------- MEGA MENU (plain React + CSS animation: no unmount animations) ---------------- */}
          {activeItem?.mega && (
            <div
              className="nb-mega"
              onMouseEnter={() => openMega(activeItem.label)}
              onMouseLeave={closeMega}
            >
              <div className="nb-mega-inner">
                <MegaBoundary key={activeItem.label}>
                  <div className="nb-mega-grid">
                    <div className="nb-mega-links">
                      <span className="nb-eyebrow">{activeItem.label}</span>
                      <h3 className="nb-mega-title">{activeItem.mega.title}</h3>
                      <p className="nb-mega-blurb">{activeItem.mega.blurb}</p>
                      <ul>
                        {activeItem.mega.links.map((l, i) => (
                          <li key={l.label} style={{ "--i": i }}>
                            <Link to={l.to} className="nb-mega-link">
                              <span>{l.label}</span>
                              <ArrowRight size={14} strokeWidth={1.4} />
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link to={activeItem.mega.cta.to} className="nb-cta">
                        {activeItem.mega.cta.label}
                      </Link>
                    </div>

                    <Link to={activeItem.mega.cta.to} className="nb-mega-visual" aria-label={activeItem.mega.cta.label}>
                      <div
                        className="nb-mega-img"
                        style={{ backgroundImage: `url(${asset(activeItem.mega.image)})` }}
                      />
                      <div className="nb-mega-frame" />
                      <span className="nb-mega-caption">
                        <StarMark size={14} /> {activeItem.mega.title}
                      </span>
                    </Link>
                  </div>
                </MegaBoundary>
              </div>
            </div>
          )}
        </header>
      </div>

      {/* spacer so page content starts below the fixed navbar
          (skipped when the hero should sit underneath it) */}
      <div className={`nb-spacer ${transparentOnTop ? "is-overlay" : ""}`} aria-hidden="true" />

      {/* ---------------- MEGA BACKDROP ---------------- */}
      {activeMega && <div className="nb-backdrop" onMouseEnter={() => setActiveMega(null)} />}

      {/* ---------------- SEARCH OVERLAY ---------------- */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="nb-search"
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button className="nb-icon-btn nb-search-close" aria-label="Close search" onClick={() => setSearchOpen(false)}>
              <X size={24} strokeWidth={1.3} />
            </button>

            <motion.div
              className="nb-search-box"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <form onSubmit={submitSearch} className="nb-search-form" role="search">
                <Search size={22} strokeWidth={1.3} />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search dates, nuts, chocolates, hampers…"
                  aria-label="Search"
                  autoComplete="off"
                />
                <button type="submit" className="nb-search-go">Search</button>
              </form>

              {suggestions.length > 0 ? (
                <ul className="nb-suggest" aria-label="Suggestions">
                  {suggestions.map((p) => (
                    <li key={p.id}>
                      <Link to={`/search?q=${encodeURIComponent(p.name)}`}>
                        <span>{p.name}</span>
                        <em>{p.category}</em>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : query.trim().length >= 2 ? (
                <p className="nb-suggest-empty">No products found for “{query}”.</p>
              ) : (
                <div className="nb-popular">
                  <span className="nb-eyebrow">Popular searches</span>
                  <div>
                    {POPULAR_SEARCHES.map((s) => (
                      <button key={s} onClick={() => goSearch(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- MOBILE MENU ---------------- */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="nb-m-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="nb-m-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="nb-m-head">
                <Logo onClick={() => setMobileOpen(false)} />
                <button className="nb-icon-btn" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
                  <X size={22} strokeWidth={1.4} />
                </button>
              </div>

              <ul className="nb-m-list">
                {NAV_ITEMS.map((item, i) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 + i * 0.045, duration: 0.4 }}
                  >
                    {item.mega ? (
                      <>
                        <button
                          className="nb-m-row"
                          aria-expanded={mobileExpanded === item.label}
                          onClick={() =>
                            setMobileExpanded(mobileExpanded === item.label ? null : item.label)
                          }
                        >
                          <span>{item.label}</span>
                          <Plus
                            size={16}
                            strokeWidth={1.4}
                            className={mobileExpanded === item.label ? "is-rot" : ""}
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {mobileExpanded === item.label && (
                            <motion.ul
                              className="nb-m-sub"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            >
                              <li>
                                <Link to={item.to} onClick={() => setMobileOpen(false)} className="nb-m-all">
                                  View all {item.label}
                                </Link>
                              </li>
                              {item.mega.links.map((l) => (
                                <li key={l.label}>
                                  <Link to={l.to} onClick={() => setMobileOpen(false)}>
                                    {l.label}
                                  </Link>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link to={item.to} className="nb-m-row" onClick={() => setMobileOpen(false)}>
                        <span>{item.label}</span>
                      </Link>
                    )}
                  </motion.li>
                ))}
              </ul>

              <div className="nb-m-foot">
                <Link to="/account" onClick={() => setMobileOpen(false)}>
                  <User size={18} strokeWidth={1.4} /> My Account
                </Link>
                <Link to="/wishlist" onClick={() => setMobileOpen(false)}>
                  <Heart size={18} strokeWidth={1.4} /> Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </Link>
                <Link to="/cart" onClick={() => setMobileOpen(false)}>
                  <ShoppingBag size={18} strokeWidth={1.4} /> Bag {bagCount > 0 && `(${bagCount})`}
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}