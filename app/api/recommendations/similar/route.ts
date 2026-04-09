import { NextResponse } from "next/server";
import db from "@/lib/db";
import { articleToProduct, type DbArticle } from "@/lib/articles";
import type { Product } from "@/types";

const PYTHON_SERVER = "http://localhost:5001";

interface PyResult {
  similarity: number;
  top_product: string | null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");
  if (!customerId) {
    return NextResponse.json({ error: "customerId required" }, { status: 400 });
  }

  // 1. Look up the customer's persona name from DB
  const row = db
    .prepare(
      `SELECT p.name AS persona_name
       FROM customers c
       LEFT JOIN personas p ON p.id = c.persona_id
       WHERE c.id = ?`
    )
    .get(customerId) as { persona_name: string | null } | undefined;

  const personaName = row?.persona_name;
  if (!personaName) {
    return NextResponse.json({ items: [] });
  }

  // 2. Call Python server
  let pyResults: PyResult[];
  try {
    const pyRes = await fetch(`${PYTHON_SERVER}/recommendations/persona`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ persona: personaName }),
      signal: AbortSignal.timeout(5000),
    });
    if (!pyRes.ok) throw new Error(`Python server: ${pyRes.status}`);
    pyResults = await pyRes.json();
  } catch (err) {
    console.error("[/api/recommendations/similar] Python server unavailable:", err);
    return NextResponse.json({ items: [] });
  }

  // 3. Resolve top_product names → full Product objects
  const items: { product: Product; percentage: number }[] = [];
  for (const r of pyResults) {
    if (!r.top_product) continue;
    const article = db
      .prepare(
        "SELECT * FROM articles WHERE LOWER(name) = LOWER(?) AND is_available = 1 LIMIT 1"
      )
      .get(r.top_product) as DbArticle | undefined;
    if (!article) continue;
    items.push({
      product: articleToProduct(article),
      percentage: r.similarity,
    });
  }

  return NextResponse.json({ items });
}
