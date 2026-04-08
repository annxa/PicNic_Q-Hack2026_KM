import { NextResponse } from "next/server";
import { dbWrite } from "@/lib/db";

const OSRM_URL =
  "http://router.project-osrm.org/route/v1/car/8.456665,49.487695;8.481575,49.479022?overview=false";

async function fetchCo2Saving(): Promise<number> {
  const res = await fetch(OSRM_URL);
  if (!res.ok) throw new Error(`OSRM error: ${res.status}`);
  const data = (await res.json()) as { routes: { distance: number }[] };
  const distanceMeters = data.routes[0].distance;
  return parseFloat((((distanceMeters / 1000) * 2 * 150) / 1000).toFixed(3));
}

export async function POST(req: Request) {
  try {
    const { customerId } = (await req.json()) as { customerId: string };

    const co2SavedKg = await fetchCo2Saving().catch(() => {
      // Fallback: ~3.5 km road distance
      return parseFloat(((3.5 * 2 * 150) / 1000).toFixed(3));
    });

    // Accumulate CO₂ savings in the customer record
    dbWrite
      .prepare(
        "UPDATE customers SET co2 = COALESCE(co2, 0) + ? WHERE id = ?"
      )
      .run(co2SavedKg, customerId);

    const row = dbWrite
      .prepare("SELECT co2 FROM customers WHERE id = ?")
      .get(customerId) as { co2: number } | undefined;

    return NextResponse.json({
      co2SavedKg,
      newCo2Total: parseFloat((row?.co2 ?? co2SavedKg).toFixed(3)),
    });
  } catch (err) {
    console.error("[/api/checkout]", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
