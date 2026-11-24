/* =====================================================================
   AL-NASR · DRINKS PRODUCT DATA   (src/Drink.js)
   ---------------------------------------------------------------------
   1) IMAGES  -> change a product's photo in the IMAGES list below
                 (one separate path each)
   2) PRICES  -> change prices in the DRINKS_PRODUCTS list below
   ===================================================================== */

/* ---------- IMAGE FILES (photos live in src/assets/drinks/) ----------
   All pictures in that folder are picked up automatically (png / jpg / jpeg / webp / avif).
   If a file is missing or named differently, the page still works: that product just shows
   the default photo (default.png) or a drawn bottle, and the browser console tells you the name.   */
const FOUND = import.meta.glob("./assets/drinks/*.{png,jpg,jpeg,webp,avif,PNG,JPG,JPEG}", { eager: true, import: "default" });
const FILES = {};
Object.entries(FOUND).forEach(([path, url]) => {
  const base = path.split("/").pop().replace(/\.[^.]+$/, "").toLowerCase().replace(/\.png$/, "");
  FILES[base] = url;
});
const defaultImg = FILES["default"] || null; // fallback photo (optional)
const img = (name) => {
  const hit = FILES[name.toLowerCase()];
  if (!hit && import.meta.env && import.meta.env.DEV) {
    console.warn(`[Drink.js] image not found: src/assets/drinks/${name}.png (check the file name)`);
  }
  return hit || defaultImg;
};

// To change a product's photo: replace the file in src/assets/drinks/ (same name),
// or change the file name (without .png) inside img('...') below.

/* ---------- ONE IMAGE PATH PER PRODUCT ---------- */
export const IMAGES = {
  sparklingPepsi: img('pepsi'),                     // src/assets/drinks/pepsi.png
  sparklingPepsiKhongDuong: img('pepsi1'),          // src/assets/drinks/pepsi1.png
  energyStarbucksDoubleShot: img('starbucks'),      // src/assets/drinks/starbucks.png
  sparklingCocoRoyal: img('coco'),                  // src/assets/drinks/coco.png
  sparklingCocoCola: img('coco-cola'),              // src/assets/drinks/coco-cola.png
  energyMonsterUltraPeachyKeen: img('monster1'),    // src/assets/drinks/monster1.png
  energyMonsterUltraStrawberryDreams: img('monster2'),// src/assets/drinks/monster2.png
  energyMonsterUltraFiestaPunch: img('monster3'),   // src/assets/drinks/monster3.png
  energyMonsterUltraAbsolutelyZero: img('monster4'),// src/assets/drinks/monster4.png
  energyMonsterPipelinePunch: img('monster5'),      // src/assets/drinks/monster5.png
  energyPocariSweat: img('pocari'),                 // src/assets/drinks/pocari.png
  sparklingMountainDew: img('mountain'),            // src/assets/drinks/mountain.png
  sparklingMirinda: img('miranda'),                 // src/assets/drinks/miranda.png
  premiumEvian: img('evian'),                       // src/assets/drinks/evian.png
  premiumPerrier: img('perrier'),                   // src/assets/drinks/perrier.png
  sparklingJoiner: img('joiner'),                   // src/assets/drinks/joiner.png
  sparklingFanta: img('fanta'),                     // src/assets/drinks/fanta.png
  sparklingSprite: img('sprite'),                   // src/assets/drinks/sprite.png
  sparkling7up: img('7up'),                         // src/assets/drinks/7up.png
  premiumOcean: img('ocean'),                       // src/assets/drinks/ocean.png
  juicesRaniMangue: img('rani1'),                   // src/assets/drinks/rani1.png
  juicesRaniFraiseBanane: img('rani2'),             // src/assets/drinks/rani2.png
  juicesRaniAnanas: img('rani3'),                   // src/assets/drinks/rani3.png
  sparklingKinzaLemon: img('kinza1'),               // src/assets/drinks/kinza1.png
  sparklingKinzaBlackFruit: img('kinza2'),          // src/assets/drinks/kinza2.png
  sparklingKinzaPomegranate: img('kinza3'),         // src/assets/drinks/kinza3.png
  juicesMoosiStrawberry: img('moosi'),              // src/assets/drinks/moosi.png
  juicesSwingLushLychee: img('swing1'),             // src/assets/drinks/swing1.png
  juicesSwingCoconutWater: img('swing2'),           // src/assets/drinks/swing2.png
  juicesSwingSlurpyMango: img('swing3'),            // src/assets/drinks/swing3.png
};

