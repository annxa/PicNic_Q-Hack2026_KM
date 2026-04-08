import { Persona, CartItem, PantryItem, OrderHistoryEntry } from "@/types";
import { products } from "./products";

const p = (id: string) => products.find((x) => x.id === id)!;

// ─── Persona 1: Familie Schmidt ──────────────────────────────────────────────

const schmidtPantry: PantryItem[] = [
  { product: p("p001"), quantity: 0.5, unit: "l", daysRemaining: 1, consumptionRate: 0.5, lastRestocked: "2026-04-05" },
  { product: p("p003"), quantity: 4, unit: "Stk.", daysRemaining: 2, consumptionRate: 2, lastRestocked: "2026-04-03" },
  { product: p("p009"), quantity: 0.3, unit: "kg", daysRemaining: 1, consumptionRate: 0.25, lastRestocked: "2026-04-04" },
  { product: p("p023"), quantity: 1, unit: "Pck.", daysRemaining: 7, consumptionRate: 0.14, lastRestocked: "2026-04-01" },
  { product: p("p018"), quantity: 0.8, unit: "kg", daysRemaining: 8, consumptionRate: 0.1, lastRestocked: "2026-04-01" },
  { product: p("p030"), quantity: 0.4, unit: "l", daysRemaining: 12, consumptionRate: 0.033, lastRestocked: "2026-03-25" },
  { product: p("p043"), quantity: 5, unit: "WL", daysRemaining: 5, consumptionRate: 1, lastRestocked: "2026-03-28" },
  { product: p("p045"), quantity: 2, unit: "Rollen", daysRemaining: 2, consumptionRate: 1, lastRestocked: "2026-04-02" },
  { product: p("p033"), quantity: 0.2, unit: "kg", daysRemaining: 3, consumptionRate: 0.067, lastRestocked: "2026-04-01" },
];

const schmidtCart: CartItem[] = [
  { product: p("p001"), quantity: 3, addedReason: "Ihr kauft jede Woche 3× Milch" },
  { product: p("p003"), quantity: 2, addedReason: "Eier fast leer – nachgefüllt!" },
  { product: p("p009"), quantity: 1, addedReason: "Vollkornbrot ist fast alle" },
  { product: p("p013"), quantity: 2, addedReason: "Äpfel aus der Region – diese Woche super frisch" },
  { product: p("p020"), quantity: 1, addedReason: "Hähnchen: letzten Dienstag auch bestellt" },
  { product: p("p023"), quantity: 2, addedReason: "Pasta-Vorrat auffüllen" },
  { product: p("p015"), quantity: 2, addedReason: "Tomaten für Pasta-Sauce" },
  { product: p("p034"), quantity: 2, addedReason: "Haribo – die Kinder werden es lieben 😄" },
  { product: p("p037"), quantity: 1, addedReason: "Spinat: schnelle Beilage unter der Woche" },
  { product: p("p045"), quantity: 1, addedReason: "Klopapier bald leer!" },
  { product: p("p043"), quantity: 1, addedReason: "Waschmittel fast alle" },
  { product: p("p041"), quantity: 2, addedReason: "OJ zum Frühstück" },
];

