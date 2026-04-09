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
    ChefHat,
    Zap,
} from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { BottomNav } from "@/components/shared/BottomNav";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { PackagesSection } from "@/components/shared/PackagesSection";
import { mealSuggestions } from "@/lib/mock/suggestions";
import {
    cn,
    formatPrice,
    cartTotal,
    co2ScoreColor,
    daysRemainingColor,
} from "@/lib/utils";
import { CartItem } from "@/types";

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
                        <span className="font-bold text-gray-900 text-sm">
                            {title}
                        </span>
                        {badge !== undefined && badge > 0 && (
                            <span className="bg-[#E1171E] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {badge}
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-xs text-gray-500 mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>
                {open ? (
                    <ChevronUp
                        size={16}
                        className="text-gray-400 flex-shrink-0"
                    />
                ) : (
                    <ChevronDown
                        size={16}
                        className="text-gray-400 flex-shrink-0"
                    />
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
                        <div className="border-t border-gray-50">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Cart Item Row ────────────────────────────────────────────────────────────
function CartItemRow({
    item,
    isShimmering,
}: {
    item: CartItem;
    isShimmering: boolean;
}) {
    const { updateQuantity } = useStore();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={cn(
                "flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0",
                isShimmering && "shimmer",
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
                    <span
                        className={cn(
                            "text-[9px] font-bold px-1 rounded-sm text-white flex-shrink-0",
                            co2ScoreColor(item.product.co2Score),
                        )}
                    >
                        {item.product.co2Score}
                    </span>
                </div>
                <p className="text-xs text-gray-400">
                    {item.product.brand} · {item.product.unit}
                </p>
                {item.addedReason && (
                    <p className="text-[10px] text-[#E1171E] mt-0.5 leading-tight italic">
                        {item.addedReason}
                    </p>
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
                    <span className="text-sm font-bold text-gray-900 w-5 text-center">
                        {item.quantity}
                    </span>
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
                <p className="text-sm font-semibold text-gray-900 truncate">
                    {item.product.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full",
                                daysRemainingColor(item.daysRemaining),
                            )}
                            style={{
                                width: `${Math.min(100, (item.daysRemaining / 7) * 100)}%`,
                            }}
                        />
                    </div>
                    <span
                        className={cn(
                            "text-[10px] font-semibold flex-shrink-0",
                            item.daysRemaining <= 1
                                ? "text-red-500"
                                : item.daysRemaining <= 3
                                  ? "text-orange-500"
                                  : "text-yellow-600",
                        )}
                    >
                        ~{item.daysRemaining}{" "}
                        {item.daysRemaining === 1 ? "day" : "days"}
                    </span>
                </div>
            </div>
            <button
                onClick={() =>
                    addToCart({
                        product: item.product,
                        quantity: 1,
                        addedReason: "Restocked – almost empty",
                    })
                }
                disabled={!!inCart}
                className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all",
                    inCart
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-[#E1171E] text-white active:scale-95",
                )}
            >
                {inCart ? "✓ Added" : "+ Add"}
            </button>
        </div>
    );
}

// ─── Meal Card ────────────────────────────────────────────────────────────────
function MealCard({ meal }: { meal: import("@/types").MealSuggestion }) {
    const addToCart = useStore((s) => s.addToCart);
    const [added, setAdded] = useState(false);

    const handleAdd = () => {
        meal.ingredients.forEach((product) => {
            addToCart({
                product,
                quantity: 1,
                addedReason: `For recipe: ${meal.name}`,
            });
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="flex-shrink-0 w-52 bg-gray-50 rounded-2xl p-3.5">
            <div className="flex items-start gap-2 mb-2">
                <span className="text-3xl">{meal.emoji}</span>
                <div>
                    <p className="text-sm font-bold text-gray-900">
                        {meal.name}
                    </p>
                    <span
                        className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white",
                            co2ScoreColor(meal.co2Score),
                        )}
                    >
                        CO₂ {meal.co2Score}
                    </span>
                </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-2 italic">
                {meal.reason}
            </p>
            <div className="flex gap-1 mb-3">
                {meal.ingredients.map((p) => (
                    <span key={p.id} className="text-base">
                        {p.emoji}
                    </span>
                ))}
            </div>
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">
                    {formatPrice(meal.totalPrice)}
                </span>
                <button
                    onClick={handleAdd}
                    className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                        added
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-900 text-white active:scale-95",
                    )}
                >
                    {added ? "✓ Added!" : "Add ingredients"}
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
    const co2PerDelivery = useStore((s) => s.co2PerDelivery);
    const fetchCo2Distance = useStore((s) => s.fetchCo2Distance);
    const checkout = useStore((s) => s.checkout);

    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutDone, setCheckoutDone] = useState(false);

    useEffect(() => {
        if (!persona) router.push("/onboarding");
    }, [persona, router]);

    useEffect(() => {
        fetchCo2Distance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        try {
            await checkout();
            setCheckoutDone(true);
            setTimeout(() => router.push("/dashboard"), 2000);
        } catch {
            setIsCheckingOut(false);
        }
    };

    if (!persona) return null;

    const total = cartTotal(cart);
    const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

    const lowStockItems = pantry.filter((p) => p.daysRemaining <= 3);
    const notInCart = lowStockItems.filter(
        (p) => !cart.find((c) => c.product.id === p.product.id),
    );

    const personaMeals = mealSuggestions[persona.id] ?? [];

    return (
        <div className="min-h-screen bg-[#F8F5F2] pb-24">
            <DemoBanner />

            {/* Header */}
            <div
                className="bg-white px-5 pt-5 pb-4 sticky top-0 z-30"
                style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.06)" }}
            >
                <div className="flex items-center justify-between mb-1">
                    <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight">
                        Cart
                    </h1>
                    <div className="text-right">
                        <p className="text-lg font-black text-gray-900">
                            {formatPrice(total)}
                        </p>
                        <p className="text-xs text-gray-400">
                            {totalItems} items ·{" "}
                            {co2PerDelivery > 0
                                ? `~${co2PerDelivery.toFixed(2)} kg CO₂ saved`
                                : "calculating CO₂…"}
                        </p>
                    </div>
                </div>
                <p className="text-xs text-gray-400">
                    Delivery:{" "}
                    <span className="font-semibold text-gray-700">
                        {persona.deliverySlot}
                    </span>
                </p>
            </div>

            <div className="px-4 py-4 space-y-4">
                {/* ─── Section 3a: Current Cart ─── */}
                <Section
                    icon={<ShoppingBag size={16} className="text-gray-600" />}
                    title="Current Cart"
                    badge={totalItems}
                    subtitle={`${formatPrice(total)} · ${co2PerDelivery > 0 ? `~${co2PerDelivery.toFixed(2)} kg CO₂ saved` : "calculating CO₂…"}`}
                >
                    <AnimatePresence>
                        {isRegenerating ? (
                            // Shimmer loading state
                            <div className="py-2">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 px-4 py-3 border-b border-gray-50"
                                    >
                                        <div className="w-12 h-12 rounded-xl shimmer" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 rounded shimmer w-3/4" />
                                            <div className="h-2 rounded shimmer w-1/2" />
                                        </div>
                                        <div className="w-20 h-8 rounded-xl shimmer" />
                                    </div>
                                ))}
                                <div className="px-4 py-3 text-center">
                                    <p className="text-xs text-[#E1171E] font-semibold flex items-center justify-center gap-1.5">
                                        <Sparkles
                                            size={13}
                                            className="animate-spin"
                                        />
                                        AI is optimizing your cart…
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {cart.map((item) => (
                                    <CartItemRow
                                        key={item.product.id}
                                        item={item}
                                        isShimmering={false}
                                    />
                                ))}
                            </>
                        )}
                    </AnimatePresence>

                    {/* Regenerate button */}
                    <div className="px-4 pb-4 pt-2">
                        <button
                            onClick={regenerateCart}
                            disabled={isRegenerating}
                            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#E1171E] rounded-2xl text-[#E1171E] text-sm font-bold tap-active disabled:opacity-60"
                        >
                            <Sparkles
                                size={15}
                                className={cn(isRegenerating && "animate-spin")}
                            />
                            {isRegenerating
                                ? "Regenerating cart…"
                                : "Regenerate cart"}
                        </button>
                    </div>
                </Section>

                {/* ─── Section 3b: Low Stock ─── */}
                {notInCart.length > 0 && (
                    <Section
                        icon={<Zap size={16} className="text-orange-500" />}
                        title="Low Stock – Time to Reorder"
                        badge={notInCart.length}
                        subtitle="Running low – restock now"
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
                            {lowStockItems.length - notInCart.length} low-stock
                            items already in cart
                        </p>
                    </div>
                )}

                {/* ─── Packages ─── */}
                <PackagesSection />

                {/* ─── Section 3e: Try something new ─── */}
                <Section
                    icon={<ChefHat size={16} className="text-rose-500" />}
                    title="Try Something New"
                    subtitle="Fresh inspiration – tailored to you"
                >
                    <div className="flex gap-3 overflow-x-auto scroll-x px-4 py-4">
                        {personaMeals.map((meal) => (
                            <MealCard key={meal.id} meal={meal} />
                        ))}
                    </div>
                </Section>

                {/* CO2 summary */}
                <div className="bg-emerald-50 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <Leaf
                        size={16}
                        className="text-emerald-600 flex-shrink-0"
                    />
                    <div>
                        <p className="text-xs text-emerald-800">
                            With this order you save approx.{" "}
                            <strong>
                                {co2PerDelivery > 0
                                    ? `${co2PerDelivery.toFixed(2)} kg CO₂`
                                    : "calculating…"}
                            </strong>{" "}
                            vs. driving to the supermarket
                        </p>
                        {co2PerDelivery > 0 && (
                            <p className="text-[10px] text-emerald-600 mt-0.5">
                                ≈ {Math.round(co2PerDelivery * 6.3)} km of
                                driving avoided 🚗
                            </p>
                        )}
                    </div>
                </div>

                {/* Checkout CTA */}
                {checkoutDone ? (
                    <div className="w-full bg-emerald-500 rounded-2xl py-4 text-[16px] font-semibold text-white flex items-center justify-center gap-2">
                        <Leaf size={18} />
                        Order placed! +{co2PerDelivery.toFixed(2)} kg CO₂
                        saved 🎉
                    </div>
                ) : (
                    <button
                        onClick={handleCheckout}
                        disabled={isCheckingOut || cart.length === 0}
                        className="w-full btn-picnic py-4 text-[16px] font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {isCheckingOut ? (
                            <>
                                <Sparkles
                                    size={16}
                                    className="animate-spin"
                                />
                                Placing order…
                            </>
                        ) : (
                            `Choose delivery slot · ${formatPrice(total)}`
                        )}
                    </button>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
