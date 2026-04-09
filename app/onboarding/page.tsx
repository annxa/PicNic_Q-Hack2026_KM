"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Sparkles, User, UserPlus } from "lucide-react";
import { getPersonas, PersonaFull } from "@/lib/api";
import { useStore } from "@/lib/store/useStore";
import { Restriction } from "@/types";
import { cn } from "@/lib/utils";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { PicnicLogo } from "@/components/shared/PicnicLogo";

// ── Persona types (based on DB personas, shown during registration) ────────────

type PersonaType = {
    key: string;
    avatar: string;
    name: string;
    description: string;
    tags: string[];
};

const PERSONA_TYPES: PersonaType[] = [
    {
        key: "seniors",
        avatar: "👴",
        name: "Seniors",
        description: "Reliable habits, familiar brands, and a tidy weekly basket.",
        tags: ["Routine", "Brand loyal", "Weekly shop"],
    },
    {
        key: "students",
        avatar: "🧑‍🎓",
        name: "Students",
        description: "Budget-conscious and hungry. Bread, eggs & the bare essentials.",
        tags: ["Budget", "Quick meals", "Essentials"],
    },
    {
        key: "biological",
        avatar: "🌿",
        name: "Organic",
        description: "Organic is non-negotiable. CO₂ footprint always in mind.",
        tags: ["Organic", "Eco-conscious", "Vegetarian"],
    },
    {
        key: "regional",
        avatar: "🏡",
        name: "Regional",
        description: "Local & seasonal – straight from the producer, fresh from the region.",
        tags: ["Local", "Seasonal", "Fresh"],
    },
    {
        key: "bargain_hunters",
        avatar: "💰",
        name: "Bargain Hunters",
        description: "Always hunting for the best deal. Bulk quantities, lowest prices.",
        tags: ["Deals", "Bulk", "Best price"],
    },
    {
        key: "gourmet",
        avatar: "👨‍🍳",
        name: "Gourmet",
        description: "Cooking is a passion. Quality over price, variety is everything.",
        tags: ["Premium", "Variety", "Cooking"],
    },
    {
        key: "pet_owners",
        avatar: "🐾",
        name: "Pet Owners",
        description: "Shopping for both people and pets. Chicken always ends up in the basket.",
        tags: ["Pets", "Practical", "Loyal brands"],
    },
    {
        key: "plant_based",
        avatar: "🥦",
        name: "Plant-Based",
        description: "100% plant-based, 0% compromise. Vegetables, OJ, and variety.",
        tags: ["Vegan", "Sustainable", "Colorful"],
    },
    {
        key: "fitness",
        avatar: "💪",
        name: "Fitness",
        description: "Meal prep every Sunday. Protein first – chicken, eggs, broccoli.",
        tags: ["Protein", "Meal prep", "Health"],
    },
];

// ── Dietary restrictions ───────────────────────────────────────────────────────

const RESTRICTION_OPTIONS: { id: Restriction; label: string; emoji: string }[] = [
    { id: "lactose",    label: "Lactose-free",  emoji: "🥛" },
    { id: "gluten",     label: "Gluten-free",   emoji: "🌾" },
    { id: "nuts",       label: "Nut allergy",   emoji: "🥜" },
    { id: "vegan",      label: "Vegan",         emoji: "🌱" },
    { id: "vegetarian", label: "Vegetarian",    emoji: "🥦" },
    { id: "halal",      label: "Halal",         emoji: "☪️" },
    { id: "kosher",     label: "Kosher",        emoji: "✡️" },
    { id: "soja",       label: "Soy allergy",   emoji: "🫘" },
    { id: "egg",        label: "No egg",        emoji: "🥚" },
    { id: "fish",       label: "No fish",       emoji: "🐟" },
];

const variants = {
    enter:  { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0  },
    exit:   { opacity: 0, x: -40 },
};

type Mode = "choose" | "login" | "register";

