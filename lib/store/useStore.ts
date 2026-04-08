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
  regenerateCart: () => void;
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

      regenerateCart: () => {
        set({ isRegenerating: true });
        setTimeout(() => {
          const cart = get().cart;
          // Simulate AI: shuffle quantities slightly and swap one item
          const newCart = cart.map((item, i) => {
            if (i === 0) return { ...item, quantity: item.quantity + 1, addedReason: "KI hat die Menge aufgestockt ✨" };
            if (i === Math.floor(cart.length / 2)) return { ...item, quantity: Math.max(1, item.quantity - 1) };
            return item;
          });
          // Add a "new" item from pantry if not already in cart
          const persona = get().currentPersona;
          if (persona) {
            const pantryNotInCart = persona.pantry.filter(
              (pi) => !newCart.find((c) => c.product.id === pi.product.id) && pi.daysRemaining < 5
            );
            if (pantryNotInCart.length > 0) {
              newCart.push({
                product: pantryNotInCart[0].product,
                quantity: 1,
                addedReason: "KI hat nachgefüllt – bald leer! ✨",
              });
            }
          }
          set({ cart: newCart, isRegenerating: false });
        }, 1800);
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
