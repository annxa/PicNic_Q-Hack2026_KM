import { NextResponse } from "next/server";
import db from "@/lib/db";
import { articleToProduct, type DbArticle } from "@/lib/articles";
import type { Product } from "@/types";

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
