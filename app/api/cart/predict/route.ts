import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import db from "@/lib/db";
import { articleToProduct } from "@/app/api/products/route";
import type { CartItem } from "@/types";

// ── DB row types ──────────────────────────────────────────────────────────────

interface DbCustomer {
  id: string;
  name: string;
  diet: string;
  age_range: string | null;
  house_hold_size: number;
  has_children: number;
  has_pets: number;
  intolerances: string | null;
  location: string | null;
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
  nutriscore: string | null;
  carbon_footprint: number | null;
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

interface ClaudeCartItem {
  sku: string;
  name: string;
  quantity: number;
  confidence: number;
  reason: string;
}

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildCartPredictionPrompt(
  customer: DbCustomer,
  orders: DbOrderRow[],
  articles: DbArticle[]
): { system: string; user: string } {
  // Group orders by order_id
  const orderMap = new Map<string, { date: string; total: number; items: DbOrderRow[] }>();
  for (const row of orders) {
    if (!orderMap.has(row.order_id)) {
      orderMap.set(row.order_id, { date: row.creation_date, total: row.total_price, items: [] });
    }
    orderMap.get(row.order_id)!.items.push(row);
  }
  const sortedOrders = [...orderMap.values()].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const latestOrder = sortedOrders[0];
  const historyOrders = sortedOrders.slice(1);

  // Customer block
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

  // Latest order block
  const latestBlock = latestOrder
    ? [
        `## Latest Order | Date: ${latestOrder.date.slice(0, 10)} | Total: ${latestOrder.total.toFixed(2)} EUR`,
        ...latestOrder.items.map(
          (i) =>
            `  - ${i.article_name}${i.is_biological ? " [Bio]" : ""} x${i.quantity} (${i.article_category}, ${i.article_price.toFixed(2)} EUR/unit)`
        ),
      ].join("\n") + "\n\n"
    : "";

  // History block
  let historyBlock = "";
  if (historyOrders.length > 0) {
    const skuCounts = new Map<string, number>();
    const catCounts = new Map<string, number>();
    const recentNames: string[] = [];

    for (const order of historyOrders.slice(0, 3)) {
      for (const item of order.items) {
        skuCounts.set(item.sku, (skuCounts.get(item.sku) ?? 0) + 1);
        catCounts.set(item.article_category, (catCounts.get(item.article_category) ?? 0) + item.quantity);
        if (!recentNames.includes(item.article_name)) recentNames.push(item.article_name);
      }
    }

    const avgTotal =
      historyOrders.reduce((s, o) => s + o.total, 0) / historyOrders.length;
    const topCats = [...catCounts.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
    const frequentSkus = [...skuCounts.entries()]
      .filter(([, n]) => n >= 2)
      .map(([sku]) => sku);

    historyBlock =
      [
        "## Purchase History",
        `- Total orders: ${historyOrders.length}`,
        `- Average order total: ${avgTotal.toFixed(2)} EUR`,
        `- Top categories: ${topCats.join(", ") || "none"}`,
        `- Frequently re-ordered SKUs: ${frequentSkus.join(", ") || "none"}`,
        `- Recent items: ${recentNames.slice(0, 12).join(", ")}`,
      ].join("\n") + "\n\n";
  }

  // Catalog block
  const catalogLines = articles.map((a) => {
    const bio = a.is_biological ? " [Bio]" : "";
    const co2 = a.carbon_footprint != null ? `${a.carbon_footprint.toFixed(1)} kg CO2` : "?";
    return `  - ${a.name}${bio} | SKU: ${a.sku} | Cat: ${a.category} | ${a.price.toFixed(2)} EUR | Nutriscore: ${a.nutriscore ?? "?"} | CO2: ${co2}`;
  });
  const catalogBlock = "## Available Products\n" + catalogLines.join("\n") + "\n\n";

  const system =
    "You are a next-basket prediction engine for Picnic+, a personalised online grocery service. " +
    "Given a customer's profile, their latest order, and purchase history, predict which items they " +
    "will most likely order next and in what quantities.\n\n" +
    "Rules:\n" +
    "- Only recommend items from the provided product catalogue.\n" +
    "- Return as many items as the customer usually orders, ranked by confidence (highest first).\n" +
    "- Respect the customer's diet restrictions and intolerances.\n" +
    "- Consider reorder frequency, quantities, and household size.\n" +
    "- Respond ONLY with a valid JSON array. No prose, no markdown fences.";

  const user =
    customerBlock +
    latestBlock +
    historyBlock +
    catalogBlock +
    "## Task\n" +
    "Predict the customer's next basket. Return a JSON array where each element has: " +
    "sku, name, quantity (integer), confidence (0.0-1.0), reason.";

  return { system, user };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const customerId = req.nextUrl.searchParams.get("customerId");
  if (!customerId) {
    return NextResponse.json({ error: "customerId is required" }, { status: 400 });
  }

  try {
    // 1. Fetch customer
    const customer = db
      .prepare(
        `SELECT c.id, c.name, c.diet, c.age_range, c.house_hold_size,
                c.has_children, c.has_pets, c.intolerances, c.location,
                p.name as persona_name
         FROM customers c
         LEFT JOIN personas p ON c.persona_id = p.id
         WHERE c.id = ?`
      )
      .get(customerId) as DbCustomer | undefined;

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // 2. Fetch order history with article details
    const orderRows = db
      .prepare(
        `SELECT o.id AS order_id, o.creation_date, o.total_price,
                ol.sku, ol.quantity,
                a.name AS article_name, a.category AS article_category,
                a.price AS article_price, a.is_biological,
                a.nutriscore, a.carbon_footprint
         FROM orders o
         JOIN orderlines ol ON ol.order_id = o.id
         JOIN articles a ON a.sku = ol.sku
         WHERE o.customer_id = ?
         ORDER BY o.creation_date DESC`
      )
      .all(customerId) as DbOrderRow[];

    // 3. Fetch available articles for the catalog
    const articles = db
      .prepare("SELECT * FROM articles WHERE is_available = 1")
      .all() as DbArticle[];

    // 4. Build and send prompt to Claude
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey });
    const { system, user } = buildCartPredictionPrompt(customer, orderRows, articles);

    const message = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: user }],
    });

    // 5. Parse Claude's response
    const raw = message.content.find((b) => b.type === "text")?.text ?? "[]";
    const stripped = raw.trim().startsWith("```")
      ? raw.trim().split("\n").slice(1, -1).join("\n")
      : raw.trim();

    const predicted: ClaudeCartItem[] = JSON.parse(stripped);

    // 6. Map SKUs to full Product objects
    const articleBySku = new Map(articles.map((a) => [a.sku, a]));
    const cartItems: CartItem[] = predicted
      .map((item) => {
        const article = articleBySku.get(item.sku);
        if (!article) return null;
        return {
          product: articleToProduct(article),
          quantity: item.quantity,
          addedReason: item.reason,
        } satisfies CartItem;
      })
      .filter((item): item is CartItem => item !== null);

    return NextResponse.json(cartItems);
  } catch (err) {
    console.error("[/api/cart/predict]", err);
    return NextResponse.json({ error: "Failed to predict cart" }, { status: 500 });
  }
}
