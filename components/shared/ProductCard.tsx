"use client";
import { motion } from "framer-motion";
import { Plus, Check } from "lucide-react";
import { useState } from "react";
import { Product } from "@/types";
import { cn, formatPrice, co2ScoreColor } from "@/lib/utils";
import { useStore } from "@/lib/store/useStore";

interface ProductCardProps {
  product: Product;
  reason?: string;
  showCO2?: boolean;
  compact?: boolean;
}

export function ProductCard({ product, reason, showCO2 = true, compact = false }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const addToCart = useStore((s) => s.addToCart);

  const handleAdd = () => {
    addToCart({ product, quantity: 1, addedReason: reason });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      className={cn(
        "relative flex-shrink-0 bg-white rounded-2xl shadow-card overflow-hidden",
        compact ? "w-36" : "w-44"
      )}
    >
      {/* Emoji / Image */}
      <div className={cn(
        "flex items-center justify-center bg-gray-50",
        compact ? "h-24 text-4xl" : "h-28 text-5xl"
      )}>
        <span role="img" aria-label={product.name}>{product.emoji}</span>
      </div>

      {/* CO2 Badge */}
      {showCO2 && (
        <span className={cn(
          "absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
          co2ScoreColor(product.co2Score)
        )}>
          {product.co2Score}
        </span>
      )}

      {/* Local note indicator */}
      {product.localNote && (
        <span className="absolute top-2 left-2 text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-1.5 py-0.5 rounded-full">
          📍 lokal
        </span>
      )}

      <div className="p-2.5">
        <p className={cn("font-semibold text-gray-900 leading-tight line-clamp-2", compact ? "text-xs" : "text-sm")}>
          {product.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{product.brand} · {product.unit}</p>

        {product.localNote && (
          <p className="text-[10px] text-emerald-600 mt-1 leading-tight">{product.localNote}</p>
        )}

        {reason && (
          <p className="text-[10px] text-gray-500 mt-1 leading-tight line-clamp-2 italic">
            {reason}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</span>
          <button
            onClick={handleAdd}
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-full transition-all",
              added
                ? "bg-emerald-500 text-white"
                : "bg-[#E1141C] text-white active:scale-90"
            )}
            aria-label={`${product.name} hinzufügen`}
          >
            {added ? <Check size={14} strokeWidth={2.5} /> : <Plus size={14} strokeWidth={2.5} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
