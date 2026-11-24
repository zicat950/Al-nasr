/* =====================================================================
   AL-NASR · CHOCOLATES — CENTRAL PRODUCT DATA
   Put this file next to Chocolates.jsx (same folder as ./assets).

   EVERYTHING you normally edit is in this file:
     • names / prices ............ the lists below — every chocolate has its own
                                   price:  { name: "…", price: 449, img: "…" }
                                   (prices are SAMPLE prices: change any number)
     • logo + product images ..... the  img: "..."  and  logo: "..."  paths

   IMAGE PATHS
   -----------
   Every logo and product has its own  img / logo  path.
   RIGHT NOW every one of them points to the same test picture:
        src/assets/chocolates/image.png
   Later, change the file name on each line to the real picture.
   Write the file name that is inside  src/assets  (or a sub-path):
        img: "lindt-85-cocoa.png"          → src/assets/lindt-85-cocoa.png
        img: "lindt/85-cocoa.png"          → src/assets/lindt/85-cocoa.png
        img: "https://…/photo.jpg"         → full web address
   A wrong / missing file name is safe: the page first tries to match the
   product automatically by file name, and if nothing matches it shows a
   clean placeholder (never a random image).
   Requires Vite (import.meta.glob).
   ===================================================================== */

export const CURRENCY = "₹";
export const CHOCOLATE_PRICE = 599; // only used when a product line has NO price of its own