/* ---------- CATEGORY TABS ---------- */
export const SHOP_CATS = [
  { id: 'all', label: 'All drinks' },
  { id: 'sparkling', label: 'Soft drinks' },
  { id: 'energy', label: 'Energy & coffee' },
  { id: 'juices', label: 'Juices & fruit drinks' },
  { id: 'premium', label: 'Water' },
];

/* ---------- PRODUCTS & PRICES (₹) ----------
   key    : must match a name in IMAGES above
   cat    : sparkling | energy | juices | premium
   prices : { 'size label': price }  -> add more sizes if you sell them, e.g. { '330 ml': 120, '1 L': 220 }
   a, b   : colours of the drawn can/bottle (only used if a product has no image)  */
const DRINKS_PRODUCTS = [
  { key: 'sparklingPepsi', cat: 'sparkling', name: 'Pepsi', sub: 'Soft drink', a: '#0B3D91', b: '#E32934', prices: { '1 pc': 120 } },
  { key: 'sparklingPepsiKhongDuong', cat: 'sparkling', name: 'Pepsi Khong Duong', sub: 'Soft drink', a: '#101820', b: '#35A7FF', prices: { '1 pc': 120 } },
  { key: 'energyStarbucksDoubleShot', cat: 'energy', name: 'Starbucks Double Shot', sub: 'Energy & coffee', a: '#1E3932', b: '#C8A46A', prices: { '1 pc': 220 } },
  { key: 'sparklingCocoRoyal', cat: 'sparkling', name: 'Coco Royal', sub: 'Soft drink', a: '#5A3A1A', b: '#E0B66B', prices: { '1 pc': 125 } },
  { key: 'sparklingCocoCola', cat: 'sparkling', name: 'Coco Cola', sub: 'Soft drink', a: '#C8102E', b: '#FF5A5F', prices: { '1 pc': 110 } },
  { key: 'energyMonsterUltraPeachyKeen', cat: 'energy', name: 'Monster Ultra Peachy Keen', sub: 'Energy & coffee', a: '#C9733A', b: '#FFD2A8', prices: { '1 pc': 260 } },
  { key: 'energyMonsterUltraStrawberryDreams', cat: 'energy', name: 'Monster Ultra Strawberry Dreams', sub: 'Energy & coffee', a: '#B5314F', b: '#FFC2D0', prices: { '1 pc': 260 } },
  { key: 'energyMonsterUltraFiestaPunch', cat: 'energy', name: 'Monster Ultra Fiesta Punch', sub: 'Energy & coffee', a: '#B8481A', b: '#FF9A5C', prices: { '1 pc': 260 } },
  { key: 'energyMonsterUltraAbsolutelyZero', cat: 'energy', name: 'Monster Ultra Absolutely Zero', sub: 'Energy & coffee', a: '#222B30', b: '#E9EEF0', prices: { '1 pc': 260 } },
  { key: 'energyMonsterPipelinePunch', cat: 'energy', name: 'Monster Pipeline Punch', sub: 'Energy & coffee', a: '#1F5E2E', b: '#9BE35A', prices: { '1 pc': 260 } },
  { key: 'energyPocariSweat', cat: 'energy', name: 'Pocari Sweat', sub: 'Energy & coffee', a: '#1A5FB4', b: '#BFE0FF', prices: { '1 pc': 120 } },
  { key: 'sparklingMountainDew', cat: 'sparkling', name: 'Mountain Dew', sub: 'Soft drink', a: '#4F8F1C', b: '#C5E84A', prices: { '1 pc': 120 } },
  { key: 'sparklingMirinda', cat: 'sparkling', name: 'Mirinda', sub: 'Soft drink', a: '#E8801A', b: '#FFB347', prices: { '1 pc': 130 } },
  { key: 'premiumEvian', cat: 'premium', name: 'Evian', sub: 'Water', a: '#1E6FB8', b: '#CFE8F8', prices: { '1 pc': 160 } },
  { key: 'premiumPerrier', cat: 'premium', name: 'Perrier', sub: 'Water', a: '#1F7A3A', b: '#BFE8C8', prices: { '1 pc': 200 } },
  { key: 'sparklingJoiner', cat: 'sparkling', name: 'Joiner', sub: 'Soft drink', a: '#7A4A1C', b: '#E8B46B', prices: { '1 pc': 70 } },
  { key: 'sparklingFanta', cat: 'sparkling', name: 'Fanta', sub: 'Soft drink', a: '#E8801A', b: '#FFC247', prices: { '1 pc': 110 } },
  { key: 'sparklingSprite', cat: 'sparkling', name: 'Sprite', sub: 'Soft drink', a: '#2E7D32', b: '#C5E84A', prices: { '1 pc': 120 } },
  { key: 'sparkling7up', cat: 'sparkling', name: '7UP', sub: 'Soft drink', a: '#2E8B3A', b: '#D7F26B', prices: { '1 pc': 110 } },
  { key: 'premiumOcean', cat: 'premium', name: 'Ocean', sub: 'Water', a: '#2F7BFF', b: '#BFE0FF', prices: { '1 pc': 40 } },
  { key: 'juicesRaniMangue', cat: 'juices', name: 'Rani Mangue', sub: 'Juice & fruit drink', a: '#F2B705', b: '#FF8A1F', prices: { '1 pc': 120 } },
  { key: 'juicesRaniFraiseBanane', cat: 'juices', name: 'Rani Fraise Banane', sub: 'Juice & fruit drink', a: '#C2456B', b: '#FFE066', prices: { '1 pc': 120 } },
  { key: 'juicesRaniAnanas', cat: 'juices', name: 'Rani Ananas', sub: 'Juice & fruit drink', a: '#D9A400', b: '#FFE066', prices: { '1 pc': 120 } },
  { key: 'sparklingKinzaLemon', cat: 'sparkling', name: 'Kinza Lemon', sub: 'Soft drink', a: '#B9A800', b: '#F6F08A', prices: { '1 pc': 125 } },
  { key: 'sparklingKinzaBlackFruit', cat: 'sparkling', name: 'Kinza Black Fruit', sub: 'Soft drink', a: '#2B1240', b: '#7A4BC4', prices: { '1 pc': 125 } },
  { key: 'sparklingKinzaPomegranate', cat: 'sparkling', name: 'Kinza Pomegranate', sub: 'Soft drink', a: '#8E1230', b: '#E8476A', prices: { '1 pc': 125 } },
  { key: 'juicesMoosiStrawberry', cat: 'juices', name: 'Moosi Strawberry', sub: 'Juice & fruit drink', a: '#B5314F', b: '#FFB3C4', prices: { '1 pc': 160 } },
  { key: 'juicesSwingLushLychee', cat: 'juices', name: 'Swing Lush Lychee', sub: 'Juice & fruit drink', a: '#C97B84', b: '#F7D6DA', prices: { '1 pc': 10 } },
  { key: 'juicesSwingCoconutWater', cat: 'juices', name: 'Swing Coconut Water', sub: 'Juice & fruit drink', a: '#4F8F1C', b: '#EAF6D8', prices: { '1 pc': 10 } },
  { key: 'juicesSwingSlurpyMango', cat: 'juices', name: 'Swing Slurpy Mango', sub: 'Juice & fruit drink', a: '#F2B705', b: '#FF8A1F', prices: { '1 pc': 10 } },
];

/* ---------- build the list used by Drinks.jsx (no need to edit below) ---------- */
export const SHOP_PRODUCTS = DRINKS_PRODUCTS.map((p) => ({
  id: `${p.cat}-${p.key}`,
  cat: p.cat,
  name: p.name,
  sub: p.sub,
  a: p.a,
  b: p.b,
  img: IMAGES[p.key] || defaultImg || undefined,
  sizes: Object.entries(p.prices).map(([label, price]) => ({ label, price })),
}));

export default SHOP_PRODUCTS;