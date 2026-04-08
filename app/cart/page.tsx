"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Minus,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Leaf,
  Package,
  Users,
  ChefHat,
  Zap,
} from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { BottomNav } from "@/components/shared/BottomNav";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { bundles, mealSuggestions, popularProducts } from "@/lib/mock/suggestions";
import { cn, formatPrice, cartTotal, cartCO2, co2ScoreColor, daysRemainingColor } from "@/lib/utils";
import { CartItem, Product } from "@/types";

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  icon,
  title,
  subtitle,
  badge,
  defaultOpen = true,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-card">
      <button
        className="w-full flex items-center gap-3 px-4 py-4 tap-active"
        onClick={() => setOpen(!open)}
      >
        <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-sm">{title}</span>
            {badge !== undefined && badge > 0 && (
              <span className="bg-[#E1141C] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {open ? (
          <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-50">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Cart Item Row ────────────────────────────────────────────────────────────
function CartItemRow({ item, isShimmering }: { item: CartItem; isShimmering: boolean }) {
  const { updateQuantity, removeFromCart } = useStore();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0",
        isShimmering && "shimmer"
      )}
    >
      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
        {item.product.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
            {item.product.name}
          </p>
          <span className={cn("text-[9px] font-bold px-1 rounded-sm text-white flex-shrink-0", co2ScoreColor(item.product.co2Score))}>
            {item.product.co2Score}
          </span>
        </div>
        <p className="text-xs text-gray-400">{item.product.brand} · {item.product.unit}</p>
        {item.addedReason && (
          <p className="text-[10px] text-[#E1141C] mt-0.5 leading-tight italic">{item.addedReason}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => updateQuantity(item.product.id, -1)}
            className="w-6 h-6 flex items-center justify-center rounded-lg bg-white shadow-sm text-gray-600 active:scale-90"
          >
            {item.quantity === 1 ? (
              <Trash2 size={11} className="text-red-400" />
            ) : (
              <Minus size={11} />
            )}
          </button>
          <span className="text-sm font-bold text-gray-900 w-5 text-center">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.product.id, 1)}
            className="w-6 h-6 flex items-center justify-center rounded-lg bg-white shadow-sm text-gray-600 active:scale-90"
          >
            <Plus size={11} />
          </button>
        </div>
        <span className="text-sm font-bold text-gray-900 w-12 text-right">
          {formatPrice(item.product.price * item.quantity)}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Low Stock Item ───────────────────────────────────────────────────────────
function LowStockItem({ item }: { item: import("@/types").PantryItem }) {
  const addToCart = useStore((s) => s.addToCart);
  const cart = useStore((s) => s.cart);
  const inCart = cart.find((c) => c.product.id === item.product.id);

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
        {item.product.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{item.product.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full", daysRemainingColor(item.daysRemaining))}
              style={{ width: `${Math.min(100, (item.daysRemaining / 7) * 100)}%` }}
            />
          </div>
          <span className={cn(
            "text-[10px] font-semibold flex-shrink-0",
            item.daysRemaining <= 1 ? "text-red-500" : item.daysRemaining <= 3 ? "text-orange-500" : "text-yellow-600"
          )}>
            ~{item.daysRemaining} {item.daysRemaining === 1 ? "Tag" : "Tage"}
          </span>
        </div>
      </div>
      <button
        onClick={() => addToCart({ product: item.product, quantity: 1, addedReason: "Nachbestellt – fast leer" })}
        disabled={!!inCart}
        className={cn(
          "px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all",
          inCart
            ? "bg-emerald-100 text-emerald-600"
            : "bg-[#E1141C] text-white active:scale-95"
        )}
      >
        {inCart ? "✓ Drin" : "+ Hinzufügen"}
      </button>
    </div>
  );
}

// ─── Bundle Card ──────────────────────────────────────────────────────────────
function BundleCard({ bundle }: { bundle: import("@/types").Bundle }) {
  const addToCart = useStore((s) => s.addToCart);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    bundle.items.forEach(({ product, quantity }) => {
      addToCart({ product, quantity, addedReason: `Aus Paket "${bundle.name}"` });
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex-shrink-0 w-56 bg-gray-50 rounded-2xl p-3.5">
      <p className="text-sm font-bold text-gray-900 mb-0.5">{bundle.name}</p>
      <p className="text-xs text-gray-500 mb-2">{bundle.description}</p>
      <div className="flex gap-1 mb-2.5 flex-wrap">
        {bundle.items.slice(0, 4).map(({ product }) => (
          <span key={product.id} className="text-lg">{product.emoji}</span>
        ))}
        {bundle.items.length > 4 && (
          <span className="text-xs text-gray-400 self-center">+{bundle.items.length - 4}</span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-black text-gray-900">{formatPrice(bundle.totalPrice)}</span>
          {bundle.savings && (
            <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-1.5 rounded-full">
              -{formatPrice(bundle.savings)}
            </span>
          )}
        </div>
        <button
          onClick={handleAdd}
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
            added
              ? "bg-emerald-500 text-white"
              : "bg-[#E1141C] text-white active:scale-95"
          )}
        >
          {added ? "✓ Hinzugefügt" : "Komplett hinzufügen"}
        </button>
      </div>
    </div>
  );
}

// ─── Popular Section ──────────────────────────────────────────────────────────
function PopularSection({
  items,
  matchTags,
}: {
  items: { product: Product; percentage: number }[];
  matchTags: string;
}) {
  const addToCart = useStore((s) => s.addToCart);
  const cart = useStore((s) => s.cart);

  return (
    <Section
      icon={<Users size={16} className="text-blue-500" />}
      title="Beliebt bei ähnlichen Haushalten"
      subtitle="Andere wie du kaufen das regelmäßig"
    >
      <div className="flex gap-1.5 flex-wrap px-4 pt-3 pb-2">
        {matchTags.split(" · ").map((tag) => (
          <span key={tag} className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>
      <div className="space-y-0">
        {items.map(({ product, percentage }) => {
          const inCart = cart.find((c) => c.product.id === product.id);
          return (
            <div key={product.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
              <span className="text-2xl">{product.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                <p className="text-[10px] text-blue-600 font-medium mt-0.5">
                  {percentage}% ähnlicher Haushalte kaufen das wöchentlich
                </p>
                <div className="h-1 bg-blue-100 rounded-full mt-1 overflow-hidden w-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }} />
                </div>
              </div>
              <div className="flex-shrink-0 flex flex-col items-end gap-1">
                <span className="text-sm font-bold">{formatPrice(product.price)}</span>
                <button
                  onClick={() => addToCart({ product, quantity: 1, addedReason: `${percentage}% kaufen das wöchentlich` })}
                  disabled={!!inCart}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all",
                    inCart ? "bg-emerald-100 text-emerald-700" : "bg-gray-900 text-white active:scale-95"
                  )}
                >
                  {inCart ? "✓ Drin" : "+ Add"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// ─── Meal Card ────────────────────────────────────────────────────────────────
function MealCard({ meal }: { meal: import("@/types").MealSuggestion }) {
  const addToCart = useStore((s) => s.addToCart);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    meal.ingredients.forEach((product) => {
      addToCart({ product, quantity: 1, addedReason: `Für Rezept: ${meal.name}` });
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex-shrink-0 w-52 bg-gray-50 rounded-2xl p-3.5">
      <div className="flex items-start gap-2 mb-2">
        <span className="text-3xl">{meal.emoji}</span>
        <div>
          <p className="text-sm font-bold text-gray-900">{meal.name}</p>
          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white", co2ScoreColor(meal.co2Score))}>
            CO₂ {meal.co2Score}
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mb-2 italic">{meal.reason}</p>
      <div className="flex gap-1 mb-3">
        {meal.ingredients.map((p) => (
          <span key={p.id} className="text-base">{p.emoji}</span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600">{formatPrice(meal.totalPrice)}</span>
        <button
          onClick={handleAdd}
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
            added
              ? "bg-emerald-500 text-white"
              : "bg-gray-900 text-white active:scale-95"
          )}
        >
          {added ? "✓ Drin!" : "Zutaten rein"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Cart Page ───────────────────────────────────────────────────────────
export default function CartPage() {
  const router = useRouter();
  const persona = useStore((s) => s.currentPersona);
  const cart = useStore((s) => s.cart);
  const pantry = useStore((s) => s.pantry);
  const isRegenerating = useStore((s) => s.isRegenerating);
  const regenerateCart = useStore((s) => s.regenerateCart);

  const [bundleTab, setBundleTab] = useState<"reorder" | "topup">("reorder");

  useEffect(() => {
    if (!persona) router.push("/onboarding");
  }, [persona, router]);

  if (!persona) return null;

  const total = cartTotal(cart);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const co2 = cartCO2(cart);

  const lowStockItems = pantry.filter((p) => p.daysRemaining <= 3);
  const notInCart = lowStockItems.filter((p) => !cart.find((c) => c.product.id === p.product.id));

  const personaBundles = bundles[persona.id] ?? [];
  const personaMeals = mealSuggestions[persona.id] ?? [];
  const personaPopular = popularProducts[persona.id] ?? [];

  const reorderBundles = personaBundles.filter((b) => b.category === "reorder");
  const topupBundles = personaBundles.filter((b) => b.category === "topup");
  const activeBundles = bundleTab === "reorder" ? reorderBundles : topupBundles;

  const matchTags = {
    schmidt: `${persona.household.size} Personen · Familie · ~${persona.household.weeklyBudget} €/Woche`,
    lena: `${persona.household.size} Person · Flexitarisch · ~${persona.household.weeklyBudget} €/Woche`,
    wg: `${persona.household.size} Personen · Vegetarisch · ~${persona.household.weeklyBudget} €/Woche`,
  }[persona.id] ?? "";

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <DemoBanner />

      {/* Header */}
      <div className="bg-white px-5 pt-5 pb-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-black text-gray-900">Warenkorb</h1>
          <div className="text-right">
            <p className="text-lg font-black text-gray-900">{formatPrice(total)}</p>
            <p className="text-xs text-gray-400">{totalItems} Artikel · ~{co2.toFixed(1)} kg CO₂</p>
          </div>
        </div>
        <p className="text-xs text-gray-400">
          Lieferung: <span className="font-semibold text-gray-700">{persona.deliverySlot}</span>
        </p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* ─── Section 3a: Current Cart ─── */}
        <Section
          icon={<ShoppingBag size={16} className="text-gray-600" />}
          title="Aktueller Warenkorb"
          badge={totalItems}
          subtitle={`${formatPrice(total)} · ~${co2.toFixed(1)} kg CO₂`}
        >
          <AnimatePresence>
            {isRegenerating ? (
              // Shimmer loading state
              <div className="py-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
                    <div className="w-12 h-12 rounded-xl shimmer" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 rounded shimmer w-3/4" />
                      <div className="h-2 rounded shimmer w-1/2" />
                    </div>
                    <div className="w-20 h-8 rounded-xl shimmer" />
                  </div>
                ))}
                <div className="px-4 py-3 text-center">
                  <p className="text-xs text-[#E1141C] font-semibold flex items-center justify-center gap-1.5">
                    <Sparkles size={13} className="animate-spin" />
                    KI optimiert deinen Warenkorb…
                  </p>
                </div>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <CartItemRow key={item.product.id} item={item} isShimmering={false} />
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Regenerate button */}
          <div className="px-4 pb-4 pt-2">
            <button
              onClick={regenerateCart}
              disabled={isRegenerating}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#E1141C] rounded-2xl text-[#E1141C] text-sm font-bold tap-active disabled:opacity-60"
            >
              <Sparkles size={15} className={cn(isRegenerating && "animate-spin")} />
              {isRegenerating ? "Warenkorb wird neu generiert…" : "Warenkorb neu generieren"}
            </button>
          </div>
        </Section>

        {/* ─── Section 3b: Low Stock ─── */}
        {notInCart.length > 0 && (
          <Section
            icon={<Zap size={16} className="text-orange-500" />}
            title="Knapper Bestand – Zeit zum Nachbestellen"
            badge={notInCart.length}
            subtitle="Bald leer – jetzt auffüllen"
            defaultOpen={true}
          >
            {notInCart.map((item) => (
              <LowStockItem key={item.product.id} item={item} />
            ))}
          </Section>
        )}

        {/* Also show items already in cart from pantry */}
        {lowStockItems.length > notInCart.length && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-2xl">
            <span className="text-emerald-600 text-sm">✓</span>
            <p className="text-xs text-emerald-700 font-medium">
              {lowStockItems.length - notInCart.length} bald-leere Artikel bereits im Warenkorb
            </p>
          </div>
        )}

        {/* ─── Section 3c: Pakete ─── */}
        <Section
          icon={<Package size={16} className="text-purple-500" />}
          title="Pakete"
          subtitle="Bewährte Bündel & Auffrisch-Pakete"
        >
          {/* Tabs */}
          <div className="flex gap-2 px-4 pt-3 pb-2">
            {(["reorder", "topup"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setBundleTab(tab)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                  bundleTab === tab
                    ? "bg-[#E1141C] text-white"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {tab === "reorder" ? "🔄 Nochmal bestellen" : "➕ Kategorien auffrischen"}
              </button>
            ))}
          </div>

          <div className="flex gap-3 overflow-x-auto scroll-x px-4 pb-4 pt-1">
            {activeBundles.map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        </Section>

        {/* ─── Section 3d: Beliebt bei ähnlichen Haushalten ─── */}
        <PopularSection
          items={personaPopular}
          matchTags={matchTags}
        />

        {/* ─── Section 3e: Ma(h)l was anderes ─── */}
        <Section
          icon={<ChefHat size={16} className="text-rose-500" />}
          title="Ma(h)l was anderes"
          subtitle="Neue Inspiration – passend zu dir"
        >
          <div className="flex gap-3 overflow-x-auto scroll-x px-4 py-4">
            {personaMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        </Section>

        {/* CO2 summary */}
        <div className="bg-emerald-50 rounded-2xl px-4 py-3 flex items-center gap-3">
          <Leaf size={16} className="text-emerald-600 flex-shrink-0" />
          <p className="text-xs text-emerald-800">
            Mit diesem Warenkorb sparst du ca. <strong>{(co2 * 0.3).toFixed(1)} kg CO₂</strong> vs. Supermarkt
          </p>
        </div>

        {/* Checkout CTA */}
        <button className="w-full btn-picnic py-4 text-base flex items-center justify-center gap-2">
          <ShoppingBag size={18} />
          Bestellen · {formatPrice(total)}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
