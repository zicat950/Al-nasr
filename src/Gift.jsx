import { useEffect, useId, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Gift.css";

/* ---------------------------------------------------------------
   IMAGES  ->  src/assets/
   Keep these imports matching your real files.
---------------------------------------------------------------- */
import heroImg from "./assets/hero1.png";
import storyImg from "./assets/custumer.png";
import datesImg from "./assets/arabian-dates.png";
import nutsImg from "./assets/almond.png";
import driedImg from "./assets/dry.png";
import chocolateImg from "./assets/chocolates.png";
import giftImg from "./assets/gift.png";

gsap.registerPlugin(ScrollTrigger);

/* ───────── data ───────── */
const TONES = {
  burgundy: { body: "#541F32", lid: "#68283f" },
  ivory: { body: "#EDE3D2", lid: "#F8F5EF" },
  rose: { body: "#D8B9B2", lid: "#E5CDC7" },
};
const RIBBONS = { gold: "#C5A36A", ivory: "#F8F5EF", burgundy: "#541F32" };
const ALL = ["dates", "chocolates", "nuts", "dryfruits"];
const fmt = (n) => "₹" + n.toLocaleString("en-IN");
const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

const COLLECTIONS = [
  { n: "Premium Date Hampers", img: datesImg, d: "Arabian dates arranged in elegant gift packaging.", tone: "burgundy", items: ["dates"] },
  { n: "Luxury Nut Hampers", img: nutsImg, d: "Almonds, cashews, pistachios and assorted dry fruits.", tone: "ivory", items: ["nuts", "dryfruits"] },
  { n: "Chocolate Hampers", img: chocolateImg, d: "An assortment of luxury chocolates and truffles.", tone: "rose", items: ["chocolates"] },
  { n: "Signature Gift Boxes", img: giftImg, d: "Exclusive AL-NASR boxes with premium packaging.", tone: "burgundy", items: ALL, tag: true },
  { n: "Customised Gift Hampers", img: storyImg, d: "Personalised arrangements for special occasions.", tone: "ivory", items: ALL, tag: true, rib: "burgundy" },
  { n: "Corporate Gifting", img: heroImg, d: "Premium gift collections for businesses.", tone: "rose", items: ["dates", "nuts", "chocolates"], rib: "burgundy" },
];

const OCCASIONS = [
  { n: "Birthdays", img: chocolateImg, d: "Hampers with premium chocolates, dates and personalised messages.", tone: "rose", items: ["chocolates", "dates"], cls: "o1" },
  { n: "Weddings", img: giftImg, d: "Sophisticated gift collections in elegant packaging.", tone: "ivory", items: ALL, cls: "o2", tag: true },
  { n: "Festivals", img: datesImg, d: "Curated festive gifting collections.", tone: "burgundy", items: ["dates", "nuts", "dryfruits"], cls: "o3" },
  { n: "Corporate events", img: heroImg, d: "Business gifts and customised corporate hampers.", tone: "burgundy", items: ["nuts", "chocolates"], cls: "o4", rib: "ivory" },
  { n: "Anniversaries", img: storyImg, d: "Personalised gifts for unforgettable celebrations.", tone: "rose", items: ["chocolates", "nuts"], cls: "o5", tag: true },
  { n: "Special moments", img: driedImg, d: "Beautiful gifts for every meaningful occasion.", tone: "ivory", items: ALL, cls: "o6" },
];

/* ───────── GiftBox (SVG, reusable) ───────── */
export function GiftBox({ tone = "burgundy", rib = "gold", items = ALL, open = false, tag = false, className = "" }) {
  const id = useId().replace(/:/g, "");
  const body = TONES[tone].body, lid = TONES[tone].lid, r = RIBBONS[rib];
  const has = (k) => items.includes(k);
  return (
    <svg className={`gb ${open ? "is-open" : ""} ${className}`} viewBox="0 0 400 360" role="img" aria-label="AL-NASR gift box">
      <defs>
        <linearGradient id={`s${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".16" />
          <stop offset=".55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".28" />
        </linearGradient>
      </defs>
      <ellipse className="gb-shadow" cx="200" cy="338" rx="150" ry="11" fill="#392C2B" opacity=".22" />
      <g className="gb-items">
        {has("dates") && (
          <g className="gb-item">
            <ellipse cx="108" cy="172" rx="16" ry="9" fill="#4a2a1a" transform="rotate(-22 108 172)" />
            <ellipse cx="136" cy="164" rx="16" ry="9" fill="#5d3521" transform="rotate(14 136 164)" />
            <ellipse cx="124" cy="178" rx="16" ry="9" fill="#3d2214" />
            <ellipse cx="132" cy="160" rx="7" ry="2.5" fill="#fff" opacity=".22" />
          </g>
        )}
        {has("chocolates") && (
          <g className="gb-item">
            <rect x="170" y="156" width="28" height="28" rx="4" fill="#2b1712" />
            <circle cx="184" cy="170" r="4" fill="#C5A36A" />
            <rect x="202" y="164" width="26" height="22" rx="11" fill="#3b2118" />
            <rect x="174" y="158" width="10" height="3" rx="1.5" fill="#fff" opacity=".2" />
          </g>
        )}
        {has("nuts") && (
          <g className="gb-item">
            <path d="M242 170c4-14 18-18 24-8-2 12-14 20-24 8z" fill="#cfa77a" />
            <path d="M262 176c6-12 20-14 24-4-3 11-16 17-24 4z" fill="#b98f62" />
            <path d="M250 182c8-3 18 0 20 8-9 4-19 1-20-8z" fill="#e0bf94" />
          </g>
        )}
        {has("dryfruits") && (
          <g className="gb-item">
            <circle cx="300" cy="172" r="10" fill="#d9893a" />
            <circle cx="316" cy="166" r="8" fill="#8a9a55" />
            <circle cx="310" cy="182" r="9" fill="#5d3a52" />
          </g>
        )}
      </g>
      <g className="gb-body">
        <rect x="70" y="182" width="260" height="152" rx="6" fill={body} />
        <rect x="70" y="182" width="260" height="152" rx="6" fill={`url(#s${id})`} />
        <rect x="70" y="182" width="260" height="10" fill="#000" opacity=".16" />
        <rect className="gb-band" x="70" y="252" width="260" height="22" fill={r} />
        <rect className="gb-vrib" x="186" y="182" width="28" height="152" fill={r} />
      </g>
      <g className="gb-lid">
        <rect x="58" y="138" width="284" height="50" rx="6" fill={lid} />
        <rect x="58" y="138" width="284" height="50" rx="6" fill={`url(#s${id})`} />
        <rect x="186" y="138" width="28" height="50" fill={r} />
        <rect x="58" y="180" width="284" height="8" fill="#000" opacity=".14" />
        <g className="gb-bow">
          <path d="M200 138C150 88 118 124 200 138z" fill={r} />
          <path d="M200 138C250 88 282 124 200 138z" fill={r} />
          <path d="M200 138C150 88 118 124 200 138z" fill="#000" opacity=".12" />
          <circle cx="200" cy="136" r="9" fill={r} />
          <circle cx="197" cy="133" r="3" fill="#fff" opacity=".35" />
        </g>
      </g>
      {tag && (
        <g className="gb-tag">
          <path d="M200 140C230 180 246 196 262 214" stroke={r} strokeWidth="2" fill="none" />
          <g transform="rotate(-8 262 244)">
            <rect x="240" y="214" width="44" height="58" rx="3" fill="#F8F5EF" stroke="#C5A36A" strokeWidth="1.5" />
            <circle cx="262" cy="224" r="3" fill="#C5A36A" />
            <text x="262" y="250" textAnchor="middle" fontSize="8" fill="#541F32" letterSpacing="1" fontFamily="serif">AL-NASR</text>
          </g>
        </g>
      )}
    </svg>
  );
}

const SPARKS = Array.from({ length: 12 }, (_, i) => ({
  l: 12 + ((i * 53) % 76), t: 18 + ((i * 37) % 60), s: 3 + (i % 3) * 2,
}));

/* ───────── helper: scroll-driven timeline (skips for reduced motion) ───────── */
function useScrollTimeline(build, deps = []) {
  const root = useRef(null);
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => build(root.current, window.innerWidth < 700));
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return root;
}

/* ───────── 1 · Hero: the unboxing ───────── */
function Hero() {
  const root = useScrollTimeline((el, mobile) => {
    const q = gsap.utils.selector(el);
    gsap.set(q(".hero-copy > *"), { opacity: 0, y: 30 });
    gsap.set(q(".hero-box .gb-item"), { opacity: 0, y: 34 });
    gsap.set(q(".hero-spark"), { opacity: 0 });
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      scrollTrigger: { trigger: el, start: "top top", end: mobile ? "+=220%" : "+=340%", scrub: 0.8, pin: true, anticipatePin: 1 },
    });
    tl.from(q(".hero-box"), { y: -260, opacity: 0, scale: 0.85, duration: 1.2, ease: "power3.out" })
      .from(q(".hero-box .gb-band"), { scaleX: 0, transformOrigin: "0% 50%", duration: 0.8 })
      .from(q(".hero-box .gb-vrib"), { scaleY: 0, transformOrigin: "50% 0%", duration: 0.7 }, "<0.2")
      .from(q(".hero-box .gb-bow"), { scale: 0, rotate: -50, transformOrigin: "50% 100%", duration: 0.7, ease: "back.out(1.6)" })
      .to(q(".hero-box .gb-bow"), { scale: 0, rotate: 80, opacity: 0, transformOrigin: "50% 100%", duration: 0.8 })
      .to(q(".hero-box .gb-band"), { scaleX: 0, transformOrigin: "100% 50%", duration: 0.7 }, "<0.1")
      .to(q(".hero-box .gb-vrib"), { scaleY: 0, transformOrigin: "50% 100%", duration: 0.7 }, "<")
      .to(q(".hero-box .gb-lid"), { y: -110, x: 70, rotate: -14, duration: 1.2 })
      .to(q(".hero-box .gb-item"), { opacity: 1, y: -46, stagger: 0.18, duration: 0.9, ease: "power2.out" }, "<0.5")
      .to(q(".hero-spark"), { opacity: 0.9, y: () => gsap.utils.random(-90, -30), stagger: 0.06, duration: 1 }, "<0.3")
      .to(q(".hero-stage"), { scale: mobile ? 1.1 : 1.25, y: 20, duration: 1.4 }, "<0.2")
      .to(q(".hero-copy > *"), { opacity: 1, y: 0, stagger: 0.25, duration: 0.8, ease: "power2.out" }, ">-0.6");
  }, []);

  return (
    <section className="hero" ref={root} id="top">
      <div className="hero-arch" aria-hidden="true" />
      <div className="hero-inner">
        <div className="hero-copy">
          <h1>GIFTING, REIMAGINED.</h1>
          <p className="hero-sub">Thoughtfully Curated. Beautifully Presented.</p>
          <p className="hero-desc">Celebrate life's special moments with extraordinary gift hampers, thoughtfully designed to create unforgettable experiences.</p>
          <div className="hero-cta">
            <button className="btn btn-solid" onClick={() => go("collections")}>Explore collections</button>
            <button className="btn btn-line" onClick={() => go("customise")}>Design your own</button>
          </div>
        </div>
        <div className="hero-stage">
          <GiftBox className="hero-box" tag />
          {SPARKS.map((s, i) => (
            <span key={i} className="hero-spark" style={{ left: `${s.l}%`, top: `${s.t}%`, width: s.s, height: s.s }} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── 2 · Collections ───────── */
function Collections() {
  return (
    <section className="sec sec-ivory" id="collections">
      <header className="sec-head">
        <h2>GIFTS THAT SPEAK FROM THE HEART</h2>
        <p>Discover thoughtfully curated collections for every special occasion.</p>
      </header>
      <div className="coll-grid">
        {COLLECTIONS.map((c, i) => (
          <motion.article key={c.n} className={`coll-card tone-${c.tone}`} whileHover="hover" initial="rest">
            <span className="coll-index">{String(i + 1).padStart(2, "0")}</span>
            <div className="coll-art">
              <motion.img
                className="pic"
                src={c.img}
                alt={c.n}
                loading="lazy"
                variants={{ rest: { y: 0, scale: 1 }, hover: { y: -8, scale: 1.08 } }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
              <span className="coll-ribbon" aria-hidden="true" />
            </div>
            <h3>{c.n}</h3>
            <p>{c.d}</p>
            <button className="btn btn-line btn-sm" onClick={() => go("customise")}>Design this gift</button>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

/* ───────── 3 · Story: scroll-controlled opening ───────── */
function Story() {
  const root = useScrollTimeline((el, mobile) => {
    const q = gsap.utils.selector(el);
    gsap.set(q(".story-cap"), { opacity: 0, y: 20 });
    gsap.set(q(".story-card"), { opacity: 0, y: 40, rotate: 6 });
    gsap.set(q(".story-box .gb-item"), { opacity: 0, y: 30 });
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      scrollTrigger: { trigger: el, start: "top top", end: mobile ? "+=200%" : "+=280%", scrub: 0.8, pin: true, anticipatePin: 1 },
    });
    tl.from(q(".story-box"), { x: -420, opacity: 0, duration: 1.2, ease: "power3.out" })
      .to(q(".story-cap.c1"), { opacity: 1, y: 0, duration: 0.5 }, "<0.3")
      .to(q(".story-cap.c1"), { opacity: 0, duration: 0.4 }, ">0.6")
      .to(q(".story-stage"), { scale: 1.2, duration: 1.2 }, "<")
      .to(q(".story-box .gb-lid"), { y: -100, x: 60, rotate: -12, duration: 1.1 })
      .to(q(".story-cap.c2"), { opacity: 1, y: 0, duration: 0.5 }, "<0.3")
      .to(q(".story-box .gb-item"), { opacity: 1, y: -44, stagger: 0.3, duration: 0.8 }, "<0.3")
      .to(q(".story-cap.c2"), { opacity: 0, duration: 0.4 }, ">0.4")
      .to(q(".story-box .gb-item:nth-child(1)"), { x: -14, rotate: -6 }, "<")
      .to(q(".story-box .gb-item:nth-child(4)"), { x: 14, rotate: 6 }, "<")
      .to(q(".story-card"), { opacity: 1, y: 0, rotate: -3, duration: 0.9, ease: "back.out(1.4)" })
      .to(q(".story-cap.c3"), { opacity: 1, y: 0, duration: 0.5 }, "<0.2")
      .to(q(".story-stage"), { scale: 1, duration: 1 });
  }, []);

  return (
    
    <section className="story" ref={root}>
    <br />  <h2 className="story-title">MORE THAN A GIFT. A BEAUTIFUL EXPERIENCE.</h2>
      <div className="story-stage">
        <GiftBox className="story-box" tone="burgundy" items={ALL} />
        <div className="story-card">
          <small>For Amina</small>
          <span>Eid Mubarak, with love.</span>
        </div>
      </div>
      <div className="story-caps">
        <p className="story-cap c1">A closed gift box arrives, wrapped in champagne satin.</p>
        <p className="story-cap c2">The lid lifts. Dates, chocolates, nuts and dry fruits appear one by one.</p>
        <p className="story-cap c3">A personalised card completes your hamper.</p>
      </div>
    </section>
  );
}

/* ───────── 4 · Occasions ───────── */
function Occasions() {
  const root = useScrollTimeline((el) => {
    gsap.utils.toArray(".occ-art", el).forEach((art) => {
      gsap.fromTo(art, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: art, start: "top 85%" } });
      gsap.to(art.querySelector("img"), { yPercent: -10, ease: "none", scrollTrigger: { trigger: art, start: "top bottom", end: "bottom top", scrub: true } });
    });
  }, []);
  return (
    <section className="sec sec-blush" id="occasions" ref={root}>
      <header className="sec-head">
        <h2>MAKE EVERY OCCASION EXTRAORDINARY</h2>
      </header>
      <div className="occ-grid">
        {OCCASIONS.map((o, i) => (
          <article key={o.n} className={`occ ${o.cls}`}>
            <div className={`occ-art tone-${o.tone}`}>
              <img src={o.img} alt={o.n} loading="lazy" />
            </div>
            <div className="occ-text">
              <span className="occ-num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{o.n}</h3>
              <p>{o.d}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────── 5 · Customiser ───────── */
const STEPS = ["Box", "Contents", "Finish", "Card", "Preview"];
const SIZES = [
  { id: "Petite", p: 1800, w: 0.74 },
  { id: "Classic", p: 2900, w: 0.88 },
  { id: "Grand", p: 4500, w: 1 },
];
const CONTENT_OPTS = [
  { id: "dates", n: "Arabian dates" },
  { id: "nuts", n: "Nuts" },
  { id: "dryfruits", n: "Dry fruits" },
  { id: "chocolates", n: "Chocolates" },
];

function Customiser({ notify, onAdd }) {
  const [step, setStep] = useState(0);
  const [size, setSize] = useState(SIZES[1]);
  const [items, setItems] = useState(["dates", "chocolates"]);
  const [tone, setTone] = useState("burgundy");
  const [rib, setRib] = useState("gold");
  const [msg, setMsg] = useState("");
  const [to, setTo] = useState("");
  const price = size.p + items.length * 450;
  const toggle = (id) => setItems((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const panels = [
    <div key="0">
      <h3>Choose your gift box</h3>
      <div className="chips">
        {SIZES.map((s) => (
          <button key={s.id} className="chip" aria-pressed={size.id === s.id} onClick={() => setSize(s)}>
            {s.id}<small>{fmt(s.p)}</small>
          </button>
        ))}
      </div>
    </div>,
    <div key="1">
      <h3>Select what goes inside</h3>
      <div className="chips">
        {CONTENT_OPTS.map((c) => (
          <button key={c.id} className="chip" aria-pressed={items.includes(c.id)} onClick={() => toggle(c.id)}>
            {c.n}<small>+{fmt(450)}</small>
          </button>
        ))}
      </div>
    </div>,
    <div key="2">
      <h3>Choose packaging and ribbon</h3>
      <p className="lbl">Packaging</p>
      <div className="chips">
        {Object.keys(TONES).map((t) => (
          <button key={t} className="chip" aria-pressed={tone === t} onClick={() => setTone(t)}>
            <i className="dot" style={{ background: TONES[t].body }} />{t === "rose" ? "Dusty rose" : t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <p className="lbl">Ribbon</p>
      <div className="chips">
        {Object.keys(RIBBONS).map((t) => (
          <button key={t} className="chip" aria-pressed={rib === t} onClick={() => setRib(t)}>
            <i className="dot" style={{ background: RIBBONS[t] }} />{t === "gold" ? "Champagne gold" : t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
    </div>,
    <div key="3">
      <h3>Add a personalised card</h3>
      <label className="field">Recipient name
        <input value={to} maxLength={24} onChange={(e) => setTo(e.target.value)} placeholder="Amina" />
      </label>
      <label className="field">Your message
        <textarea value={msg} maxLength={90} rows={3} onChange={(e) => setMsg(e.target.value)} placeholder="Wishing you a beautiful day." />
        <small>{msg.length}/90</small>
      </label>
    </div>,
    <div key="4">
      <h3>Your hamper</h3>
      <ul className="sum">
        <li><span>Box</span><b>{size.id}</b></li>
        <li><span>Inside</span><b>{items.length ? items.map((i) => CONTENT_OPTS.find((c) => c.id === i).n).join(", ") : "Empty box"}</b></li>
        <li><span>Finish</span><b>{tone === "rose" ? "Dusty rose" : tone}, {rib} ribbon</b></li>
        <li><span>Total</span><b>{fmt(price)}</b></li>
      </ul>
      <button
        className="btn btn-gold"
        onClick={() => {
          onAdd?.({ type: "custom", size: size.id, items, tone, rib, to, msg, price });
          notify(`Custom hamper added · ${fmt(price)}`);
        }}
      >
        CREATE YOUR GIFT
      </button>
    </div>,
  ];

  return (
    <section className="sec sec-burgundy" id="customise">
      <header className="sec-head">
        <h2>YOUR GIFT. YOUR WAY.</h2>
        <p>Create a gift that feels personal. Choose your favourite products, packaging and finishing touches.</p>
      </header>
      <div className="cust">
        <div className="cust-preview">
          <div className="cust-box" style={{ width: `${size.w * 100}%` }}>
            <GiftBox tone={tone} rib={rib} items={step >= 1 ? items : []} open={step >= 1} tag={!!msg} />
          </div>
          <AnimatePresence>
            {(msg || to) && (
              <motion.div className="cust-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <small>{to ? `For ${to}` : "For you"}</small>
                <span>{msg || "Your message appears here."}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="cust-panel">
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s}>
                <button className={i === step ? "on" : i < step ? "done" : ""} onClick={() => setStep(i)}>
                  <b>{i + 1}</b>{s}
                </button>
              </li>
            ))}
          </ol>
          <div className="cust-body">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                {panels[step]}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="cust-nav">
            <button className="btn btn-line-light btn-sm" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
            {step < 4 && <button className="btn btn-gold btn-sm" onClick={() => setStep(step + 1)}>Next</button>}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── 6 · Packaging showcase ───────── */
function Packaging() {
  const root = useScrollTimeline((el, mobile) => {
    const q = gsap.utils.selector(el);
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      scrollTrigger: { trigger: el, start: "top top", end: mobile ? "+=200%" : "+=300%", scrub: 0.8, pin: true, anticipatePin: 1 },
    });
    tl.from(q(".pk-box .gb-body"), { scaleY: 0.06, transformOrigin: "50% 100%", duration: 1 })
      .from(q(".pk-box .gb-lid"), { y: -220, opacity: 0, duration: 1, ease: "power3.out" })
      .from(q(".pk-box .gb-band"), { scaleX: 0, transformOrigin: "0% 50%", duration: 0.7 })
      .from(q(".pk-box .gb-vrib"), { scaleY: 0, transformOrigin: "50% 0%", duration: 0.7 }, "<0.1")
      .from(q(".pk-box .gb-bow"), { scale: 0, transformOrigin: "50% 100%", duration: 0.6, ease: "back.out(1.6)" })
      .from(q(".pk-box .gb-tag"), { opacity: 0, rotate: 30, transformOrigin: "200px 140px", duration: 0.7 })
      .to(q(".pk-spin"), { rotationY: 360, transformPerspective: 900, duration: 2 });
  }, []);
  return (
    <section className="pack" ref={root}>
      <header className="sec-head sec-head-light">
        <h2>BEAUTY IN EVERY DETAIL</h2>
        <p>Rigid boxes, magnetic closures, gold foil branding and satin ribbon, finished by hand.</p>
      </header>
      <div className="pack-body">
        <div className="pk-spin"><GiftBox className="pk-box" items={[]} tag /></div>
        <ul className="pack-list">
          <li>Premium rigid gift boxes</li>
          <li>Magnetic closure</li>
          <li>Gold foil AL-NASR branding</li>
          <li>Satin ribbons</li>
          <li>Customised greeting cards</li>
        </ul>
      </div>
    </section>
  );
}

/* ───────── 7 · Final ───────── */
function Finale() {
  return (
    <section className="finale">
      <motion.div className="finale-photo" initial={{ clipPath: "inset(0 50% 0 50%)" }} whileInView={{ clipPath: "inset(0 0% 0 0%)" }} viewport={{ once: true }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}>
        <img src={giftImg} alt="AL-NASR burgundy and ivory gift boxes" loading="lazy" />
        <img src={heroImg} alt="AL-NASR luxury hampers" loading="lazy" />
      </motion.div>
      <h2>MAKE SOMEONE'S DAY UNFORGETTABLE.</h2>
      <p>Discover the art of thoughtful gifting with AL-NASR. Create a hamper that makes every celebration special.</p>
      <button className="btn btn-gold" onClick={() => go("customise")}>DESIGN YOUR GIFT</button>
    </section>
  );
}

/* ───────── Page ───────── */
export default function Gift({ onAddToCart }) {
  const [toast, setToast] = useState("");
  const timer = useRef(null);
  const notify = useCallback((m) => {
    setToast(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 2600);
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => { clearTimeout(t); clearTimeout(timer.current); };
  }, []);
  return (
    <main className="gift-page">
      <Hero />
      <Collections />
      <Story />
      <Occasions />
      <Customiser notify={notify} onAdd={onAddToCart} />
      <Packaging />
      <Finale />
      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">{toast}</div>
    </main>
  );
}