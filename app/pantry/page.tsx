"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Package, Plus, RefreshCw } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { BottomNav } from "@/components/shared/BottomNav";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { PantryItem } from "@/types";
import { cn, formatPrice, daysRemainingColor } from "@/lib/utils";

function StockBar({ days }: { days: number }) {
  const pct = Math.min(100, Math.max(5, (days / 14) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", daysRemainingColor(days))}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        />
      </div>
      <span className={cn(
        "text-[10px] font-bold w-12 text-right flex-shrink-0",
        days <= 1 ? "text-red-500" : days <= 3 ? "text-orange-500" : days <= 7 ? "text-yellow-600" : "text-emerald-600"
      )}>
        ~{days} {days === 1 ? "Tag" : "Tage"}
      </span>
    </div>
  );
}

function PantryItemCard({ item }: { item: PantryItem }) {
  const addToCart = useStore((s) => s.addToCart);
  const cart = useStore((s) => s.cart);
  const inCart = cart.find((c) => c.product.id === item.product.id);
  const urgent = item.daysRemaining <= 2;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0",
        urgent && "bg-orange-50/50"
      )}
    >
      <div className={cn(
        "w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0",
        urgent ? "bg-orange-100" : "bg-gray-100"
      )}>
        {item.product.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-sm font-semibold text-gray-900 truncate">{item.product.name}</p>
          {urgent && (
            <span className="text-[10px] bg-orange-100 text-orange-600 font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
              Fast leer!
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-1.5">
          Noch ca. {item.quantity} {item.unit} · {item.consumptionRate > 0 ? `${(item.consumptionRate).toFixed(1)}/Tag` : "selten"}
        </p>
        <StockBar days={item.daysRemaining} />
      </div>

      <button
        onClick={() => addToCart({ product: item.product, quantity: 1, addedReason: "Aus Vorratsschrank" })}
        disabled={!!inCart}
        className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0",
          inCart
            ? "bg-emerald-100 text-emerald-600"
            : "bg-[#E1141C] text-white active:scale-90"
        )}
      >
        {inCart ? "✓" : <Plus size={14} />}
      </button>
    </motion.div>
  );
}

export default function PantryPage() {
  const router = useRouter();
  const persona = useStore((s) => s.currentPersona);
  const pantry = useStore((s) => s.pantry);

  const [filter, setFilter] = useState<"all" | "urgent" | "ok">("all");

  useEffect(() => {
    if (!persona) router.push("/onboarding");
  }, [persona, router]);

  if (!persona) return null;

  const urgentCount = pantry.filter((p) => p.daysRemaining <= 3).length;

  const filtered = pantry
    .filter((p) => {
      if (filter === "urgent") return p.daysRemaining <= 3;
      if (filter === "ok") return p.daysRemaining > 3;
      return true;
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  // Group by category
  const grouped: Record<string, PantryItem[]> = {};
  filtered.forEach((item) => {
    const cat = item.product.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  const totalItems = pantry.length;
  const avgDays = pantry.length
    ? Math.round(pantry.reduce((s, p) => s + p.daysRemaining, 0) / pantry.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <DemoBanner />

      {/* Header */}
      <div className="bg-white px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-black text-gray-900">Vorratsschrank</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Automatisch aktualisiert nach jeder Bestellung
            </p>
          </div>
          <div className="w-9 h-9 bg-gray-100 rounded-2xl flex items-center justify-center">
            <RefreshCw size={16} className="text-gray-500" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-50 rounded-2xl p-3 text-center">
            <p className="text-lg font-black text-gray-900">{totalItems}</p>
            <p className="text-[10px] text-gray-500">Artikel</p>
          </div>
          <div className={cn(
            "rounded-2xl p-3 text-center",
            urgentCount > 0 ? "bg-orange-50" : "bg-emerald-50"
          )}>
            <p className={cn("text-lg font-black", urgentCount > 0 ? "text-orange-500" : "text-emerald-600")}>
              {urgentCount}
            </p>
            <p className="text-[10px] text-gray-500">Fast leer</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3 text-center">
            <p className="text-lg font-black text-gray-900">{avgDays}</p>
            <p className="text-[10px] text-gray-500">Ø Tage</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(["all", "urgent", "ok"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                filter === f
                  ? f === "urgent"
                    ? "bg-orange-500 text-white"
                    : "bg-[#E1141C] text-white"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {f === "all" && "Alle"}
              {f === "urgent" && `⚠️ Bald leer (${urgentCount})`}
              {f === "ok" && "✓ Gut bestückt"}
            </button>
          ))}
        </div>
      </div>

      {/* Pantry list */}
      <div className="px-4 py-4 space-y-4">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="bg-white rounded-3xl overflow-hidden shadow-card">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
              <Package size={14} className="text-gray-400" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{category}</span>
              <span className="ml-auto text-xs text-gray-400">{items.length} Artikel</span>
            </div>
            {items.map((item) => (
              <PantryItemCard key={item.product.id} item={item} />
            ))}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Kein Eintrag in dieser Kategorie</p>
          </div>
        )}

        {/* How it works */}
        <div className="bg-blue-50 rounded-2xl p-4">
          <p className="text-xs font-bold text-blue-800 mb-1">Wie funktioniert das?</p>
          <p className="text-xs text-blue-700 leading-relaxed">
            Picnic+ trackt deinen Verbrauch anhand deiner Bestellhistorie und lernt, wie schnell du was aufbrauchst. So weiß die App, wann es Zeit ist nachzubestellen – ganz automatisch.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
