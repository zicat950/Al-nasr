import { useEffect, useRef, useState, useCallback, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight, ShoppingBag, Check } from "lucide-react";
import { BRANDS, EXTRA_SECTIONS, CURRENCY } from "./chocolateData";
import { useCart } from "./CartContext"; // same cart the /cart page uses
import "./Chocolates.css";

/* ------------------------------------------------------------------
   IMAGES  ->  src/assets/
   (Page imagery below is unchanged. Brand logos and product images for
   the shop are resolved automatically from src/assets by chocolateData.js)
------------------------------------------------------------------- */
// chocolate surface used as the texture of the 3D chocolate bar,
// squares, truffles and floating pieces (a close-up of dark chocolate works best)
import chocoTexImg from "./assets/chocolates.png";

// 04 · category cards
import catDarkImg from "./assets/chocolates.png";
import catMilkImg from "./assets/chocolates.png";
import catWhiteImg from "./assets/chocolates.png";
import catTruffleImg from "./assets/chocolates.png";
import catNutsImg from "./assets/chocolates.png";
import catAssortedImg from "./assets/chocolates.png";

// 05 · cinematic experience
import cinMacroImg from "./assets/chocolates.png";
import cinCocoaImg from "./assets/chocolates.png";

// 07 · gifting (closed box on top, open box with tray underneath)
import giftClosedImg from "./assets/gift.png";
import giftOpenImg from "./assets/chocolates.png";

// 09 · final
import finalImg from "./assets/chocolates.png";

gsap.registerPlugin(ScrollTrigger);

const CART_ROUTE = "/cart"; // page opened after Add to Cart
const GO_TO_CART_AFTER_ADD = true; // set false to stay on the page after adding

const CATEGORIES = [
  { n: "01", name: "Dark Chocolates", desc: "Rich, sophisticated dark chocolate with an intense cocoa experience.", img: catDarkImg },
  { n: "02", name: "Milk Chocolates", desc: "Smooth, creamy and beautifully balanced chocolate delights.", img: catMilkImg },
  { n: "03", name: "White Chocolates", desc: "Delicate sweetness with a luxurious creamy texture.", img: catWhiteImg },
  { n: "04", name: "Chocolate Truffles", desc: "Beautifully crafted chocolate truffles with irresistible fillings.", img: catTruffleImg },
  { n: "05", name: "Chocolate Covered Nuts", desc: "Premium almonds, cashews and pistachios coated in delicious chocolate.", img: catNutsImg },
  { n: "06", name: "Assorted Chocolates", desc: "An elegant selection of assorted chocolate flavours.", img: catAssortedImg },
];

/* top navigation = 10 brands + Chips + Peanut Butter + More Treats */
const NAV_ITEMS = [
  ...BRANDS.map((b) => ({ id: b.id, name: b.name.replace(" Chocolates", "") })),
  ...EXTRA_SECTIONS.map((s) => ({ id: s.id, name: s.nav || s.title })),
];

const money = (n) => `${CURRENCY}${Number(n).toLocaleString("en-IN")}`;

/* x, y, z (px at 1440 wide) and rotateZ for each separating square */
const SPREAD = [
  [-470, -190, 140, -30],
  [-190, -270, -70, 22],
  [270, -230, 150, -18],
  [470, -70, -50, 28],
  [-420, 150, 70, 24],
  [-130, 250, 170, -26],
  [350, 220, -90, 20],
];

