import type { Product, CO2Score, StockStatus, LocalityTag } from "@/types";

export interface DbArticle {
  id: string;
  name: string;
  sku: string;
  category: string;
  nutriscore: string | null;
  carbon_footprint: number | null;
  is_biological: number;
  is_available: number;
  price: number;
  allergy_labels: string | null;
}

export const SKU_EMOJI: Record<string, string> = {
  "DAI-MLK-001": "🥛", "DAI-BUT-001": "🧈", "DAI-EGG-001": "🥚",
  "DAI-CHE-001": "🧀", "DAI-CRE-001": "🥛", "DAI-MOZ-001": "🫕",
  "DAI-YOG-001": "🫙",
  "BAK-BRD-001": "🍞", "BAK-CRO-001": "🥐", "BAK-OAT-001": "🌾",
  "BAK-BGL-001": "🥯",
  "VEG-BRC-001": "🥦", "VEG-TOM-001": "🍅", "VEG-LET-001": "🥬",
  "VEG-CUC-001": "🥒", "VEG-CAR-001": "🥕", "VEG-AVK-001": "🥑",
  "VEG-SPI-001": "🥬", "VEG-ONI-001": "🧅", "VEG-POT-001": "🥔",
  "VEG-PEP-001": "🫑",
  "MEA-CHK-001": "🍗", "MEA-GBF-001": "🥩", "MEA-TUR-001": "🍗",
  "SEA-SAL-001": "🐟", "SEA-COD-001": "🐡",
  "DRK-OJC-001": "🍊", "DRK-WAT-001": "💧", "DRK-COF-001": "☕",
  "DRK-APJ-001": "🍎", "DRK-TEA-001": "🍵",
  "PAN-PAS-001": "🍝", "PAN-RIC-001": "🍚", "PAN-OLV-001": "🫒",
  "PAN-TOM-001": "🥫", "PAN-CHI-001": "🫘", "PAN-OAT-001": "🌾",
  "SNK-CHO-001": "🍫", "SNK-CHI-001": "🥨", "SNK-NUT-001": "🥜",
  "SNK-GRB-001": "🍫",
  "FRZ-PZA-001": "🍕", "FRZ-VEG-001": "❄️",
};

export const SKU_UNIT: Record<string, string> = {
  "DAI-MLK-001": "1 l",    "DAI-BUT-001": "250 g",  "DAI-EGG-001": "10 Stk.",
  "DAI-CHE-001": "400 g",  "DAI-CRE-001": "200 g",  "DAI-MOZ-001": "125 g",
  "DAI-YOG-001": "500 g",
  "BAK-BRD-001": "500 g",  "BAK-CRO-001": "4 Stk.", "BAK-OAT-001": "500 g",
  "BAK-BGL-001": "4 Stk.",
  "VEG-BRC-001": "500 g",  "VEG-TOM-001": "1 kg",   "VEG-LET-001": "1 Stk.",
  "VEG-CUC-001": "1 Stk.", "VEG-CAR-001": "1 kg",   "VEG-AVK-001": "1 Stk.",
  "VEG-SPI-001": "300 g",  "VEG-ONI-001": "1 kg",   "VEG-POT-001": "2 kg",
  "VEG-PEP-001": "1 Stk.",
  "MEA-CHK-001": "500 g",  "MEA-GBF-001": "400 g",  "MEA-TUR-001": "400 g",
  "SEA-SAL-001": "300 g",  "SEA-COD-001": "300 g",
  "DRK-OJC-001": "1 l",    "DRK-WAT-001": "1.5 l",  "DRK-COF-001": "500 g",
  "DRK-APJ-001": "1 l",    "DRK-TEA-001": "20 Btl.",
  "PAN-PAS-001": "500 g",  "PAN-RIC-001": "1 kg",   "PAN-OLV-001": "500 ml",
  "PAN-TOM-001": "400 g",  "PAN-CHI-001": "400 g",  "PAN-OAT-001": "500 g",
  "SNK-CHO-001": "100 g",  "SNK-CHI-001": "150 g",  "SNK-NUT-001": "200 g",
  "SNK-GRB-001": "6 Stk.",
  "FRZ-PZA-001": "350 g",  "FRZ-VEG-001": "750 g",
};