const schmidtHistory: OrderHistoryEntry[] = [
  {
    id: "ord001",
    date: "2026-04-01",
    items: [
      { productId: "p001", quantity: 3 }, { productId: "p003", quantity: 1 },
      { productId: "p009", quantity: 1 }, { productId: "p020", quantity: 1 },
      { productId: "p023", quantity: 2 }, { productId: "p015", quantity: 2 },
      { productId: "p034", quantity: 1 }, { productId: "p041", quantity: 2 },
    ],
    total: 34.28, co2Saved: 1.2,
  },
  {
    id: "ord002",
    date: "2026-03-25",
    items: [
      { productId: "p001", quantity: 2 }, { productId: "p003", quantity: 2 },
      { productId: "p020", quantity: 1 }, { productId: "p021", quantity: 1 },
      { productId: "p023", quantity: 1 }, { productId: "p037", quantity: 1 },
      { productId: "p030", quantity: 1 }, { productId: "p018", quantity: 1 },
    ],
    total: 28.91, co2Saved: 0.9,
  },
  {
    id: "ord003",
    date: "2026-03-18",
    items: [
      { productId: "p001", quantity: 3 }, { productId: "p007", quantity: 1 },
      { productId: "p009", quantity: 1 }, { productId: "p013", quantity: 1 },
      { productId: "p023", quantity: 2 }, { productId: "p043", quantity: 1 },
      { productId: "p045", quantity: 1 },
    ],
    total: 31.50, co2Saved: 1.1,
  },
  {
    id: "ord004",
    date: "2026-03-11",
    items: [
      { productId: "p001", quantity: 3 }, { productId: "p020", quantity: 2 },
      { productId: "p024", quantity: 2 }, { productId: "p028", quantity: 2 },
      { productId: "p037", quantity: 1 }, { productId: "p045", quantity: 1 },
    ],
    total: 29.74, co2Saved: 0.8,
  },
];

// ─── Persona 2: Lena (Young Professional) ────────────────────────────────────

const lenaPantry: PantryItem[] = [
  { product: p("p002"), quantity: 0.3, unit: "l", daysRemaining: 1, consumptionRate: 0.3, lastRestocked: "2026-04-05" },
  { product: p("p005"), quantity: 0.2, unit: "kg", daysRemaining: 2, consumptionRate: 0.1, lastRestocked: "2026-04-04" },
  { product: p("p036"), quantity: 1, unit: "Stk.", daysRemaining: 3, consumptionRate: 0.33, lastRestocked: "2026-04-03" },
  { product: p("p040"), quantity: 1, unit: "Flasche", daysRemaining: 3, consumptionRate: 0.33, lastRestocked: "2026-04-02" },
  { product: p("p019"), quantity: 1, unit: "Stk.", daysRemaining: 2, consumptionRate: 0.5, lastRestocked: "2026-04-05" },
  { product: p("p030"), quantity: 0.6, unit: "l", daysRemaining: 18, consumptionRate: 0.033, lastRestocked: "2026-03-20" },
];

const lenaCart: CartItem[] = [
  { product: p("p002"), quantity: 2, addedReason: "Du kaufst Haferdrink jede Woche" },
  { product: p("p004"), quantity: 1, addedReason: "Griechischer Joghurt – dein Frühstücks-Fave" },
  { product: p("p019"), quantity: 2, addedReason: "Avocado-Toast? Ja bitte!" },
  { product: p("p010"), quantity: 1, addedReason: "Toastbrot fast leer" },
  { product: p("p038"), quantity: 2, addedReason: "Schnelles Abendessen unter der Woche" },
  { product: p("p036"), quantity: 3, addedReason: "Dein Mittags-Snack am Schreibtisch" },
  { product: p("p027"), quantity: 1, addedReason: "Quinoa Bowl – gesund & schnell" },
  { product: p("p041"), quantity: 1, addedReason: "OJ für deinen Morgen" },
  { product: p("p046"), quantity: 1, addedReason: "Duschgel fast alle" },
  { product: p("p040"), quantity: 3, addedReason: "Wasser für die Woche" },
];

const lenaHistory: OrderHistoryEntry[] = [
  {
    id: "ord005",
    date: "2026-04-01",
    items: [
      { productId: "p002", quantity: 2 }, { productId: "p004", quantity: 1 },
      { productId: "p019", quantity: 2 }, { productId: "p038", quantity: 2 },
      { productId: "p036", quantity: 2 }, { productId: "p040", quantity: 3 },
    ],
    total: 24.61, co2Saved: 0.7,
  },
  {
    id: "ord006",
    date: "2026-03-25",
    items: [
      { productId: "p002", quantity: 1 }, { productId: "p005", quantity: 1 },
      { productId: "p035", quantity: 1 }, { productId: "p038", quantity: 1 },
      { productId: "p040", quantity: 2 }, { productId: "p046", quantity: 1 },
    ],
    total: 18.34, co2Saved: 0.5,
  },
  {
    id: "ord007",
    date: "2026-03-18",
    items: [
      { productId: "p002", quantity: 2 }, { productId: "p027", quantity: 1 },
      { productId: "p019", quantity: 1 }, { productId: "p036", quantity: 2 },
      { productId: "p041", quantity: 1 },
    ],
    total: 20.25, co2Saved: 0.6,
  },
  {
    id: "ord008",
    date: "2026-03-11",
    items: [
      { productId: "p002", quantity: 2 }, { productId: "p004", quantity: 1 },
      { productId: "p038", quantity: 3 }, { productId: "p040", quantity: 2 },
    ],
    total: 19.88, co2Saved: 0.4,
  },
];