/* ---------------------------------------------------------------
   BRANDS — 10 collections        (logo + one image per flavour)
---------------------------------------------------------------- */
const RAW_BRANDS = [
  {
    id: "lindt",
    name: "Lindt",
    tagline: "Swiss master chocolatiers",
    keys: ["lindt"], // words used for automatic image matching
    logo: "chocolates/lindit-logo.png",
    products: [
      { name: "Caramelised Hazelnut – Dark Chocolate",                price: 599, img: "chocolates/caramelised-hazelnut.png" },
      { name: "Caramel with a Touch of Sea Salt – Dark Chocolate",    price: 599, img: "chocolates/caramel-sea.png" },
      { name: "85% Cocoa – Rich Dark",                                price: 599, img: "chocolates/85-cocoa-rich.png" },
      { name: "70% Cocoa – Intense Dark",                             price: 599, img: "chocolates/70-cocoa.png" },
      { name: "Chilli – Dark Chocolate",                              price: 599, img: "chocolates/chilli-dark.png" },
      { name: "Les Grandes – 34% Hazelnuts",                          price: 899, img: "chocolates/les-grandes.png" },
      { name: "Swiss Classic – Milk Chocolate",                       price: 899, img: "chocolates/swiss-classic.png" },
      { name: "Mint Intense – Dark Chocolate",                        price: 599, img: "chocolates/mint-intense.png" },
      { name: "Lindor – White Chocolate",                             price: 549, img: "chocolates/lindor-white.png" },
      { name: "Lindor – Milk Chocolate",                              price: 549, img: "chocolates/lindor-milk.png" },
      { name: "Lindor – 60% Cacao Dark Chocolate",                    price: 549, img: "chocolates/lindor-60.png" },
    ],
  },
  {
    id: "dairy-milk",
    name: "Dairy Milk",
    tagline: "Cadbury · Glass & a half of full cream milk",
    keys: ["dairymilk", "cadbury"], // words used for automatic image matching
    logo: "chocolates/dairymilk-logo.png",
    products: [
      { name: "Chips More",      price: 350, img: "chocolates/chips-more.png" },
      { name: "Black Forest",    price: 350, img: "chocolates/black-forest.png" },
      { name: "Coklat Susu",     price: 350, img: "chocolates/coklat-susu.png" },
      { name: "Fruit & Nut",     price: 350, img: "chocolates/fruit-nut.png" },
      { name: "Hazelnut",        price: 350, img: "chocolates/hazelnut.png" },
      { name: "Roast Almond",    price: 350, img: "chocolates/roast-almond.png" },
    ],
  },
  {
    id: "kunafa",
    name: "Kunafa Chocolates",
    tagline: "Crunchy kunafa meets silky chocolate",
    keys: ["kunafa", "kunafah", "knafeh"], // words used for automatic image matching
    logo: "chocolates/kunafa-logo.png",
    products: [
      { name: "Pistachio with Kunafa",    price: 499, img: "chocolates/pistachio-with-kunafa.png" },
      { name: "Dark Coffee",              price: 699, img: "chocolates/dark-coffee.png" },
      { name: "Speculoos",                price: 699, img: "chocolates/speculoos.png" },
      { name: "Hazelnuts",                price: 699, img: "chocolates/hazelnuts.png" },
      { name: "Cheesecake",               price: 699, img: "chocolates/cheesecake.png" },
    ],
  },
  {
    id: "kitkat",
    name: "KitKat",
    tagline: "Have a break",
    keys: ["kitkat"], // words used for automatic image matching
    logo: "chocolates/kitkat-logo.png",
    products: [
      { name: "Brownie",           price: 360, img: "chocolates/brownie.png" },
      { name: "Chunky",            price: 120, img: "chocolates/chunky.png" },
      { name: "Milk Chocolate",    price: 100, img: "chocolates/milk-chocolate.png" },
    ],
  },
  {
    id: "milka",
    name: "Milka",
    tagline: "Alpine milk chocolate",
    keys: ["milka"], // words used for automatic image matching
    logo: "chocolates/milka-logo.png",
    products: [
      { name: "Yogurt",                price: 300, img: "chocolates/yogurt.png" },
      { name: "Happy Cows",            price: 300, img: "chocolates/happy-cows.png" },
      { name: "Strawberry Cilekli",    price: 300, img: "chocolates/strawberry-cilekli.png" },
      { name: "Riso Soffiato",         price: 300, img: "chocolates/riso-soffiato.png" },
    ],
  },
  {
    id: "roshen",
    name: "Roshen",
    tagline: "European confectionery since 1996",
    keys: ["roshen"], // words used for automatic image matching
    logo: "chocolates/roshen-logo.png",
    products: [
      { name: "Special",              price: 199, img: "chocolates/special.png" },
      { name: "Bitter",               price: 179, img: "chocolates/bitter.png" },
      { name: "White Chocolate",      price: 179, img: "chocolates/white-roshen.png" },
      { name: "Milk Chocolate",       price: 179, img: "chocolates/milk-roshen.png" },
      { name: "Caramel Chocolate",    price: 199, img: "chocolates/caramel-chocolate.png" },
      { name: "Dark Chocolate",       price: 179, img: "chocolates/dark-roshen.png" },
    ],
  },
  {
    id: "vintage",
    name: "Vintage",
    tagline: "Classic recipes, timeless taste",
    keys: ["vintage"], // words used for automatic image matching
    logo: "chocolates/vintage-logo.png",
    products: [
      { name: "Hazelnut",          price: 360, img: "chocolates/hazelnut1.png" },
      { name: "Almond Dark",       price: 250, img: "chocolates/almond-dark.png" },
      { name: "Fruit & Nuts",      price: 250, img: "chocolates/fruit-nuts.png" },
      { name: "Milk Chocolate",    price: 250, img: "chocolates/milk-vintage.png" },
      { name: "Dark Chocolate",    price: 250, img: "chocolates/dark-vintage.png" },
    ],
  },
  {
    id: "ghirardelli",
    name: "Ghirardelli",
    tagline: "San Francisco · Since 1852",
    keys: ["ghirardelli"], // words used for automatic image matching
    logo: "chocolates/ghirardelli-logo.png",
    products: [
      { name: "Milk Chocolate",    price: 250, img: "chocolates/milk-ghirardelli.png" },
    ],
  },
  {
    id: "kinder",
    name: "Kinder",
    tagline: "Italian cream & wafer delights",
    keys: ["kinder"], // words used for automatic image matching
    logo: "chocolates/kinder-logo.png",
    products: [
      { name: "Bueno White",    price: 140, img: "chocolates/beuno-white.png" },
    ],
  },
  {
    id: "toblerone",
    name: "Toblerone",
    tagline: "Swiss chocolate with honey & almond nougat",
    keys: ["toblerone"], // words used for automatic image matching
    logo: "chocolates/toblerone-logo.png",
    products: [
      { name: "Chocolate",                                 price: 140, img: "chocolates/toblerone-chocolate.png" },
      { name: "White Chocolate",                           price: 260, img: "chocolates/white-chocolate.png" },
      { name: "Dark Chocolate – Honey & Almond Nougat",    price: 260, img: "chocolates/dark-chocolate.png" },
      { name: "Milk Chocolate with Raisins",               price: 260, img: "chocolates/milk-chocolate2.png" },
    ],
  },
];

