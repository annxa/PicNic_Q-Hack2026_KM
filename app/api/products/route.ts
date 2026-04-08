import { NextResponse } from "next/server";
import db from "@/lib/db";
import type { Product, CO2Score, StockStatus, LocalityTag } from "@/types";

// ── Lookup tables for fields not stored in DB ─────────────────────────────────

const SKU_EMOJI: Record<string, string> = {
  "DAI-MLK-001": "🥛",
  "DAI-BUT-001": "🧈",
  "DAI-EGG-001": "🥚",
  "BAK-BRD-001": "🍞",
  "VEG-BRC-001": "🥦",
  "VEG-TOM-001": "🍅",
  "MEA-CHK-001": "🍗",
  "DRK-OJC-001": "🍊",
  "VEG-LET-001": "🥬",
  "DAI-YOG-001": "🫙",
};

const SKU_UNIT: Record<string, string> = {
  "DAI-MLK-001": "1 l",
  "DAI-BUT-001": "250 g",
  "DAI-EGG-001": "10 Stk.",
  "BAK-BRD-001": "500 g",
  "VEG-BRC-001": "500 g",
  "VEG-TOM-001": "1 kg",
  "MEA-CHK-001": "500 g",
  "DRK-OJC-001": "1 l",
  "VEG-LET-001": "1 Stk.",
  "DAI-YOG-001": "500 g",
};

const SKU_BRAND: Record<string, string> = {
  "DAI-MLK-001": "Milbona",
  "DAI-BUT-001": "Kerrygold",
  "DAI-EGG-001": "Gutfleisch",
  "BAK-BRD-001": "Harry",
  "VEG-BRC-001": "AH",
  "VEG-TOM-001": "AH",
  "MEA-CHK-001": "Gutfleisch",
  "DRK-OJC-001": "Innocent",
  "VEG-LET-001": "AH",
  "DAI-YOG-001": "Müller",
};

export const CATEGORY_MAP: Record<string, string> = {
  Dairy: "Milch & Eier",
  Bakery: "Brot & Backwaren",
  Vegetables: "Obst & Gemüse",
  Meat: "Fleisch & Fisch",
  Drinks: "Getränke",
};

const CATEGORY_EMOJI: Record<string, string> = {
  Dairy: "🥛",
  Bakery: "🍞",
  Vegetables: "🥦",
  Meat: "🍗",
  Drinks: "🥤",
};

const CATEGORY_TAGS: Record<string, string[]> = {
  Dairy: ["frisch", "täglich"],
  Bakery: ["frühstück", "täglich"],
  Vegetables: ["gemüse", "frisch"],
  Meat: ["protein", "kochen"],
  Drinks: ["getränk"],
};

// ── DB row type ───────────────────────────────────────────────────────────────

interface DbArticle {
  id: string;
  name: string;
  sku: string;
  category: string;
  nutriscore: string | null;
  carbon_footprint: number | null;
  is_biological: number; // 0 | 1
  is_available: number;  // 0 | 1
  price: number;
  allergy_labels: string | null; // JSON string, e.g. '["milk"]'
}

// ── Helper ────────────────────────────────────────────────────────────────────

export function articleToProduct(a: DbArticle): Product {
  let tags: string[] = CATEGORY_TAGS[a.category] ?? [];
  try {
    if (a.allergy_labels) {
      tags = [...tags, ...JSON.parse(a.allergy_labels)];
    }
  } catch {}
  if (a.is_biological) tags = [...new Set([...tags, "bio"])];

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

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const articles = db
      .prepare("SELECT * FROM articles WHERE is_available = 1")
      .all() as DbArticle[];

    const products: Product[] = articles.map(articleToProduct);
    return NextResponse.json(products);
  } catch (err) {
    console.error("[/api/products]", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
