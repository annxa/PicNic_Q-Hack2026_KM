"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  BookmarkPlus,
  X,
  Check,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import type { SavedPackage, Product } from "@/types";
import { formatPrice, cn } from "@/lib/utils";

// ── helpers ───────────────────────────────────────────────────────────────────

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

// ── Preset / saved package card ───────────────────────────────────────────────

function PackageCard({
  pkg,
  onAddToCart,
  onDelete,
}: {
  pkg: SavedPackage;
  onAddToCart: () => void;
  onDelete?: () => void;
}) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex-shrink-0 w-56 bg-gray-50 rounded-2xl p-3.5 relative">
      {/* delete button for custom packages */}
      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 active:scale-90"
        >
          <X size={10} />
        </button>
      )}

      <div className="flex items-start gap-2 mb-2">
        <span className="text-3xl">{pkg.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-tight">
            {pkg.name}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {pkg.items.length} items
          </p>
        </div>
      </div>

      {pkg.description && (
        <p className="text-xs text-gray-500 leading-relaxed mb-2 italic line-clamp-2">
          {pkg.description}
        </p>
      )}

      {/* item previews */}
      <div className="flex flex-wrap gap-1 mb-3">
        {pkg.items.slice(0, 5).map((i) => (
          <span key={i.product.id} className="text-base" title={i.product.name}>
            {i.product.emoji}
          </span>
        ))}
        {pkg.items.length > 5 && (
          <span className="text-xs text-gray-400 self-center">
            +{pkg.items.length - 5}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600">
          {formatPrice(pkg.totalPrice)}
        </span>
        <button
          onClick={handleAdd}
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1",
            added
              ? "bg-emerald-500 text-white"
              : "bg-gray-900 text-white active:scale-95"
          )}
        >
          {added ? (
            <>
              <Check size={11} /> Added!
            </>
          ) : (
            <>
              <ShoppingCart size={11} /> Add all
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Custom package builder modal ──────────────────────────────────────────────

function BuilderModal({
  allProducts,
  onSave,
  onClose,
}: {
  allProducts: Product[];
  onSave: (pkg: SavedPackage) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📦");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const selectedItems = allProducts
    .filter((p) => (quantities[p.id] ?? 0) > 0)
    .map((p) => ({ product: p, quantity: quantities[p.id] }));

  const totalPrice = selectedItems.reduce(
    (s, i) => s + i.product.price * i.quantity,
    0
  );

  const adjust = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const next = Math.max(0, (prev[productId] ?? 0) + delta);
      return { ...prev, [productId]: next };
    });
  };

  const handleSave = () => {
    if (!name.trim() || selectedItems.length === 0) return;
    const pkg: SavedPackage = {
      id: randomId(),
      name: name.trim(),
      emoji,
      items: selectedItems,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      isPreset: false,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    onSave(pkg);
    onClose();
  };

  const EMOJI_OPTIONS = ["📦", "🛒", "🍳", "🥗", "💪", "🌿", "🏠", "🎉", "🥩", "🥛"];

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full bg-white rounded-t-3xl max-h-[90vh] flex flex-col"
      >
        {/* handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-2" />

        {/* header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">New Package</h2>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* name + emoji */}
          <div className="flex gap-3">
            {/* emoji picker */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 font-medium">Icon</span>
              <div className="relative">
                <select
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="appearance-none w-14 h-10 bg-gray-100 rounded-xl text-xl text-center cursor-pointer border-0 focus:ring-2 focus:ring-[#E1141C]"
                >
                  {EMOJI_OPTIONS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <span className="text-xs text-gray-500 font-medium">Name</span>
              <input
                type="text"
                placeholder="My package name…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 bg-gray-100 rounded-xl text-sm text-gray-900 border-0 focus:ring-2 focus:ring-[#E1141C] outline-none"
              />
            </div>
          </div>

          {/* product list */}
          <div>
            <p className="text-xs text-gray-500 font-medium mb-2">
              Select products
            </p>
            <div className="space-y-1">
              {allProducts.map((product) => {
                const qty = quantities[product.id] ?? 0;
                return (
                  <div
                    key={product.id}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                      qty > 0 ? "bg-red-50" : "bg-gray-50"
                    )}
                  >
                    <span className="text-xl flex-shrink-0">{product.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatPrice(product.price)} · {product.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {qty > 0 && (
                        <>
                          <button
                            onClick={() => adjust(product.id, -1)}
                            className="w-6 h-6 bg-white rounded-lg shadow-sm flex items-center justify-center active:scale-90"
                          >
                            {qty === 1 ? (
                              <Trash2 size={10} className="text-red-400" />
                            ) : (
                              <Minus size={10} className="text-gray-600" />
                            )}
                          </button>
                          <span className="w-4 text-center text-sm font-bold text-gray-900">
                            {qty}
                          </span>
                        </>
                      )}
                      <button
                        onClick={() => adjust(product.id, 1)}
                        className="w-6 h-6 bg-[#E1141C] rounded-lg flex items-center justify-center active:scale-90"
                      >
                        <Plus size={10} className="text-white" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="px-5 py-4 border-t border-gray-100 space-y-2">
          {selectedItems.length > 0 && (
            <p className="text-xs text-gray-500 text-center">
              {selectedItems.length} products · {formatPrice(totalPrice)}
            </p>
          )}
          <button
            onClick={handleSave}
            disabled={!name.trim() || selectedItems.length === 0}
            className="w-full bg-[#E1141C] text-white rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-transform"
          >
            <BookmarkPlus size={16} />
            Save Package
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Skeleton card (loading state) ─────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-56 bg-gray-50 rounded-2xl p-3.5 animate-pulse">
      <div className="flex items-start gap-2 mb-3">
        <div className="w-9 h-9 bg-gray-200 rounded-xl" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-gray-200 rounded w-3/4" />
          <div className="h-2 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="h-2 bg-gray-200 rounded w-full mb-1.5" />
      <div className="h-2 bg-gray-200 rounded w-2/3 mb-4" />
      <div className="flex justify-between items-center">
        <div className="h-3 bg-gray-200 rounded w-10" />
        <div className="h-7 bg-gray-200 rounded-xl w-20" />
      </div>
    </div>
  );
}

// ── Main exported section ─────────────────────────────────────────────────────

export function PackagesSection() {
  const persona = useStore((s) => s.currentPersona);
  const customPackages = useStore((s) => s.customPackages);
  const savePackage = useStore((s) => s.savePackage);
  const deletePackage = useStore((s) => s.deletePackage);
  const addPackageToCart = useStore((s) => s.addPackageToCart);

  const [presets, setPresets] = useState<SavedPackage[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<SavedPackage[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);

  useEffect(() => {
    fetch("/api/packages")
      .then((r) => r.json())
      .then(setPresets)
      .catch(() => {});
    fetch("/api/products")
      .then((r) => r.json())
      .then(setAllProducts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!persona) return;
    setAiLoading(true);
    fetch(`/api/packages/suggest?customerId=${persona.id}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((pkgs: SavedPackage[]) => { setAiSuggestions(pkgs); setAiLoading(false); })
      .catch(() => setAiLoading(false));
  }, [persona?.id]);

  return (
    <>
      <div className="bg-white rounded-3xl overflow-hidden shadow-card">
        {/* section header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-50">
          <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package size={16} className="text-gray-600" />
          </div>
          <div className="flex-1">
            <span className="font-bold text-gray-900 text-sm">Packages</span>
            <p className="text-xs text-gray-500 mt-0.5">
              Preset bundles, AI picks & your own
            </p>
          </div>
          <button
            onClick={() => setShowBuilder(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E1141C] text-white rounded-xl text-xs font-bold active:scale-95 transition-transform"
          >
            <Plus size={12} /> New
          </button>
        </div>

        {/* AI-suggested packages */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={11} className="text-[#E1141C]" />
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              AI picks for you
            </p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1">
            {aiLoading
              ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
              : aiSuggestions.length > 0
              ? aiSuggestions.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    onAddToCart={() => addPackageToCart(pkg)}
                  />
                ))
              : <p className="text-xs text-gray-400 py-2">No suggestions available.</p>
            }
          </div>
        </div>

        {/* preset packages */}
        {presets.length > 0 && (
          <div className="px-4 pt-2 pb-1 border-t border-gray-50">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2 mt-2">
              Ready-made
            </p>
            <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1">
              {presets.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onAddToCart={() => addPackageToCart(pkg)}
                />
              ))}
            </div>
          </div>
        )}

        {/* custom / saved packages */}
        {customPackages.length > 0 && (
          <div className="px-4 pt-2 pb-4 border-t border-gray-50">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2 mt-2">
              My packages
            </p>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
              {customPackages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onAddToCart={() => addPackageToCart(pkg)}
                  onDelete={() => deletePackage(pkg.id)}
                />
              ))}
            </div>
          </div>
        )}

        {customPackages.length === 0 && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-50">
            <button
              onClick={() => setShowBuilder(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-xs font-semibold tap-active"
            >
              <Plus size={14} /> Create your first package
            </button>
          </div>
        )}
      </div>

      {/* builder modal */}
      <AnimatePresence>
        {showBuilder && (
          <BuilderModal
            allProducts={allProducts}
            onSave={savePackage}
            onClose={() => setShowBuilder(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
