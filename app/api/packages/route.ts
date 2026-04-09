import { NextResponse } from "next/server";
import db from "@/lib/db";
import { articleToProduct } from "@/lib/articles";
import type { SavedPackage, Product } from "@/types";

// ── DB row type ───────────────────────────────────────────────────────────────

interface DbArticle {
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

// ── Preset package definitions ────────────────────────────────────────────────
// Each preset lists SKUs + quantities. Products are resolved from the DB so
// prices and metadata are always in sync.

const PRESETS: {
  id: string;
  name: string;
  emoji: string;
  description: string;
  items: { sku: string; quantity: number }[];
}[] = [
  {
    id: "preset-breakfast",
    name: "Breakfast Essentials",
    emoji: "🌅",
    description: "Everything you need to start the day right — milk, eggs, bread and yoghurt.",
    items: [
      { sku: "DAI-MLK-001", quantity: 2 },
      { sku: "DAI-EGG-001", quantity: 1 },
      { sku: "BAK-BRD-001", quantity: 1 },
      { sku: "DAI-YOG-001", quantity: 2 },
    ],
  },
  {
    id: "preset-veggie-week",
    name: "Veggie Week",
    emoji: "🥦",
    description: "A full week of fresh vegetables for salads, stir-fries and sides.",
    items: [
      { sku: "VEG-BRC-001", quantity: 2 },
      { sku: "VEG-TOM-001", quantity: 2 },
      { sku: "VEG-LET-001", quantity: 3 },
    ],
  },
  {
    id: "preset-protein-prep",
    name: "Protein Meal Prep",
    emoji: "💪",
    description: "Lean protein and greens — perfect for a week of healthy meal prep.",
    items: [
      { sku: "MEA-CHK-001", quantity: 3 },
      { sku: "DAI-EGG-001", quantity: 2 },
      { sku: "VEG-BRC-001", quantity: 2 },
      { sku: "DAI-YOG-001", quantity: 2 },
    ],
  },
  {
    id: "preset-pantry-basics",
    name: "Pantry Basics Restock",
    emoji: "🏠",
    description: "The staples that should always be in your fridge and cupboard.",
    items: [
      { sku: "DAI-MLK-001", quantity: 2 },
      { sku: "DAI-BUT-001", quantity: 1 },
      { sku: "DAI-EGG-001", quantity: 1 },
      { sku: "BAK-BRD-001", quantity: 2 },
      { sku: "DRK-OJC-001", quantity: 1 },
    ],
  },
  {
    id: "preset-salad-kit",
    name: "Fresh Salad Kit",
    emoji: "🥗",
    description: "Crisp greens, juicy tomatoes and a drizzle of butter — simple and fresh.",
    items: [
      { sku: "VEG-LET-001", quantity: 2 },
      { sku: "VEG-TOM-001", quantity: 1 },
      { sku: "DAI-EGG-001", quantity: 1 },
      { sku: "DAI-BUT-001", quantity: 1 },
    ],
  },
];

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const articles = db
      .prepare("SELECT * FROM articles WHERE is_available = 1")
      .all() as DbArticle[];

    const articleBySku = new Map<string, DbArticle>(
      articles.map((a) => [a.sku, a])
    );

    const packages: SavedPackage[] = PRESETS.flatMap((preset) => {
      const resolvedItems: { product: Product; quantity: number }[] = [];

      for (const { sku, quantity } of preset.items) {
        const article = articleBySku.get(sku);
        if (!article) continue;
        resolvedItems.push({ product: articleToProduct(article), quantity });
      }

      if (resolvedItems.length === 0) return [];

      const totalPrice = resolvedItems.reduce(
        (sum, i) => sum + i.product.price * i.quantity,
        0
      );

      return [
        {
          id: preset.id,
          name: preset.name,
          emoji: preset.emoji,
          description: preset.description,
          items: resolvedItems,
          totalPrice: parseFloat(totalPrice.toFixed(2)),
          isPreset: true,
          createdAt: "2026-01-01",
        } satisfies SavedPackage,
      ];
    });

    return NextResponse.json(packages);
  } catch (err) {
    console.error("[/api/packages]", err);
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}
