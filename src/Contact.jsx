import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Contact.css";

/* ---------------------------------------------------------------
   IMAGES  ->  src/assets/
   Keep these imports matching your real files.
---------------------------------------------------------------- */
import heroImg from "./assets/hero1.png";
import storeImg from "./assets/custumer.png";
import datesImg from "./assets/arabian-dates.png";
import nutsImg from "./assets/almond.png";
import chocolateImg from "./assets/chocolates.png";
import giftImg from "./assets/gift.png";

gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------------------------------
   BUSINESS DETAILS  ->  edit this one object. Nothing is invented:
   anything left empty shows an "add" placeholder and its button
   stays disabled until you fill it in.
---------------------------------------------------------------- */
const BUSINESS = {
  address: "Palarivattom, Ernakulam, Kerala, India", // add shop no. / street / PIN for a precise address
  phone: "", // e.g. "+91 00000 00000"
  email: "", // e.g. "hello@yourdomain.com"
  whatsapp: "", // digits only, with country code, e.g. "910000000000"
  mapsQuery: "Palarivattom, Ernakulam, Kerala, India", // swap for your exact shop address or Google Maps place name to pin the store
  hours: [], // e.g. [["Monday – Saturday", "10:00 – 21:00"], ["Sunday", "Closed"]]
  social: { Instagram: "", Facebook: "", WhatsApp: "" }, // full URLs
  /* Form delivery. Works with Formspree (https://formspree.io/f/xxxx)
     or Web3Forms (https://api.web3forms.com/submit + accessKey). */
  formEndpoint: "",
  formAccessKey: "",
};
const ROUTES = { collection: "/dates" };

const clean = (s) => (s || "").trim();
const tel = () => "tel:" + clean(BUSINESS.phone).replace(/[^\d+]/g, "");
const wa = (text = "Hello AL-NASR, I'd like to make an enquiry.") => `https://wa.me/${clean(BUSINESS.whatsapp).replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
const dirUrl = () => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(BUSINESS.mapsQuery || BUSINESS.address)}`;
const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

/* ───────── small pieces ───────── */
const I = {
  pin: <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  mail: <path d="M3 6h18v12H3zM3 7l9 7 9-7" />,
  chat: <path d="M4 20l1.4-4A8 8 0 1 1 8 18.6L4 20zM9 9.5c.5 2.5 2.5 4.5 5 5l1.2-1.2-2-1-.8.8a4 4 0 0 1-2-2l.8-.8-1-2L9 9.5z" />,
  heart: <path d="M12 20s-7.5-4.8-7.5-10.3A4.2 4.2 0 0 1 12 7.4a4.2 4.2 0 0 1 7.5 2.3C19.5 15.2 12 20 12 20z" />,
  gem: <path d="M6 4h12l3 5-9 11L3 9l3-5zM3 9h18M9 4l-2 5 5 11 5-11-2-5" />,
  gift: <path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7C9 7 8 3 10.5 3 12.5 3 12 7 12 7zm0 0c3 0 4-4 1.5-4C11.5 3 12 7 12 7z" />,
};
const Icon = ({ n, size = 28 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{I[n]}</svg>
);

function Action({ href, ready, label, missing, external, className = "ct-btn ct-btn-line ct-btn-sm" }) {
  if (!ready) return <span className="ct-btn ct-btn-off ct-btn-sm" title="Add this detail in BUSINESS config">{missing}</span>;
  return <a className={className} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{label}</a>;
}

function useReveal(build, deps = []) {
  const root = useRef(null);
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => build(root.current));
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return root;
}

const Words = ({ text }) =>
  text.split(" ").map((w, i) => (
    <span className="ct-word" key={i}><span className="ct-word-in">{w}&nbsp;</span></span>
  ));

