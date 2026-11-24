/* =====================================================================
   AL-NASR · DATES PRODUCT DATA   (src/datesData.js)
   ---------------------------------------------------------------------
   1) IMAGES  → change a product's photo here (one separate path each).
   2) PRICES  → change prices in the DATES_PRODUCTS list below.
   ===================================================================== */

/* ---------- IMAGE FILES (photos live in src/assets/dates/) ---------- */
import defaultImg  from "./assets/dates/zaitoon.png";    // fallback photo
import farajiimg   from "./assets/dates/faraji.png";
import khalifaimg  from "./assets/dates/khalifa.png";
import mahfilimg   from "./assets/dates/mahfil.png";
import jumaraimg   from "./assets/dates/jumara.png";
import shishiimg   from "./assets/dates/shishi.png";
import kashiramimg from "./assets/dates/kashiram.png";
import barariimg   from "./assets/dates/barari.png";
import noorimg     from "./assets/dates/noor.png";
import ajwaimg     from "./assets/dates/ajwa.png";
import majdoolimg  from "./assets/dates/majdool.png";
import safawiimg   from "./assets/dates/safawi.png";
import sifriimg    from "./assets/dates/sifri.png";
import shawiimg    from "./assets/dates/shawi.png";
import kaloothiimg from "./assets/dates/kaloothi.png";
import mashrookimg from "./assets/dates/mashrook.png";
import mabroomimg  from "./assets/dates/mabroom.png";
import sukariimg   from "./assets/dates/sukari.png";
// To give another product its own photo:
//   1. save the file in src/assets/dates/   (example: mahfil.png)
//   2. add:  import mahfilimg from "./assets/dates/mahfil.png";
//   3. change   mahfil: defaultImg,   to   mahfil: mahfilimg,   below

/* ---------- ONE IMAGE PATH PER PRODUCT ---------- */
export const IMAGES = {
  zaitoon:  defaultImg,
  faraji:   farajiimg,     // ← own separate image
  khalifa:  khalifaimg,    // ← own separate image
  mahfil:   mahfilimg,     // ← own separate image
  jumara:   jumaraimg,     // ← own separate image
  shishi:   shishiimg,     // ← own separate image
  kashiram: kashiramimg,   // ← own separate image
  barari:   barariimg,     // ← own separate image
  noor:     noorimg,       // ← own separate image
  ajwa:     ajwaimg,       // ← own separate image
  majdool:  majdoolimg,    // ← own separate image
  safawi:   safawiimg,     // ← own separate image
  sifri:    sifriimg,      // ← own separate image
  shawi:    shawiimg,      // ← own separate image
  kaloothi: kaloothiimg,   // ← own separate image
  mashrook: mashrookimg,   // ← own separate image
  mabroom:  mabroomimg,    // ← own separate image
  sukari:   sukariimg,     // ← own separate image
};

export const CURRENCY = "₹";

/* The only two sizes sold */
export const WEIGHTS = ["250g", "1kg"];
export const WEIGHT_LABELS = { "250g": "250 Gram", "1kg": "1 KG" };

/* ---------- PRODUCTS (each one reads its photo from IMAGES) ---------- */
export const DATES_PRODUCTS = [
  { id: "zaitoon",  name: "Zaitoon Dates",  desc: "Soft, mellow and gently sweet — an everyday Arabian favourite.", img: IMAGES.zaitoon,  prices: { "250g": 120, "1kg": 400 } },
  { id: "faraji",   name: "Faraji Premium", desc: "Plump, tender dates with a smooth, honeyed richness.",           img: IMAGES.faraji,   prices: { "250g": 140, "1kg": 500 } },
  { id: "khalifa",  name: "Khalifa Dates",  desc: "Golden, juicy and beautifully balanced in sweetness.",           img: IMAGES.khalifa,  prices: { "250g": 130, "1kg": 450 } },
  { id: "mahfil",   name: "Mahfil Dates",   desc: "A celebration-worthy date, soft with a caramel finish.",         img: IMAGES.mahfil,   prices: { "250g": 180, "1kg": 700 } },
  { id: "jumara",   name: "Jumara Dates",   desc: "Naturally sweet with a tender bite and deep amber colour.",      img: IMAGES.jumara,   prices: { "250g": 150, "1kg": 550 } },
  { id: "shishi",   name: "Shishi Dates",   desc: "Semi-dry, lightly chewy and wonderfully fragrant.",              img: IMAGES.shishi,   prices: { "250g": 160, "1kg": 600 } },
  { id: "kashiram", name: "Kashiram Dates", desc: "Rich, dark and satisfying with a gentle raisin-like depth.",     img: IMAGES.kashiram, prices: { "250g": 180, "1kg": 750 } },
  { id: "barari",   name: "Barari Dates",   desc: "Soft, fresh and mildly sweet — perfect for daily enjoyment.",    img: IMAGES.barari,   prices: { "250g": 90, "1kg": 250 } },
  { id: "noor",     name: "Noor Dates",     desc: "Bright, luminous dates with a clean, natural sweetness.",        img: IMAGES.noor,     prices: { "250g": 116, "1kg": 380 } },
  { id: "ajwa",     name: "Ajwa Premium",   desc: "A treasured Arabian delicacy with a naturally rich flavour.",    img: IMAGES.ajwa,     prices: { "250g": 340, "1kg": 1500 } },
  { id: "majdool",  name: "Majdool Large",  desc: "Large, soft and deliciously sweet with a caramel-like texture.", img: IMAGES.majdool,  prices: { "250g": 360, "1kg": 1600 } },
  { id: "safawi",   name: "Safawi Dates",   desc: "Dark, soft and rich with a gentle, raisin-like depth.",          img: IMAGES.safawi,   prices: { "250g": 238, "1kg": 990 } },
  { id: "sifri",    name: "Sifri Dates",    desc: "Delicate, honey-toned dates with a buttery softness.",           img: IMAGES.sifri,    prices: { "250g": 200, "1kg": 800 } },
  { id: "shawi",    name: "Shawi Dates",    desc: "Tender and mellow, with a smooth, lingering sweetness.",         img: IMAGES.shawi,    prices: { "250g": 280, "1kg": 1200 } },
  { id: "kaloothi", name: "Kaloothi Dates", desc: "Deep, dark and velvety — beautiful with Arabic coffee.",         img: IMAGES.kaloothi, prices: { "250g": 210, "1kg": 850 } },
  { id: "mashrook", name: "Mashrook Dates", desc: "Firm-soft texture with a rounded, naturally sweet flavour.",     img: IMAGES.mashrook, prices: { "250g": 220, "1kg": 900 } },
  { id: "mabroom",  name: "Mabroom Dates",  desc: "Elegant elongated dates with a distinctive chewy texture.",      img: IMAGES.mabroom,  prices: { "250g": 260, "1kg": 1100 } },
  { id: "sukari",   name: "Sukari Dates",   desc: "Naturally golden, soft and exceptionally sweet.",                img: IMAGES.sukari,   prices: { "250g": 150, "1kg": 550 } },
];