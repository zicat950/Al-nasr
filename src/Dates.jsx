import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight, ShoppingBag, Check } from "lucide-react";
import { useCart } from "./CartContext";
import { DATES_PRODUCTS, WEIGHTS, WEIGHT_LABELS, CURRENCY } from "./datesData";
import "./Dates.css";

/* ------------------------------------------------------------------
   IMAGES  ->  src/assets/dates/      (one separate path for each)
   Product images + prices live in  src/datesData.js
------------------------------------------------------------------- */
import heroBowlImg from "./assets/dates/image copy.png";   // hero bowl
import finalBgImg  from "./assets/dates/image.png";   // last section background

import ajwaImg     from "./assets/dates/ajwa.png";   // Ajwa collection card
import medjoolImg  from "./assets/dates/majdool.png";   // Medjool collection card
import sukkariImg  from "./assets/dates/sukari.png";   // Sukkari collection card
import mabroomImg  from "./assets/dates/sifri.png";   // Mabroom collection card

/* Optional transparent PNG cutouts for the floating hero animation.
   Add your files, uncomment, and list them in `cutouts` below.
// import cut1 from "./assets/dates/cut-1.png";
// import cut2 from "./assets/dates/cut-2.png";
*/

gsap.registerPlugin(ScrollTrigger);

const IMG = {
  heroBowl: heroBowlImg,
  cutouts: [], // e.g. [cut1, cut2, cut3, cut4, cut5, cut6, cut7, cut8]
  final: finalBgImg,
};

const CART_ROUTE = "/cart"; // page opened after Add to Cart

/* Collection highlight cards (hero + "Explore Our Date Collection") */
const VARIETIES = [
  {
    id: "ajwa-collection",
    name: "Ajwa Dates",
    desc: "A treasured Arabian delicacy with a naturally rich flavour.",
    img: ajwaImg,
  },
  {
    id: "medjool-collection",
    name: "Medjool Dates",
    desc: "Large, soft and deliciously sweet with a caramel-like texture.",
    img: medjoolImg,
  },
  {
    id: "sukkari-collection",
    name: "Sukkari Dates",
    desc: "Naturally golden, soft and exceptionally sweet.",
    img: sukkariImg,
  },
  {
    id: "mabroom-collection",
    name: "Mabroom Dates",
    desc: "Elegant elongated dates with a distinctive chewy texture.",
    img: mabroomImg,
  },
];