// ─── Persona 3: WG Stuttgart ──────────────────────────────────────────────────

const wgPantry: PantryItem[] = [
  { product: p("p002"), quantity: 0.4, unit: "l", daysRemaining: 1, consumptionRate: 0.4, lastRestocked: "2026-04-05" },
  { product: p("p026"), quantity: 0.5, unit: "Dose", daysRemaining: 2, consumptionRate: 0.25, lastRestocked: "2026-04-04" },
  { product: p("p023"), quantity: 0.5, unit: "Pck.", daysRemaining: 3, consumptionRate: 0.17, lastRestocked: "2026-04-03" },
  { product: p("p028"), quantity: 1, unit: "Dose", daysRemaining: 5, consumptionRate: 0.2, lastRestocked: "2026-04-02" },
  { product: p("p018"), quantity: 0.3, unit: "kg", daysRemaining: 3, consumptionRate: 0.1, lastRestocked: "2026-04-02" },
  { product: p("p030"), quantity: 0.5, unit: "l", daysRemaining: 15, consumptionRate: 0.033, lastRestocked: "2026-03-24" },
  { product: p("p044"), quantity: 0.3, unit: "l", daysRemaining: 3, consumptionRate: 0.1, lastRestocked: "2026-04-01" },
];

const wgCart: CartItem[] = [
  { product: p("p002"), quantity: 3, addedReason: "WG-Haferdrink – Vorrat aufstocken" },
  { product: p("p026"), quantity: 2, addedReason: "Kichererbsen für Curry & Hummus" },
  { product: p("p014"), quantity: 2, addedReason: "Bio-Karotten vom Hof um die Ecke" },
  { product: p("p017"), quantity: 1, addedReason: "Brokkoli für die Meal-Prep Sonntag" },
  { product: p("p023"), quantity: 2, addedReason: "Pasta-Vorrat für die Woche" },
  { product: p("p028"), quantity: 3, addedReason: "Tomaten für Soße" },
  { product: p("p027"), quantity: 1, addedReason: "Quinoa: neues WG-Liebling" },
  { product: p("p008"), quantity: 2, addedReason: "Mozzarella für den Freitags-Salat" },
  { product: p("p037"), quantity: 2, addedReason: "Spinat: WG-Frühstück" },
  { product: p("p005"), quantity: 2, addedReason: "Joghurt für alle" },
  { product: p("p044"), quantity: 1, addedReason: "Spülmittel fast alle" },
  { product: p("p040"), quantity: 6, addedReason: "Wasser für die WG" },
];

