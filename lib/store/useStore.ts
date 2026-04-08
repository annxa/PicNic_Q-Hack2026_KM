"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Persona, CartItem, PantryItem, Household, Restriction } from "@/types";
import { cartTotal } from "@/lib/utils";

interface Store {
  // State
  currentPersona: Persona | null;
  household: Household | null;
  restrictions: Restriction[];
  cart: CartItem[];
  pantry: PantryItem[];
  co2SavedThisWeek: number;
  co2SavedThisMonth: number;
  co2MonthlyGoal: number;
  co2SavedTotal: number;
  isRegenerating: boolean;

  // Actions
  initPersona: (persona: Persona) => void;
  setHousehold: (household: Household) => void;
  setRestrictions: (restrictions: Restriction[]) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  regenerateCart: () => Promise<void>;
  clearCart: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      currentPersona: null,
      household: null,
      restrictions: [],
      cart: [],
      pantry: [],
      co2SavedThisWeek: 0,
      co2SavedThisMonth: 0,
      co2MonthlyGoal: 5,
      co2SavedTotal: 0,
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

      clearCart: () => set({ cart: [] }),
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
      }),
    }
  )
);