/* Image with graceful, tasteful fallback */
function Photo({ src, alt, className = "", ...rest }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div
        className={`dt-ph ${className}`}
        role="img"
        aria-label={alt}
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

/* Split text into words for staggered reveals */
const Words = ({ text }) =>
  text.split(" ").map((w, i) => (
    <span className="dt-word" key={i}>
      <span className="dt-word-in">{w}&nbsp;</span>
    </span>
  ));

export default function Dates() {
  const root = useRef(null);
  const toastTimer = useRef(null);
  const [wish, setWish] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("alnasr_wishlist") || "[]");
    } catch {
      return [];
    }
  });
  /* selected weight per product: "250g" | "1kg"  (default 250g) */
  const [sel, setSel] = useState(() =>
    Object.fromEntries(DATES_PRODUCTS.map((p) => [p.id, WEIGHTS[0]]))
  );
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const { add } = useCart(); // shared cart (same one the Cart page reads)

  useEffect(() => {
    window.scrollTo(0, 0);
    return () => clearTimeout(toastTimer.current);
  }, []);

  const toggleWish = useCallback((id) => {
    setWish((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem("alnasr_wishlist", JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      window.dispatchEvent(new CustomEvent("alnasr:wishlist", { detail: next }));
      return next;
    });
  }, []);

  const addToCart = (p) => {
    const weight = sel[p.id] || WEIGHTS[0];
    add(
      {
        id: `${p.id}-${weight}`, // same product + same weight => qty + 1
        name: p.name,
        category: "Dates",
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
      /* ---------- Reduced motion: no animation, everything visible ---------- */
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".dt-reveal, .dt-word-in, .dt-clip, .dt-fade", {
          clearProps: "all",
        });
      });

      mm.add(
        {
          full: "(prefers-reduced-motion: no-preference) and (min-width: 821px)",
          lite: "(prefers-reduced-motion: no-preference) and (max-width: 820px)",
        },
        (c) => {
          const lite = c.conditions.lite;

          /* ================= HERO (pinned, scrubbed) ================= */
          const floats = gsap.utils.toArray(".dt-float");
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: ".dt-hero",
              start: "top top",
              end: lite ? "+=140%" : "+=190%",
              scrub: 0.9,
              pin: true,
              anticipatePin: 1,
            },
          });

          // intro (not scrubbed): text rises in
          gsap.from(".dt-hero-kicker, .dt-hero-title .dt-word-in, .dt-hero-sub, .dt-hero-desc", {
            yPercent: 110,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out",
            stagger: 0.07,
            delay: 0.15,
          });
          gsap.from(".dt-bowl", {
            scale: 1.08,
            opacity: 0,
            duration: 1.8,
            ease: "power2.out",
          });

          // camera moves closer
          tl.to(".dt-stage", { scale: lite ? 1.25 : 1.45, yPercent: -4 }, 0);
          tl.to(".dt-bowl", { yPercent: 6, scale: 1.06 }, 0);
          tl.to(".dt-hero-bg", { yPercent: -8, scale: 1.08 }, 0);

          // dates float up and rotate in 3D
          floats.forEach((el, i) => {
            const depth = Number(el.dataset.depth || 1);
            tl.to(
              el,
              {
                y: -(90 + depth * 170),
                x: (i % 2 ? 1 : -1) * (20 + depth * 24),
                rotationX: 160 + i * 25,
                rotationY: (i % 2 ? 1 : -1) * (220 + i * 20),
                rotationZ: (i % 2 ? 1 : -1) * (35 + i * 6),
                scale: 0.9 + depth * 0.25,
                ease: "power1.inOut",
              },
              0
            );
          });

          // text glides up & compact
          tl.to(".dt-hero-text", { yPercent: -18, scale: 0.86, opacity: 0.0, ease: "power1.in" }, 0.35);

          // dates become individual compositions
          tl.to(".dt-bowl", { opacity: 0, scale: 1.2 }, 0.55);
          tl.fromTo(
            ".dt-comp",
            { opacity: 0, y: 70, rotationX: -40, scale: 0.9 },
            { opacity: 1, y: 0, rotationX: 0, scale: 1, stagger: 0.07, ease: "power2.out" },
            0.62
          );
          tl.to(".dt-float", { opacity: 0, ease: "power1.in" }, 0.8);
          tl.fromTo(
            ".dt-hero-end",
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, ease: "power2.out" },
            0.78
          );

          /* ============== generic reveals ============== */
          gsap.utils.toArray(".dt-reveal").forEach((el) => {
            gsap.from(el, {
              y: 46,
              opacity: 0,
              duration: 1.1,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 86%", once: true },
            });
          });

          gsap.utils.toArray(".dt-split").forEach((el) => {
            gsap.from(el.querySelectorAll(".dt-word-in"), {
              yPercent: 115,
              duration: 1,
              ease: "power3.out",
              stagger: 0.06,
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            });
          });

          /* image clip reveals */
          gsap.utils.toArray(".dt-clip").forEach((el) => {
            gsap.fromTo(
              el,
              { clipPath: "inset(100% 0% 0% 0%)" },
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1.5,
                ease: "power4.inOut",
                scrollTrigger: { trigger: el, start: "top 85%", once: true },
              }
            );
            const img = el.querySelector("img, .dt-ph");
            if (img)
              gsap.fromTo(
                img,
                { scale: 1.25 },
                {
                  scale: 1,
                  duration: 1.8,
                  ease: "power3.out",
                  scrollTrigger: { trigger: el, start: "top 85%", once: true },
                }
              );
          });

          /* collection cards stagger */
          gsap.from(".dt-card", {
            y: 70,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: { trigger: ".dt-cards", start: "top 82%", once: true },
          });

          /* shop grid — each card animates in as it scrolls into view
             (18 products, so batch instead of one big trigger) */
          ScrollTrigger.batch(".dt-prod", {
            start: "top 92%",
            once: true,
            onEnter: (batch) =>
              gsap.from(batch, {
                y: 50,
                opacity: 0,
                duration: 0.9,
                ease: "power3.out",
                stagger: 0.08,
                overwrite: true,
              }),
          });

          /* final background slow cinematic drift */
          gsap.to(".dt-final-bg", {
            scale: 1.14,
            xPercent: -2,
            ease: "none",
            scrollTrigger: {
              trigger: ".dt-final",
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      );
    }, root);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  /* floating date positions around bowl (percent of stage) */
  const floatPos = [
    { l: "6%", t: "18%", s: 78, d: 1.4 },
    { l: "22%", t: "4%", s: 64, d: 1.0 },
    { l: "44%", t: "-2%", s: 70, d: 1.7 },
    { l: "68%", t: "6%", s: 66, d: 1.2 },
    { l: "86%", t: "20%", s: 80, d: 1.5 },
    { l: "12%", t: "62%", s: 60, d: 0.8 },
    { l: "82%", t: "64%", s: 62, d: 0.9 },
    { l: "50%", t: "78%", s: 56, d: 0.7 },
  ];

  return (
    <main className="dt-page" ref={root}>
      {/* =================== 1 · HERO =================== */}
      <section className="dt-hero" aria-label="The Art of Arabian Dates">
        <div className="dt-hero-bg" aria-hidden="true">
          <svg className="dt-arch" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
            <g fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M180 800V330a150 150 0 0 1 300 0v470" />
              <path d="M210 800V335a120 120 0 0 1 240 0v465" />
              <path d="M720 800V330a150 150 0 0 1 300 0v470" />
              <path d="M750 800V335a120 120 0 0 1 240 0v465" />
              <path d="M0 640h1200" />
            </g>
          </svg>
        </div>

        <div className="dt-hero-text">
          <p className="dt-hero-kicker">AL-NASR · Dates Collection</p>
          <h1 className="dt-hero-title">
            <Words text="THE ART OF" />
            <br />
            <Words text="ARABIAN DATES" />
          </h1>
          <p className="dt-hero-sub">Nature’s Finest Sweetness, Perfected Through Tradition.</p>
          <p className="dt-hero-desc">
            Discover our exceptional collection of hand-selected Arabian dates, carefully
            sourced for their rich flavour, natural sweetness and extraordinary quality.
          </p>
        </div>

        <div className="dt-stage">
          <Photo src={IMG.heroBowl} alt="Ceramic bowl of Medjool, Ajwa, Sukkari and Mabroom dates" className="dt-bowl" loading="eager" />
          {floatPos.map((p, i) => (
            <div
              key={i}
              className="dt-float"
              data-depth={p.d}
              style={{ left: p.l, top: p.t, width: p.s, height: p.s * 0.62 }}
            >
              <Photo src={IMG.cutouts[i]} alt="" aria-hidden="true" />
            </div>
          ))}
        </div>

        <div className="dt-comps" aria-hidden="false">
          {VARIETIES.map((v) => (
            <a href={`#${v.id}`} className="dt-comp" key={v.id}>
              <Photo src={v.img} alt={v.name} />
              <span>{v.name.replace(" Dates", "")}</span>
            </a>
          ))}
        </div>

        <div className="dt-hero-end">
          <a href="#shop" className="dt-btn dt-btn-solid">
            Shop Dates <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* =================== 2 · COLLECTION =================== */}
      <section className="dt-section dt-collection" id="collection">
        <header className="dt-head">
          <p className="dt-eyebrow dt-reveal">Explore Our Date Collection</p>
          <h2 className="dt-h2 dt-split">
            <Words text="A COLLECTION OF NATURAL EXCELLENCE" />
          </h2>
          <p className="dt-lead dt-reveal">
            Carefully selected varieties, each with its own unique character.
          </p>
        </header>

        <div className="dt-cards">
          {VARIETIES.map((v) => (
            <article className="dt-card" key={v.id} id={v.id}>
              <div className="dt-card-img">
                <Photo src={v.img} alt={v.name} />
              </div>
              <h3>{v.name.toUpperCase()}</h3>
              <p>{v.desc}</p>
              <a href="#shop" className="dt-btn dt-btn-line">
                Explore Collection
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* =================== 3 · SHOP =================== */}
      <section className="dt-section dt-shop" id="shop">
        <header className="dt-head">
          <p className="dt-eyebrow dt-reveal">Shop</p>
          <h2 className="dt-h2 dt-split">
            <Words text="SHOP OUR COLLECTION" />
          </h2>
        </header>

        <div className="dt-shop-grid">
          {DATES_PRODUCTS.map((p) => {
            const weight = sel[p.id] || WEIGHTS[0];
            const price = p.prices[weight];
            const liked = wish.includes(p.id);
            return (
              <article className="dt-prod" key={p.id}>
                <div className="dt-prod-img">
                  <Photo src={p.img} alt={p.name} />
                  <button
                    className={`dt-heart ${liked ? "on" : ""}`}
                    onClick={() => toggleWish(p.id)}
                    aria-label={liked ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`}
                    aria-pressed={liked}
                  >
                    <Heart size={18} fill={liked ? "currentColor" : "none"} />
                  </button>
                </div>
                <h3>{p.name}</h3>
                <p className="dt-prod-desc">{p.desc}</p>
                <div className="dt-weights" role="radiogroup" aria-label={`Weight for ${p.name}`}>
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
                <div className="dt-prod-foot">
                  <strong>
                    {CURRENCY}
                    {price.toLocaleString("en-IN")}
                  </strong>
                  <button
                    type="button"
                    className="dt-btn dt-btn-solid dt-add"
                    onClick={() => addToCart(p)}
                  >
                    <ShoppingBag size={15} /> Add to Cart
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* =================== 4 · FINAL =================== */}
      <section className="dt-final">
        <div className="dt-final-bg-wrap" aria-hidden="true">
          <Photo src={IMG.final} alt="" className="dt-final-bg" />
        </div>
        <div className="dt-final-veil" />
        <div className="dt-final-copy">
          <h2 className="dt-h2 dt-split">
            <Words text="THE SWEETNESS OF TRADITION." />
          </h2>
          <p className="dt-lead dt-reveal">
            Experience the finest selection of Arabian dates, brought to you with the quality
            and care that define AL-NASR.
          </p>
          <a href="#shop" className="dt-btn dt-btn-gold dt-reveal">
            SHOP ALL DATES <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="dt-toast"
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