const wgHistory: OrderHistoryEntry[] = [
  {
    id: "ord009",
    date: "2026-04-01",
    items: [
      { productId: "p002", quantity: 3 }, { productId: "p026", quantity: 2 },
      { productId: "p023", quantity: 2 }, { productId: "p028", quantity: 3 },
      { productId: "p017", quantity: 1 }, { productId: "p014", quantity: 2 },
      { productId: "p040", quantity: 6 },
    ],
    total: 26.42, co2Saved: 1.4,
  },
  {
    id: "ord010",
    date: "2026-03-25",
    items: [
      { productId: "p002", quantity: 2 }, { productId: "p026", quantity: 1 },
      { productId: "p027", quantity: 1 }, { productId: "p037", quantity: 2 },
      { productId: "p008", quantity: 2 }, { productId: "p005", quantity: 2 },
    ],
    total: 22.13, co2Saved: 1.1,
  },
  {
    id: "ord011",
    date: "2026-03-18",
    items: [
      { productId: "p002", quantity: 3 }, { productId: "p023", quantity: 3 },
      { productId: "p014", quantity: 1 }, { productId: "p016", quantity: 2 },
      { productId: "p028", quantity: 2 }, { productId: "p044", quantity: 1 },
    ],
    total: 24.78, co2Saved: 1.2,
  },
  {
    id: "ord012",
    date: "2026-03-11",
    items: [
      { productId: "p002", quantity: 2 }, { productId: "p026", quantity: 2 },
      { productId: "p027", quantity: 1 }, { productId: "p037", quantity: 1 },
      { productId: "p040", quantity: 4 }, { productId: "p044", quantity: 1 },
    ],
    total: 21.55, co2Saved: 1.3,
  },
];

// ─── Personas Export ──────────────────────────────────────────────────────────

export const personas: Persona[] = [
  {
    id: "schmidt",
    name: "Familie Schmidt",
    avatar: "👨‍👩‍👧‍👦",
    tagline: "4 Personen · 2 Kinder · ~180 €/Woche",
    description: "Frisch kochen mit der Familie, gerne regional & saisonal. Die Kinder lieben Pasta und Haribo.",
    household: { size: 4, weeklyBudget: 180, dietStyle: "omnivor", restrictions: [], hasKids: true, kidsCount: 2 },
    defaultRestrictions: [],
    pantry: schmidtPantry,
    orderHistory: schmidtHistory,
    defaultCart: schmidtCart,
    co2SavedTotal: 42.3,
    co2SavedThisWeek: 1.2,
    co2MonthlyGoal: 5.0,
    co2SavedThisMonth: 3.1,
    deliverySlot: "Mi 17–18 Uhr",
    preferredCategories: ["Fleisch & Fisch", "Obst & Gemüse", "Pasta & Reis", "Milch & Eier"],
    color: "#E1141C",
  },
  {
    id: "lena",
    name: "Lena",
    avatar: "👩‍💻",
    tagline: "1 Person · Young Professional · ~55 €/Woche",
    description: "Wenig Zeit, viel Ambition. Convenience trifft Gesundheitsbewusstsein – schnell, lecker, kein Stress.",
    household: { size: 1, weeklyBudget: 55, dietStyle: "flexitarisch", restrictions: [], hasKids: false },
    defaultRestrictions: ["laktose"],
    pantry: lenaPantry,
    orderHistory: lenaHistory,
    defaultCart: lenaCart,
    co2SavedTotal: 18.7,
    co2SavedThisWeek: 0.7,
    co2MonthlyGoal: 3.0,
    co2SavedThisMonth: 1.8,
    deliverySlot: "Do 19–20 Uhr",
    preferredCategories: ["Tiefkühl", "Snacks", "Milch & Eier", "Frühstück"],
    color: "#7C3AED",
  },
  {
    id: "wg",
    name: "WG Stuttgart",
    avatar: "🏠",
    tagline: "3 Personen · Vegetarisch · ~120 €/Woche",
    description: "Budgetbewusst & grün. Meal Prep Sonntag ist heilig, Hülsenfrüchte die beste Freunde.",
    household: { size: 3, weeklyBudget: 120, dietStyle: "vegetarisch", restrictions: ["fisch"], hasKids: false },
    defaultRestrictions: ["vegetarisch"],
    pantry: wgPantry,
    orderHistory: wgHistory,
    defaultCart: wgCart,
    co2SavedTotal: 61.4,
    co2SavedThisWeek: 1.4,
    co2MonthlyGoal: 6.0,
    co2SavedThisMonth: 4.7,
    deliverySlot: "Fr 16–17 Uhr",
    preferredCategories: ["Obst & Gemüse", "Pasta & Reis", "Milch & Eier", "Haushalt"],
    color: "#059669",
  },
];

export const getPersonaById = (id: string) => personas.find((p) => p.id === id);
