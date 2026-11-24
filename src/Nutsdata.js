/* =====================================================================
   AL-NASR · NUTS & DRY FRUITS PRODUCT DATA   (src/nutsData.js)
   ---------------------------------------------------------------------
   EDIT PRICES HERE ONLY.
   Every product has its own "250g" and "1kg" price (in ₹).
   The prices below are TEMPORARY SAMPLE PRICES — replace with real ones.
   To use your own photo for a product, change its file name in IMAGE_FILES.
   ===================================================================== */

/* ---------- ONE IMAGE FILE PER PRODUCT ----------
   All photos live in  src/assets/nuts/ .
   To change a product's photo, change the file name on its line
   (the name of the file inside the nuts folder).
   ✓ = file name read from your nuts folder
   ? = file not visible in the folder list I was given — change it to the
       real name if the photo does not show (otherwise it uses a
       best-match by name, then the plain image.png)                       */
const IMAGE_FILES = {
  "nut-dry-mango-slices":     "dry-mango.png",          // ✓
  "nut-blackberry":           "blackberry.png",         // ?
  "nut-jackfruit":            "dry-jackfruit.png",      // ✓
  "nut-dry-nuts-fruit-mix":   "dry-nut.png",            // ✓
  "nut-protein-beans":        "protein.png",            // ✓
  "nut-dry-mix-vegetables":   "dry-vegetable.png",      // ✓
  "nut-black-kishmish":       "black-kishmish.png",     // ?
  "nut-afghan-kishmish":      "afghan-kishmish.png",    // ?
  "nut-dry-dates":            "dry-dates.png",          // ✓
  "nut-munnaka-raisins":      "munnka.png",             // ✓
  "nut-dry-mixed-nuts":       "dry-mixed-nuts.png",     // ✓
  "nut-macadamia":            "macadamia.png",          // ✓
  "nut-flax-seeds":           "flax-seeds.png",         // ✓
  "nut-watermelon-seeds":     "watermelon-seeds.png",   // ✓
  "nut-pumpkin-seeds":        "pumpkin-seeds.png",      // ✓
  "nut-green-kiwi":           "green-kiwi.png",         // ✓
  "nut-pistachios":           "pistachios.png",         // ✓
  "nut-pista-giri":           "pista-giri.png",         // ✓
  "nut-walnut":               "walnut.png",             // ✓
  "nut-pecan":                "pecan.png",              // ✓
  "nut-pepper-cashew":        "pepper-cashew.png",      // ✓
  "nut-cashew-240":           "cashew-240.png",         // ?
  "nut-cashew-320":           "cashew-320.png",         // ?
  "nut-shelled-pistachios":   "shelled-pistachios.png", // ✓
  "nut-roasted-almonds":      "roasted-almonds.png",    // ✓
  "nut-jumbo-almonds":        "jumbo-almonds.png",      // ✓
  "nut-almonds":              "almonds.png",            // ?
  "nut-sunflower-seeds":      "sunflower-seeds.png",    // ✓
  "nut-dried-strawberry":     "dried-strawberry.png",   // ✓
  "nut-pineapple-slices":     "pineapple-slices.png",   // ✓
};

/* ---------- finds the files (you don't need to touch this) ----------
   Looks inside src/assets/nuts/ (works even if the nuts folder sits inside
   another folder such as src/assets/chocolates/nuts/). A missing file never
   crashes the page. */
