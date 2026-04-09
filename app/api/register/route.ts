import { NextResponse } from "next/server";
import { dbWrite } from "@/lib/db";
import { randomUUID } from "crypto";

interface RegisterBody {
  name: string;
  personaKey: string;
  householdSize: number;
  hasChildren: boolean;
  intolerances: string[];
  goals: string[];
}

export async function POST(req: Request) {
  try {
    const { name, personaKey, householdSize, hasChildren, intolerances, goals } =
      (await req.json()) as RegisterBody;

    // Reject duplicate names
    const existing = dbWrite
      .prepare("SELECT id FROM customers WHERE LOWER(name) = LOWER(?)")
      .get(name.trim()) as { id: string } | undefined;
    if (existing) {
      return NextResponse.json(
        { error: "This name is already taken. Please choose a different name." },
        { status: 409 }
      );
    }

    // Look up the persona row by its name key (e.g. "fitness", "bargain_hunters")
    const personaRow = dbWrite
      .prepare("SELECT id FROM personas WHERE name = ?")
      .get(personaKey) as { id: string } | undefined;

    const id = randomUUID();
    // Append a short unique suffix to satisfy the UNIQUE email constraint
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, ".");
    const email = `${slug}.${id.slice(0, 6)}@picnic.app`;

    dbWrite
      .prepare(
        `INSERT INTO customers
           (id, name, email, house_hold_size, has_children, diet,
            intolerances, goals, persona_id, co2, has_pets, tech_savviness, country)
         VALUES (?, ?, ?, ?, ?, 'omni', ?, ?, ?, 0.00, 0, 'medium', 'Germany')`
      )
      .run(
        id,
        name.trim(),
        email,
        householdSize,
        hasChildren ? 1 : 0,
        Array.isArray(intolerances) ? intolerances.join(",") : "",
        Array.isArray(goals) ? goals.join(",") : "",
        personaRow?.id ?? null
      );

    return NextResponse.json({ customerId: id });
  } catch (err) {
    console.error("[/api/register]", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
