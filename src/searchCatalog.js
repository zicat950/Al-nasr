/* =====================================================================
   AL-NASR · SEARCH CATALOG   (src/searchCatalog.js)
   ---------------------------------------------------------------------
   Collects EVERY product of the site into one list for the search page
   and the navbar search box — dates, nuts & dry fruits, chocolates,
   gift hampers, drinks…

   It automatically reads your data files in src/ (no list to maintain):
       Datesdata.js · Drink.js · products.js · any *data*.js · src/data/*.js
   and picks up every exported list whose items have a name.

   A new data file called something else (e.g. Nuts.js)? Add its name to
   EXTRA_FILES below, or import it and add it to EXTRA_LISTS.
   ===================================================================== */

/* extra files that don't match the automatic patterns, e.g. "./Nuts.js" */
const EXTRA_FILES = [];

const found = import.meta.glob(
  ["./*[Dd]ata*.js", "./Drink*.js", "./[Pp]roducts*.js", "./*[Pp]roducts.js", "./data/*.js"],
  { eager: true }
);
const extra = EXTRA_FILES.length ? import.meta.glob("./*.js", { eager: true }) : {};
Object.keys(extra).forEach((k) => {
  if (EXTRA_FILES.includes(k)) found[k] = extra[k];
});

/* category of a file / export, guessed from its name */
const CATEGORY_RULES = [
  [/drink|bever|juice|soda/i, "Drinks & Beverages", "/drinks-beverages"],
  [/choco/i, "Chocolates", "/chocolates"],
  [/hamper|gift/i, "Gift Hampers", "/gift-hampers"],
  [/nut|dry|dried/i, "Nuts & Dry Fruits", "/nuts-dry-fruits"],
  [/date/i, "Dates", "/dates"],
];
const PATH_BY_CATEGORY = {
  Dates: "/dates",
  "Nuts & Dry Fruits": "/nuts-dry-fruits",
  Chocolates: "/chocolates",
  "Gift Hampers": "/gift-hampers",
  "Drinks & Beverages": "/drinks-beverages",
};
const categoryFrom = (text) => {
  for (const [re, label] of CATEGORY_RULES) if (re.test(text)) return label;
  return null;
};

const nameOf = (p) => p && (p.name || p.title || p.n);
const isProduct = (p) => p && typeof p === "object" && !Array.isArray(p) && typeof nameOf(p) === "string";

const num = (v) => {
  if (typeof v === "number" && isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^0-9.]/g, ""));
    return isFinite(n) ? n : null;
  }
  return null;
};

/** every size / weight option of a product, as [{ label, price }] */
function variantsOf(p) {
  const out = [];
  const list = p.sizes || p.weights || p.variants || p.options;
  if (Array.isArray(list)) {
    list.forEach((v) => {
      if (v && typeof v === "object") {
        const price = num(v.price ?? v.p);
        if (price != null) out.push({ label: String(v.label ?? v.weight ?? v.size ?? v.name ?? ""), price });
      }
    });
  }
  if (!out.length && p.prices && typeof p.prices === "object") {
    Object.entries(p.prices).forEach(([label, v]) => {
      const price = num(v);
      if (price != null) out.push({ label, price });
    });
  }
  if (!out.length) {
    const price = num(p.price ?? p.p ?? p.cost ?? p.mrp);
    if (price != null) out.push({ label: String(p.weight ?? p.size ?? p.vol ?? ""), price });
  }
  if (!out.length) {
    Object.keys(p).forEach((k) => {
      if (/^price/i.test(k)) {
        const price = num(p[k]);
        if (price != null) out.push({ label: k.replace(/^price[_\-\s]*/i, ""), price });
      }
    });
  }
  return out;
}

/** turn any product object into the one shape the search page uses */
export function normalize(p, fileCat, fileName) {
  const name = String(nameOf(p)).trim();
  const own = p.category && typeof p.category === "string" ? p.category : null;
  const category = fileCat || categoryFrom(own || "") || own || "Products";
  const sub = p.sub || p.type || p.brand || "";
  const baseId = String(p.id ?? p.key ?? name);
  return {
    id: `${category}-${baseId}`.toLowerCase().replace(/\s+/g, "-"),
    name,
    category,
    sub: typeof sub === "string" ? sub : "",
    desc: typeof (p.desc || p.d || p.description) === "string" ? p.desc || p.d || p.description : "",
    image: p.image || p.img || p.photo || p.src || null,
    variants: variantsOf(p),
    to: PATH_BY_CATEGORY[category] || "/",
    src: fileName,
  };
}

/** read lists of products out of loaded modules (exported separately so it can be tested) */
export function buildCatalog(modules) {
  const seenLists = new Set();
  const seenIds = new Set();
  const out = [];
  const take = (list, fileCat, file) => {
    list.forEach((p) => {
      if (!isProduct(p)) return;
      const item = normalize(p, fileCat, file);
      const dup = `${item.category}|${item.name}`.toLowerCase();
      if (seenIds.has(dup)) return;
      seenIds.add(dup);
      out.push(item);
    });
  };
  Object.entries(modules).forEach(([file, mod]) => {
    Object.entries(mod || {}).forEach(([exportName, value]) => {
      if (!value || typeof value !== "object" || seenLists.has(value)) return;
      let list = null;
      if (Array.isArray(value)) list = value;
      else {
        const vals = Object.values(value);
        if (vals.length && vals.every(isProduct)) list = vals; // { key: {name,…} } maps
      }
      if (!list || !list.some(isProduct)) return;
      seenLists.add(value);
      take(list, categoryFrom(`${file} ${exportName}`), file);
    });
  });
  return out;
}

export const ALL_PRODUCTS = buildCatalog(found);

export const formatPrice = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

/* lower-case, no accents / punctuation: "Cadbury Dairy-Milk" → "cadbury dairy milk" */
export const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** every typed word must appear in the product name, category or type */
export function searchProducts(list, query) {
  const words = norm(query).split(" ").filter(Boolean);
  if (!words.length) return list;
  const q = words.join(" ");
  return list
    .map((p) => {
      const nm = norm(p.name);
      const hay = `${nm} ${norm(p.category)} ${norm(p.sub)}`;
      const ok = words.every((w) => hay.includes(w)) || hay.replace(/ /g, "").includes(words.join(""));
      if (!ok) return null;
      return { p, score: nm.startsWith(q) ? 0 : nm.includes(q) ? 1 : 2 };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score)
    .map((x) => x.p);
}