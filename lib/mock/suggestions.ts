import { MealSuggestion, Bundle } from "@/types";
import { products } from "./products";

const p = (id: string) => products.find((x) => x.id === id)!;

// ─── Meal Suggestions per persona ────────────────────────────────────────────

export const mealSuggestions: Record<string, MealSuggestion[]> = {
  schmidt: [
    {
      id: "meal1",
      name: "Shakshuka",
      emoji: "🍳",
      reason: "Du isst oft Pasta – probier mal was Nordafrikanisches!",
      ingredients: [p("p028"), p("p003"), p("p016"), p("p018")],
      totalPrice: 5.36,
      co2Score: "A",
    },
    {
      id: "meal2",
      name: "Hähnchen-Curry",
      emoji: "🍛",
      reason: "Wie letztes Mal – aber mit mehr Gemüse für die Kinder",
      ingredients: [p("p020"), p("p026"), p("p028"), p("p025")],
      totalPrice: 10.17,
      co2Score: "B",
    },
    {
      id: "meal3",
      name: "Brokkoli-Pasta",
      emoji: "🥦",
      reason: "Schnell, gesund, die Kinder kennen es schon",
      ingredients: [p("p023"), p("p017"), p("p008")],
      totalPrice: 4.57,
      co2Score: "A",
    },
  ],
  lena: [
    {
      id: "meal4",
      name: "Avocado-Toast Deluxe",
      emoji: "🥑",
      reason: "Dein Instagram-würdiges Frühstück – du liebst Avocados!",
      ingredients: [p("p010"), p("p019"), p("p003")],
      totalPrice: 5.87,
      co2Score: "B",
    },
    {
      id: "meal5",
      name: "Quinoa Power Bowl",
      emoji: "🥣",
      reason: "Meal Prep in 20 min – perfekt für deine Mittagspausen",
      ingredients: [p("p027"), p("p017"), p("p015"), p("p019")],
      totalPrice: 10.76,
      co2Score: "A",
    },
    {
      id: "meal6",
      name: "Lachs mit Spinat",
      emoji: "🐟",
      reason: "Mal was anderes als Pizza – in 15 min fertig",
      ingredients: [p("p022"), p("p037"), p("p005")],
      totalPrice: 12.77,
      co2Score: "B",
    },
  ],
  wg: [
    {
      id: "meal7",
      name: "Veganes Dal",
      emoji: "🫘",
      reason: "Euer WG-Budget dankt – Hülsenfrüchte satt!",
      ingredients: [p("p026"), p("p028"), p("p018"), p("p025")],
      totalPrice: 6.26,
      co2Score: "A",
    },
    {
      id: "meal8",
      name: "Gemüse-Stir Fry",
      emoji: "🥬",
      reason: "Schnell & günstig – Meal Prep für 3 Tage",
      ingredients: [p("p017"), p("p016"), p("p014"), p("p025")],
      totalPrice: 8.06,
      co2Score: "A",
    },
    {
      id: "meal9",
      name: "Caprese-Salat",
      emoji: "🍅",
      reason: "Frisch, schnell, günstig – perfekt für Freitagabend",
      ingredients: [p("p015"), p("p008"), p("p030")],
      totalPrice: 10.27,
      co2Score: "A",
    },
  ],
};

// ─── Bundles per persona ──────────────────────────────────────────────────────

