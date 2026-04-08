import type { Product, Persona, MealSuggestion, Bundle } from "@/types";

export type PersonaFull = Persona & {
  mealSuggestions: MealSuggestion[];
  bundles: Bundle[];
  popularProducts: { product: Product; percentage: number }[];
};

export async function getProducts(): Promise<Product[]> {
  const res = await fetch("/api/products", { cache: "no-store" });
  if (!res.ok) throw new Error("Fehler beim Laden der Produkte");
  return res.json();
}

export async function getPersonas(): Promise<PersonaFull[]> {
  const res = await fetch("/api/personas", { cache: "no-store" });
  if (!res.ok) throw new Error("Fehler beim Laden der Personas");
  return res.json();
}
