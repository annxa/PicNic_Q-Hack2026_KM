"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Check } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { BottomNav } from "@/components/shared/BottomNav";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { Product } from "@/types";
import { cn, formatPrice, co2ScoreColor } from "@/lib/utils";

function useDebounce(value: string, delay: number) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

function ProductRow({ product }: { product: Product }) {
    const { addToCart, cart } = useStore();
    const inCart = cart.find((c) => c.product.id === product.id);
    const [flash, setFlash] = useState(false);

    const handleAdd = () => {
        addToCart({ product, quantity: 1, addedReason: "Added from Store" });
        setFlash(true);
        setTimeout(() => setFlash(false), 1500);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-50 last:border-0"
        >
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                {product.emoji}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
                        {product.name}
                    </p>
                    <span className={cn(
                        "text-[9px] font-bold px-1 py-0.5 rounded text-white flex-shrink-0",
                        co2ScoreColor(product.co2Score)
                    )}>
                        {product.co2Score}
                    </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                    {product.brand} · {product.unit}
                </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-bold text-gray-900">
                    {formatPrice(product.price)}
                </span>
                <button
                    onClick={handleAdd}
                    className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                        flash || inCart
                            ? "bg-emerald-500 scale-95"
                            : "bg-[#E1141C] active:scale-90"
                    )}
                >
                    {flash || inCart
                        ? <Check size={14} className="text-white" strokeWidth={2.5} />
                        : <Plus size={14} className="text-white" strokeWidth={2.5} />
                    }
                </button>
            </div>
        </motion.div>
    );
}

export default function StorePage() {
    const router = useRouter();
    const persona = useStore((s) => s.currentPersona);

    const [query, setQuery]       = useState("");
    const [results, setResults]   = useState<Product[]>([]);
    const [loading, setLoading]   = useState(false);
    const [focused, setFocused]   = useState(false);
    const inputRef                = useRef<HTMLInputElement>(null);
    const debouncedQuery          = useDebounce(query, 250);

    useEffect(() => {
        if (!persona) router.push("/onboarding");
    }, [persona, router]);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/store/search?q=${encodeURIComponent(debouncedQuery)}`)
            .then((r) => r.json())
            .then((data) => { setResults(Array.isArray(data) ? data : []); })
            .catch(() => setResults([]))
            .finally(() => setLoading(false));
    }, [debouncedQuery]);

    if (!persona) return null;

    const categoryGroups = results.reduce<Record<string, Product[]>>((acc, p) => {
        if (!acc[p.category]) acc[p.category] = [];
        acc[p.category].push(p);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-[#F5F4F0] pb-24">
            <DemoBanner />

            {/* Sticky header */}
            <div
                className="bg-white px-5 pt-5 pb-4 sticky top-0 z-30"
                style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.06)" }}
            >
                <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight mb-4">
                    Store
                </h1>

                {/* Search bar */}
                <div className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200",
                    focused
                        ? "bg-white shadow-md ring-2 ring-[#E1141C]/30"
                        : "bg-[#F5F4F0] ring-1 ring-transparent"
                )}>
                    <Search
                        size={17}
                        className={cn(
                            "flex-shrink-0 transition-colors",
                            focused ? "text-[#E1141C]" : "text-gray-400"
                        )}
                    />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search products…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
                    />
                    <AnimatePresence>
                        {query.length > 0 && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.7 }}
                                transition={{ duration: 0.12 }}
                                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                                className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0"
                            >
                                <span className="text-[10px] font-bold leading-none">✕</span>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Results */}
            <div className="px-4 py-4 space-y-4">
                {loading ? (
                    // Skeleton
                    <div className="bg-white rounded-3xl overflow-hidden shadow-card">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
                                <div className="w-12 h-12 rounded-xl shimmer flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 rounded shimmer w-2/3" />
                                    <div className="h-2 rounded shimmer w-1/3" />
                                </div>
                                <div className="w-8 h-8 rounded-full shimmer flex-shrink-0" />
                            </div>
                        ))}
                    </div>
                ) : results.length === 0 && query.length > 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <span className="text-5xl mb-4">🔍</span>
                        <p className="text-sm font-semibold text-gray-700">No results for &ldquo;{query}&rdquo;</p>
                        <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                    </div>
                ) : query.length === 0 ? (
                    // Browse by category
                    Object.entries(categoryGroups).map(([category, products]) => (
                        <div key={category} className="bg-white rounded-3xl overflow-hidden shadow-card">
                            <div className="px-4 py-3 border-b border-gray-50">
                                <p className="text-sm font-bold text-gray-900">{category}</p>
                            </div>
                            <AnimatePresence initial={false}>
                                {products.map((p) => (
                                    <ProductRow key={p.id} product={p} />
                                ))}
                            </AnimatePresence>
                        </div>
                    ))
                ) : (
                    // Search results (flat list)
                    <div className="bg-white rounded-3xl overflow-hidden shadow-card">
                        <div className="px-4 py-3 border-b border-gray-50">
                            <p className="text-xs text-gray-400 font-medium">
                                {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
                            </p>
                        </div>
                        <AnimatePresence initial={false}>
                            {results.map((p) => (
                                <ProductRow key={p.id} product={p} />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
