"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store/useStore";
import { BottomNav } from "@/components/shared/BottomNav";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { getPersonas, PersonaFull } from "@/lib/api";
import { cn, formatPrice } from "@/lib/utils";
import { LogOut, ChevronRight, Settings, Star, ShoppingBag } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { currentPersona, initPersona, setCurrentPersona } = useStore();
  const [personas, setPersonas] = useState<PersonaFull[]>([]);

  useEffect(() => {
    if (!currentPersona) router.push("/onboarding");
  }, [currentPersona, router]);

  useEffect(() => {
    getPersonas().then((fresh) => {
      setPersonas(fresh);
      // Refresh current persona's order history and CO₂ stats from the DB
      const updated = fresh.find((p) => p.id === currentPersona?.id);
      if (updated) setCurrentPersona(updated);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!currentPersona) return null;

  const totalSpent = currentPersona.orderHistory.reduce((s, o) => s + o.total, 0);
  const totalCO2 = currentPersona.orderHistory.reduce((s, o) => s + o.co2Saved, 0);

  return (
    <div className="min-h-screen bg-[#F8F5F2] pb-24">
      <DemoBanner />

      {/* Hero */}
      <div className="bg-[#E1171E] px-5 pt-6 pb-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl">
            {currentPersona.avatar}
          </div>
          <div>
            <h1 className="text-[22px] font-semibold text-white tracking-tight">{currentPersona.name}</h1>
            <p className="text-white/70 text-[13px]">{currentPersona.tagline}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Stats */}
        <div className="bg-white rounded-3xl p-4 shadow-card grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-xl font-black text-gray-900">{currentPersona.orderHistory.length}</p>
            <p className="text-[10px] text-gray-500 font-medium">Bestellungen</p>
          </div>
          <div className="text-center border-x border-gray-100">
            <p className="text-xl font-black text-[#E1171E]">{formatPrice(totalSpent)}</p>
            <p className="text-[10px] text-gray-500 font-medium">Ausgegeben</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-emerald-600">{totalCO2.toFixed(1)} kg</p>
            <p className="text-[10px] text-gray-500 font-medium">CO₂ gespart</p>
          </div>
        </div>

        {/* Order history preview */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-card">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={14} className="text-gray-500" />
              <span className="text-sm font-bold text-gray-900">Letzte Bestellungen</span>
            </div>
            <span className="text-xs text-[#E1171E] font-semibold">Alle anzeigen</span>
          </div>
          {currentPersona.orderHistory.slice(0, 3).map((order) => (
            <div key={order.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(order.date).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" })}
                </p>
                <p className="text-xs text-gray-400">{order.items.length} Artikel</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</p>
                <p className="text-[10px] text-emerald-600">+{order.co2Saved} kg CO₂ gespart</p>
              </div>
            </div>
          ))}
        </div>

        {/* Persona switcher */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-card">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-sm font-bold text-gray-900">Profil wechseln</p>
            <p className="text-xs text-gray-400">Demo-Feature: andere Personas testen</p>
          </div>
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => { initPersona(p); router.push("/dashboard"); }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 tap-active",
                currentPersona.id === p.id && "bg-[#FFF0F0]"
              )}
            >
              <span className="text-2xl">{p.avatar}</span>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                <p className="text-xs text-gray-400">{p.tagline}</p>
              </div>
              {currentPersona.id === p.id ? (
                <Star size={14} className="text-[#E1171E] fill-[#E1171E]" />
              ) : (
                <ChevronRight size={14} className="text-gray-300" />
              )}
            </button>
          ))}
        </div>

        {/* Settings rows */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-card">
          {[
            { icon: Settings, label: "Einstellungen" },
            { icon: LogOut, label: "Abmelden", danger: true },
          ].map(({ icon: Icon, label, danger }) => (
            <button
              key={label}
              onClick={() => { if (danger) router.push("/onboarding"); }}
              className="w-full flex items-center gap-3 px-4 py-4 border-b border-gray-50 last:border-0 tap-active"
            >
              <Icon size={18} className={danger ? "text-[#E1171E]" : "text-gray-500"} />
              <span className={cn("text-sm font-medium flex-1 text-left", danger ? "text-[#E1171E]" : "text-gray-700")}>
                {label}
              </span>
              <ChevronRight size={14} className="text-gray-300" />
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
