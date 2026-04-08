"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, Package, User } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", icon: Home, label: "Start" },
  { href: "/cart", icon: ShoppingCart, label: "Warenkorb" },
  { href: "/pantry", icon: Package, label: "Vorrat" },
  { href: "/profile", icon: User, label: "Profil" },
];

export function BottomNav() {
  const pathname = usePathname();
  const cart = useStore((s) => s.cart);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 safe-bottom z-40">
      <div className="flex items-center justify-around px-2 pt-2 pb-3">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href === "/cart" && pathname === "/cart");
          const isCart = href === "/cart";
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all",
                active ? "text-[#E1141C]" : "text-gray-400"
              )}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                {isCart && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center text-[10px] font-bold bg-[#E1141C] text-white rounded-full px-1">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] font-medium", active ? "text-[#E1141C]" : "text-gray-400")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
