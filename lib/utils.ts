import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CO2Score } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return price.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

export function co2ScoreColor(score: CO2Score): string {
  const map: Record<CO2Score, string> = {
    A: "bg-emerald-500 text-white",
    B: "bg-lime-500 text-white",
    C: "bg-yellow-500 text-white",
    D: "bg-orange-500 text-white",
    E: "bg-red-600 text-white",
  };
  return map[score];
}

export function co2ScoreBg(score: CO2Score): string {
  const map: Record<CO2Score, string> = {
    A: "bg-emerald-50 border-emerald-200",
    B: "bg-lime-50 border-lime-200",
    C: "bg-yellow-50 border-yellow-200",
    D: "bg-orange-50 border-orange-200",
    E: "bg-red-50 border-red-200",
  };
  return map[score];
}

export function stockStatusColor(status: string): string {
  const map: Record<string, string> = {
    verfügbar: "text-emerald-600",
    knapp: "text-orange-500",
    ausverkauft: "text-red-600",
  };
  return map[status] ?? "text-gray-500";
}

export function daysRemainingColor(days: number): string {
  if (days <= 1) return "bg-red-500";
  if (days <= 3) return "bg-orange-400";
  if (days <= 7) return "bg-yellow-400";
  return "bg-emerald-400";
}

export function cartTotal(items: { product: { price: number }; quantity: number }[]): number {
  return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
}

export function cartCO2(items: { product: { co2Kg: number }; quantity: number }[]): number {
  return items.reduce((sum, i) => sum + i.product.co2Kg * i.quantity, 0);
}
