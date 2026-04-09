import { NextResponse } from "next/server";
import db from "@/lib/db";
import { articleToProduct } from "@/lib/articles";
import type { Product } from "@/types";

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();

    const rows = q.length === 0
      ? (db.prepare(
          "SELECT * FROM articles WHERE is_available = 1 ORDER BY name LIMIT 20"
        ).all() as DbArticle[])
      : (db.prepare(
          "SELECT * FROM articles WHERE is_available = 1 AND name LIKE ? ORDER BY name LIMIT 30"
        ).all(`%${q}%`) as DbArticle[]);

    const products: Product[] = rows.map((a) => articleToProduct(a as never));
    return NextResponse.json(products);
  } catch (err) {
    console.error("[/api/store/search]", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