const ASSET_FILES = import.meta.glob("./assets/**/*.{png,jpg,jpeg,webp,avif,svg,PNG,JPG,JPEG,WEBP}", {
  eager: true,
  query: "?url",
  import: "default",
});
const FILE_LIST = Object.entries(ASSET_FILES)
  .map(([p, url]) => ({ rel: p.toLowerCase().replace("./assets/", ""), url }))
  .filter((f) => /(^|\/)nuts\//.test(f.rel))
  .map((f) => ({ ...f, name: f.rel.split("/").pop() }));
const GENERIC = (FILE_LIST.find((f) => f.name === "image.png") || {}).url || "";

const resolveImages = (files) => {
  const out = {};
  const claimed = new Set();
  // 1) exact file names
  Object.entries(files).forEach(([id, file]) => {
    const hit = FILE_LIST.find((f) => f.name === String(file).toLowerCase());
    if (hit) {
      out[id] = hit.url;
      claimed.add(hit.url);
    }
  });
  // 2) best match by name for the rest (never re-uses a photo another product owns)
  Object.entries(files).forEach(([id, file]) => {
    if (out[id]) return;
    const tokens = String(file).toLowerCase().replace(/\.[a-z]+$/, "").split(/[^a-z0-9]+/).filter(Boolean);
    const hit = FILE_LIST.filter((f) => !claimed.has(f.url) && tokens.every((t) => f.name.includes(t))).sort(
      (x, y) => x.name.length - y.name.length
    )[0];
    out[id] = hit ? hit.url : GENERIC; // 3) plain image.png
  });
  return out;
};

export const IMAGES = resolveImages(IMAGE_FILES);

export const CURRENCY = "₹";

/* The only two sizes sold */
export const WEIGHTS = ["250g", "1kg"];
export const WEIGHT_LABELS = { "250g": "250 Gram", "1kg": "1 KG" };

/* ---------- THE 30 PRODUCTS (prices in ₹ — edit freely) ---------- */
export const NUTS_PRODUCTS = [
  { id: "nut-dry-mango-slices",   name: "Dry Mango Slices",        desc: "Sun-sweet mango, gently dried with a soft, chewy bite.",          img: IMAGES["nut-dry-mango-slices"],   prices: { "250g": 180,  "1kg": 640 } },
  { id: "nut-blackberry",         name: "Blackberry",              desc: "Deep, tangy-sweet dried blackberries full of character.",         img: IMAGES["nut-blackberry"],         prices: { "250g": 320,  "1kg": 1150 } },
  { id: "nut-jackfruit",          name: "Jackfruit",               desc: "Golden, tropical jackfruit with a naturally honeyed flavour.",    img: IMAGES["nut-jackfruit"],          prices: { "250g": 200,  "1kg": 720 } },
  { id: "nut-dry-nuts-fruit-mix", name: "Dry Nuts & Fruit Mix",    desc: "A generous blend of nuts and dried fruits for everyday snacking.", img: IMAGES["nut-dry-nuts-fruit-mix"], prices: { "250g": 290,  "1kg": 1040 } },
  { id: "nut-protein-beans",      name: "Protein Beans",           desc: "Crunchy, roasted and richly nourishing protein beans.",           img: IMAGES["nut-protein-beans"],      prices: { "250g": 140,  "1kg": 500 } },
  { id: "nut-dry-mix-vegetables", name: "Dry Mix Vegetables",      desc: "Crisp dried vegetables, light, colourful and full of flavour.",   img: IMAGES["nut-dry-mix-vegetables"], prices: { "250g": 160,  "1kg": 580 } },
  { id: "nut-black-kishmish",     name: "Black Kishmish Seedless", desc: "Plump, dark seedless raisins with a deep natural sweetness.",     img: IMAGES["nut-black-kishmish"],     prices: { "250g": 130,  "1kg": 460 } },
  { id: "nut-afghan-kishmish",    name: "Afghan Kishmish",         desc: "Golden Afghan raisins, soft, juicy and delicately sweet.",        img: IMAGES["nut-afghan-kishmish"],    prices: { "250g": 170,  "1kg": 610 } },
  { id: "nut-dry-dates",          name: "Dry Dates",               desc: "Firm, chewy dried dates with a rich, caramel-like sweetness.",    img: IMAGES["nut-dry-dates"],          prices: { "250g": 120,  "1kg": 430 } },
  { id: "nut-munnaka-raisins",    name: "Munnaka Raisins",         desc: "Large, juicy munnaka raisins with a mellow, honeyed taste.",      img: IMAGES["nut-munnaka-raisins"],    prices: { "250g": 190,  "1kg": 680 } },
  { id: "nut-dry-mixed-nuts",     name: "Dry Mixed Nuts",          desc: "A premium assortment of crunchy, lightly sweet nuts.",            img: IMAGES["nut-dry-mixed-nuts"],     prices: { "250g": 310,  "1kg": 1110 } },
  { id: "nut-macadamia",          name: "Macadamia",               desc: "Buttery, creamy macadamias with a luxurious, smooth finish.",     img: IMAGES["nut-macadamia"],          prices: { "250g": 520,  "1kg": 1880 } },
  { id: "nut-flax-seeds",         name: "Flax Seeds",              desc: "Nutty, nutrient-rich seeds, perfect for smoothies and baking.",   img: IMAGES["nut-flax-seeds"],         prices: { "250g": 90,   "1kg": 320 } },
  { id: "nut-watermelon-seeds",   name: "Watermelon Seeds",        desc: "Light, crisp seeds with a delicate, nutty flavour.",              img: IMAGES["nut-watermelon-seeds"],   prices: { "250g": 150,  "1kg": 540 } },
  { id: "nut-pumpkin-seeds",      name: "Pumpkin Seeds",           desc: "Green, crunchy pumpkin seeds with a toasty, earthy taste.",       img: IMAGES["nut-pumpkin-seeds"],      prices: { "250g": 210,  "1kg": 760 } },
  { id: "nut-green-kiwi",         name: "Green Kiwi",              desc: "Tangy-sweet dried kiwi slices with a bright, fresh character.",   img: IMAGES["nut-green-kiwi"],         prices: { "250g": 260,  "1kg": 930 } },
  { id: "nut-pistachios",         name: "Pistachios",              desc: "Vivid green pistachios with a delicate, savoury richness.",       img: IMAGES["nut-pistachios"],         prices: { "250g": 450,  "1kg": 1620 } },
  { id: "nut-pista-giri",         name: "Pista Giri",              desc: "Shelled, vibrant pistachio kernels ready for sweets and baking.", img: IMAGES["nut-pista-giri"],         prices: { "250g": 540,  "1kg": 1950 } },
  { id: "nut-walnut",             name: "Walnut",                  desc: "Tender walnut kernels with a mellow, slightly sweet depth.",      img: IMAGES["nut-walnut"],             prices: { "250g": 280,  "1kg": 1010 } },
  { id: "nut-pecan",              name: "Pecan Nut",               desc: "Rich, maple-sweet pecans with a soft, buttery bite.",             img: IMAGES["nut-pecan"],              prices: { "250g": 480,  "1kg": 1730 } },
  { id: "nut-pepper-cashew",      name: "Pepper Cashew",           desc: "Crunchy cashews roasted with a gentle kick of black pepper.",     img: IMAGES["nut-pepper-cashew"],      prices: { "250g": 300,  "1kg": 1080 } },
  { id: "nut-cashew-240",         name: "Cashew 240",              desc: "Premium whole cashews, creamy, buttery and beautifully even.",    img: IMAGES["nut-cashew-240"],         prices: { "250g": 340,  "1kg": 1220 } },
  { id: "nut-cashew-320",         name: "Cashew 320",              desc: "Delicate whole cashews with a smooth, naturally sweet taste.",    img: IMAGES["nut-cashew-320"],         prices: { "250g": 310,  "1kg": 1120 } },
  { id: "nut-shelled-pistachios", name: "Shelled Pistachios",      desc: "Fresh, shelled pistachios, convenient, green and full of flavour.", img: IMAGES["nut-shelled-pistachios"], prices: { "250g": 500,  "1kg": 1800 } },
  { id: "nut-roasted-almonds",    name: "Roasted Almonds",         desc: "Gently roasted almonds with a warm, golden crunch.",              img: IMAGES["nut-roasted-almonds"],    prices: { "250g": 250,  "1kg": 900 } },
  { id: "nut-jumbo-almonds",      name: "Jumbo Almonds",           desc: "Extra-large, crisp almonds with a rich, sweet flavour.",          img: IMAGES["nut-jumbo-almonds"],      prices: { "250g": 290,  "1kg": 1050 } },
  { id: "nut-almonds",            name: "Almonds",                 desc: "Crisp, naturally sweet almonds, a timeless everyday favourite.", img: IMAGES["nut-almonds"],            prices: { "250g": 230,  "1kg": 830 } },
  { id: "nut-sunflower-seeds",    name: "Sunflower Seeds",         desc: "Light, nutty sunflower seeds with a satisfying crunch.",          img: IMAGES["nut-sunflower-seeds"],    prices: { "250g": 100,  "1kg": 360 } },
  { id: "nut-dried-strawberry",   name: "Dried Strawberry",        desc: "Ruby-red strawberries, tangy, sweet and beautifully tender.",     img: IMAGES["nut-dried-strawberry"],   prices: { "250g": 280,  "1kg": 1000 } },
  { id: "nut-pineapple-slices",   name: "Pineapple Slices",        desc: "Golden pineapple rings with a bright, tropical sweetness.",       img: IMAGES["nut-pineapple-slices"],   prices: { "250g": 190,  "1kg": 680 } },
];