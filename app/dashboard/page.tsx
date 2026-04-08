"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
    ShoppingCart,
    Leaf,
    ChevronRight,
    Bell,
    MapPin,
    TrendingUp,
    Zap,
    Users,
    Package,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { BottomNav } from "@/components/shared/BottomNav";
import { PicnicLogo } from "@/components/shared/PicnicLogo";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { ProductCard } from "@/components/shared/ProductCard";
import { products } from "@/lib/mock/products";
import { cn, formatPrice, cartTotal, cartCO2 } from "@/lib/utils";
import { Product } from "@/types";
import { mealSuggestions, popularProducts } from "@/lib/mock/suggestions";

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
                            <span className="bg-[#E1141C] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
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

// One comparison entry: a label + emoji, computed from kg saved
const CO2_COMPARISONS: Array<{
    compute: (kg: number) => string;
    emoji: string;
    suffix: string;
}> = [
    {
        compute: (kg) => `${Math.round(kg / 0.15)} km`,
        emoji: "🚗",
        suffix: "of car driving avoided",
    },
    {
        compute: (kg) => `${Math.round(kg / 0.21)}`,
        emoji: "☕",
        suffix: "cups of coffee equivalent",
    },
    {
        compute: (kg) => `${Math.round(kg / 0.008).toLocaleString()}`,
        emoji: "📱",
        suffix: "smartphone charges equivalent",
    },
    {
        compute: (kg) => `${Math.round(kg / 0.036)}`,
        emoji: "📺",
        suffix: "hours of video streaming",
    },
    {
        compute: (kg) => `${(kg / 2.5).toFixed(1)}`,
        emoji: "🍔",
        suffix: "beef burgers worth of CO₂",
    },
    {
        compute: (kg) => `${Math.round(kg / 0.0576)}`,
        emoji: "🌳",
        suffix: "days of tree carbon absorption",
    },
];

