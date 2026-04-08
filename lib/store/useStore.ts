"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Persona, CartItem, PantryItem, Household, Restriction, Bundle } from "@/types";

interface Store {
  // State
  currentPersona: Persona | null;
  household: Household | null;
  restrictions: Restriction[];
  cart: CartItem[];
  bundles: Bundle[];
  pantry: PantryItem[];
  co2SavedThisWeek: number;
  co2SavedThisMonth: number;
  co2MonthlyGoal: number;
  co2SavedTotal: number;
  co2PerDelivery: number; // OSRM-calculated CO₂ saving per delivery (kg)
  isRegenerating: boolean;

  // Actions
  initPersona: (persona: Persona) => void;
  setHousehold: (household: Household) => void;
  setRestrictions: (restrictions: Restriction[]) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  regenerateCart: () => Promise<void>;
  fetchBundles: () => Promise<void>;
  clearCart: () => void;
  fetchCo2Distance: () => Promise<void>;
  checkout: () => Promise<number>; // returns co2SavedKg
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      currentPersona: null,
      household: null,
      restrictions: [],
      cart: [],
      bundles: [],
      pantry: [],
      co2SavedThisWeek: 0,
      co2SavedThisMonth: 0,
      co2MonthlyGoal: 5,
      co2SavedTotal: 0,
      co2PerDelivery: 0,
      isRegenerating: false,

      initPersona: (persona) => {
        set({
          currentPersona: persona,
          household: persona.household,
          restrictions: persona.defaultRestrictions,
          cart: [...persona.defaultCart],
          pantry: [...persona.pantry],
          co2SavedThisWeek: persona.co2SavedThisWeek,
          co2SavedThisMonth: persona.co2SavedThisMonth,
          co2MonthlyGoal: persona.co2MonthlyGoal,
          co2SavedTotal: persona.co2SavedTotal,
        });
      },

      setHousehold: (household) => set({ household }),
      setRestrictions: (restrictions) => set({ restrictions }),

      addToCart: (item) => {
        const current = get().cart;
        const existing = current.find((c) => c.product.id === item.product.id);
        if (existing) {
          set({
            cart: current.map((c) =>
              c.product.id === item.product.id
                ? { ...c, quantity: c.quantity + item.quantity }
                : c
            ),
          });
        } else {
          set({ cart: [...current, item] });
        }
      },

      removeFromCart: (productId) => {
        set({ cart: get().cart.filter((c) => c.product.id !== productId) });
      },

      updateQuantity: (productId, delta) => {
        set({
          cart: get()
            .cart.map((c) =>
              c.product.id === productId
                ? { ...c, quantity: Math.max(0, c.quantity + delta) }
                : c
            )
            .filter((c) => c.quantity > 0),
        });
      },

      regenerateCart: async () => {
        const persona = get().currentPersona;
        if (!persona) return;
        set({ isRegenerating: true });
        try {
          const res = await fetch(`/api/cart/predict?customerId=${persona.id}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const cartItems: CartItem[] = await res.json();
          set({ cart: cartItems, isRegenerating: false });
        } catch (err) {
          console.error("[regenerateCart]", err);
          set({ isRegenerating: false });
        }
      },

      fetchBundles: async () => {
        const persona = get().currentPersona;
        if (!persona) return;
        try {
          const res = await fetch(`/api/packages/suggest?customerId=${persona.id}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const bundles: Bundle[] = await res.json();
          set({ bundles });
        } catch (err) {
          console.error("[fetchBundles]", err);
        }
      },

      clearCart: () => set({ cart: [] }),

      fetchCo2Distance: async () => {
        try {
          const res = await fetch("/api/co2-distance");
          if (!res.ok) return;
          const { co2SavedKg } = (await res.json()) as { co2SavedKg: number };
          set({ co2PerDelivery: co2SavedKg });
        } catch {
          // keep previous value / default 0
        }
      },

      checkout: async () => {
        const persona = get().currentPersona;
        if (!persona) return 0;

        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId: persona.id }),
        });

        if (!res.ok) throw new Error("Checkout failed");

        const { co2SavedKg, newCo2Total } = (await res.json()) as {
          co2SavedKg: number;
          newCo2Total: number;
        };

        set({
          cart: [],
          co2SavedTotal: parseFloat(newCo2Total.toFixed(1)),
          co2SavedThisWeek: parseFloat(
            (get().co2SavedThisWeek + co2SavedKg).toFixed(2)
          ),
          co2SavedThisMonth: parseFloat(
            (get().co2SavedThisMonth + co2SavedKg).toFixed(1)
          ),
        });

        return co2SavedKg;
      },
    }),
    {
      name: "picnic-store",
      partialize: (state) => ({
        currentPersona: state.currentPersona,
        household: state.household,
        restrictions: state.restrictions,
        cart: state.cart,
        pantry: state.pantry,
        co2SavedThisWeek: state.co2SavedThisWeek,
        co2SavedThisMonth: state.co2SavedThisMonth,
        co2MonthlyGoal: state.co2MonthlyGoal,
        co2SavedTotal: state.co2SavedTotal,
        co2PerDelivery: state.co2PerDelivery,
      }),
    }
  )
);