/* ---------------------------------------------------------------
   EXTRA SECTIONS — shown after the 10 brands
   Each has its own heading. Prices here are SAMPLE prices: change freely.
   Add / remove / rename any line, or add a whole new section.
---------------------------------------------------------------- */
const RAW_EXTRA_SECTIONS = [
  {
    id: "chips",
    nav: "Chips",                       // name in the top navigation
    title: "CHIPS",                     // big section heading
    category: "Chips",                  // shown in the cart / wishlist
    tagline: "Crunchy crisps for every craving",
    products: [
      { name: "Sohar Chips", price: 320, img: "chocolates/sohar-chips.png" },
      { name: "Pringles", price: 320, img: "chocolates/pringles.png" },
      { name: "Chips Oman", price: 599, img: "chocolates/chips-oman.png" },
    ],
  },
  {
    id: "peanut-butter",
    nav: "Peanut Butter",
    title: "PEANUT BUTTER",
    category: "Peanut Butter",
    tagline: "Creamy, crunchy and natural spreads",
    products: [
      { name: "Creamy Peanut Butter", price: 660, img: "chocolates/biscoff.png" },
      { name: "Crunchy Peanut Butter", price: 319, img: "chocolates/peanut-butter1.png" },
      { name: "Natural Peanut Butter", price: 319, img: "chocolates/peanut-butter2.png" },
      { name: "Chocolate Peanut Butter", price: 319, img: "chocolates/peanut-butter3.png" },
    ],
  },
  {
    id: "more-treats",
    nav: "More Treats",
    title: "MORE TREATS & SNACKS",
    category: "Treats & Snacks",
    tagline: "Biscuits, sweets and gifting favourites",
    products: [
      { name: "Maltesers", price: 160, img: "chocolates/maltesers.png" },
      { name: "Bounty", price: 110, img: "chocolates/bounty.png" },
      { name: "Peanut M&M", price: 130, img: "chocolates/peanut-m&m.png" },
      { name: "Chocolate M&M", price: 130, img: "chocolates/chocolate-m&m.png" },
      { name: "Skittles", price: 95, img: "chocolates/skittles.png" },
      { name: "Tim Tam", price: 490, img: "chocolates/tim-tam.png" },
      { name: "Kravout", price: 80, img: "chocolates/kravout.png" },
      { name: "Yummo", price: 60, img: "chocolates/yummo.png" },
      { name: "Barquillo", price: 799, img: "chocolates/barquillo.png" },
      { name: "Selection", price: 400, img: "chocolates/selection.png" },
      { name: "Mamoul Oman", price: 225, img: "chocolates/mamoul-oman.png" },
      { name: "Ferrero Rocher", price: 949, img: "chocolates/ferrero-rocher.png" },
      { name: "Raffaello", price: 2380, img: "chocolates/raffaello.png" },
    ],
  },
];

/* =====================================================================
   AUTOMATIC IMAGE MATCHING  (you normally never need to touch this)
   ===================================================================== */
const assetUrls = import.meta.glob("./assets/**/*.{png,jpg,jpeg,webp,avif,svg,PNG,JPG,JPEG,WEBP}", {
  eager: true,
  query: "?url",
  import: "default",
});

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
const slug = (s) =>
  String(s)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const tokensOf = (name) =>
  name
    .toLowerCase()
    .split(/[\s\-–—/]+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ""))
    .filter(Boolean);
const STOP = new Set(["with", "a", "of", "the", "and"]);