function CO2ProgressCard() {
    const {
        co2SavedThisWeek,
        co2SavedThisMonth,
        co2MonthlyGoal,
        co2SavedTotal,
    } = useStore();
    const [animated, setAnimated] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    // Pick a random comparison once per session mount
    const [compIdx] = useState(() =>
        Math.floor(Math.random() * CO2_COMPARISONS.length),
    );
    const pct = Math.min(100, (co2SavedThisMonth / co2MonthlyGoal) * 100);
    const activeComp = CO2_COMPARISONS[compIdx];
    const compValue = activeComp.compute(co2SavedThisMonth);

    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 400);
        return () => clearTimeout(t);
    }, []);

    return (
        <>
            <button
                onClick={() => setShowDetail(true)}
                className="w-full rounded-3xl p-5 text-left relative overflow-hidden tap-active"
                style={{
                    background:
                        "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
                }}
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
                                <p className="text-emerald-200 text-xs font-medium">
                                    CO₂ Account
                                </p>
                                <p className="text-white text-xs opacity-60">
                                    This Month
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-white/60 text-[10px]">
                                Total saved
                            </p>
                            <p className="text-emerald-300 text-sm font-bold">
                                {co2SavedTotal} kg
                            </p>
                        </div>
                    </div>

                    {/* Main metric */}
                    <div className="mb-3">
                        <div className="flex items-baseline gap-1">
                            <span className="text-white text-3xl font-black">
                                {co2SavedThisMonth.toFixed(1)}
                            </span>
                            <span className="text-emerald-300 text-base font-semibold">
                                kg CO₂
                            </span>
                            <span className="text-white/50 text-xs ml-1">
                                / {co2MonthlyGoal} kg goal
                            </span>
                        </div>
                        <p className="text-emerald-300 text-xs mt-0.5">
                            {activeComp.emoji} ≈{" "}
                            <strong className="text-white">{compValue}</strong>{" "}
                            {activeComp.suffix}
                        </p>
                    </div>

                    {/* Progress bar */}
                    <div className="bg-white/20 rounded-full h-2 mb-3 overflow-hidden">
                        <motion.div
                            className="h-full bg-emerald-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: animated ? `${pct}%` : 0 }}
                            transition={{
                                duration: 1.2,
                                delay: 0.2,
                                ease: "easeOut",
                            }}
                        />
                    </div>

                    {/* This week */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <TrendingUp
                                size={12}
                                className="text-emerald-300"
                            />
                            <span className="text-emerald-200 text-xs">
                                This week:{" "}
                                <strong className="text-white">
                                    +{co2SavedThisWeek} kg
                                </strong>
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
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300,
                        }}
                        className="w-full max-w-[430px] mx-auto bg-white rounded-t-3xl p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
                        <h2 className="text-[20px] font-semibold mb-4 tracking-tight">
                            My CO₂ History
                        </h2>

                        {[
                            {
                                week: "This week",
                                kg: co2SavedThisWeek,
                                fill: 100,
                            },
                            {
                                week: "Last week",
                                kg: co2SavedThisWeek * 0.85,
                                fill: 85,
                            },
                            {
                                week: "2 weeks ago",
                                kg: co2SavedThisWeek * 0.78,
                                fill: 78,
                            },
                            {
                                week: "3 weeks ago",
                                kg: co2SavedThisWeek * 0.92,
                                fill: 92,
                            },
                        ].map((row) => (
                            <div key={row.week} className="mb-3">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600 font-medium">
                                        {row.week}
                                    </span>
                                    <span className="font-bold text-emerald-700">
                                        {row.kg.toFixed(2)} kg
                                    </span>
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
                            You save approx.{" "}
                            {Math.round(co2SavedThisWeek * 6.3)} km of driving
                            per week 🌍
                        </p>

                        <button
                            onClick={() => setShowDetail(false)}
                            className="w-full mt-4 py-3.5 bg-[#EFEEE9] rounded-full text-[15px] font-semibold text-[#3D3D3D]"
                        >
                            Close
                        </button>
                    </motion.div>
                </div>
            )}
        </>
    );
}
// ─── Bundle Card ──────────────────────────────────────────────────────────────
function BundleCard({ bundle }: { bundle: import("@/types").Bundle }) {
    const addToCart = useStore((s) => s.addToCart);
    const [added, setAdded] = useState(false);

    const handleAdd = () => {
        bundle.items.forEach(({ product, quantity }) => {
            addToCart({
                product,
                quantity,
                addedReason: `From bundle "${bundle.name}"`,
            });
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="flex-shrink-0 w-56 bg-gray-50 rounded-2xl p-3.5">
            <p className="text-sm font-bold text-gray-900 mb-0.5">
                {bundle.name}
            </p>
            <p className="text-xs text-gray-500 mb-2">{bundle.description}</p>
            <div className="flex gap-1 mb-2.5 flex-wrap">
                {bundle.items.slice(0, 4).map(({ product }) => (
                    <span key={product.id} className="text-lg">
                        {product.emoji}
                    </span>
                ))}
                {bundle.items.length > 4 && (
                    <span className="text-xs text-gray-400 self-center">
                        +{bundle.items.length - 4}
                    </span>
                )}
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-sm font-black text-gray-900">
                        {formatPrice(bundle.totalPrice)}
                    </span>
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
                            : "bg-[#E1141C] text-white active:scale-95",
                    )}
                >
                    {added ? "✓ Added" : "Add all items"}
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
            title="Popular with similar households"
            subtitle="Others like you buy this regularly"
        >
            <div className="flex gap-1.5 flex-wrap px-4 pt-3 pb-2">
                {matchTags.split(" · ").map((tag) => (
                    <span
                        key={tag}
                        className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-1 rounded-full"
                    >
                        {tag}
                    </span>
                ))}
            </div>
            <div className="space-y-0">
                {items.map(({ product, percentage }) => {
                    const inCart = cart.find(
                        (c) => c.product.id === product.id,
                    );
                    return (
                        <div
                            key={product.id}
                            className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0"
                        >
                            <span className="text-2xl">{product.emoji}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {product.name}
                                </p>
                                <p className="text-[10px] text-blue-600 font-medium mt-0.5">
                                    {percentage}% of similar households buy this
                                    weekly
                                </p>
                                <div className="h-1 bg-blue-100 rounded-full mt-1 overflow-hidden w-full">
                                    <div
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                            <div className="flex-shrink-0 flex flex-col items-end gap-1">
                                <span className="text-sm font-bold">
                                    {formatPrice(product.price)}
                                </span>
                                <button
                                    onClick={() =>
                                        addToCart({
                                            product,
                                            quantity: 1,
                                            addedReason: `${percentage}% buy this weekly`,
                                        })
                                    }
                                    disabled={!!inCart}
                                    className={cn(
                                        "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all",
                                        inCart
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-gray-900 text-white active:scale-95",
                                    )}
                                >
                                    {inCart ? "✓ Added" : "+ Add"}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Section>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const persona = useStore((s) => s.currentPersona);
    const cart = useStore((s) => s.cart);
    const storeBundles = useStore((s) => s.bundles);
    const fetchBundles = useStore((s) => s.fetchBundles);

    const [bundleTab, setBundleTab] = useState<"reorder" | "topup">("topup");

    useEffect(() => {
        if (!persona) router.push("/onboarding");
        else fetchBundles();
    }, [persona, router]);

    if (!persona) return null;

    const total = cartTotal(cart);
    const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
    const co2 = cartCO2(cart);

    // Personalized recommendations: products not in cart
    const inCartIds = new Set(cart.map((c) => c.product.id));
    const recommendations = products
        .filter(
            (p) =>
                !inCartIds.has(p.id) &&
                persona.preferredCategories.includes(p.category),
        )
        .slice(0, 8);

    const personaPopular = popularProducts[persona.id] ?? [];

    const reorderBundles = storeBundles.filter((b) => b.category === "reorder");
    const topupBundles = storeBundles.filter((b) => b.category === "topup");
    const activeBundles =
        bundleTab === "reorder" ? reorderBundles : topupBundles;

    // Popular in region: random products
    const popular = products.filter((p) => !inCartIds.has(p.id)).slice(5, 13);

    const matchTags =
        {
            schmidt: `${persona.household.size} people · Family · ~${persona.household.weeklyBudget} €/week`,
            lena: `${persona.household.size} person · Flexitarian · ~${persona.household.weeklyBudget} €/week`,
            wg: `${persona.household.size} people · Vegetarian · ~${persona.household.weeklyBudget} €/week`,
        }[persona.id] ?? "";

    return (
        <div className="min-h-screen bg-[#F5F4F0] pb-24">
            <DemoBanner />

            {/* Header */}
            <div className="bg-white px-5 pt-5 pb-4">
                <div className="flex items-center justify-between mb-4">
                    {/* PIC NIC Logo + greeting */}
                    <div className="flex items-center gap-2.5">
                        <PicnicLogo size={36} />
                        <div>
                            <h1 className="text-[18px] font-semibold text-gray-900 leading-tight tracking-tight">
                                Hi, {persona.name.split(" ")[0]}!
                            </h1>
                            <div className="flex items-center gap-1 text-[11px] text-[#3E8B3E] font-medium">
                                <MapPin size={10} />
                                <span>Hub Viernheim · Fresh today</span>
                            </div>
                        </div>
                    </div>
                    <button className="w-9 h-9 bg-[#F5F4F0] rounded-full flex items-center justify-center relative">
                        <Bell size={18} className="text-[#6D6D6D]" />
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#E1141C] rounded-full" />
                    </button>
                </div>

                {/* Delivery slot */}
                <div className="flex items-center gap-2 bg-[#FDECEA] rounded-2xl px-3 py-2.5">
                    <Zap size={14} className="text-[#E1141C]" />
                    <p className="text-[12px] font-medium text-gray-700">
                        Next delivery:{" "}
                        <span className="text-[#E1141C] font-semibold">
                            {persona.deliverySlot}
                        </span>
                    </p>
                    <span className="ml-auto text-[11px] text-[#9B9B9B]">
                        Change →
                    </span>
                </div>
            </div>

            <div className="px-5 py-5 space-y-5">
                {/* CO2 Card */}
                <CO2ProgressCard />

                {/* Cart CTA */}
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => router.push("/cart")}
                    className="w-full btn-picnic py-4 px-5 flex items-center gap-4 text-left"
                    style={{ borderRadius: "16px" }}
                >
                    <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <ShoppingCart size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white/75 text-[11px] font-medium">
                            Your weekly cart is ready
                        </p>
                        <p className="text-white font-bold text-[17px] leading-tight">
                            {totalItems} items · {formatPrice(total)}
                        </p>
                        <p className="text-white/65 text-[11px] mt-0.5">
                            ~{co2.toFixed(1)} kg CO₂ · Tap to review
                        </p>
                    </div>
                    <ChevronRight
                        size={18}
                        className="text-white/60 flex-shrink-0"
                    />
                </motion.button>

                {/* Personalized recommendations */}
                <section>
                    <div className="flex items-baseline justify-between mb-3">
                        <h2 className="text-[18px] font-semibold text-gray-900 tracking-tight">
                            For you
                        </h2>
                        <span className="text-sm text-[#9B9B9B]">
                            See all &gt;
                        </span>
                    </div>
                    <div className="flex gap-3 overflow-x-auto scroll-x pb-2 -mx-5 px-5">
                        {recommendations.map((product, i) => {
                            const prevOrder =
                                persona.orderHistory[0]?.items.find(
                                    (oi) => oi.productId === product.id,
                                );
                            const reason = prevOrder
                                ? `Ordered last time too`
                                : `Matches your ${product.category}`;
                            return (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    reason={reason}
                                />
                            );
                        })}
                    </div>
                </section>

                {/*}
                <section>
                    <div className="flex items-baseline justify-between mb-1">
                        <h2 className="text-[18px] font-semibold text-gray-900 tracking-tight">
                            Popular in your area
                        </h2>
                        <span className="text-sm text-[#9B9B9B]">
                            See all &gt;
                        </span>
                    </div>
                    <p className="text-[12px] text-[#9B9B9B] mb-3">
                        Trending with similar households this week
                    </p>
                    <div className="flex gap-3 overflow-x-auto scroll-x pb-2 -mx-5 px-5">
                        {popular.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                compact
                            />
                        ))}
                    </div>
                </section>*/}

                {/* ─── Section 3c: Bundles ─── */}
                <Section
                    icon={<Package size={16} className="text-purple-500" />}
                    title="Bundles"
                    subtitle="Proven bundles & top-up packs"
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
                                        : "bg-[#EFEEE9] text-[#6D6D6D]",
                                )}
                            >
                                {tab === "reorder"
                                    ? "🔄 Order again"
                                    : "➕ Restock categories"}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3 overflow-x-auto scroll-x px-4 pb-4 pt-1">
                        {activeBundles.map((bundle) => (
                            <BundleCard key={bundle.id} bundle={bundle} />
                        ))}
                    </div>
                </Section>

                {/* ─── Section 3d: Popular with similar households ─── */}
                <PopularSection items={personaPopular} matchTags={matchTags} />
                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-2xl p-3 text-center shadow-card">
                        <p className="text-xl font-bold text-[#E1141C]">
                            {persona.orderHistory.length}
                        </p>
                        <p className="text-[10px] text-[#9B9B9B] font-medium mt-0.5">
                            Orders
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-3 text-center shadow-card">
                        <p className="text-xl font-bold text-[#3E8B3E]">
                            {persona.co2SavedTotal}
                        </p>
                        <p className="text-[10px] text-[#9B9B9B] font-medium mt-0.5">
                            kg CO₂ saved
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-3 text-center shadow-card">
                        <p className="text-xl font-bold text-gray-900">
                            {formatPrice(
                                persona.orderHistory.reduce(
                                    (s, o) => s + o.total,
                                    0,
                                ) / persona.orderHistory.length,
                            )}
                        </p>
                        <p className="text-[10px] text-[#9B9B9B] font-medium mt-0.5">
                            Avg. order
                        </p>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
