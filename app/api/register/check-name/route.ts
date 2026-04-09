import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  const { name } = (await req.json()) as { name: string };
  const existing = db
    .prepare("SELECT id FROM customers WHERE LOWER(name) = LOWER(?)")
    .get(name?.trim() ?? "") as { id: string } | undefined;

  if (existing) {
    return NextResponse.json(
      { error: "This name is already taken. Please choose a different name." },
      { status: 409 }
    );
  }
  return NextResponse.json({ ok: true });
}