export default function OnboardingPage() {
    const router = useRouter();
    const { initPersona, setHousehold, setRestrictions } = useStore();

    const [personas, setPersonas]               = useState<PersonaFull[]>([]);
    const [loadingPersonas, setLoadingPersonas] = useState(true);

    const [mode, setMode]                 = useState<Mode>("choose");
    const [registerStep, setRegisterStep] = useState(0); // 0 = name+type, 1 = household+diet

    // Login state
    const [loginName,  setLoginName]  = useState("");
    const [loginError, setLoginError] = useState("");

    // Register state
    const [registerName,       setRegisterName]       = useState("");
    const [selectedTypes,      setSelectedTypes]      = useState<PersonaType[]>([]);
    const [householdSize,      setHouseholdSize]      = useState(2);
    const [hasChildren,        setHasChildren]        = useState(false);
    const [activeRestrictions, setActiveRestrictions] = useState<Restriction[]>([]);

    useEffect(() => {
        getPersonas()
            .then(setPersonas)
            .finally(() => setLoadingPersonas(false));
    }, []);

    const handleLogin = () => {
        const found = personas.find(
            (p) => p.name.toLowerCase() === loginName.trim().toLowerCase()
        );
        if (!found) {
            setLoginError("No account found with that name.");
            return;
        }
        initPersona(found);
        setHousehold(found.household);
        setRestrictions(found.defaultRestrictions);
        router.push("/dashboard");
    };

    const handleRegisterFinish = async () => {
        if (selectedTypes.length === 0) return;
        // Use the first selected type as primary — match to its DB persona by avatar
        const primary = selectedTypes[0];
        const base = personas.find((p) => p.avatar === primary.avatar);
        if (!base) return;

        // Save to database and get the new customer's UUID
        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: registerName.trim() || base.name,
                personaKey: primary.key,
                householdSize,
                hasChildren,
                intolerances: activeRestrictions,
            }),
        });
        const { customerId } = await res.json();

        const customPersona: PersonaFull = {
            ...base,
            id: customerId,
            name: registerName.trim() || base.name,
        };
        initPersona(customPersona);
        setHousehold({ ...base.household, size: householdSize, hasKids: hasChildren });
        setRestrictions(activeRestrictions);
        router.push("/dashboard");
    };

    const toggleRestriction = (r: Restriction) =>
        setActiveRestrictions((prev) =>
            prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
        );

    const goBack = () => {
        if (mode === "login") {
            setMode("choose");
            setLoginError("");
        } else if (mode === "register" && registerStep > 0) {
            setRegisterStep(0);
        } else {
            setMode("choose");
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <DemoBanner />

            {/* Header */}
            <div className="px-5 pt-6 pb-4">
                <div className="flex items-center gap-2.5 mb-6">
                    <PicnicLogo size={40} />
                    <span className="text-[22px] font-semibold text-gray-900 tracking-tight">
                        picnic<span className="text-[#E1141C] font-bold">+</span>
                    </span>
                </div>

                {mode === "register" && (
                    <>
                        <div className="flex gap-1.5 mb-4">
                            {[0, 1].map((i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-1 rounded-full transition-all duration-300",
                                        i === registerStep
                                            ? "bg-[#E1141C] w-10"
                                            : i < registerStep
                                              ? "bg-[#E1141C]/40 w-5"
                                              : "bg-[#E2E1DD] w-5",
                                    )}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 font-medium">
                            {registerStep === 0 ? "Step 1 of 2 · Profile" : "Step 2 of 2 · Preferences"}
                        </p>
                    </>
                )}
            </div>

            {/* Steps */}
            <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>

                    {/* ── Choose: login vs register ── */}
                    {mode === "choose" && (
                        <motion.div
                            key="choose"
                            variants={variants}
                            initial="enter" animate="center" exit="exit"
                            transition={{ duration: 0.22 }}
                            className="px-5"
                        >
                            <h1 className="text-[28px] font-semibold text-gray-900 mb-1 tracking-tight">
                                Welcome to picnic+
                            </h1>
                            <p className="text-sm text-[#9B9B9B] mb-8">
                                Log in to your account or create a new one.
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => setMode("login")}
                                    className="w-full flex items-center gap-4 rounded-2xl border-2 border-[#E2E1DD] bg-white p-5 text-left transition-all hover:border-[#E1141C]/40"
                                >
                                    <div className="w-12 h-12 rounded-full bg-[#FFF0F0] flex items-center justify-center flex-shrink-0">
                                        <User size={22} className="text-[#E1141C]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900">Log in</p>
                                        <p className="text-xs text-gray-500 mt-0.5">I already have an account</p>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-400" />
                                </button>

                                <button
                                    onClick={() => setMode("register")}
                                    className="w-full flex items-center gap-4 rounded-2xl border-2 border-[#E2E1DD] bg-white p-5 text-left transition-all hover:border-[#E1141C]/40"
                                >
                                    <div className="w-12 h-12 rounded-full bg-[#FFF0F0] flex items-center justify-center flex-shrink-0">
                                        <UserPlus size={22} className="text-[#E1141C]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900">Create account</p>
                                        <p className="text-xs text-gray-500 mt-0.5">I&apos;m new here</p>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-400" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Login ── */}
                    {mode === "login" && (
                        <motion.div
                            key="login"
                            variants={variants}
                            initial="enter" animate="center" exit="exit"
                            transition={{ duration: 0.22 }}
                            className="px-5"
                        >
                            <h1 className="text-[28px] font-semibold text-gray-900 mb-1 tracking-tight">
                                Welcome back!
                            </h1>
                            <p className="text-sm text-[#9B9B9B] mb-6">
                                Enter your name to continue.
                            </p>

                            <input
                                type="text"
                                placeholder="Your name"
                                value={loginName}
                                autoFocus
                                onChange={(e) => { setLoginName(e.target.value); setLoginError(""); }}
                                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                                className={cn(
                                    "w-full rounded-2xl border-2 px-4 py-4 text-base outline-none transition-all",
                                    loginError
                                        ? "border-red-400 bg-red-50"
                                        : "border-[#E2E1DD] bg-white focus:border-[#E1141C]"
                                )}
                            />
                            {loginError && (
                                <p className="text-sm text-red-500 mt-2 px-1">{loginError}</p>
                            )}

                            {/* Quick-pick chips for demo */}
                            {!loadingPersonas && personas.length > 0 && (
                                <div className="mt-5">
                                    <p className="text-xs text-gray-400 font-medium mb-2">Available accounts</p>
                                    <div className="flex flex-wrap gap-2">
                                        {personas.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => { setLoginName(p.name); setLoginError(""); }}
                                                className={cn(
                                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                                                    loginName === p.name
                                                        ? "bg-[#E1141C] border-[#E1141C] text-white"
                                                        : "bg-white border-[#E2E1DD] text-gray-600 hover:border-[#E1141C]/40"
                                                )}
                                            >
                                                <span>{p.avatar}</span>
                                                {p.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ── Register: Step 0 — name + persona type ── */}
                    {mode === "register" && registerStep === 0 && (
                        <motion.div
                            key="reg-0"
                            variants={variants}
                            initial="enter" animate="center" exit="exit"
                            transition={{ duration: 0.22 }}
                            className="px-5"
                        >
                            <h1 className="text-[28px] font-semibold text-gray-900 mb-1 tracking-tight">
                                Create your profile
                            </h1>
                            <p className="text-sm text-[#9B9B9B] mb-5">
                                Tell us your name and which shopper type fits you best.
                            </p>

                            <input
                                type="text"
                                placeholder="Your name"
                                value={registerName}
                                autoFocus
                                onChange={(e) => setRegisterName(e.target.value)}
                                className="w-full rounded-2xl border-2 border-[#E2E1DD] bg-white px-4 py-4 text-base outline-none transition-all focus:border-[#E1141C] mb-5"
                            />

                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-semibold text-gray-700">
                                    Which shopper type are you?
                                </p>
                                <span className="text-xs text-gray-400">
                                    {selectedTypes.length}/3 selected
                                </span>
                            </div>

                            <div className="space-y-2">
                                {PERSONA_TYPES.map((type) => {
                                    const isSelected = selectedTypes.some((t) => t.key === type.key);
                                    const isDisabled = !isSelected && selectedTypes.length >= 3;
                                    return (
                                        <button
                                            key={type.key}
                                            disabled={isDisabled}
                                            onClick={() =>
                                                setSelectedTypes((prev) =>
                                                    isSelected
                                                        ? prev.filter((t) => t.key !== type.key)
                                                        : [...prev, type]
                                                )
                                            }
                                            className={cn(
                                                "w-full text-left rounded-2xl border-2 p-4 transition-all",
                                                isSelected
                                                    ? "border-[#E1141C] bg-[#FDECEA]"
                                                    : isDisabled
                                                      ? "border-[#E2E1DD] bg-[#FAFAFA] opacity-40 cursor-not-allowed"
                                                      : "border-[#E2E1DD] bg-white hover:border-[#E1141C]/30"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl leading-none flex-shrink-0">
                                                    {type.avatar}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="font-bold text-gray-900 text-sm">
                                                            {type.name}
                                                        </span>
                                                        {isSelected && (
                                                            <span className="text-[#E1141C] text-base flex-shrink-0">✓</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                                                        {type.description}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                                        {type.tags.map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className={cn(
                                                                    "text-[10px] font-medium px-2 py-0.5 rounded-full",
                                                                    isSelected
                                                                        ? "bg-[#E1141C]/15 text-[#E1141C]"
                                                                        : "bg-[#F0EFEB] text-gray-500"
                                                                )}
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Register: Step 1 — household + dietary restrictions ── */}
                    {mode === "register" && registerStep === 1 && (
                        <motion.div
                            key="reg-1"
                            variants={variants}
                            initial="enter" animate="center" exit="exit"
                            transition={{ duration: 0.22 }}
                            className="px-5"
                        >
                            <h1 className="text-[28px] font-semibold text-gray-900 mb-1 tracking-tight">
                                Your preferences
                            </h1>
                            <p className="text-sm text-[#9B9B9B] mb-6">
                                Help us personalize your shopping.
                            </p>

                            {/* Household size */}
                            <div className="mb-6">
                                <label className="text-sm font-semibold text-gray-700 block mb-3">
                                    Household size
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {[1, 2, 3, 4, 5, 6].map((n) => (
                                        <button
                                            key={n}
                                            onClick={() => setHouseholdSize(n)}
                                            className={cn(
                                                "w-12 h-12 rounded-full text-sm font-semibold border transition-all",
                                                householdSize === n
                                                    ? "bg-[#E1141C] border-[#E1141C] text-white"
                                                    : "bg-white border-[#E2E1DD] text-[#3D3D3D]"
                                            )}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Has children */}
                            <div className="mb-7">
                                <label className="text-sm font-semibold text-gray-700 block mb-3">
                                    Children in household?
                                </label>
                                <div className="flex gap-2">
                                    {[
                                        { value: false, label: "No" },
                                        { value: true,  label: "Yes" },
                                    ].map(({ value, label }) => (
                                        <button
                                            key={label}
                                            onClick={() => setHasChildren(value)}
                                            className={cn(
                                                "px-6 py-2.5 rounded-full text-sm font-semibold border transition-all",
                                                hasChildren === value
                                                    ? "bg-[#E1141C] border-[#E1141C] text-white"
                                                    : "bg-white border-[#E2E1DD] text-[#3D3D3D]"
                                            )}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dietary restrictions */}
                            <div>
                                <label className="text-sm font-semibold text-gray-700 block mb-3">
                                    Dietary restrictions
                                </label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {RESTRICTION_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => toggleRestriction(opt.id)}
                                            className={cn(
                                                "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border transition-all",
                                                activeRestrictions.includes(opt.id)
                                                    ? "bg-[#E1141C] border-[#E1141C] text-white"
                                                    : "bg-white border-[#E2E1DD] text-[#3D3D3D]"
                                            )}
                                        >
                                            <span>{opt.emoji}</span>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                {activeRestrictions.length === 0 && (
                                    <p className="text-xs text-gray-400 italic">None selected</p>
                                )}
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* Bottom CTA */}
            {mode !== "choose" && (
                <div className="px-5 pb-8 pt-4 flex gap-3">
                    <button
                        onClick={goBack}
                        className="w-14 h-14 flex items-center justify-center rounded-full bg-[#EFEEE9] text-[#6D6D6D] flex-shrink-0"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    {mode === "login" && (
                        <button
                            onClick={handleLogin}
                            disabled={!loginName.trim()}
                            className="flex-1 h-14 btn-picnic flex items-center justify-center gap-2 text-base"
                        >
                            Log in
                            <ChevronRight size={18} strokeWidth={2.5} />
                        </button>
                    )}

                    {mode === "register" && registerStep === 0 && (
                        <button
                            onClick={() => setRegisterStep(1)}
                            disabled={!registerName.trim() || selectedTypes.length === 0}
                            className="flex-1 h-14 btn-picnic flex items-center justify-center gap-2 text-base"
                        >
                            Continue
                            <ChevronRight size={18} strokeWidth={2.5} />
                        </button>
                    )}

                    {mode === "register" && registerStep === 1 && (
                        <button
                            onClick={handleRegisterFinish}
                            className="flex-1 h-14 btn-picnic flex items-center justify-center gap-2 text-base"
                        >
                            <Sparkles size={18} />
                            Let&apos;s go!
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
