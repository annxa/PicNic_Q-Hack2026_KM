"use client";
import { motion } from "framer-motion";
import { Plus, Check } from "lucide-react";
import { useState } from "react";
import { Product } from "@/types";
import { cn, formatPrice, co2ScoreColor } from "@/lib/utils";
import { useStore } from "@/lib/store/useStore";

// Category → tile background color (from Picnic building blocks: tile secondary colors)
const CATEGORY_BG: Record<string, string> = {
  "Obst & Gemüse": "#E7ECD7",
  "Milch & Eier": "#E3EEEE",
  "Fleisch & Fisch": "#EFDCDC",
  "Tiefkühl": "#E3EEEE",
  "Getränke": "#E3F0F8",
  "Brot & Backwaren": "#F0E8DD",
  "Snacks & Süßes": "#F5EDE0",
  "Haushalt": "#EBE9E5",
  "Drogerie": "#EBE9E5",
};
const DEFAULT_BG = "#F0E8DD";

interface ProductCardProps {
  product: Product;
  reason?: string;
  showCO2?: boolean;
  compact?: boolean;
}

export function ProductCard({ product, reason, showCO2 = true, compact = false }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const addToCart = useStore((s) => s.addToCart);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({ product, quantity: 1, addedReason: reason });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const tileBg = CATEGORY_BG[product.category] ?? DEFAULT_BG;

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      className={cn(
        "relative flex-shrink-0 bg-white rounded-2xl overflow-hidden",
        compact ? "w-36" : "w-44"
      )}
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Product image area with category colour */}
      <div
        className={cn("flex items-center justify-center relative", compact ? "h-24" : "h-28")}
        style={{ background: tileBg }}
      >
        <span
          role="img"
          aria-label={product.name}
          className={compact ? "text-4xl" : "text-5xl"}
        >
          {product.emoji}
        </span>

        {/* CO2 badge (top-right) */}
        {showCO2 && (
          <span className={cn(
            "absolute top-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white leading-none",
            co2ScoreColor(product.co2Score)
          )}>
            {product.co2Score}
          </span>
        )}

        {/* Local badge (top-left) */}
        {product.localNote && (
          <span className="absolute top-2 left-2 text-[10px] bg-white/90 text-[#308807] font-semibold px-1.5 py-0.5 rounded-full leading-none">
            📍 lokal
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="p-2.5">
        {/* Highlight / reason label — styled like Picnic's category caption */}
        {reason && !compact && (
          <p className="text-[10px] font-medium text-[#9C6D2B] mb-0.5 leading-tight line-clamp-1">
            {reason}
          </p>
        )}

        {/* Product name — Subtitle 1: 14–16px Medium */}
        <p className={cn(
          "font-medium text-gray-900 leading-snug line-clamp-2",
          compact ? "text-xs" : "text-[13px]"
        )}>
          {product.name}
        </p>

        {/* Brand — Body 2: 14px Regular, gray */}
        <p className="text-[11px] text-[#787570] mt-0.5 leading-tight truncate">
          {product.brand}
        </p>

        <div className="flex items-end justify-between mt-2 gap-1">
          <div className="min-w-0">
            {/* Price — Bold, black */}
            <span className={cn("font-bold text-gray-900 leading-tight", compact ? "text-sm" : "text-[15px]")}>
              {formatPrice(product.price)}
            </span>
            {/* Unit — Caption 1: 12px, gray */}
            <p className="text-[10px] text-[#787570] leading-tight truncate">{product.unit}</p>
          </div>

          {/* Add button — green circle per Picnic PDP style */}
          <button
            onClick={handleAdd}
            className={cn(
              "w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-150",
              added
                ? "bg-emerald-500 text-white scale-95"
                : "btn-picnic-green"
            )}
            aria-label={`${product.name} hinzufügen`}
          >
            {added ? <Check size={13} strokeWidth={2.5} /> : <Plus size={13} strokeWidth={2.5} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
