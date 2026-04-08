import { NextResponse } from "next/server";

// Hardcoded route: Hub Viernheim → nearest supermarket
const OSRM_URL =
  "http://router.project-osrm.org/route/v1/car/8.456665,49.487695;8.481575,49.479022?overview=false";

export async function GET() {
  try {
    const res = await fetch(OSRM_URL, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`OSRM responded with status ${res.status}`);

    const data = (await res.json()) as { routes: { distance: number }[] };
    const distanceMeters = data.routes[0].distance;

    // CO₂ saved in kg: round trip (×2), 150 g CO₂ per km, convert g→kg (÷1000)
    const co2SavedKg = parseFloat(
      (((distanceMeters / 1000) * 2 * 150) / 1000).toFixed(3)
    );

    return NextResponse.json({ co2SavedKg, distanceMeters });
  } catch (err) {
    console.error("[/api/co2-distance]", err);
    // Fallback: ~3.5 km road distance
    const fallbackKg = parseFloat(((3.5 * 2 * 150) / 1000).toFixed(3));
    return NextResponse.json({ co2SavedKg: fallbackKg, distanceMeters: 3500, fallback: true });
  }
}