export const SKU_BRAND: Record<string, string> = {
  "DAI-MLK-001": "Milbona",    "DAI-BUT-001": "Kerrygold",   "DAI-EGG-001": "Gutfleisch",
  "DAI-CHE-001": "Leerdammer", "DAI-CRE-001": "Crème Fresh", "DAI-MOZ-001": "Galbani",
  "DAI-YOG-001": "Müller",
  "BAK-BRD-001": "Harry",      "BAK-CRO-001": "LU",          "BAK-OAT-001": "Harvest",
  "BAK-BGL-001": "Harry",
  "VEG-BRC-001": "AH",         "VEG-TOM-001": "AH",          "VEG-LET-001": "AH",
  "VEG-CUC-001": "AH",         "VEG-CAR-001": "AH",          "VEG-AVK-001": "AH",
  "VEG-SPI-001": "AH",         "VEG-ONI-001": "AH",          "VEG-POT-001": "AH",
  "VEG-PEP-001": "AH",
  "MEA-CHK-001": "Gutfleisch", "MEA-GBF-001": "Gutfleisch",  "MEA-TUR-001": "Gutfleisch",
  "SEA-SAL-001": "Fjord",      "SEA-COD-001": "Fjord",
  "DRK-OJC-001": "Innocent",   "DRK-WAT-001": "Volvic",      "DRK-COF-001": "Jacobs",
  "DRK-APJ-001": "Innocent",   "DRK-TEA-001": "Lipton",
  "PAN-PAS-001": "Barilla",    "PAN-RIC-001": "Uncle Ben's", "PAN-OLV-001": "Bertolli",
  "PAN-TOM-001": "AH",         "PAN-CHI-001": "AH",          "PAN-OAT-001": "Quaker",
  "SNK-CHO-001": "Lindt",      "SNK-CHI-001": "Lay's",       "SNK-NUT-001": "Seeberger",
  "SNK-GRB-001": "Nature Valley",
  "FRZ-PZA-001": "Dr. Oetker", "FRZ-VEG-001": "iglo",
};

export const CATEGORY_MAP: Record<string, string> = {
  Dairy:      "Milch & Eier",
  Bakery:     "Brot & Backwaren",
  Vegetables: "Obst & Gemüse",
  Meat:       "Fleisch & Fisch",
  Seafood:    "Fisch & Meeresfrüchte",
  Drinks:     "Getränke",
  Pantry:     "Vorratskammer",
  Snacks:     "Snacks & Süßes",
  Frozen:     "Tiefkühl",
};

export const CATEGORY_EMOJI: Record<string, string> = {
  Dairy:      "🥛",
  Bakery:     "🍞",
  Vegetables: "🥦",
  Meat:       "🍗",
  Seafood:    "🐟",
  Drinks:     "🥤",
  Pantry:     "🫙",
  Snacks:     "🍫",
  Frozen:     "❄️",
};

export const CATEGORY_TAGS: Record<string, string[]> = {
  Dairy:      ["frisch", "täglich"],
  Bakery:     ["frühstück", "täglich"],
  Vegetables: ["gemüse", "frisch"],
  Meat:       ["protein", "kochen"],
  Seafood:    ["protein", "frisch"],
  Drinks:     ["getränk"],
  Pantry:     ["vorrat", "haltbar"],
  Snacks:     ["snack", "süß"],
  Frozen:     ["tiefkühl", "praktisch"],
};

export function articleToProduct(a: DbArticle): Product {
  let tags: string[] = CATEGORY_TAGS[a.category] ?? [];
  try {
    if (a.allergy_labels) {
      tags = [...tags, ...JSON.parse(a.allergy_labels)];
    }
  } catch {}
  if (a.is_biological && !tags.includes("bio")) tags = [...tags, "bio"];

  return {
    id: a.id,
    name: a.name,
    brand: SKU_BRAND[a.sku] ?? "",
    category: CATEGORY_MAP[a.category] ?? a.category,
    price: a.price,
    unit: SKU_UNIT[a.sku] ?? "",
    emoji: SKU_EMOJI[a.sku] ?? CATEGORY_EMOJI[a.category] ?? "🛒",
    co2Score: (a.nutriscore as CO2Score) ?? "C",
    co2Kg: a.carbon_footprint ?? 0,
    stockStatus: (a.is_available ? "verfügbar" : "ausverkauft") as StockStatus,
    locality: (a.is_biological ? "lokal" : "regional") as LocalityTag,
    tags,
  };
}