/* image with graceful fallback */
function Photo({ src, alt, className = "", ...rest }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return <div className={`cx-ph ${className}`} role="img" aria-label={alt} {...rest} />;
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

const Words = ({ text }) =>
  text.split(" ").map((w, i) => (
    <span className="cx-word" key={i}>
      <span className="cx-word-in">{w}&nbsp;</span>
    </span>
  ));
const Chars = ({ text }) =>
  text.split(" ").map((w, i) => (
    <span className="cx-cword" key={i}>
      {w.split("").map((c, j) => (
        <span className="cx-char" key={j}>{c}</span>
      ))}
      &nbsp;
    </span>
  ));

/* A chocolate square with real depth: front face + stacked slices */
function Square({ tex, pos = "0% 0%", clip, className = "", style }) {
  const cp = clip ? { clipPath: clip } : null;
  return (
    <div className={`cx-sq ${className}`} style={style}>
      {[4, 3, 2, 1].map((n) => (
        <i key={n} style={{ transform: `translateZ(${-n * 3}px)`, ...cp }} />
      ))}
      <span
        className="cx-face"
        style={{ backgroundImage: tex ? `url(${tex})` : undefined, backgroundPosition: pos, ...cp }}
      />
    </div>
  );
}

/* 4 x 2 chocolate bar. The last square is a pre-cracked pair of halves. */
function Bar({ tex, className = "" }) {
  const pos = ["0% 0%", "33% 0%", "66% 0%", "100% 0%", "0% 100%", "33% 100%", "66% 100%"];
  return (
    <div className={`cx-bar ${className}`}>
      {pos.map((p, i) => (
        <Square key={i} tex={tex} pos={p} />
      ))}
      <div className="cx-snap">
        <Square tex={tex} pos="100% 100%" className="cx-half a" clip="polygon(0 0, 58% 0, 46% 22%, 56% 41%, 44% 63%, 55% 82%, 48% 100%, 0 100%)" />
        <Square tex={tex} pos="100% 100%" className="cx-half b" clip="polygon(58% 0, 100% 0, 100% 100%, 48% 100%, 55% 82%, 44% 63%, 56% 41%, 46% 22%)" />
        <span className="cx-crack" />
      </div>
    </div>
  );
}

/* melted chocolate flow (SVG) */
function Melt({ className = "" }) {
  return (
    <svg className={`cx-melt ${className}`} viewBox="0 0 1600 500" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="cxm1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6a4030" />
          <stop offset="0.5" stopColor="#4a2b20" />
          <stop offset="1" stopColor="#2a1511" />
        </linearGradient>
        <linearGradient id="cxm2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c5a36a" stopOpacity="0" />
          <stop offset="0.5" stopColor="#e6cf9f" stopOpacity="0.55" />
          <stop offset="1" stopColor="#c5a36a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        className="cx-melt-a"
        fill="url(#cxm1)"
        d="M0 190 C 160 130 280 260 460 210 S 760 90 960 190 S 1300 280 1600 170 V500 H0 Z"
      />
      <path
        className="cx-melt-b"
        fill="#3a211a"
        d="M0 300 C 200 250 340 360 560 310 S 900 220 1120 310 S 1420 370 1600 290 V500 H0 Z"
      />
      <path className="cx-melt-gloss" fill="none" stroke="url(#cxm2)" strokeWidth="3" strokeLinecap="round"
        d="M0 196 C 160 136 280 266 460 216 S 760 96 960 196 S 1300 286 1600 176" />
    </svg>
  );
}

/* ------------------------------------------------------------------
   SHOP COMPONENTS
------------------------------------------------------------------- */
function ProductPhoto({ src, alt, label }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div className="cx-ph cx-prod-ph" role="img" aria-label={alt}>
        <span>{label}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

const ProductCard = memo(function ProductCard({ p, liked, onWish, onAdd }) {
  const [title, sub] = p.name.split(/\s[–-]\s/);
  return (
    <article className="cx-prod">
      <div className="cx-prod-img">
        <ProductPhoto src={p.img} alt={p.fullName} label={p.brand || title} />
        <button
          className={`cx-heart ${liked ? "on" : ""}`}
          onClick={() => onWish(p.id)}
          aria-label={liked ? `Remove ${p.fullName} from wishlist` : `Add ${p.fullName} to wishlist`}
          aria-pressed={liked}
        >
          <Heart size={17} fill={liked ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="cx-prod-body">
        <h4 className="cx-prod-title">{title}</h4>
        <p className="cx-prod-sub">{sub || "\u00A0"}</p>
        <strong className="cx-price">{money(p.price)}</strong>
        <button className="cx-btn cx-btn-solid cx-add" onClick={() => onAdd(p)}>
          <ShoppingBag size={14} /> Add to Cart
        </button>
      </div>
    </article>
  );
});

function BrandNav({ items, active, onGo }) {
  const listRef = useRef(null);

  /* keep the active brand visible inside the scrollable bar (mobile) */
  useEffect(() => {
    const list = listRef.current;
    const el = list && list.querySelector('[aria-current="true"]');
    if (!list || !el) return;
    list.scrollTo({
      left: el.offsetLeft - list.clientWidth / 2 + el.clientWidth / 2,
      behavior: "smooth",
    });
  }, [active]);

  return (
    <nav className="cx-brandnav" aria-label="Chocolate brands">
      <div className="cx-brandnav-list" ref={listRef}>
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            className={active === it.id ? "active" : ""}
            aria-current={active === it.id ? "true" : undefined}
            onClick={() => onGo(it.id)}
          >
            {it.name}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default function Chocolates() {
  const root = useRef(null);
  const navigate = useNavigate();
  const { add } = useCart(); // same cart the /cart and /wishlist pages use
  const toastTimer = useRef(null);
  const [wish, setWish] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("alnasr_wishlist") || "[]");
    } catch {
      return [];
    }
  });
  const wishRef = useRef(wish);
  const [toast, setToast] = useState(null);
  const [activeBrand, setActiveBrand] = useState(NAV_ITEMS[0].id);

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

  /* keep wishlist in sync if another component / tab changes it */
  useEffect(() => {
    const sync = (e) => {
      const next = Array.isArray(e.detail) ? e.detail : null;
      if (next) {
        wishRef.current = next;
        setWish(next);
      }
    };
    const onStorage = (e) => {
      if (e.key !== "alnasr_wishlist") return;
      try {
        const next = JSON.parse(e.newValue || "[]");
        wishRef.current = next;
        setWish(next);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("alnasr:wishlist", sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("alnasr:wishlist", sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const toggleWish = useCallback((id) => {
    const cur = wishRef.current;
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    wishRef.current = next;
    setWish(next);
    try {
      localStorage.setItem("alnasr_wishlist", JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
    window.dispatchEvent(new CustomEvent("alnasr:wishlist", { detail: next }));
  }, []);

  const addToCart = useCallback(
    (p) => {
      const item = {
        id: p.id,
        productId: p.id,
        name: p.fullName,
        category: p.category || p.brand || "Chocolates",
        weight: "", // chocolates have no weight options
        price: p.price,
        qty: 1,
        image: p.img,
      };
      add(item, 1);
      setToast(`${p.fullName} added to your bag`);
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => {
        setToast(null);
        if (GO_TO_CART_AFTER_ADD) navigate(CART_ROUTE);
      }, GO_TO_CART_AFTER_ADD ? 700 : 1800);
    },
    [navigate, add]
  );

  /* smooth scroll to a brand collection */
  const goToBrand = useCallback((id) => {
    const el = document.getElementById(`cx-brand-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveBrand(id);
  }, []);

  /* highlight the brand currently in view */
  useEffect(() => {
    const els = NAV_ITEMS.map((n) => document.getElementById(`cx-brand-${n.id}`)).filter(Boolean);
    if (!els.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setActiveBrand(en.target.id.replace("cx-brand-", ""));
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

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
          const k = lite ? 0.42 : Math.min(1, window.innerWidth / 1440) * 0.95 + 0.1;

          /* shared: separate squares in a bar */
          const spread = (scope, tl, at, dur, amp = 1) => {
            gsap.utils.toArray(`${scope} .cx-bar > .cx-sq`).forEach((el, i) => {
              const [x, y, z, rz] = SPREAD[i % SPREAD.length];
              tl.to(
                el,
                {
                  x: x * k * amp,
                  y: y * k * amp,
                  z: z * amp,
                  rotationZ: rz,
                  rotationX: rnd(-40, 40),
                  rotationY: rnd(-60, 60),
                  duration: dur,
                  ease: "power2.inOut",
                },
                at + i * 0.04
              );
            });
          };

          /* ============ 02/03 · HERO — pinned, scrubbed cinematic ============ */
          gsap.set(".cx-hero .cx-bar-wrap", { opacity: 0, scale: 0.7, y: 70 });
          gsap.set(".cx-hero .cx-bar", { rotationY: -42, rotationX: 16 });
          gsap.set(".cx-hero .cx-melt-a", { xPercent: -105 });
          gsap.set(".cx-hero .cx-melt-b", { xPercent: 110 });
          gsap.set(".cx-hero .cx-melt-gloss", { xPercent: -105 });
          gsap.set(".cx-hero .cx-drops", { opacity: 0 });
          gsap.set(".cx-hero-title .cx-char", { yPercent: 110, opacity: 0, letterSpacing: "0.3em" });
          gsap.set(".cx-hero-sub, .cx-hero-desc, .cx-hero-cta", { opacity: 0, y: 26 });
          gsap.set(".cx-hero .cx-veil", { opacity: 0 });
          gsap.set(".cx-curtain", { clipPath: "inset(100% 0% 0% 0%)" });

          // ambient droplets rising in slow motion
          gsap.utils.toArray(".cx-hero .cx-drop").forEach((d) => {
            gsap.set(d, { x: rnd(0, 100) + "vw", y: rnd(60, 105) + "vh", scale: rnd(0.5, 1.5) });
            gsap.to(d, {
              y: "-=" + rnd(60, 120) + "vh",
              x: "+=" + rnd(-40, 40),
              duration: rnd(10, 18),
              repeat: -1,
              ease: "none",
              delay: rnd(0, 8),
            });
          });
          gsap.utils.toArray(".cx-melt-gloss, .cx-melt-b").forEach((p) =>
            gsap.to(p, { y: "+=6", duration: rnd(3, 5), yoyo: true, repeat: -1, ease: "sine.inOut" })
          );

          const hero = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: ".cx-hero",
              start: "top top",
              end: lite ? "+=240%" : "+=340%",
              scrub: 1,
              pin: true,
              anticipatePin: 1,
            },
          });
          // 1-2 melted chocolate flows across
          hero.to(".cx-hero .cx-melt-a", { xPercent: 0, duration: 1.6, ease: "power2.out" }, 0)
            .to(".cx-hero .cx-melt-gloss", { xPercent: 0, duration: 1.8, ease: "power2.out" }, 0.1)
            .to(".cx-hero .cx-melt-b", { xPercent: 0, duration: 1.8, ease: "power2.out" }, 0.3)
            // 3 droplets
            .to(".cx-hero .cx-drops", { opacity: 1, duration: 1.2 }, 0.5)
            // 4 bar appears
            .to(".cx-hero .cx-bar-wrap", { opacity: 1, scale: 1, y: 0, duration: 1.6, ease: "power2.out" }, 1.4)
            // 5 slow 3D rotation
            .to(".cx-hero .cx-bar", { rotationY: 34, rotationX: 6, duration: 2.6, ease: "sine.inOut" }, 2.4);
          // 6 squares separate and float
          spread(".cx-hero", hero, 4.4, 1.8);
          // 7 a piece breaks in two
          hero.to(".cx-hero .cx-crack", { opacity: 1, duration: 0.2 }, 5.5)
            .to(".cx-hero .cx-half.a", { x: -70 * k - 10, y: 24, rotationZ: -16, rotationY: -28, duration: 1.3, ease: "power3.out" }, 5.7)
            .to(".cx-hero .cx-half.b", { x: 70 * k + 10, y: -14, rotationZ: 18, rotationY: 30, duration: 1.3, ease: "power3.out" }, 5.7)
            .to(".cx-hero .cx-crack", { opacity: 0, duration: 0.5 }, 6.2)
            // 8 camera moves in on the texture
            .to(".cx-hero .cx-world", { scale: lite ? 1.7 : 2.3, duration: 2.2, ease: "power2.inOut" }, 6.6)
            .to(".cx-hero .cx-veil", { opacity: 0.62, duration: 1.6 }, 7)
            // 9 cinematic heading
            .to(
              ".cx-hero-title .cx-char",
              { yPercent: 0, opacity: 1, letterSpacing: "0.02em", duration: 1.4, stagger: 0.03, ease: "power3.out" },
              7.6
            )
            .to(".cx-hero-sub, .cx-hero-desc, .cx-hero-cta", { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power2.out" }, 8.6)
            // 10 transition into the collection
            .to(".cx-curtain", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "power2.inOut" }, 10.4)
            .to(".cx-hero-copy", { opacity: 0, y: -40, duration: 1.2 }, 10.4);

          /* ============ 04 · CATEGORIES — masked slide-up, alternating sides ============ */
          gsap.utils.toArray(".cx-cat").forEach((el, i) => {
            gsap.from(el, {
              y: 90,
              x: i % 2 ? 40 : -40,
              opacity: 0,
              duration: 1.2,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            });
          });

          /* generic reveals */
          gsap.utils.toArray(".cx-reveal").forEach((el) =>
            gsap.from(el, {
              y: 40,
              opacity: 0,
              duration: 1.1,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 87%", once: true },
            })
          );
          gsap.utils.toArray(".cx-split").forEach((el) =>
            gsap.from(el.querySelectorAll(".cx-word-in"), {
              yPercent: 115,
              opacity: 0,
              duration: 1.1,
              ease: "power3.out",
              stagger: 0.07,
              scrollTrigger: { trigger: el, start: "top 86%", once: true },
            })
          );

          /* ============ 05 · CINEMATIC — bar enters from the right, camera dives in ============ */
          gsap.set(".cx-cin .cx-bar-wrap", { xPercent: 120, opacity: 1 });
          gsap.set(".cx-cin .cx-bar", { rotationY: 70, rotationX: 14 });
          gsap.set(".cx-cin-cap", { opacity: 0, y: 24 });
          gsap.set(".cx-cin-melt", { xPercent: 40 });
          const cin = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: ".cx-cin",
              start: "top top",
              end: lite ? "+=220%" : "+=300%",
              scrub: 1,
              pin: true,
              anticipatePin: 1,
            },
          });
          cin.to(".cx-cin-melt", { xPercent: -30, duration: 7, ease: "none" }, 0)
            .to(".cx-cin-macro", { scale: 1, yPercent: -6, duration: 7 }, 0)
            .to(".cx-cin .cx-bar-wrap", { xPercent: 0, duration: 1.8, ease: "power3.out" }, 0.4)
            .to(".cx-cin .cx-bar", { rotationY: -24, rotationX: 6, duration: 3.2, ease: "sine.inOut" }, 1.4)
            .to(".cx-cin-cap.c1", { opacity: 1, y: 0, duration: 0.8 }, 1.2)
            .to(".cx-cin-cap.c1", { opacity: 0, duration: 0.5 }, 2.6);
          spread(".cx-cin", cin, 3.2, 1.6, 0.8);
          cin.to(".cx-cin-cap.c2", { opacity: 1, y: 0, duration: 0.8 }, 3.4)
            .to(".cx-cin-cap.c2", { opacity: 0, duration: 0.5 }, 4.6)
            .to(".cx-cin-cap.c3", { opacity: 1, y: 0, duration: 0.8 }, 4.8)
            .to(".cx-cin-cap.c3", { opacity: 0, duration: 0.5 }, 5.8)
            // camera zooms into the texture, then the scene dissolves to cream
            .to(".cx-cin-world", { scale: lite ? 3 : 4.2, duration: 2.4, ease: "power2.in" }, 5.6)
            .to(".cx-cin-title", { opacity: 0, y: -40, duration: 1 }, 5.4)
            .to(".cx-cin-fade", { opacity: 1, duration: 1.4 }, 7);

          /* ============ 07 · GIFT — the box opens, chocolates appear ============ */
          gsap.set(".cx-lid", { transformPerspective: 1400, transformOrigin: "50% 0%" });
          gsap.set(".cx-truffle", { scale: 0, opacity: 0, y: 24 });
          const gift = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: ".cx-gift", start: "top 72%", end: "bottom 60%", scrub: 1 },
          });
          gift.to(".cx-gift-stage", { scale: 1.14, duration: 6 }, 0)
            .to(".cx-lid", { rotationX: -112, duration: 2.6, ease: "power2.inOut" }, 0.6)
            .to(".cx-truffle", { scale: 1, opacity: 1, y: 0, duration: 1, stagger: 0.28, ease: "power2.out" }, 2.4)
            .to(".cx-gift-copy > *", { opacity: 1, y: 0, duration: 1, stagger: 0.15 }, 0.2);
          gsap.set(".cx-gift-copy > *", { opacity: 0, y: 30 });
          gsap.to(".cx-rib-v", { rotation: 0.8, duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut" });
          gsap.to(".cx-rib-h", { rotation: -0.6, duration: 3.6, yoyo: true, repeat: -1, ease: "sine.inOut" });

          /* ============ 08 · SHOP — product cards rise in as each row scrolls into view ============ */
          gsap.set(".cx-prod", { opacity: 0 });
          ScrollTrigger.batch(".cx-prod", {
            start: "top 94%",
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                opacity: 1,
                duration: 0.8,
                ease: "power2.out",
                stagger: 0.05,
                overwrite: true,
                clearProps: "opacity,transform",
              }),
          });

          /* ============ 09 · FINAL — drips fall (end of gift), gold dust drifts ============ */
          gsap.from(".cx-drip path", {
            scaleY: 0,
            transformOrigin: "50% 0%",
            duration: 1.8,
            ease: "power2.inOut",
            stagger: 0.12,
            scrollTrigger: { trigger: ".cx-gift", start: "bottom 92%", once: true },
          });
          gsap.fromTo(".cx-final-bg", { scale: 1.04 }, { scale: 1.16, ease: "none", scrollTrigger: { trigger: ".cx-final", start: "top bottom", end: "bottom top", scrub: true } });
          gsap.from(".cx-final-title .cx-word-in", {
            yPercent: 110, opacity: 0, letterSpacing: "0.2em", duration: 1.4, ease: "power3.out", stagger: 0.1,
            scrollTrigger: { trigger: ".cx-final", start: "top 60%", once: true },
          });
          gsap.utils.toArray(".cx-dust i").forEach((p) => {
            gsap.set(p, { x: rnd(0, 100) + "vw", y: rnd(0, 100) + "%", scale: rnd(0.5, 1.8), opacity: 0 });
            gsap.to(p, { y: "-=" + rnd(100, 260), opacity: rnd(0.3, 0.7), duration: rnd(6, 11), repeat: -1, yoyo: true, ease: "sine.inOut", delay: rnd(0, 4) });
          });
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
    <main className="cx-page" ref={root}>
      {/* =================== 02/03 · HERO =================== */}
      <section className="cx-hero" aria-label="Indulge in pure perfection">
        <div className="cx-hero-bg" aria-hidden="true" />
        <Melt className="cx-hero-melt" />
        <div className="cx-drops" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <span className="cx-drop" key={i} style={{ width: 8 + (i % 4) * 5, height: 10 + (i % 4) * 6 }} />
          ))}
        </div>

        <div className="cx-world">
          <div className="cx-bar-wrap">
            <Bar tex={chocoTexImg} />
          </div>
        </div>
        <div className="cx-veil" />

        <div className="cx-hero-copy">
          <p className="cx-hero-kicker">AL-NASR · Luxury Chocolates</p>
          <h1 className="cx-hero-title">
            <Chars text="INDULGE IN" />
            <br />
            <Chars text="PURE PERFECTION" />
          </h1>
          <p className="cx-hero-sub">An Extraordinary World of Luxury Chocolates</p>
          <p className="cx-hero-desc">
            Discover an exquisite collection of handcrafted chocolate delights, created to transform
            every moment into something unforgettable.
          </p>
          <a href="#cx-shop" className="cx-btn cx-btn-gold cx-hero-cta">
            Shop Chocolates <ArrowRight size={16} />
          </a>
        </div>
        <div className="cx-curtain" aria-hidden="true" />
      </section>

      {/* =================== 04 · COLLECTION =================== */}
      <section className="cx-section cx-collection" id="cx-collection">
        <header className="cx-head">
          <p className="cx-eyebrow cx-reveal">Explore Our Chocolate Collection</p>
          <h2 className="cx-h2 cx-split">
            <Words text="DISCOVER THE ART OF CHOCOLATE" />
          </h2>
          <p className="cx-lead cx-reveal">
            Exceptional flavours. Exquisite craftsmanship. Unforgettable indulgence.
          </p>
        </header>

        <div className="cx-cats">
          {CATEGORIES.map((c) => (
            <motion.a
              href="#cx-shop"
              className="cx-cat"
              key={c.n}
              initial="rest"
              animate="rest"
              whileHover="hover"
              whileFocus="hover"
            >
              <div className="cx-cat-img">
                <motion.div
                  className="cx-cat-zoom"
                  variants={{ rest: { scale: 1 }, hover: { scale: 1.08 } }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Photo src={c.img} alt={c.name} />
                </motion.div>
                {/* pieces that gently separate and rotate */}
                {[
                  { cls: "p1", rest: { x: 0, y: 0, rotate: -8 }, hover: { x: -26, y: -20, rotate: -28 } },
                  { cls: "p2", rest: { x: 0, y: 0, rotate: 6 }, hover: { x: 30, y: -12, rotate: 26 } },
                  { cls: "p3", rest: { x: 0, y: 0, rotate: 0 }, hover: { x: 6, y: 26, rotate: 18 } },
                ].map((p) => (
                  <motion.span
                    key={p.cls}
                    className={`cx-piece ${p.cls}`}
                    style={{ backgroundImage: `url(${chocoTexImg})` }}
                    variants={{ rest: p.rest, hover: p.hover }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  />
                ))}
              </div>
              <div className="cx-cat-body">
                <span className="cx-cat-n">{c.n}</span>
                <h3>{c.name.toUpperCase()}</h3>
                <p>{c.desc}</p>
                <span className="cx-cat-link">
                  Discover <ArrowRight size={14} />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* =================== 05 · CINEMATIC EXPERIENCE =================== */}
      <section className="cx-cin" aria-label="Crafted to delight every sense">
        <div className="cx-cin-world">
          <Photo src={cinMacroImg} alt="Macro of glossy dark chocolate" className="cx-cin-macro" />
          <div className="cx-cin-shade" />
          <Melt className="cx-cin-melt" />
          <div className="cx-bar-wrap">
            <Bar tex={chocoTexImg} />
          </div>
        </div>
        <h2 className="cx-cin-title">
          <span className="cx-eyebrow">Cinematic Chocolate Experience</span>
          CRAFTED TO DELIGHT EVERY SENSE
        </h2>
        <p className="cx-cin-cap c1">Glossy dark chocolate, slowly poured.</p>
        <p className="cx-cin-cap c2">Pieces suspended in warm light.</p>
        <p className="cx-cin-cap c3">Pure cocoa, in every detail.</p>
        <div className="cx-cin-cocoa" aria-hidden="true">
          <Photo src={cinCocoaImg} alt="" />
        </div>
        <div className="cx-cin-fade" aria-hidden="true" />
      </section>

      {/* =================== 07 · GIFTING =================== */}
      <section className="cx-gift">
        <div className="cx-gift-media">
          <div className="cx-gift-stage">
            <div className="cx-open-base">
              <Photo src={giftOpenImg} alt="Open luxury chocolate box with assorted chocolates" />
              <div className="cx-truffles" aria-hidden="true">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span className="cx-truffle" key={i} style={{ backgroundImage: `url(${chocoTexImg})`, backgroundPosition: `${i * 20}% ${i % 2 ? 80 : 20}%` }} />
                ))}
              </div>
            </div>
            <div className="cx-lid">
              <Photo src={giftClosedImg} alt="Cocoa-brown gift box with champagne gold embossing" />
              <span className="cx-rib-v" aria-hidden="true" />
              <span className="cx-rib-h" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="cx-gift-copy">
          <p className="cx-eyebrow">Premium Chocolate Gifting</p>
          <h2 className="cx-h2">GIVE SOMETHING EXTRAORDINARY</h2>
          <p className="cx-lead">
            Beautifully presented chocolates for life’s sweetest celebrations.
          </p>
          <Link to="/gift-hampers" className="cx-btn cx-btn-gold">
            EXPLORE CHOCOLATE GIFTS <ArrowRight size={16} />
          </Link>
        </div>
        <svg className="cx-drip" viewBox="0 0 1600 90" preserveAspectRatio="none" aria-hidden="true">
          <g fill="#321b16">
            <path d="M0 0H1600V8H0Z" />
            <path d="M120 0h46v34a23 23 0 0 1-46 0Z" />
            <path d="M330 0h34v58a17 17 0 0 1-34 0Z" />
            <path d="M560 0h54v26a27 27 0 0 1-54 0Z" />
            <path d="M790 0h38v72a19 19 0 0 1-38 0Z" />
            <path d="M1010 0h50v40a25 25 0 0 1-50 0Z" />
            <path d="M1240 0h36v64a18 18 0 0 1-36 0Z" />
            <path d="M1450 0h48v30a24 24 0 0 1-48 0Z" />
          </g>
        </svg>
      </section>

      {/* =================== 08 · SHOP — 10 BRAND COLLECTIONS + CHIPS + PEANUT BUTTER + SNACKS =================== */}
      <section className="cx-section cx-shop" id="cx-shop">
        <header className="cx-head">
          <p className="cx-eyebrow cx-reveal">Shop</p>
          <h2 className="cx-h2 cx-split">
            <Words text="OUR EXQUISITE COLLECTION" />
          </h2>
          <p className="cx-lead cx-reveal">Ten iconic chocolate houses. One extraordinary store.</p>
        </header>

        <BrandNav items={NAV_ITEMS} active={activeBrand} onGo={goToBrand} />

        {BRANDS.map((b, i) => (
          <section
            className={`cx-brand ${i % 2 ? "alt" : ""}`}
            id={`cx-brand-${b.id}`}
            key={b.id}
            aria-label={`${b.name} collection`}
          >
            <div className="cx-brand-inner">
              <header className="cx-brand-head cx-reveal">
                <span className="cx-brand-n">{String(i + 1).padStart(2, "0")}</span>
                <div className="cx-brand-logo">
                  {b.logo ? (
                    <img src={b.logo} alt={`${b.name} logo`} loading="lazy" decoding="async" />
                  ) : (
                    <span className="cx-brand-word">{b.name}</span>
                  )}
                </div>
                <h3 className="cx-brand-name">The {b.name} Collection</h3>
                <span className="cx-rule cx-rule-c" />
                <p className="cx-brand-tag">
                  {b.tagline} · {b.products.length} {b.products.length === 1 ? "flavour" : "flavours"}
                </p>
              </header>

              <div className="cx-brand-grid">
                {b.products.map((p) => (
                  <ProductCard
                    key={p.id}
                    p={p}
                    liked={wish.includes(p.id)}
                    onWish={toggleWish}
                    onAdd={addToCart}
                  />
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* ---------- EXTRA SECTIONS: Chips · Peanut Butter · More Treats & Snacks ---------- */}
        {EXTRA_SECTIONS.map((s, j) => {
          const n = BRANDS.length + j; // continues the numbering after the 10 brands
          return (
            <section
              className={`cx-brand cx-extra ${n % 2 ? "alt" : ""}`}
              id={`cx-brand-${s.id}`}
              key={s.id}
              aria-label={s.title}
            >
              <div className="cx-brand-inner">
                <header className="cx-brand-head cx-reveal">
                  <span className="cx-brand-n">{String(n + 1).padStart(2, "0")}</span>
                  <h3 className="cx-brand-title">{s.title}</h3>
                  <span className="cx-rule cx-rule-c" />
                  <p className="cx-brand-tag">
                    {s.tagline} · {s.products.length} {s.products.length === 1 ? "item" : "items"}
                  </p>
                </header>

                <div className="cx-brand-grid">
                  {s.products.map((p) => (
                    <ProductCard
                      key={p.id}
                      p={p}
                      liked={wish.includes(p.id)}
                      onWish={toggleWish}
                      onAdd={addToCart}
                    />
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </section>

      {/* =================== 09 · FINAL =================== */}
      <section className="cx-final">
        <div className="cx-final-wrap" aria-hidden="true">
          <Photo src={finalImg} alt="" className="cx-final-bg" />
        </div>
        <div className="cx-final-veil" />
        <div className="cx-dust" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <i key={i} />
          ))}
        </div>
        <div className="cx-final-copy">
          <h2 className="cx-final-title">
            <Words text="MAKE EVERY MOMENT SWEETER" />
          </h2>
          <p className="cx-lead cx-reveal">
            From everyday indulgence to extraordinary celebrations, discover chocolates that make
            every occasion memorable.
          </p>
          <a href="#cx-collection" className="cx-btn cx-btn-gold cx-reveal">
            DISCOVER ALL CHOCOLATES <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="cx-toast"
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