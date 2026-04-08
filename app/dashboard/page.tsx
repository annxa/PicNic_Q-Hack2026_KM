"use client";
import { useEffect, useState } from "react";
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
import { PicnicLogo } from "@/components/shared/PicnicLogo";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { ProductCard } from "@/components/shared/ProductCard";
import { getProducts } from "@/lib/api";
import { Product } from "@/types";
import { formatPrice, cartTotal, cartCO2 } from "@/lib/utils";

function CO2ProgressCard() {
    const {
        co2SavedThisWeek,
        co2SavedThisMonth,
        co2MonthlyGoal,
        co2SavedTotal,
    } = useStore();
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
                            ≈ {Math.round(co2SavedThisMonth * 6.3)} km of
                            driving saved 🚗
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

export default function DashboardPage() {
    const router = useRouter();
    const persona = useStore((s) => s.currentPersona);
    const cart = useStore((s) => s.cart);
    const [allProducts, setAllProducts] = useState<Product[]>([]);

    useEffect(() => {
        if (!persona) router.push("/onboarding");
    }, [persona, router]);

    useEffect(() => {
        getProducts().then(setAllProducts);
    }, []);

    if (!persona) return null;

    const total = cartTotal(cart);
    const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
    const co2 = cartCO2(cart);

    // Personalized recommendations: products not in cart
    const inCartIds = new Set(cart.map((c) => c.product.id));
    const recommendations = allProducts
        .filter(
            (p: Product) =>
                !inCartIds.has(p.id) &&
                persona.preferredCategories.includes(p.category),
        )
        .slice(0, 8);

    // Popular in region: products not in cart
    const popular = allProducts.filter((p: Product) => !inCartIds.has(p.id)).slice(5, 13);

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

                {/* Popular in region */}
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
                </section>

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
