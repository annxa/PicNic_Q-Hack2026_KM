"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Leaf,
  ChevronRight,
  Bell,
  MapPin,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { BottomNav } from "@/components/shared/BottomNav";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { ProductCard } from "@/components/shared/ProductCard";
import { products } from "@/lib/mock/products";
import { cn, formatPrice, cartTotal, cartCO2 } from "@/lib/utils";

function CO2ProgressCard() {
  const { co2SavedThisWeek, co2SavedThisMonth, co2MonthlyGoal, co2SavedTotal } = useStore();
  const [animated, setAnimated] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const pct = Math.min(100, (co2SavedThisMonth / co2MonthlyGoal) * 100);
  const kmEquivalent = Math.round(co2SavedThisWeek * 6.3);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <button
        onClick={() => setShowDetail(true)}
        className="w-full rounded-3xl p-5 text-left relative overflow-hidden tap-active"
        style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)" }}
      >
        {/* Background decoration */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute right-8 bottom-0 w-20 h-20 bg-white/5 rounded-full translate-y-6" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center">
                <Leaf size={16} className="text-emerald-300" />
              </div>
              <div>
                <p className="text-emerald-200 text-xs font-medium">CO₂ Konto</p>
                <p className="text-white text-xs opacity-60">Diesen Monat</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-[10px]">Gesamt gespart</p>
              <p className="text-emerald-300 text-sm font-bold">{co2SavedTotal} kg</p>
            </div>
          </div>

          {/* Main metric */}
          <div className="mb-3">
            <div className="flex items-baseline gap-1">
              <span className="text-white text-3xl font-black">{co2SavedThisMonth.toFixed(1)}</span>
              <span className="text-emerald-300 text-base font-semibold">kg CO₂</span>
              <span className="text-white/50 text-xs ml-1">/ {co2MonthlyGoal} kg Ziel</span>
            </div>
            <p className="text-emerald-300 text-xs mt-0.5">
              ≈ {Math.round(co2SavedThisMonth * 6.3)} km Auto gespart 🚗
            </p>
          </div>

          {/* Progress bar */}
          <div className="bg-white/20 rounded-full h-2 mb-3 overflow-hidden">
            <motion.div
              className="h-full bg-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: animated ? `${pct}%` : 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            />
          </div>

          {/* This week */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={12} className="text-emerald-300" />
              <span className="text-emerald-200 text-xs">
                Diese Woche: <strong className="text-white">+{co2SavedThisWeek} kg</strong>
              </span>
            </div>
            <span className="text-white/50 text-xs flex items-center gap-1">
              Details <ChevronRight size={12} />
            </span>
          </div>
        </div>
      </button>

      {/* Detail Sheet */}
      {showDetail && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setShowDetail(false)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-[430px] mx-auto bg-white rounded-t-3xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h2 className="text-xl font-black mb-4">Mein CO₂ Verlauf</h2>

            {[
              { week: "Diese Woche", kg: co2SavedThisWeek, fill: 100 },
              { week: "Letzte Woche", kg: co2SavedThisWeek * 0.85, fill: 85 },
              { week: "Vor 2 Wochen", kg: co2SavedThisWeek * 0.78, fill: 78 },
              { week: "Vor 3 Wochen", kg: co2SavedThisWeek * 0.92, fill: 92 },
            ].map((row) => (
              <div key={row.week} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 font-medium">{row.week}</span>
                  <span className="font-bold text-emerald-700">{row.kg.toFixed(2)} kg</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${row.fill}%` }}
                  />
                </div>
              </div>
            ))}

            <p className="text-xs text-gray-400 mt-4 text-center">
              Du sparst ca. {Math.round(co2SavedThisWeek * 6.3)} km Autofahrt pro Woche ein 🌍
            </p>

            <button
              onClick={() => setShowDetail(false)}
              className="w-full mt-4 py-3 bg-gray-100 rounded-2xl text-sm font-semibold text-gray-700"
            >
              Schließen
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const persona = useStore((s) => s.currentPersona);
  const cart = useStore((s) => s.cart);

  useEffect(() => {
    if (!persona) router.push("/onboarding");
  }, [persona, router]);

  if (!persona) return null;

  const total = cartTotal(cart);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const co2 = cartCO2(cart);

  // Personalized recommendations: products not in cart
  const inCartIds = new Set(cart.map((c) => c.product.id));
  const recommendations = products
    .filter((p) => !inCartIds.has(p.id) && persona.preferredCategories.includes(p.category))
    .slice(0, 8);

  // Popular in region: random products
  const popular = products.filter((p) => !inCartIds.has(p.id)).slice(5, 13);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <DemoBanner />

      {/* Header */}
      <div className="bg-white px-5 pt-5 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{persona.avatar}</span>
              <div>
                <h1 className="text-lg font-black text-gray-900 leading-tight">
                  Hallo, {persona.name.split(" ")[0]}!
                </h1>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <MapPin size={11} />
                  <span>Hub Viernheim · Heute frisch</span>
                </div>
              </div>
            </div>
          </div>
          <button className="w-9 h-9 bg-gray-100 rounded-2xl flex items-center justify-center relative">
            <Bell size={18} className="text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E1141C] rounded-full" />
          </button>
        </div>

        {/* Delivery slot */}
        <div className="flex items-center gap-2 bg-[#FFF0F0] rounded-2xl px-3 py-2.5">
          <Zap size={14} className="text-[#E1141C]" />
          <p className="text-xs font-semibold text-gray-700">
            Nächste Lieferung: <span className="text-[#E1141C]">{persona.deliverySlot}</span>
          </p>
          <span className="ml-auto text-xs text-gray-400">→ Slot ändern</span>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* CO2 Card */}
        <CO2ProgressCard />

        {/* Cart CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/cart")}
          className="w-full btn-picnic py-4 px-5 flex items-center gap-4 text-left rounded-3xl"
        >
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <ShoppingCart size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/80 text-xs font-medium">Dein Wochenkorb ist bereit</p>
            <p className="text-white font-black text-lg leading-tight">
              {totalItems} Artikel · {formatPrice(total)}
            </p>
            <p className="text-white/70 text-xs mt-0.5">
              ~{co2.toFixed(1)} kg CO₂ · Tippe zum Prüfen
            </p>
          </div>
          <ChevronRight size={20} className="text-white/70 flex-shrink-0" />
        </motion.button>

        {/* Personalized recommendations */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-base font-black text-gray-900">Für dich</h2>
            <span className="text-xs text-[#E1141C] font-semibold">Alle sehen</span>
          </div>
          <div className="flex gap-3 overflow-x-auto scroll-x pb-2 -mx-5 px-5">
            {recommendations.map((product, i) => {
              const prevOrder = persona.orderHistory[0]?.items.find((oi) => oi.productId === product.id);
              const reason = prevOrder
                ? `Letztes Mal auch bestellt`
                : `Passt zu deinem ${product.category}`;
              return (
                <ProductCard key={product.id} product={product} reason={reason} />
              );
            })}
          </div>
        </section>

        {/* Popular in region */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-base font-black text-gray-900">
              Beliebt in deiner Region
            </h2>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Bei ähnlichen Haushalten diese Woche
          </p>
          <div className="flex gap-3 overflow-x-auto scroll-x pb-2 -mx-5 px-5">
            {popular.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </section>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-3 text-center shadow-card">
            <p className="text-xl font-black text-[#E1141C]">{persona.orderHistory.length}</p>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">Bestellungen</p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-card">
            <p className="text-xl font-black text-emerald-600">{persona.co2SavedTotal}</p>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">kg CO₂ gespart</p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-card">
            <p className="text-xl font-black text-gray-900">
              {formatPrice(persona.orderHistory.reduce((s, o) => s + o.total, 0) / persona.orderHistory.length)}
            </p>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">Ø Bestellung</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