/* ───────── 1 · Hero ───────── */
function Hero() {
  const root = useReveal((el) => {
    const q = gsap.utils.selector(el);
    gsap.set(q(".ct-hero-sub, .ct-hero-desc"), { opacity: 0, y: 24 });
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(q(".ct-hero-img"), { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.6, ease: "power4.inOut" })
      .fromTo(q(".ct-hero-img img"), { scale: 1.25 }, { scale: 1, duration: 2.4, ease: "power2.out" }, 0)
      .fromTo(q(".ct-line"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, stagger: 0.25, ease: "power2.inOut" }, 0.3)
      .from(q(".ct-hero h1 .ct-word-in"), { yPercent: 110, duration: 1, stagger: 0.12 }, 0.7)
      .to(q(".ct-hero-sub"), { opacity: 1, y: 0, duration: 0.9 }, 1.3)
      .to(q(".ct-hero-desc"), { opacity: 1, y: 0, duration: 0.9 }, 1.5);
    gsap.to(q(".ct-hero-img img"), { yPercent: 8, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
  }, []);
  return (
    <section className="ct-hero" ref={root}>
      <svg className="ct-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line className="ct-line" x1="0" y1="82" x2="100" y2="82" pathLength="1" />
        <line className="ct-line" x1="58" y1="0" x2="58" y2="100" pathLength="1" />
      </svg>
      <div className="ct-hero-inner">
        <div className="ct-hero-copy">
          <h1><Words text="WE'D LOVE TO HEAR FROM YOU." /></h1>
          <p className="ct-hero-sub">Every Great Experience Begins With A Conversation.</p>
          <p className="ct-hero-desc">Whether you're exploring our collections, planning a special gift or looking for something personalised, we're here to help make every experience exceptional.</p>
          <motion.div className="ct-hero-cta" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <button className="ct-btn ct-btn-solid" onClick={() => go("ct-form")}>Get in touch</button>
            <a className="ct-btn ct-btn-line" href={ROUTES.collection}>Explore our collection</a>
          </motion.div>
        </div>
        <div className="ct-hero-img"><img src={heroImg} alt="AL-NASR luxury dates, nuts, chocolates and gift hampers" /></div>
      </div>
    </section>
  );
}

/* ───────── 2 · Contact cards ───────── */
function InfoCards() {
  const cards = [
    { n: "01", t: "Visit us", icon: "pin", v: BUSINESS.address, empty: "Add your store address", btn: <Action ready={!!clean(BUSINESS.address || BUSINESS.mapsQuery)} href={dirUrl()} label="Get directions" missing="Add address" external /> },
    { n: "02", t: "Call us", icon: "phone", v: BUSINESS.phone, empty: "Add your business phone", btn: <Action ready={!!clean(BUSINESS.phone)} href={tel()} label="Call now" missing="Add phone" /> },
    { n: "03", t: "Email us", icon: "mail", v: BUSINESS.email, empty: "Add your business email", btn: <Action ready={!!clean(BUSINESS.email)} href={`mailto:${clean(BUSINESS.email)}`} label="Send an email" missing="Add email" /> },
    { n: "04", t: "WhatsApp", icon: "chat", v: BUSINESS.whatsapp ? "Message us directly" : "", empty: "Add your WhatsApp number", btn: <Action ready={!!clean(BUSINESS.whatsapp)} href={wa()} label="Chat on WhatsApp" missing="Add WhatsApp" external className="ct-btn ct-btn-gold ct-btn-sm" /> },
  ];
  return (
    <section className="ct-sec ct-white" id="ct-info">
      <header className="ct-head">
        <h2>WE'RE HERE TO HELP</h2>
        <p>Connect with AL-NASR. Our team is always happy to assist you.</p>
      </header>
      <div className="ct-cards">
        {cards.map((c, i) => (
          <motion.article key={c.n} className="ct-card" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }} whileHover={{ y: -6 }}>
            <span className="ct-card-n">{c.n}</span>
            <span className="ct-card-ico"><Icon n={c.icon} /></span>
            <h3>{c.t}</h3>
            <p className={c.v ? "" : "ct-muted"}>{c.v || c.empty}</p>
            {c.btn}
            <i className="ct-card-line" />
          </motion.article>
        ))}
      </div>
    </section>
  );
}

/* ───────── 3 · Form ───────── */
const TYPES = ["Product Enquiry", "Dates & Dry Fruits", "Premium Chocolates", "Gift Hampers", "Customised Gifting", "Corporate Orders", "Bulk Orders", "General Enquiry"];
const EMPTY = { name: "", email: "", phone: "", subject: "", type: "", message: "", company: "" };
const validate = (v) => {
  const e = {};
  if (v.name.trim().length < 2) e.name = "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) e.email = "Please enter a valid email address.";
  if (v.phone && !/^[+()\d\s-]{7,18}$/.test(v.phone)) e.phone = "Please enter a valid phone number.";
  if (v.subject.trim().length < 3) e.subject = "Please add a short subject.";
  if (!v.type) e.type = "Please select an enquiry type.";
  if (v.message.trim().length < 10) e.message = "Please tell us a little more (at least 10 characters).";
  return e;
};