const FILES = Object.entries(assetUrls).map(([path, url]) => {
  const rel = path.replace(/^\.\/assets\//, "");
  const noExt = rel.replace(/\.[^.]+$/, "");
  return {
    url,
    rel: rel.toLowerCase(),
    relNoExt: noExt.toLowerCase(),
    full: norm(noExt),
    base: norm(noExt.split("/").pop()),
    isLogo: /logo/i.test(rel),
  };
});

/* resolve an  img / logo  path written in this file */
const findByHint = (hint) => {
  if (!hint) return null;
  if (/^(https?:)?\/\//.test(hint) || hint.startsWith("data:") || hint.startsWith("/")) return hint;
  const h = hint.toLowerCase().replace(/^\.?\/?(src\/)?assets\//, "");
  let f = FILES.find(
    (x) => x.rel === h || x.relNoExt === h || x.rel.endsWith("/" + h) || x.relNoExt.endsWith("/" + h)
  );
  // last chance: same file name in any folder (e.g. folder is "chocolate" not "chocolates")
  if (!f) {
    const name = h.split("/").pop();
    f = FILES.find((x) => x.rel.split("/").pop() === name || x.relNoExt.split("/").pop() === name);
  }
  return f ? f.url : null;
};

/* automatic logo lookup (used only when the logo path above isn't found) */
const findLogoAuto = (keys) => {
  const byLogo = FILES.filter((f) => f.isLogo && keys.some((k) => f.full.includes(k)));
  const pool = byLogo.length ? byLogo : FILES.filter((f) => keys.some((k) => f.base === k));
  pool.sort((a, b) => a.base.length - b.base.length);
  return pool[0] ? pool[0].url : null;
};

/* ---------- build brands + extra sections ---------- */
const BRANDS_BUILT = RAW_BRANDS.map((b) => ({
  ...b,
  logo: findByHint(b.logo) || findLogoAuto(b.keys),
  products: b.products.map((p) => {
    const o = typeof p === "string" ? { name: p } : p;
    return {
      id: `${b.id}-${slug(o.name)}`,
      brandId: b.id,
      brand: b.name,
      category: b.name,
      name: o.name,
      fullName: `${b.name} ${o.name}`,
      price: o.price ?? CHOCOLATE_PRICE,
      imgHint: o.img || null,
      img: null,
    };
  }),
}));

const EXTRA_BUILT = RAW_EXTRA_SECTIONS.map((s) => ({
  ...s,
  products: s.products.map((o) => ({
    id: `snack-${slug(o.name)}`,
    brandId: s.id,
    brand: "",
    category: s.category || s.title,
    name: o.name,
    fullName: o.name,
    price: o.price,
    imgHint: o.img || null,
    img: null,
  })),
}));

(function assignImages() {
  const logoUrls = new Set(BRANDS_BUILT.map((b) => b.logo).filter(Boolean));
  const pool = FILES.filter((f) => !f.isLogo && !logoUrls.has(f.url));
  const used = new Set();
  const pairs = [];
  const extraProducts = EXTRA_BUILT.flatMap((s) => s.products);

  // 1) the exact paths written in this file
  [...BRANDS_BUILT.flatMap((b) => b.products), ...extraProducts].forEach((p) => {
    const url = findByHint(p.imgHint);
    if (url) {
      p.img = url;
      used.add(url);
    }
  });

  // 2) automatic matching for anything still without an image
  BRANDS_BUILT.forEach((b) => {
    const brandFiles = pool.filter((f) => b.keys.some((k) => f.full.includes(k)));
    b.products.forEach((p) => {
      if (p.img) return;
      const tokens = tokensOf(p.name).filter((t) => !STOP.has(t) && !b.keys.includes(t));
      brandFiles.forEach((f) => {
        let hay = f.full;
        b.keys.forEach((k) => (hay = hay.split(k).join("")));
        const matched = tokens.filter((t) => hay.includes(t)).length;
        const ratio = tokens.length ? matched / tokens.length : 1;
        if (ratio >= 0.5) pairs.push({ p, url: f.url, ratio, matched, len: f.base.length });
      });
    });
  });

  extraProducts.forEach((p) => {
    if (p.img) return;
    const tokens = tokensOf(p.name).filter((t) => !STOP.has(t));
    pool.forEach((f) => {
      const matched = tokens.filter((t) => f.full.includes(t)).length;
      if (tokens.length && matched === tokens.length) {
        pairs.push({ p, url: f.url, ratio: 1, matched, len: f.base.length });
      }
    });
  });

  pairs.sort((a, b) => b.ratio - a.ratio || b.matched - a.matched || a.len - b.len);
  pairs.forEach(({ p, url }) => {
    if (p.img || used.has(url)) return;
    p.img = url;
    used.add(url);
  });
})();

export const BRANDS = BRANDS_BUILT;
export const EXTRA_SECTIONS = EXTRA_BUILT;
/* every product of the extra sections in one list (used by the wishlist page) */
export const SNACKS = EXTRA_BUILT.flatMap((s) => s.products);