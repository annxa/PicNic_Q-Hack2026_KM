import { NextResponse } from "next/server";
import { dbWrite } from "@/lib/db";
import { randomUUID } from "crypto";

const OSRM_URL =
  "http://router.project-osrm.org/route/v1/car/8.456665,49.487695;8.481575,49.479022?overview=false";

async function fetchCo2Saving(): Promise<number> {
  const res = await fetch(OSRM_URL);
  if (!res.ok) throw new Error(`OSRM error: ${res.status}`);
  const data = (await res.json()) as { routes: { distance: number }[] };
  const distanceMeters = data.routes[0].distance;
  return parseFloat((((distanceMeters / 1000) * 2 * 150) / 1000).toFixed(3));
}

interface CartItem {
  productId: string; // = article.id
  quantity: number;
}

export async function POST(req: Request) {
  try {
    const { customerId, cart } = (await req.json()) as {
      customerId: string;
      cart: CartItem[];
    };

    const co2SavedKg = await fetchCo2Saving().catch(() =>
      parseFloat(((3.5 * 2 * 150) / 1000).toFixed(3))
    );

    // ── 1. Calculate total price from DB article prices ──────────────────────
    const totalPrice = (cart ?? []).reduce((sum, item) => {
      const article = dbWrite
        .prepare("SELECT price FROM articles WHERE id = ?")
        .get(item.productId) as { price: number } | undefined;
      return sum + (article?.price ?? 0) * item.quantity;
    }, 0);

    // ── 2. Insert order ───────────────────────────────────────────────────────
    const orderId = randomUUID();
    dbWrite
      .prepare(
        `INSERT INTO orders (id, customer_id, creation_date, status, total_price, co2_saved)
         VALUES (?, ?, datetime('now'), 'delivered', ?, ?)`
      )
      .run(orderId, customerId, parseFloat(totalPrice.toFixed(2)), co2SavedKg);

    // ── 3. Insert orderlines (look up SKU from article id) ────────────────────
    const insertLine = dbWrite.prepare(
      "INSERT INTO orderlines (id, order_id, sku, quantity) VALUES (?, ?, ?, ?)"
    );
    for (const item of cart ?? []) {
      const article = dbWrite
        .prepare("SELECT sku FROM articles WHERE id = ?")
        .get(item.productId) as { sku: string } | undefined;
      if (!article) continue;
      insertLine.run(randomUUID(), orderId, article.sku, item.quantity);
    }

    // ── 4. Update customer CO₂ total ──────────────────────────────────────────
    dbWrite
      .prepare("UPDATE customers SET co2 = COALESCE(co2, 0) + ? WHERE id = ?")
      .run(co2SavedKg, customerId);

    const row = dbWrite
      .prepare("SELECT co2 FROM customers WHERE id = ?")
      .get(customerId) as { co2: number } | undefined;

    // Build the order entry so the client can update its state immediately
    const newOrder = {
      id: orderId,
      date: new Date().toISOString().slice(0, 10),
      items: (cart ?? []).map((i) => ({ productId: i.productId, quantity: i.quantity })),
      total: parseFloat(totalPrice.toFixed(2)),
      co2Saved: co2SavedKg,
    };

    return NextResponse.json({
      co2SavedKg,
      newCo2Total: parseFloat((row?.co2 ?? co2SavedKg).toFixed(3)),
      newOrder,
    });
  } catch (err) {
    console.error("[/api/checkout]", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
