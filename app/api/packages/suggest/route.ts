import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import db from "@/lib/db";
import { articleToProduct } from "@/app/api/products/route";
import type { Bundle } from "@/types";

// ── DB row types ──────────────────────────────────────────────────────────────

interface DbCustomer {
  id: string;
  name: string;
  diet: string;
  house_hold_size: number;
  has_children: number;
  has_pets: number;
  intolerances: string | null;
  persona_name: string | null;
}

interface DbOrderRow {
  order_id: string;
  creation_date: string;
  total_price: number;
  sku: string;
  quantity: number;
  article_name: string;
  article_category: string;
  article_price: number;
  is_biological: number;
}

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

interface DbPackage {
  id: string;
  name: string;
  description: string | null;
}

interface ClaudePackage {
  name: string;
  description: string;
  article_skus: string[];
  reason: string;
}

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildPackageSuggestionPrompt(
  customer: DbCustomer,
  orders: DbOrderRow[],
  articles: DbArticle[],
  existingPackages: DbPackage[]
): { system: string; user: string } {
  const dietMap: Record<string, string> = { omni: "omnivore", vegan: "vegan", vegetarian: "vegetarian" };
  const intolerances = customer.intolerances
    ? customer.intolerances.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const customerBlock = [
    "## Customer Profile",
    `- Name: ${customer.name}`,
    `- Persona: ${customer.persona_name ?? "unknown"}`,
    `- Diet: ${dietMap[customer.diet] ?? customer.diet}`,
    `- Household size: ${customer.house_hold_size}`,
    `- Has children: ${customer.has_children ? "yes" : "no"}`,
    `- Has pets: ${customer.has_pets ? "yes" : "no"}`,
    `- Intolerances: ${intolerances.length ? intolerances.join(", ") : "none"}`,
  ].join("\n") + "\n\n";

  // Summarise order history
  const skuCounts = new Map<string, { name: string; count: number; category: string }>();
  for (const row of orders) {
    const entry = skuCounts.get(row.sku);
    if (entry) {
      entry.count += row.quantity;
    } else {
      skuCounts.set(row.sku, { name: row.article_name, count: row.quantity, category: row.article_category });
    }
  }
  const skuEntries: [string, { name: string; count: number; category: string }][] = [];
  skuCounts.forEach((value, sku) => {
    skuEntries.push([sku, value]);
  });

  const topItems = skuEntries
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([sku, v]) => `  - ${v.name} (SKU: ${sku}, cat: ${v.category}, total qty: ${v.count})`);

  const historyBlock = [
    "## Purchase History Summary",
    `- Total orders: ${new Set(orders.map((r) => r.order_id)).size}`,
    "- Most ordered items:",
    ...topItems,
  ].join("\n") + "\n\n";

  const catalogLines = articles.map((a) => {
    const bio = a.is_biological ? " [Bio]" : "";
    return `  - ${a.name}${bio} | SKU: ${a.sku} | Cat: ${a.category} | ${a.price.toFixed(2)} EUR`;
  });
  const catalogBlock = "## Available Products\n" + catalogLines.join("\n") + "\n\n";

  const existingBlock =
    "## Existing Packages (do NOT duplicate)\n" +
    (existingPackages.length
      ? existingPackages.map((p) => `  - ${p.name}: ${p.description ?? ""}`).join("\n")
      : "  (none)") +
    "\n\n";

  const system =
    "You are a product merchandising engine for Picnic+, a personalised online grocery service. " +
    "Your job is to design new meal-kit bundles (groups of grocery articles) that match a customer's " +
    "actual buying patterns and dietary profile.\n\n" +
    "Rules:\n" +
    "- Suggest exactly 3 bundles not already in the existing package catalogue.\n" +
    "- Only use article SKUs that exist in the provided product catalogue.\n" +
    "- Each bundle should contain 3-6 articles.\n" +
    "- Respect the customer's diet and intolerances.\n" +
    "- Respond ONLY with a valid JSON array. No prose, no markdown fences.";

  const user =
    customerBlock +
    historyBlock +
    catalogBlock +
    existingBlock +
    "## Task\n" +
    "Design 3 new meal-kit bundles for this customer. " +
    "Each element in the JSON array must have: name, description, article_skus (list of SKU strings), reason.";

  return { system, user };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const customerId = req.nextUrl.searchParams.get("customerId");
  if (!customerId) {
    return NextResponse.json({ error: "customerId is required" }, { status: 400 });
  }

  try {
    const customer = db
      .prepare(
        `SELECT c.id, c.name, c.diet, c.house_hold_size, c.has_children,
                c.has_pets, c.intolerances, p.name as persona_name
         FROM customers c
         LEFT JOIN personas p ON c.persona_id = p.id
         WHERE c.id = ?`
      )
      .get(customerId) as DbCustomer | undefined;

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const orderRows = db
      .prepare(
        `SELECT o.id AS order_id, o.creation_date, o.total_price,
                ol.sku, ol.quantity,
                a.name AS article_name, a.category AS article_category,
                a.price AS article_price, a.is_biological
         FROM orders o
         JOIN orderlines ol ON ol.order_id = o.id
         JOIN articles a ON a.sku = ol.sku
         WHERE o.customer_id = ?
         ORDER BY o.creation_date DESC`
      )
      .all(customerId) as DbOrderRow[];

    const articles = db
      .prepare("SELECT * FROM articles WHERE is_available = 1")
      .all() as DbArticle[];

    const existingPackages = db
      .prepare("SELECT id, name, description FROM packages")
      .all() as DbPackage[];

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey });
    const { system, user } = buildPackageSuggestionPrompt(customer, orderRows, articles, existingPackages);

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

    const bundles: Bundle[] = suggested.map((pkg, i) => {
      const items = pkg.article_skus
        .map((sku) => {
          const article = articleBySku.get(sku);
          if (!article) return null;
          return { product: articleToProduct(article), quantity: 1 };
        })
        .filter((item): item is { product: ReturnType<typeof articleToProduct>; quantity: number } => item !== null);

      const totalPrice = parseFloat(items.reduce((s, item) => s + item.product.price, 0).toFixed(2));

      return {
        id: `ai-bundle-${i}-${Date.now()}`,
        name: pkg.name,
        description: pkg.description,
        items,
        totalPrice,
        category: "topup",
      } satisfies Bundle;
    });

    return NextResponse.json(bundles);
  } catch (err) {
    console.error("[/api/packages/suggest]", err);
    return NextResponse.json({ error: "Failed to suggest packages" }, { status: 500 });
  }
}
