import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./about.css";

/* ------------------------------------------------------------------
   IMAGES  →  src/assets/   (existing files are reused)
   heroImg  : large background photo of the hero
   storyImg : arched photo in "A little about us"
------------------------------------------------------------------- */
import heroImg from "./assets/hero1.png";
import storyImg from "./assets/custumer.png";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------
   SETTINGS — edit these
------------------------------------------------------------------- */
/** Paste your exact Google Maps share link here for a precise pin. */
const MAPS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=" +
  encodeURIComponent("AL NASR Dates & Nuts Shop, Valathur, Tirur, Malappuram, Kerala, India");

/** Headline split into masked lines for the reveal animation. */
function Lines({ lines, as: Tag = "h2", className = "" }) {
  return (
    <Tag className={`lines ${className}`} aria-label={lines.join(" ")}>
      {lines.map((l) => (
        <span className="line" key={l} aria-hidden="true">
          <span className="line-inner">{l}</span>
        </span>
      ))}
    </Tag>
  );
}

/** Eight-point star, drawn as line work. */
function Star() {
  return (
    <svg className="star" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="22" height="22" />
      <rect x="9" y="9" width="22" height="22" transform="rotate(45 20 20)" />
      <circle cx="20" cy="20" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** line · star · line divider */
function Ornament() {
  return (
    <div className="orn" aria-hidden="true">
      <i />
      <Star />
      <i />
    </div>
  );
}

/** Small illustrative map card (not to scale). */
function MapCard() {
  return (
    <div className="map" role="img" aria-label="Illustrative map showing the AL NASR store in Valathur, between Tirur and Valanchery">
      <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="#B5A689" strokeOpacity="0.12" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="320" fill="url(#grid)" />
        {/* river */}
        <path d="M-10 250C70 220 120 270 200 240S330 200 410 230" fill="none" stroke="#B5A689" strokeOpacity="0.18" strokeWidth="14" strokeLinecap="round" />
        {/* roads */}
        <g fill="none" stroke="#B5A689" strokeLinecap="round">
          <path className="road" d="M-10 200C60 180 110 150 200 150S330 110 410 90" strokeOpacity="0.55" strokeWidth="3" pathLength="1" />
          <path className="road" d="M200 -10C195 60 205 110 200 150S190 260 200 330" strokeOpacity="0.3" strokeWidth="2" pathLength="1" />
          <path className="road" d="M60 -10C80 70 120 110 200 150" strokeOpacity="0.25" strokeWidth="2" pathLength="1" />
          <path className="road" d="M200 150C260 190 320 200 410 180" strokeOpacity="0.25" strokeWidth="2" pathLength="1" />
        </g>
        {/* towns */}
        <g fill="#F1F2EC" fontFamily="Manrope, sans-serif" fontSize="9" letterSpacing="3" opacity="0.7">
          <circle cx="62" cy="192" r="3" />
          <text x="40" y="214">TIRUR</text>
          <circle cx="338" cy="104" r="3" />
          <text x="302" y="126">VALANCHERY</text>
        </g>
      </svg>
      <span className="pin" aria-hidden="true">
        <span className="pin-pulse" />
        <svg viewBox="0 0 32 44" width="34" height="46">
          <path d="M16 1C8 1 2 7.2 2 15c0 10 14 28 14 28s14-18 14-28C30 7.2 24 1 16 1Z" fill="#F1F2EC" />
          <circle cx="16" cy="15" r="5.5" fill="#0B3025" />
        </svg>
      </span>
      <span className="map-tag">Valathur</span>
    </div>
  );
}

export default function About() {
  const root = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia(root);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      /* hero opening sequence */
      gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .from(".hero-bg img", { scale: 1.15, duration: 3, ease: "power2.out" }, 0)
        .from(".hero .line-inner", { yPercent: 115, duration: 1.4, stagger: 0.12 }, 0.3)
        .from(".hero-fade", { opacity: 0, y: 22, duration: 1.1, stagger: 0.14 }, 0.9);

      /* hero softly lifts away on scroll */
      gsap.to(".hero-copy", {
        yPercent: -10,
        opacity: 0.2,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      });

      /* headlines */
      gsap.utils.toArray(".lines:not(.hero-title)").forEach((el) => {
        gsap.from(el.querySelectorAll(".line-inner"), {
          yPercent: 115,
          duration: 1.2,
          stagger: 0.1,
          ease: "power4.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });

      /* photo reveals through its arch */
      gsap.fromTo(
        ".story-photo",
        { clipPath: "inset(100% 0 0 0)" },
        { clipPath: "inset(0% 0 0 0)", duration: 1.6, ease: "power3.inOut", scrollTrigger: { trigger: ".story-photo", start: "top 85%" } }
      );
      gsap.fromTo(
        ".story-photo img",
        { scale: 1.2 },
        { scale: 1, duration: 2.4, ease: "power2.out", scrollTrigger: { trigger: ".story-photo", start: "top 85%" } }
      );

      /* fade-ins */
      gsap.utils.toArray("[data-fade]").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 26,
          duration: 1.1,
          ease: "power3.out",
          delay: parseFloat(el.dataset.fade) || 0,
          scrollTrigger: { trigger: el, start: "top 92%" },
        });
      });

      /* ornaments */
      gsap.utils.toArray(".orn").forEach((el) => {
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: "top 92%" } })
          .from(el.querySelector("svg"), { rotation: -135, scale: 0, opacity: 0, duration: 1.1, ease: "back.out(1.6)" })
          .from(el.querySelectorAll("i"), { scaleX: 0, duration: 1.1, ease: "power3.inOut" }, 0.2);
      });

      /* map: roads draw, pin drops */
      gsap.from(".road", {
        strokeDashoffset: 1,
        strokeDasharray: 1,
        duration: 2.2,
        stagger: 0.2,
        ease: "power2.inOut",
        scrollTrigger: { trigger: ".map", start: "top 85%" },
      });
      gsap.from(".pin", {
        y: -40,
        opacity: 0,
        duration: 1,
        delay: 0.9,
        ease: "bounce.out",
        scrollTrigger: { trigger: ".map", start: "top 85%" },
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <div className="about" ref={root}>
      <main>
        {/* ───────── HERO ───────── */}
        <section className="hero" aria-labelledby="about-title">
          <div className="hero-bg" aria-hidden="true">
            <img src={heroImg} alt="" decoding="async" />
          </div>
          <div className="hero-copy">
            <p className="hero-label hero-fade">
              <span className="hero-ar" lang="ar" dir="rtl">النصر</span>
              <i />
              <span>Dates · Nuts · Dry fruits</span>
            </p>
            <Lines as="h1" className="hero-title" lines={["ABOUT", "AL NASR"]} />
            <p className="hero-tag hero-fade">A Taste of Tradition. A Promise of Quality.</p>
            <p className="hero-sub hero-fade">
              AL NASR is a premium dates, nuts and dry fruits shop based in Valathur, near Tirur, Kerala. We bring
              together quality products and carefully selected varieties to make every purchase special.
            </p>
          </div>
          <span className="hero-scroll hero-fade" aria-hidden="true">
            <i /> Scroll
          </span>
        </section>

        {/* ───────── A LITTLE ABOUT US ───────── */}
        <section className="story" aria-labelledby="story-title">
          <figure className="story-photo">
            <img src={storyImg} alt="Premium dates and mixed nuts from AL NASR" loading="lazy" decoding="async" />
          </figure>
          <div className="story-copy">
            <Ornament />
            <Lines lines={["A LITTLE", "ABOUT US"]} />
            <p data-fade>
              At AL NASR, we believe in bringing quality closer to you. From delicious dates to premium nuts and dry
              fruits, we offer carefully selected products for everyday enjoyment and special occasions.
            </p>
          </div>
        </section>

        {/* ───────── VISIT OUR STORE ───────── */}
        <section className="visit" aria-labelledby="visit-title">
          <div className="visit-copy">
            <Ornament />
            <Lines lines={["VISIT", "OUR STORE"]} />
            <address data-fade>
              <strong>AL NASR – Dates &amp; Nuts Shop</strong>
              <span>Valathur, Near Tirur</span>
              <span>Malappuram, Kerala, India.</span>
            </address>
            <a className="btn" href={MAPS_URL} target="_blank" rel="noopener noreferrer" data-fade="0.1">
              <span>GET DIRECTIONS</span>
            </a>
          </div>
          <MapCard />
        </section>
      </main>
    </div>
  );
}