function Field({ id, label, value, error, onChange, onBlur, multiline, type = "text", autoComplete }) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <div className={`ct-field ${error ? "has-error" : ""}`}>
      <Tag id={`f-${id}`} name={id} type={multiline ? undefined : type} rows={multiline ? 5 : undefined} placeholder=" " value={value} autoComplete={autoComplete} aria-invalid={!!error} aria-describedby={error ? `e-${id}` : undefined} onChange={(e) => onChange(id, e.target.value)} onBlur={() => onBlur(id)} />
      <label htmlFor={`f-${id}`}>{label}</label>
      <i className="ct-field-bar" />
      <AnimatePresence>
        {error && <motion.small id={`e-${id}`} role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{error}</motion.small>}
      </AnimatePresence>
    </div>
  );
}

function Select({ value, error, onChange, onBlur }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const away = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); } };
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, []);
  return (
    <div className={`ct-field ct-select ${error ? "has-error" : ""} ${value || open ? "filled" : ""}`} ref={ref}>
      <button type="button" id="f-type" aria-haspopup="listbox" aria-expanded={open} aria-invalid={!!error} onClick={() => setOpen((o) => !o)} onBlur={() => !open && onBlur("type")}>
        {value}
        <svg viewBox="0 0 12 8" width="12" height="8" className={open ? "up" : ""} aria-hidden="true"><path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>
      </button>
      <label htmlFor="f-type">Select enquiry type</label>
      <i className="ct-field-bar" />
      <AnimatePresence>
        {open && (
          <motion.ul role="listbox" className="ct-options" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
            {TYPES.map((t) => (
              <li key={t} role="option" aria-selected={value === t} tabIndex={0} onClick={() => { onChange("type", t); setOpen(false); onBlur("type"); }} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onChange("type", t), setOpen(false), onBlur("type"))}>{t}</li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {error && <motion.small role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{error}</motion.small>}
      </AnimatePresence>
    </div>
  );
}

function ContactForm() {
  const [v, setV] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [serverErr, setServerErr] = useState("");
  const errors = validate(v);
  const shown = (k) => (touched[k] ? errors[k] : undefined);
  const set = (k, val) => setV((s) => ({ ...s, [k]: val }));
  const blur = (k) => setTouched((t) => ({ ...t, [k]: true }));

  const submit = async (e) => {
    e.preventDefault();
    if (v.company) return; // honeypot: bots only
    setTouched({ name: 1, email: 1, phone: 1, subject: 1, type: 1, message: 1 });
    const first = Object.keys(errors)[0];
    if (first) return document.getElementById(`f-${first}`)?.focus();
    if (!clean(BUSINESS.formEndpoint)) {
      setStatus("error");
      return setServerErr("The form service isn't connected yet. Add your endpoint in BUSINESS.formEndpoint, or reach us by phone or WhatsApp.");
    }
    setStatus("loading");
    setServerErr("");
    try {
      const res = await fetch(BUSINESS.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: BUSINESS.formAccessKey || undefined,
          from_name: "AL-NASR Website",
          name: v.name, email: v.email, phone: v.phone, subject: `[${v.type}] ${v.subject}`, enquiry_type: v.type, message: v.message,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.message || "failed");
      setStatus("success");
      setV(EMPTY);
      setTouched({});
    } catch {
      setStatus("error");
      setServerErr("We couldn't send your message. Please try again, or contact us directly.");
    }
  };

  return (
    <section className="ct-sec ct-ivory" id="ct-form">
      <div className="ct-form-wrap">
        <header className="ct-form-intro">
          <h2>HOW CAN WE MAKE YOUR DAY SPECIAL?</h2>
          <p>Tell us what you're looking for. We'd love to help you find the perfect experience.</p>
          <i className="ct-gold-rule" />
        </header>
        <div className="ct-form-box">
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div key="ok" className="ct-success" role="status" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <svg viewBox="0 0 80 80" width="84" height="84" aria-hidden="true">
                  <motion.circle cx="40" cy="40" r="36" fill="none" stroke="#B69A61" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9 }} />
                  <motion.path d="M24 41l11 11 21-24" fill="none" stroke="#173D2B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.7, duration: 0.6 }} />
                </svg>
                <h3>THANK YOU FOR REACHING OUT!</h3>
                <p>Our team will get back to you shortly.</p>
                <button className="ct-btn ct-btn-line ct-btn-sm" onClick={() => setStatus("idle")}>Send another message</button>
              </motion.div>
            ) : (
              <motion.form key="form" noValidate onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="ct-row">
                  <Field id="name" label="Full name" value={v.name} error={shown("name")} onChange={set} onBlur={blur} autoComplete="name" />
                  <Field id="email" label="Email address" type="email" value={v.email} error={shown("email")} onChange={set} onBlur={blur} autoComplete="email" />
                </div>
                <div className="ct-row">
                  <Field id="phone" label="Phone number (optional)" type="tel" value={v.phone} error={shown("phone")} onChange={set} onBlur={blur} autoComplete="tel" />
                  <Field id="subject" label="Subject" value={v.subject} error={shown("subject")} onChange={set} onBlur={blur} />
                </div>
                <Select value={v.type} error={shown("type")} onChange={set} onBlur={blur} />
                <Field id="message" label="Your message" multiline value={v.message} error={shown("message")} onChange={set} onBlur={blur} />
                <input className="ct-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="company" value={v.company} onChange={(e) => set("company", e.target.value)} />
                <AnimatePresence>
                  {status === "error" && <motion.p className="ct-server-err" role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>{serverErr}</motion.p>}
                </AnimatePresence>
                <button className="ct-btn ct-btn-solid ct-submit" type="submit" disabled={status === "loading"}>
                  {status === "loading" ? <><span className="ct-spin" aria-hidden="true" />Sending…</> : "Send your message"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ───────── 4 · Store ───────── */
function Store() {
  const root = useReveal((el) => {
    const q = gsap.utils.selector(el);
    const st = { trigger: el, start: "top 70%" };
    gsap.fromTo(q(".ct-store-img"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1.5, ease: "power4.inOut", scrollTrigger: st });
    gsap.fromTo(q(".ct-store-img img"), { scale: 1.2 }, { scale: 1, duration: 2, ease: "power2.out", scrollTrigger: st });
    gsap.from(q(".ct-store-text > *"), { y: 30, opacity: 0, stagger: 0.12, duration: 0.9, ease: "power3.out", scrollTrigger: st });
    gsap.from(q(".ct-map"), { opacity: 0, duration: 1.4, delay: 0.4, scrollTrigger: { trigger: q(".ct-map")[0], start: "top 85%" } });
  }, []);
  const q = clean(BUSINESS.mapsQuery || BUSINESS.address);
  return (
    <section className="ct-sec ct-white" id="ct-store" ref={root}>
      <header className="ct-head">
        <h2>COME EXPERIENCE AL-NASR</h2>
        <p>Discover our world of premium dates, nuts, chocolates and thoughtful gifting.</p>
      </header>
      <div className="ct-store">
        <div className="ct-store-img"><img src={storeImg} alt="Inside the AL-NASR store" loading="lazy" /></div>
        <div className="ct-store-text">
          <h3>Visit our store</h3>
          <dl>
            <dt>Address</dt><dd className={BUSINESS.address ? "" : "ct-muted"}>{BUSINESS.address || "Add your store address"}</dd>
            <dt>Business hours</dt>
            <dd className={BUSINESS.hours.length ? "" : "ct-muted"}>
              {BUSINESS.hours.length ? BUSINESS.hours.map(([d, h]) => <span className="ct-hours" key={d}><em>{d}</em>{h}</span>) : "Add your business hours"}
            </dd>
            <dt>Contact</dt><dd className={BUSINESS.phone ? "" : "ct-muted"}>{BUSINESS.phone || "Add your business phone"}</dd>
          </dl>
          <Action ready={!!q} href={dirUrl()} label="Get directions" missing="Add address to enable directions" external className="ct-btn ct-btn-solid" />
        </div>
      </div>
      <div className="ct-map">
        {q ? (
          <iframe title="AL-NASR store location" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`} allowFullScreen />
        ) : (
          <p>Your Google Map appears here once you add <code>mapsQuery</code> in BUSINESS.</p>
        )}
      </div>
    </section>
  );
}

/* ───────── 5 · Why ───────── */
function Why() {
  const items = [
    { icon: "heart", img: giftImg, t: "Personal attention", d: "We believe every customer deserves a thoughtful and personalised experience." },
    { icon: "gem", img: datesImg, t: "Premium selection", d: "Discover carefully selected products and beautifully curated collections." },
    { icon: "gift", img: chocolateImg, t: "Thoughtful gifting", d: "Let us help you create memorable gifting experiences for every occasion." },
  ];
  return (
    <section className="ct-sec ct-ivory">
      <header className="ct-head"><h2>YOUR EXPERIENCE MATTERS TO US</h2></header>
      <div className="ct-why">
        {items.map((it, i) => (
          <motion.article key={it.t} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay: i * 0.12, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
            <div className="ct-why-img"><img src={it.img} alt="" loading="lazy" /></div>
            <span className="ct-why-ico"><Icon n={it.icon} size={30} /></span>
            <small>{String(i + 1).padStart(2, "0")}</small>
            <h3>{it.t}</h3>
            <p>{it.d}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

/* ───────── 6 · FAQ ───────── */
const FAQ = [
  ["How can I place an order?", "You can order through our website, or contact our team by phone, email or WhatsApp and we'll help you complete your order."],
  ["Do you offer customised gift hampers?", "Yes. Visit our Gift Hampers page to design your own, or contact us and we'll help you create something personal."],
  ["Can I place bulk or corporate orders?", "Yes. Select “Corporate Orders” or “Bulk Orders” in the enquiry form and our team will respond with the options available."],
  ["Do you provide delivery services?", "Please contact our team with your location and we'll confirm delivery availability and timing."],
  ["How can I enquire about your products?", "Use the enquiry form above, call us, email us or message us on WhatsApp. We're happy to help you choose."],
  ["Can I request personalised packaging?", "Yes. Tell us about the occasion and your preferences, and we'll advise on packaging and personalised cards."],
  ["How can I contact your customer support team?", "Reach us by phone, email or WhatsApp using the details at the top of this page, or send a message through the form."],
];
function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="ct-sec ct-white">
      <header className="ct-head"><h2>WE'RE HAPPY TO ANSWER</h2></header>
      <div className="ct-faq">
        {FAQ.map(([q, a], i) => {
          const on = open === i;
          return (
            <div key={q} className={`ct-faq-item ${on ? "on" : ""}`}>
              <h3>
                <button aria-expanded={on} aria-controls={`faq-${i}`} id={`faq-b-${i}`} onClick={() => setOpen(on ? -1 : i)}>
                  <span>{q}</span>
                  <i className="ct-pm" aria-hidden="true" />
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.div id={`faq-${i}`} role="region" aria-labelledby={`faq-b-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} style={{ overflow: "hidden" }}>
                    <p>{a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ───────── 7 · WhatsApp CTA ───────── */
function WhatsAppCta() {
  const ready = !!clean(BUSINESS.whatsapp);
  return (
    <section className="ct-wa">
      <span className="ct-wa-ico" aria-hidden="true"><i /><Icon n="chat" size={34} /></span>
      <h2>LET'S MAKE SOMETHING SPECIAL HAPPEN.</h2>
      <p>Have a question or planning something extraordinary? Connect with our team directly.</p>
      <Action ready={ready} href={wa()} label="Chat with us" missing="Add WhatsApp number" external className="ct-btn ct-btn-gold" />
    </section>
  );
}

/* ───────── 8 · Closing ───────── */
function Closing() {
  const root = useReveal((el) => {
    gsap.utils.toArray(".ct-close-img", el).forEach((img) => {
      gsap.to(img, { yPercent: parseFloat(img.dataset.speed), ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });
  }, []);
  return (
    <section className="ct-close" ref={root}>
      <div className="ct-close-grid" aria-hidden="true">
        <img className="ct-close-img a" data-speed="-8" src={datesImg} alt="" loading="lazy" />
        <img className="ct-close-img b" data-speed="6" src={nutsImg} alt="" loading="lazy" />
        <img className="ct-close-img c" data-speed="-4" src={chocolateImg} alt="" loading="lazy" />
        <img className="ct-close-img d" data-speed="9" src={giftImg} alt="" loading="lazy" />
      </div>
      <div className="ct-close-text">
        <h2>AL-NASR — WHERE QUALITY MEETS THOUGHTFULNESS.</h2>
        <p>From nature's finest selections to beautifully curated gifts, we're here to make every moment special.</p>
        <a className="ct-btn ct-btn-solid" href={ROUTES.collection}>Explore our collection</a>
      </div>
    </section>
  );
}

/* ───────── Page (navbar + footer come from your existing layout) ───────── */
export default function Contact() {
  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => clearTimeout(t);
  }, []);
  return (
    <main className="contact-page">
      <Hero />
      <InfoCards />
      <ContactForm />
      <Store />
      <Why />
      <Faq />
      <WhatsAppCta />
      <Closing />
    </main>
  );
}