// SAMPLE catalogue — replace names, prices and images with your real products.
// Search and the cart both read from this list (or from the `products` prop you pass to <Navbar />).
export const CURRENCY = "AED"; // change to your currency code / symbol

export const formatPrice = (n) => `${CURRENCY} ${Number(n).toFixed(2)}`;

export const PRODUCTS = [
  { id: "ajwa-premium", name: "Ajwa Dates – Premium Box", category: "Dates", slug: "ajwa-premium", price: 85, weight: "500 g", image: null },
  { id: "medjool-jumbo", name: "Medjool Dates – Jumbo", category: "Dates", slug: "medjool-jumbo", price: 70, weight: "500 g", image: null },
  { id: "safawi-classic", name: "Safawi Dates – Classic", category: "Dates", slug: "safawi-classic", price: 45, weight: "500 g", image: null },
  { id: "stuffed-almond", name: "Almond Stuffed Dates", category: "Dates", slug: "almond-stuffed-dates", price: 60, weight: "350 g", image: null },
  { id: "pistachio-roasted", name: "Roasted Pistachios", category: "Nuts & Dry Fruits", slug: "roasted-pistachios", price: 55, weight: "400 g", image: null },
  { id: "cashew-w320", name: "Cashews W320", category: "Nuts & Dry Fruits", slug: "cashews-w320", price: 48, weight: "500 g", image: null },
  { id: "almonds-raw", name: "Premium Almonds", category: "Nuts & Dry Fruits", slug: "premium-almonds", price: 42, weight: "500 g", image: null },
  { id: "choc-dates", name: "Chocolate Covered Dates", category: "Chocolates", slug: "chocolate-covered-dates", price: 65, weight: "300 g", image: null },
  { id: "choc-assorted", name: "Assorted Chocolate Box", category: "Chocolates", slug: "assorted-chocolate-box", price: 90, weight: "400 g", image: null },
  { id: "hamper-royal", name: "The Royal Gift Hamper", category: "Gift Hampers", slug: "royal-gift-hamper", price: 250, weight: "Gift box", image: null },
  { id: "hamper-wedding", name: "Wedding Celebration Hamper", category: "Gift Hampers", slug: "wedding-celebration-hamper", price: 320, weight: "Gift box", image: null },
  { id: "drink-orange", name: "Fresh Orange Juice", category: "Drinks & Beverages", slug: "fresh-orange-juice", price: 6, weight: "330 ml", image: null },
  { id: "drink-mango", name: "Mango Juice", category: "Drinks & Beverages", slug: "mango-juice", price: 6, weight: "330 ml", image: null },
  { id: "drink-energy", name: "AL-NASR Energy Drink", category: "Drinks & Beverages", slug: "al-nasr-energy-drink", price: 8, weight: "250 ml", image: null },
  { id: "drink-sparkling", name: "Sparkling Lime & Mint", category: "Drinks & Beverages", slug: "sparkling-lime-mint", price: 9, weight: "500 ml", image: null },
  { id: "drink-premium", name: "Premium Reserve Bottle", category: "Drinks & Beverages", slug: "premium-reserve-bottle", price: 28, weight: "750 ml", image: null },
];