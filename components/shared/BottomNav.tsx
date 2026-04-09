"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store/useStore";
import { cn } from "@/lib/utils";
import { CartLogo } from "@/components/shared/CartLogo";

// Custom Picnic-style SVG icons matching the building blocks grid
function DiscoverIcon({ active }: { active: boolean }) {
    const c = active ? "#E1171E" : "#787570";
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect
                x="3"
                y="3"
                width="7.5"
                height="7.5"
                rx="1.5"
                stroke={c}
                strokeWidth="1.75"
                fill={active ? "#FDECEA" : "none"}
            />
            <rect
                x="13.5"
                y="3"
                width="7.5"
                height="7.5"
                rx="1.5"
                stroke={c}
                strokeWidth="1.75"
                fill={active ? "#FDECEA" : "none"}
            />
            <rect
                x="3"
                y="13.5"
                width="7.5"
                height="7.5"
                rx="1.5"
                stroke={c}
                strokeWidth="1.75"
                fill={active ? "#FDECEA" : "none"}
            />
            <rect
                x="13.5"
                y="13.5"
                width="7.5"
                height="7.5"
                rx="1.5"
                stroke={c}
                strokeWidth="1.75"
                fill={active ? "#FDECEA" : "none"}
            />
        </svg>
    );
}

function PantryIcon({ active }: { active: boolean }) {
    const c = active ? "#E1171E" : "#787570";
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                stroke={c}
                strokeWidth="1.75"
                fill={active ? "#FDECEA" : "none"}
            />
            <path
                d="M3 8.5h18"
                stroke={c}
                strokeWidth="1.75"
                strokeLinecap="round"
            />
            <path
                d="M8.5 8.5V21"
                stroke={c}
                strokeWidth="1.75"
                strokeLinecap="round"
            />
            <circle cx="15.5" cy="14.5" r="1.5" fill={c} />
            <circle cx="15.5" cy="14.5" r="1.5" fill={c} />
        </svg>
    );
}

function StoreIcon({ active }: { active: boolean }) {
    const c = active ? "#E1171E" : "#787570";
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M3 9.5L5 4h14l2 5.5"
                stroke={c} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                fill={active ? "#FDECEA" : "none"}
            />
            <rect
                x="3" y="9.5" width="18" height="11" rx="1.5"
                stroke={c} strokeWidth="1.75"
                fill={active ? "#FDECEA" : "none"}
            />
            <circle cx="16" cy="15" r="1.5" fill={c} />
            <path d="M8 13v4" stroke={c} strokeWidth="1.75" strokeLinecap="round" />
            <path d="M6 15h4" stroke={c} strokeWidth="1.75" strokeLinecap="round" />
        </svg>
    );
}

function RecipeIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="3" width="16" height="18" rx="2" stroke="#787570" strokeWidth="1.75" />
            <path d="M8 8h8"  stroke="#787570" strokeWidth="1.75" strokeLinecap="round" />
            <path d="M8 12h8" stroke="#787570" strokeWidth="1.75" strokeLinecap="round" />
            <path d="M8 16h5" stroke="#787570" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
    );
}

function ProfileIcon({ active }: { active: boolean }) {
    const c = active ? "#E1171E" : "#787570";
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle
                cx="12"
                cy="8"
                r="3.5"
                stroke={c}
                strokeWidth="1.75"
                fill={active ? "#FDECEA" : "none"}
            />
            <path
                d="M4.5 21c0-4.142 3.358-7.5 7.5-7.5s7.5 3.358 7.5 7.5"
                stroke={c}
                strokeWidth="1.75"
                strokeLinecap="round"
            />
        </svg>
    );
}

const NAV_ITEMS = [
    { href: "/dashboard", Icon: DiscoverIcon, label: "Discover" },
    { href: "/store",     Icon: StoreIcon,    label: "Store"    },
    { href: "/cart",      Icon: CartLogo,     label: "Cart"     },
    { href: "/profile",   Icon: ProfileIcon,  label: "Profile"  },
];

const NAV_ITEMS_LEFT  = NAV_ITEMS.slice(0, 2);
const NAV_ITEMS_RIGHT = NAV_ITEMS.slice(2);

export function BottomNav() {
    const pathname = usePathname();
    const cart = useStore((s) => s.cart);
    const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

    return (
        <nav
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white safe-bottom z-40"
            style={{ boxShadow: "0 -1px 0 rgba(0,0,0,0.07)" }}
        >
            <div className="flex items-center justify-around px-2 pt-2 pb-1">
                {NAV_ITEMS_LEFT.map(({ href, Icon, label }) => {
                    const active = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className="flex flex-col items-center gap-0.5 px-4 py-0.5"
                        >
                            <Icon active={active} />
                            <span className={cn("text-[10px] font-medium", active ? "text-[#E1171E]" : "text-[#787570]")}>
                                {label}
                            </span>
                        </Link>
                    );
                })}

                {/* Recipe tab — centre, non-functional */}
                <button className="flex flex-col items-center gap-0.5 px-4 py-0.5">
                    <RecipeIcon />
                    <span className="text-[10px] font-medium text-[#787570]">Recipes</span>
                </button>

                {NAV_ITEMS_RIGHT.map(({ href, Icon, label }) => {
                    const active = pathname === href;
                    const isCart = href === "/cart";
                    return (
                        <Link
                            key={href}
                            href={href}
                            className="flex flex-col items-center gap-0.5 px-4 py-0.5"
                        >
                            <div className="relative">
                                <Icon active={active} />
                                {isCart && totalItems > 0 && (
                                    <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 flex items-center justify-center text-[10px] font-bold bg-[#E1171E] text-white rounded-full px-1 leading-none">
                                        {totalItems > 99 ? "99+" : totalItems}
                                    </span>
                                )}
                            </div>
                            <span className={cn("text-[10px] font-medium", active ? "text-[#E1171E]" : "text-[#787570]")}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
