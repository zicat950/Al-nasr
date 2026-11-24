import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight, ShoppingBag, Check } from "lucide-react";
import { useCart } from "./CartContext";
import { NUTS_PRODUCTS, WEIGHTS, WEIGHT_LABELS, CURRENCY } from "./nutsData";
import "./Nuts.css";

/* ------------------------------------------------------------------
   IMAGES  ->  src/assets/
   Product photos + prices now live in  src/nutsData.js
   (the 30 shop products). The images below are for the page design.
------------------------------------------------------------------- */
// hero composition (bowls + nuts on stone, white background)
import heroCompImg from "./assets/dry.png";

// 02 · category cards
import catAlmondImg from "./assets/almond1.png";
import catCashewImg from "./assets/cashew.png";
import catPistachioImg from "./assets/pista.png";
import catWalnutImg from "./assets/walnuts1.png";
import catHazelPecanImg from "./assets/hazel.png";
import catDriedImg from "./assets/dry1.png";

// 04 · gifting
import giftBoxImg from "./assets/gift.png";
import giftDetailImg from "./assets/gift.png";

gsap.registerPlugin(ScrollTrigger);

/* Floating nut cutouts (transparent PNGs) — served from public/nuts/.
   Change the file names to match your folder. A missing file shows a
   soft nut-coloured shape instead, so nothing breaks. */
const CUTS = [
  { src: "/nuts/almond-1.png", tone: "#a9774a", w: 74, from: "l", d: 1.5, x: 8, y: 14 },
  { src: "/nuts/cashew-1.png", tone: "#e3cfa2", w: 70, from: "t", d: 1.2, x: 24, y: 2 },
  { src: "/nuts/pistachio-1.png", tone: "#9fae7a", w: 56, from: "t", d: 0.9, x: 44, y: 6 },
  { src: "/nuts/almond-2.png", tone: "#a9774a", w: 66, from: "r", d: 1.4, x: 64, y: 0 },
  { src: "/nuts/cashew-2.png", tone: "#e3cfa2", w: 64, from: "r", d: 1.0, x: 82, y: 12 },
  { src: "/nuts/pistachio-2.png", tone: "#9fae7a", w: 50, from: "l", d: 0.7, x: 14, y: 34 },
  { src: "/nuts/walnut-1.png", tone: "#8a6a46", w: 78, from: "b", d: 1.6, x: 34, y: 22 },
  { src: "/nuts/hazelnut-1.png", tone: "#a37a4f", w: 52, from: "t", d: 0.8, x: 56, y: 24 },
  { src: "/nuts/pecan-1.png", tone: "#7b4f33", w: 68, from: "r", d: 1.3, x: 76, y: 32 },
  { src: "/nuts/almond-3.png", tone: "#a9774a", w: 48, from: "l", d: 0.6, x: 4, y: 48 },
  { src: "/nuts/cashew-3.png", tone: "#e3cfa2", w: 46, from: "b", d: 0.6, x: 90, y: 46 },
  { src: "/nuts/pistachio-3.png", tone: "#9fae7a", w: 44, from: "t", d: 0.5, x: 50, y: 40 },
];

const CART_ROUTE = "/cart"; // page opened after Add to Cart
const WISH_KEY = "alnasr_wishlist"; // shared with the Wishlist page + navbar

const CATEGORIES = [
  { n: "01", name: "Almonds", desc: "Natural almonds with beautiful textures and authentic appearance.", img: catAlmondImg, tone: "#a9774a" },
  { n: "02", name: "Cashews", desc: "Premium whole cashews with creamy natural colour.", img: catCashewImg, tone: "#e3cfa2" },
  { n: "03", name: "Pistachios", desc: "Beautiful green pistachio kernels and natural shells.", img: catPistachioImg, tone: "#9fae7a" },
  { n: "04", name: "Walnuts", desc: "Premium walnut kernels with realistic detailed textures.", img: catWalnutImg, tone: "#8a6a46" },
  { n: "05", name: "Hazelnuts & Pecans", desc: "Carefully selected premium nuts.", img: catHazelPecanImg, tone: "#7b4f33" },
  { n: "06", name: "Dried Fruits", desc: "Dried apricots, raisins, figs and cranberries.", img: catDriedImg, tone: "#c0843a" },
];