export const bundles: Record<string, Bundle[]> = {
  schmidt: [
    {
      id: "b1",
      name: "Frühstück Basics",
      description: "Alles für den Familienfrühstückstisch",
      items: [
        { product: p("p001"), quantity: 2 },
        { product: p("p003"), quantity: 1 },
        { product: p("p009"), quantity: 1 },
        { product: p("p033"), quantity: 1 },
        { product: p("p041"), quantity: 1 },
      ],
      totalPrice: 13.35,
      savings: 1.20,
      category: "reorder",
    },
    {
      id: "b2",
      name: "Pasta Klassiker",
      description: "Spaghetti Bolognese für die ganze Familie",
      items: [
        { product: p("p023"), quantity: 2 },
        { product: p("p021"), quantity: 1 },
        { product: p("p028"), quantity: 2 },
        { product: p("p018"), quantity: 1 },
      ],
      totalPrice: 12.74,
      savings: 0.80,
      category: "reorder",
    },
    {
      id: "b3",
      name: "Hygieneartikel auffrischen",
      description: "Klopapier & Waschmittel auf Vorrat",
      items: [
        { product: p("p045"), quantity: 1 },
        { product: p("p043"), quantity: 1 },
        { product: p("p044"), quantity: 1 },
      ],
      totalPrice: 17.27,
      category: "topup",
    },
    {
      id: "b4",
      name: "Regionale Gemüsebox",
      description: "Diese Woche besonders frisch aus der Region",
      items: [
        { product: p("p013"), quantity: 1 },
        { product: p("p014"), quantity: 1 },
        { product: p("p017"), quantity: 1 },
        { product: p("p015"), quantity: 1 },
      ],
      totalPrice: 7.16,
      savings: 0.60,
      category: "topup",
    },
  ],
  lena: [
    {
      id: "b5",
      name: "Convenience Week",
      description: "Schnell & lecker für Bürotage",
      items: [
        { product: p("p038"), quantity: 2 },
        { product: p("p036"), quantity: 3 },
        { product: p("p040"), quantity: 3 },
      ],
      totalPrice: 16.82,
      savings: 1.00,
      category: "reorder",
    },
    {
      id: "b6",
      name: "Gesunder Start",
      description: "Dein pflanzliches Frühstück",
      items: [
        { product: p("p002"), quantity: 2 },
        { product: p("p004"), quantity: 1 },
        { product: p("p019"), quantity: 2 },
        { product: p("p010"), quantity: 1 },
      ],
      totalPrice: 12.35,
      savings: 0.90,
      category: "reorder",
    },
    {
      id: "b7",
      name: "Pflege auffrischen",
      description: "Dusche & Co.",
      items: [
        { product: p("p046"), quantity: 1 },
        { product: p("p044"), quantity: 1 },
      ],
      totalPrice: 4.78,
      category: "topup",
    },
  ],
  wg: [
    {
      id: "b8",
      name: "Vegane Wochenbasis",
      description: "Für eure 3-Personen Meal Preps",
      items: [
        { product: p("p002"), quantity: 3 },
        { product: p("p023"), quantity: 2 },
        { product: p("p026"), quantity: 2 },
        { product: p("p028"), quantity: 2 },
      ],
      totalPrice: 14.71,
      savings: 1.50,
      category: "reorder",
    },
    {
      id: "b9",
      name: "Frischer Gemüsekorb",
      description: "Hässliche Gemüsebox – trotzdem lecker!",
      items: [
        { product: p("p014"), quantity: 1 },
        { product: p("p017"), quantity: 1 },
        { product: p("p016"), quantity: 1 },
        { product: p("p015"), quantity: 1 },
      ],
      totalPrice: 7.56,
      savings: 1.20,
      category: "topup",
    },
    {
      id: "b10",
      name: "WG-Haushalt",
      description: "Spülen & sauber halten",
      items: [
        { product: p("p044"), quantity: 2 },
        { product: p("p045"), quantity: 1 },
      ],
      totalPrice: 10.57,
      category: "topup",
    },
  ],
};

// ─── Popular products (social proof) ─────────────────────────────────────────

export const popularProducts: Record<string, { product: ReturnType<typeof p>; percentage: number }[]> = {
  schmidt: [
    { product: p("p001"), percentage: 94 },
    { product: p("p003"), percentage: 87 },
    { product: p("p023"), percentage: 82 },
    { product: p("p034"), percentage: 78 },
    { product: p("p013"), percentage: 75 },
    { product: p("p037"), percentage: 71 },
  ],
  lena: [
    { product: p("p002"), percentage: 91 },
    { product: p("p036"), percentage: 84 },
    { product: p("p038"), percentage: 79 },
    { product: p("p019"), percentage: 76 },
    { product: p("p040"), percentage: 88 },
  ],
  wg: [
    { product: p("p002"), percentage: 89 },
    { product: p("p026"), percentage: 83 },
    { product: p("p028"), percentage: 86 },
    { product: p("p044"), percentage: 72 },
    { product: p("p027"), percentage: 68 },
    { product: p("p040"), percentage: 91 },
  ],
};
