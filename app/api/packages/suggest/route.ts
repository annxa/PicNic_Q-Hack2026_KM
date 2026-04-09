import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import db from "@/lib/db";
import { articleToProduct } from "@/lib/articles";
import type { SavedPackage } from "@/types";

interface DbCustomer {
  id: string; name: string; diet: string; house_hold_size: number;
  has_children: number; has_pets: number; intolerances: string | null;
  persona_name: string | null;
}
interface DbOrderRow {
  order_id: string; sku: string; quantity: number;
  article_name: string; article_category: string; is_biological: number;
}
interface DbArticle {
  id: string; name: string; sku: string; category: string;
  nutriscore: string | null; carbon_footprint: number | null;
  is_biological: number; is_available: number; price: number;
  allergy_labels: string | null;
}
interface DbPackage { id: string; name: string; description: string | null; }
interface ClaudePackage { name: string; description: string; article_skus: string[]; reason: string; }

function buildPrompt(
  customer: DbCustomer, orders: DbOrderRow[],
  articles: DbArticle[], existingPackages: DbPackage[]
): { system: string; user: string } {
  const dietMap: Record<string, string> = { omni: "omnivore", vegan: "vegan", vegetarian: "vegetarian" };
  const intolerances = customer.intolerances?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];

  const skuCounts = new Map<string, { name: string; count: number; category: string }>();
  for (const row of orders) {
    const e = skuCounts.get(row.sku);
    if (e) e.count += row.quantity;
    else skuCounts.set(row.sku, { name: row.article_name, count: row.quantity, category: row.article_category });
  }
  const topItems = Array.from(skuCounts.entries())
    .sort((a, b) => b[1].count - a[1].count).slice(0, 10)
    .map(([sku, v]) => `  - ${v.name} (SKU: ${sku}, cat: ${v.category}, qty: ${v.count})`);

  const user = [
    "## Customer Profile",
    `- Name: ${customer.name}`,
    `- Persona: ${customer.persona_name ?? "unknown"}`,
    `- Diet: ${dietMap[customer.diet] ?? customer.diet}`,
    `- Household size: ${customer.house_hold_size}`,
    `- Has children: ${customer.has_children ? "yes" : "no"}`,
    `- Has pets: ${customer.has_pets ? "yes" : "no"}`,
    `- Intolerances: ${intolerances.length ? intolerances.join(", ") : "none"}`,
    "",
    "## Purchase History (most ordered)",
    `- Total orders: ${new Set(orders.map((r) => r.order_id)).size}`,
    ...topItems,
    "",
    "## Available Products",
    ...articles.map((a) =>
      `  - ${a.name}${a.is_biological ? " [Bio]" : ""} | SKU: ${a.sku} | Cat: ${a.category} | ${a.price.toFixed(2)} EUR`
    ),
    "",
    "## Existing Packages (do NOT duplicate)",
    ...(existingPackages.length
      ? existingPackages.map((p) => `  - ${p.name}: ${p.description ?? ""}`)
      : ["  (none)"]),
    "",
    "## Task",
    "Design 3 new meal-kit bundles for this customer.",
    "Each element must have: name, description, article_skus (list of SKU strings), reason.",
  ].join("\n");

  const system =
    "You are a product merchandising engine for Picnic+, a personalised online grocery service. " +
    "Design new meal-kit bundles that match the customer's buying patterns and dietary profile.\n\n" +
    "Rules:\n" +
    "- Suggest exactly 3 bundles not already in the existing package catalogue.\n" +
    "- Only use article SKUs from the provided product catalogue.\n" +
    "- Each bundle should contain 3-6 articles.\n" +
    "- Respect the customer's diet and intolerances.\n" +
    "- Respond ONLY with a valid JSON array. No prose, no markdown fences.";

  return { system, user };
}

export async function GET(req: NextRequest) {
  const customerId = req.nextUrl.searchParams.get("customerId");
  if (!customerId) return NextResponse.json({ error: "customerId is required" }, { status: 400 });

  try {
    const customer = db.prepare(
      `SELECT c.id, c.name, c.diet, c.house_hold_size, c.has_children,
              c.has_pets, c.intolerances, p.name as persona_name
       FROM customers c LEFT JOIN personas p ON c.persona_id = p.id
       WHERE c.id = ?`
    ).get(customerId) as DbCustomer | undefined;
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    const orderRows = db.prepare(
      `SELECT o.id AS order_id, ol.sku, ol.quantity,
              a.name AS article_name, a.category AS article_category, a.is_biological
       FROM orders o
       JOIN orderlines ol ON ol.order_id = o.id
       JOIN articles a ON a.sku = ol.sku
       WHERE o.customer_id = ? ORDER BY o.creation_date DESC`
    ).all(customerId) as DbOrderRow[];

    const articles = db.prepare("SELECT * FROM articles WHERE is_available = 1").all() as DbArticle[];
    const existingPackages = db.prepare("SELECT id, name, description FROM packages").all() as DbPackage[];

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 });

    const anthropic = new Anthropic({ apiKey });
    const { system, user } = buildPrompt(customer, orderRows, articles, existingPackages);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: user }],
    });

    const raw = message.content.find((b) => b.type === "text")?.text ?? "[]";
    const stripped = raw.trim().startsWith("```")
      ? raw.trim().split("\n").slice(1, -1).join("\n")
      : raw.trim();

    const suggested: ClaudePackage[] = JSON.parse(stripped);
    const articleBySku = new Map(articles.map((a) => [a.sku, a]));

    const packages: SavedPackage[] = [];
    suggested.forEach((pkg, i) => {
      const items = pkg.article_skus.flatMap((sku) => {
        const a = articleBySku.get(sku);
        return a ? [{ product: articleToProduct(a), quantity: 1 as const }] : [];
      });
      if (items.length === 0) return;
      packages.push({
        id: `ai-${i}-${Date.now()}`,
        name: pkg.name,
        emoji: "✨",
        description: `${pkg.description} — ${pkg.reason}`,
        items,
        totalPrice: parseFloat(items.reduce((s, item) => s + item.product.price, 0).toFixed(2)),
        isPreset: false,
        createdAt: new Date().toISOString().slice(0, 10),
      });
    });

    return NextResponse.json(packages);
  } catch (err) {
    console.error("[/api/packages/suggest]", err);
    return NextResponse.json({ error: "Failed to suggest packages" }, { status: 500 });
  }
}