/* wishlist helpers (localStorage = survives refresh + page changes) */
const readWish = () => {
  try {
    const v = JSON.parse(localStorage.getItem(WISH_KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

/* image with graceful fallback */
function Photo({ src, alt, className = "", tone, ...rest }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div
        className={`nx-ph ${className}`}
        role="img"
        aria-label={alt}
        style={tone ? { "--tone": tone } : undefined}
        {...rest}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}

/* split into words / characters for typographic animation */
const Words = ({ text }) =>
  text.split(" ").map((w, i) => (
    <span className="nx-word" key={i}>
      <span className="nx-word-in">{w}&nbsp;</span>
    </span>
  ));
const Chars = ({ text }) =>
  text.split(" ").map((w, i) => (
    <span className="nx-cword" key={i}>
      {w.split("").map((c, j) => (
        <span className="nx-char" key={j}>{c}</span>
      ))}
      &nbsp;
    </span>
  ));

export default function Nuts() {
  const root = useRef(null);
  const toastTimer = useRef(null);
  const navigate = useNavigate();
  const { add } = useCart(); // shared cart (same one the Cart page reads)

  const [wish, setWish] = useState(readWish);
  /* selected weight per product: "250g" | "1kg"  (default 250g) */
  const [sel, setSel] = useState(() =>
    Object.fromEntries(NUTS_PRODUCTS.map((p) => [p.id, WEIGHTS[0]]))
  );
  const [toast, setToast] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    if (!reduce) html.style.scrollBehavior = "smooth";
    return () => {
      html.style.scrollBehavior = prev;
      clearTimeout(toastTimer.current);
    };
  }, []);

  /* keep hearts in sync when the wishlist changes elsewhere
     (Wishlist page, navbar, another tab) */
  useEffect(() => {
    const sync = () => setWish(readWish());
    window.addEventListener("alnasr:wishlist", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("alnasr:wishlist", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggleWish = useCallback((id) => {
    const current = readWish();
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    try {
      localStorage.setItem(WISH_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
    setWish(next);
    window.dispatchEvent(new CustomEvent("alnasr:wishlist", { detail: next }));
  }, []);

  const addToCart = (p) => {
    const weight = sel[p.id] || WEIGHTS[0];
    add(
      {
        id: `${p.id}-${weight}`, // same product + same weight => qty + 1
        name: p.name,
        category: "Nuts & Dry Fruits",
        slug: p.id,
        weight, // "250g" | "1kg"
        price: p.prices[weight], // unit price for the chosen weight
        image: p.img,
      },
      1
    );

    setToast(`${p.name} · ${weight} added to your cart`);
    clearTimeout(toastTimer.current);
    /* brief confirmation, then go to the cart */
    toastTimer.current = setTimeout(() => {
      setToast(null);
      navigate(CART_ROUTE);
    }, 700);
  };

  /* ----------------------------- GSAP ----------------------------- */
  useEffect(() => {
    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      mm.add(
        {
          full: "(prefers-reduced-motion: no-preference) and (min-width: 821px)",
          lite: "(prefers-reduced-motion: no-preference) and (max-width: 820px)",
        },
        (c) => {
          const lite = c.conditions.lite;
          const rnd = gsap.utils.random;

          /* ============ 01 · HERO — nuts drift in, fall into the bowls ============ */
          const stage = root.current.querySelector(".nx-stage");
          const cuts = gsap.utils.toArray(".nx-cut");
          const far = lite ? 520 : 1100;
          const dir = { l: [-1, 0], r: [1, 0], t: [0, -1], b: [0, 1] };

          gsap.set(".nx-cut", { transformPerspective: 900 });
          gsap.set(".nx-comp", { opacity: 0, scale: 1.1, y: 50, filter: "blur(10px)" });

          const hero = gsap.timeline({ delay: 0.2 });
          hero.from(".nx-hero-kicker", { opacity: 0, y: 20, duration: 0.9, ease: "power2.out" }, 0);
          hero.from(
            ".nx-hero-title .nx-char",
            { yPercent: 120, rotationX: -80, opacity: 0, duration: 1.1, ease: "power3.out", stagger: 0.025, transformOrigin: "50% 100%" },
            0.15
          );
          hero.from(".nx-hero-sub, .nx-hero-desc, .nx-hero-cta", { opacity: 0, y: 24, duration: 1, ease: "power2.out", stagger: 0.14 }, 0.9);

          // 1–5: enter from different directions, rotate in 3D, different depths
          cuts.forEach((el, i) => {
            const k = el.dataset.from;
            const depth = Number(el.dataset.depth);
            const [dx, dy] = dir[k];
            hero.fromTo(
              el,
              {
                x: dx * far * (0.7 + depth * 0.3),
                y: dy * far * 0.8,
                rotationX: rnd(-260, 260),
                rotationY: rnd(-260, 260),
                rotationZ: rnd(-120, 120),
                scale: 0.5 + depth * 0.3,
                opacity: 0,
              },
              {
                x: 0,
                y: 0,
                rotationX: rnd(-25, 25),
                rotationY: rnd(-30, 30),
                rotationZ: rnd(-40, 40),
                scale: 0.8 + depth * 0.35,
                opacity: 1,
                duration: 2.6 + (1.6 - depth) * 0.9,
                ease: "power3.out",
              },
              0.2 + i * 0.09
            );
          });

          // 6–8: they gently fall into the bowls and the composition settles
          const fallAt = 3.4;
          cuts.forEach((el, i) => {
            hero.to(
              el,
              {
                y: () => stage.clientHeight * 0.66 - el.offsetTop + rnd(-14, 14),
                x: () => (stage.clientWidth * 0.5 - el.offsetLeft) * 0.45 + rnd(-30, 30),
                rotationX: "+=" + rnd(40, 120),
                rotationZ: "+=" + rnd(-90, 90),
                scale: 0.55,
                opacity: 0,
                duration: 1.5,
                ease: "power2.in",
              },
              fallAt + i * 0.07
            );
          });
          hero.to(
            ".nx-comp",
            { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", duration: 2.2, ease: "power3.out" },
            fallAt + 0.5
          );

          // slow camera push on scroll (not pinned)
          gsap.to(".nx-stage-inner", {
            scale: lite ? 1.12 : 1.22,
            yPercent: -3,
            ease: "none",
            scrollTrigger: { trigger: ".nx-hero", start: "top top", end: "bottom top", scrub: true },
          });

          // dust particles drifting
          gsap.utils.toArray(".nx-dust i").forEach((p) => {
            gsap.set(p, { x: rnd(0, 100) + "%", y: rnd(0, 100) + "%", scale: rnd(0.5, 1.6), opacity: rnd(0.2, 0.6) });
            gsap.to(p, {
              y: "+=" + rnd(-90, -30),
              x: "+=" + rnd(-40, 40),
              duration: rnd(7, 13),
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            });
          });

          /* ============ 02 · CATEGORIES — 3D flip-up stagger ============ */
          gsap.from(".nx-cat", {
            y: 90,
            rotationX: -22,
            opacity: 0,
            transformOrigin: "50% 100%",
            transformPerspective: 1000,
            duration: 1.2,
            ease: "power3.out",
            stagger: { each: 0.1, grid: [2, 3], from: "start" },
            scrollTrigger: { trigger: ".nx-cats", start: "top 82%", once: true },
          });

          /* ============ generic text reveals ============ */
          gsap.utils.toArray(".nx-reveal").forEach((el) =>
            gsap.from(el, {
              y: 40,
              opacity: 0,
              duration: 1.1,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 87%", once: true },
            })
          );
          gsap.utils.toArray(".nx-split").forEach((el) =>
            gsap.from(el.querySelectorAll(".nx-word-in"), {
              yPercent: 110,
              opacity: 0,
              duration: 1,
              ease: "power3.out",
              stagger: 0.07,
              scrollTrigger: { trigger: el, start: "top 86%", once: true },
            })
          );

          /* ============ 03 · SHOP — soft fade + scale as each card scrolls in
             (30 products, so batch instead of one big trigger) ============ */
          ScrollTrigger.batch(".nx-prod", {
            start: "top 92%",
            once: true,
            onEnter: (batch) =>
              gsap.from(batch, {
                opacity: 0,
                scale: 0.94,
                y: 30,
                duration: 0.9,
                ease: "power2.out",
                stagger: 0.08,
                overwrite: true,
              }),
          });

          /* ============ 04 · GIFT — curtain opens + ribbon draws ============ */
          const g = gsap.timeline({ scrollTrigger: { trigger: ".nx-gift", start: "top 65%", once: true } });
          g.fromTo(".nx-gift-main", { clipPath: "inset(0% 50% 0% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "power4.inOut" })
            .from(".nx-gift-main img, .nx-gift-main .nx-ph", { scale: 1.3, duration: 2, ease: "power3.out" }, 0)
            .from(".nx-ribbon", { scaleY: 0, transformOrigin: "50% 0%", duration: 1.2, ease: "power3.inOut" }, 0.6)
            .from(".nx-gift-sub", { y: 80, opacity: 0, duration: 1.2, ease: "power3.out" }, 1.1)
            .from(".nx-gift-copy > *", { x: 50, opacity: 0, stagger: 0.12, duration: 1, ease: "power3.out" }, 0.8);
        }
      );
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    return () => {
      window.removeEventListener("load", refresh);
      mm.revert();
      ctx.revert();
    };
  }, []);

  return (
    <main className="nx-page" ref={root}>
      {/* =================== 01 · HERO =================== */}
      <section className="nx-hero" aria-label="The finest nature has to offer">
        <div className="nx-hero-arch" aria-hidden="true">
          <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
            <g fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M760 800V300a170 170 0 0 1 340 0v500" />
              <path d="M792 800V304a138 138 0 0 1 276 0v496" />
              <path d="M90 800V380a110 110 0 0 1 220 0v420" />
            </g>
          </svg>
        </div>
        <div className="nx-dust" aria-hidden="true">
          {Array.from({ length: 16 }).map((_, i) => (
            <i key={i} />
          ))}
        </div>

        <div className="nx-hero-copy">
          <p className="nx-hero-kicker">AL-NASR · Nuts &amp; Dry Fruits</p>
          <h1 className="nx-hero-title">
            <Chars text="THE FINEST" />
            <br />
            <Chars text="NATURE HAS" />
            <br />
            <Chars text="TO OFFER" />
          </h1>
          <p className="nx-hero-sub">Premium Nuts &amp; Exquisite Dry Fruits</p>
          <p className="nx-hero-desc">
            Discover nature’s finest treasures, carefully selected for exceptional taste, freshness
            and quality.
          </p>
          <a href="#nx-shop" className="nx-btn nx-btn-solid nx-hero-cta">
            Shop Collection <ArrowRight size={16} />
          </a>
        </div>

        <div className="nx-stage" aria-hidden="false">
          <div className="nx-stage-inner">
            <Photo
              src={heroCompImg}
              alt="Almonds, cashews, pistachios, walnuts and dried fruits in white ceramic bowls on stone"
              className="nx-comp"
              loading="eager"
            />
            {CUTS.map((c, i) => (
              <div
                key={i}
                className="nx-cut"
                data-from={c.from}
                data-depth={c.d}
                style={{ left: `${c.x}%`, top: `${c.y}%`, width: c.w, height: c.w * 0.72 }}
              >
                <Photo src={c.src} alt="" aria-hidden="true" tone={c.tone} loading="eager" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== 02 · CATEGORIES =================== */}
      <section className="nx-section nx-collection" id="nx-collection">
        <header className="nx-head">
          <p className="nx-eyebrow nx-reveal">Explore Our Collection</p>
          <h2 className="nx-h2 nx-split">
            <Words text="A WORLD OF NATURAL GOODNESS" />
          </h2>
          <p className="nx-lead nx-reveal">Exceptional selections for every taste and occasion.</p>
        </header>

        <div className="nx-cats">
          {CATEGORIES.map((c) => (
            <motion.a
              href="#nx-shop"
              className="nx-cat"
              key={c.n}
              initial="rest"
              whileHover="hover"
              whileFocus="hover"
              animate="rest"
            >
              <div className="nx-cat-img">
                <motion.div
                  className="nx-cat-zoom"
                  variants={{ rest: { scale: 1 }, hover: { scale: 1.08 } }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Photo src={c.img} alt={c.name} tone={c.tone} />
                </motion.div>
                {/* little nuts that shift on hover */}
                <motion.span
                  className="nx-bit b1"
                  style={{ "--tone": c.tone }}
                  variants={{ rest: { x: 0, y: 0, rotate: 0 }, hover: { x: 14, y: -12, rotate: 28 } }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.span
                  className="nx-bit b2"
                  style={{ "--tone": c.tone }}
                  variants={{ rest: { x: 0, y: 0, rotate: 0 }, hover: { x: -16, y: 10, rotate: -34 } }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.span
                  className="nx-bit b3"
                  style={{ "--tone": c.tone }}
                  variants={{ rest: { x: 0, y: 0, rotate: 0 }, hover: { x: 10, y: 14, rotate: 20 } }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <div className="nx-cat-body">
                <span className="nx-cat-n">{c.n}</span>
                <h3>{c.name.toUpperCase()}</h3>
                <p>{c.desc}</p>
                <span className="nx-cat-link">
                  Discover <ArrowRight size={14} />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* =================== 03 · SHOP (30 products) =================== */}
      <section className="nx-section nx-shop" id="nx-shop">
        <header className="nx-head">
          <p className="nx-eyebrow nx-reveal">Premium Product Collection</p>
          <h2 className="nx-h2 nx-split">
            <Words text="SHOP OUR FINEST COLLECTION" />
          </h2>
        </header>
        <div className="nx-shop-grid">
          {NUTS_PRODUCTS.map((p) => {
            const weight = sel[p.id] || WEIGHTS[0];
            const price = p.prices[weight];
            const liked = wish.includes(p.id);
            return (
              <article className="nx-prod" key={p.id}>
                <div className="nx-prod-img">
                  <Photo src={p.img} alt={p.name} />
                  <button
                    type="button"
                    className={`nx-heart ${liked ? "on" : ""}`}
                    onClick={() => toggleWish(p.id)}
                    aria-label={liked ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`}
                    aria-pressed={liked}
                  >
                    <Heart size={17} fill={liked ? "currentColor" : "none"} />
                  </button>
                </div>
                <h3>{p.name}</h3>
                <p className="nx-prod-desc">{p.desc}</p>
                <div className="nx-weights" role="radiogroup" aria-label={`Weight for ${p.name}`}>
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
                <div className="nx-prod-foot">
                  <strong>
                    {CURRENCY}
                    {price.toLocaleString("en-IN")}
                  </strong>
                  <button
                    type="button"
                    className="nx-btn nx-btn-solid nx-add"
                    onClick={() => addToCart(p)}
                  >
                    <ShoppingBag size={14} /> Add to Cart
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* =================== 04 · GIFTING =================== */}
      <section className="nx-gift">
        <div className="nx-gift-media">
          <div className="nx-gift-main">
            <Photo src={giftBoxImg} alt="White and beige gift box with gold detailing, filled with nuts and dried fruits" />
            <span className="nx-ribbon" aria-hidden="true" />
          </div>
          <div className="nx-gift-sub">
            <Photo src={giftDetailImg} alt="Gift box detail" />
          </div>
        </div>
        <div className="nx-gift-copy">
          <p className="nx-eyebrow">Premium Gifting</p>
          <h2 className="nx-h2">GIVE THE GIFT OF NATURAL GOODNESS</h2>
          <p className="nx-lead">
            Almonds, cashews, pistachios, walnuts and dried fruits, presented in white and beige
            boxes finished with gold.
          </p>
          <Link to="/gift-hampers" className="nx-btn nx-btn-solid">
            EXPLORE GIFT COLLECTION <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="nx-toast"
            role="status"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Check size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}