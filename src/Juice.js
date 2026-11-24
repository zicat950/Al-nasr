/* AL-NASR — Juice catalogue (31 juices)
   Photos: drop files in  public/images/juices/<id>.jpg  (e.g. orange.jpg).
   If a photo is missing, a coloured bottle illustration (colours a → b) is shown instead.
   Prices are in ₹. Edit freely. */

export const JUICE_CURRENCY = "₹";

export const JUICE_CATEGORIES = [
  "Citrus", "Tropical", "Orchard", "Berry", "Green & Wellness", "Blends",
];

export const PRICE_RANGES = [
  { id: "all", label: "All prices", min: 0, max: Infinity },
  { id: "u60", label: "Under ₹60", min: 0, max: 59 },
  { id: "60-100", label: "₹60 – ₹100", min: 60, max: 100 },
  { id: "100-150", label: "₹100 – ₹150", min: 101, max: 150 },
  { id: "o150", label: "Above ₹150", min: 151, max: Infinity },
];

const j = (id, name, category, size, price, desc, a, b) => ({
  id: `juice-${id}`,
  name: `${name} Juice`,
  category,
  size,
  price,
  desc,
  a,
  b,
  img: `/images/juices/${id}.jpg`,
});

export const JUICES = [
  // Citrus (5)
  j("orange", "Orange", "Citrus", "1 L", 120, "Pressed oranges, bright and naturally sweet.", "#E8801A", "#FFB347"),
  j("sweet-lime", "Sweet Lime", "Citrus", "1 L", 110, "Mild, refreshing mosambi juice.", "#B9C94A", "#E6EE9C"),
  j("lemon-mint", "Lemon Mint", "Citrus", "500 ml", 55, "Zesty lemon with cool fresh mint.", "#C5D93A", "#8BC34A"),
  j("grapefruit", "Grapefruit", "Citrus", "1 L", 135, "Tangy pink grapefruit with a clean finish.", "#E9707A", "#FFB3A7"),
  j("tangerine", "Tangerine", "Citrus", "1 L", 125, "Sweet-tart mandarin, served cold.", "#F08A24", "#FFC36B"),

  // Tropical (7)
  j("mango", "Mango", "Tropical", "1 L", 130, "Thick, sun-ripened mango pulp.", "#F2B705", "#FF8A1F"),
  j("pineapple", "Pineapple", "Tropical", "1 L", 115, "Juicy, sweet and slightly tangy.", "#E8C619", "#FFE46B"),
  j("guava", "Guava", "Tropical", "1 L", 105, "Soft, fragrant guava nectar.", "#D96B7A", "#F5B5B0"),
  j("passion-fruit", "Passion Fruit", "Tropical", "500 ml", 85, "Bold tropical aroma with a tart kick.", "#8E3B8F", "#F2A83B"),
  j("lychee", "Lychee", "Tropical", "1 L", 140, "Delicate floral sweetness.", "#E7A1B0", "#FBE1E3"),
  j("coconut-water", "Coconut Water", "Tropical", "330 ml", 45, "Natural, lightly sweet hydration.", "#7FB9A3", "#DDF3E8"),
  j("papaya", "Papaya", "Tropical", "1 L", 100, "Smooth and mellow, rich in flavour.", "#F0903A", "#FFC98A"),

  // Orchard (7)
  j("apple", "Apple", "Orchard", "1 L", 110, "Crisp green apples, lightly pressed.", "#4F8F1C", "#C5D93A"),
  j("pear", "Pear", "Orchard", "1 L", 120, "Soft, gentle and naturally sweet.", "#A8B94A", "#E4EBA6"),
  j("peach", "Peach", "Orchard", "1 L", 125, "Ripe peach with a velvety finish.", "#F2994A", "#FFD1A1"),
  j("pomegranate", "Pomegranate", "Orchard", "1 L", 165, "Ruby-red, rich and slightly tart.", "#A4122D", "#E5566D"),
  j("black-grape", "Black Grape", "Orchard", "1 L", 130, "Deep, full-bodied grape flavour.", "#4B1A5E", "#9B59B6"),
  j("white-grape", "White Grape", "Orchard", "1 L", 130, "Light, sweet and clear.", "#B7C95A", "#EAF2B0"),
  j("cranberry", "Cranberry", "Orchard", "1 L", 175, "Tart red berries with a clean bite.", "#9E1B32", "#E2536B"),

  // Berry (4)
  j("strawberry", "Strawberry", "Berry", "1 L", 150, "Sweet summer strawberries.", "#D81E3E", "#FF7A8A"),
  j("blueberry", "Blueberry", "Berry", "500 ml", 120, "Dark, antioxidant-rich blueberry.", "#2F3C8F", "#7C8CE0"),
  j("mixed-berry", "Mixed Berry", "Berry", "1 L", 165, "Strawberry, blueberry and raspberry.", "#8B1A5E", "#E0568F"),
  j("blackcurrant", "Blackcurrant", "Berry", "1 L", 155, "Intense, tangy and aromatic.", "#3A1257", "#8E44AD"),

  // Green & Wellness (6)
  j("watermelon", "Watermelon", "Green & Wellness", "1 L", 95, "Cooling and super hydrating.", "#E0314B", "#9BD36A"),
  j("kiwi", "Kiwi", "Green & Wellness", "500 ml", 90, "Vivid green with a zingy edge.", "#6BA81F", "#C5E36B"),
  j("aloe-vera", "Aloe Vera", "Green & Wellness", "500 ml", 60, "Light aloe drink with real pulp.", "#7BC89B", "#D8F3E2"),
  j("amla", "Amla", "Green & Wellness", "500 ml", 70, "Indian gooseberry, rich in vitamin C.", "#6F9A3A", "#BFD98A"),
  j("carrot", "Carrot", "Green & Wellness", "1 L", 90, "Fresh-pressed, naturally sweet.", "#E8731A", "#FFB066"),
  j("beetroot", "Beetroot", "Green & Wellness", "500 ml", 75, "Earthy, vibrant and energising.", "#8B1038", "#D6456F"),

  // Blends (2)
  j("mixed-fruit", "Mixed Fruit", "Blends", "1 L", 115, "Apple, orange, mango and pineapple.", "#9B1D4F", "#FF7A59"),
  j("tropical-blend", "Tropical Blend", "Blends", "1 L", 125, "Mango, pineapple, guava and passion fruit.", "#F28C1A", "#F7D154"),
];

if (typeof process !== "undefined" && process.env && process.env.NODE_ENV !== "production" && JUICES.length !== 31) {
  // eslint-disable-next-line no-console
  console.warn(`Expected 31 juices, found ${JUICES.length}`);
}