"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { getPersonas, PersonaFull } from "@/lib/api";
import { useStore } from "@/lib/store/useStore";
import { Persona, Restriction } from "@/types";
import { cn } from "@/lib/utils";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { PicnicLogo } from "@/components/shared/PicnicLogo";

const DIET_OPTIONS = [
    { id: "omnivor", label: "Everything" },
    { id: "flexitarisch", label: "Flexitarian" },
    { id: "vegetarisch", label: "Vegetarian" },
    { id: "vegan", label: "Vegan" },
    { id: "pescetarisch", label: "Pescatarian" },
];

const RESTRICTION_OPTIONS: { id: Restriction; label: string; emoji: string }[] =
    [
        { id: "lactose", label: "Lactose-free", emoji: "🥛" },
        { id: "gluten", label: "Gluten-free", emoji: "🌾" },
        { id: "nuts", label: "Nut allergy", emoji: "🥜" },
        { id: "vegan", label: "Vegan", emoji: "🌱" },
        { id: "vegetarian", label: "Vegetarian", emoji: "🥦" },
        { id: "halal", label: "Halal", emoji: "☪️" },
        { id: "kosher", label: "Kosher", emoji: "✡️" },
        { id: "soja", label: "Soy allergy", emoji: "🫘" },
        { id: "egg", label: "No egg", emoji: "🥚" },
        { id: "fish", label: "No fish", emoji: "🐟" },
    ];

const variants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
};

export default function OnboardingPage() {
    const router = useRouter();
    const { initPersona, setHousehold, setRestrictions } = useStore();

    const [personas, setPersonas] = useState<PersonaFull[]>([]);
    const [loadingPersonas, setLoadingPersonas] = useState(true);

    const [step, setStep] = useState(0);
    const [selectedPersona, setSelectedPersona] = useState<Persona | null>(
        null,
    );
    const [budget, setBudget] = useState(180);
    const [householdSize, setHouseholdSize] = useState(4);
    const [dietStyle, setDietStyle] = useState<string>("omnivor");
    const [activeRestrictions, setActiveRestrictions] = useState<Restriction[]>(
        [],
    );

    useEffect(() => {
        getPersonas()
            .then(setPersonas)
            .finally(() => setLoadingPersonas(false));
    }, []);

    const handlePersonaSelect = (persona: Persona) => {
        setSelectedPersona(persona);
        setBudget(persona.household.weeklyBudget);
        setHouseholdSize(persona.household.size);
        setDietStyle(persona.household.dietStyle);
        setActiveRestrictions(persona.defaultRestrictions);
    };

    const toggleRestriction = (r: Restriction) => {
        setActiveRestrictions((prev) =>
            prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
        );
    };

    const handleFinish = () => {
        if (!selectedPersona) return;
        initPersona(selectedPersona);
        setHousehold({
            ...selectedPersona.household,
            weeklyBudget: budget,
            size: householdSize,
            dietStyle: dietStyle as any,
        });
        setRestrictions(activeRestrictions);
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <DemoBanner />

            {/* Header */}
            <div className="px-5 pt-6 pb-4">
                {/* PIC NIC Logo */}
                <div className="flex items-center gap-2.5 mb-6">
                    <PicnicLogo size={40} />
                    <span className="text-[22px] font-semibold text-gray-900 tracking-tight">
                        picnic
                        <span className="text-[#E1141C] font-bold">+</span>
                    </span>
                </div>

                {/* Progress indicator */}
                <div className="flex gap-1.5 mb-4">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1 rounded-full transition-all duration-300",
                                i === step
                                    ? "bg-[#E1141C] w-10"
                                    : i < step
                                      ? "bg-[#E1141C]/40 w-5"
                                      : "bg-[#E2E1DD] w-5",
                            )}
                        />
                    ))}
                </div>

                <p className="text-xs text-gray-400 font-medium">
                    {step === 0 && "Step 1 of 3 · Choose profile"}
                    {step === 1 && "Step 2 of 3 · Household"}
                    {step === 2 && "Step 3 of 3 · Diet"}
                </p>
            </div>

            {/* Steps */}
            <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                    {step === 0 && (
                        <motion.div
                            key="step0"
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.22 }}
                            className="px-5"
                        >
                            <h1 className="text-[28px] font-semibold text-gray-900 mb-1 tracking-tight">
                                Who are you?
                            </h1>
                            <p className="text-sm text-[#9B9B9B] mb-5">
                                We'll personalize your shopping right away.
                            </p>

                            <div className="space-y-3">
                                {loadingPersonas && (
                                    <p className="text-sm text-[#9B9B9B] text-center py-6">
                                        Lade Profile…
                                    </p>
                                )}
                                {personas.map((persona) => (
                                    <button
                                        key={persona.id}
                                        onClick={() =>
                                            handlePersonaSelect(persona)
                                        }
                                        className={cn(
                                            "w-full text-left rounded-2xl border-2 p-4 transition-all tap-active",
                                            selectedPersona?.id === persona.id
                                                ? "border-[#E1141C] bg-[#FDECEA]"
                                                : "border-[#E2E1DD] bg-white",
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-4xl leading-none mt-0.5">
                                                {persona.avatar}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-bold text-gray-900 text-base">
                                                        {persona.name}
                                                    </h3>
                                                    {selectedPersona?.id ===
                                                        persona.id && (
                                                        <span className="text-[#E1141C] text-lg">
                                                            ✓
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {persona.tagline}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                                                    {persona.description}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div
                            key="step1"
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.22 }}
                            className="px-5"
                        >
                            <h1 className="text-[28px] font-semibold text-gray-900 mb-1 tracking-tight">
                                Your household
                            </h1>
                            <p className="text-sm text-[#9B9B9B] mb-6">
                                Pre-filled for you – feel free to adjust.
                            </p>

                            {/* Household size */}
                            <div className="mb-6">
                                <label className="text-sm font-semibold text-gray-700 block mb-3">
                                    How many people?
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
                                                    : "bg-white border-[#E2E1DD] text-[#3D3D3D]",
                                            )}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Budget slider */}
                            <div className="mb-6">
                                <label className="text-sm font-semibold text-gray-700 block mb-2">
                                    Weekly budget
                                    <span className="ml-2 text-[#E1141C] font-black text-lg">
                                        {budget} €
                                    </span>
                                </label>
                                <input
                                    type="range"
                                    min={20}
                                    max={400}
                                    step={5}
                                    value={budget}
                                    onChange={(e) =>
                                        setBudget(Number(e.target.value))
                                    }
                                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, #E1141C ${((budget - 20) / 380) * 100}%, #e5e7eb ${((budget - 20) / 380) * 100}%)`,
                                    }}
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>€20</span>
                                    <span>€400</span>
                                </div>
                            </div>

                            {/* Diet style */}
                            <div>
                                <label className="text-sm font-semibold text-gray-700 block mb-3">
                                    Diet style
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {DIET_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setDietStyle(opt.id)}
                                            className={cn(
                                                "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                                                dietStyle === opt.id
                                                    ? "bg-[#E1141C] border-[#E1141C] text-white"
                                                    : "bg-white border-[#E2E1DD] text-[#3D3D3D]",
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.22 }}
                            className="px-5"
                        >
                            <h1 className="text-[28px] font-semibold text-gray-900 mb-1 tracking-tight">
                                Dietary restrictions
                            </h1>
                            <p className="text-sm text-[#9B9B9B] mb-5">
                                What should we always keep in mind?
                            </p>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {RESTRICTION_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() =>
                                            toggleRestriction(opt.id)
                                        }
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border transition-all",
                                            activeRestrictions.includes(opt.id)
                                                ? "bg-[#E1141C] border-[#E1141C] text-white"
                                                : "bg-white border-[#E2E1DD] text-[#3D3D3D]",
                                        )}
                                    >
                                        <span>{opt.emoji}</span>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>

                            {activeRestrictions.length === 0 && (
                                <p className="text-xs text-gray-400 italic">
                                    No restrictions selected
                                </p>
                            )}

                            {/* Teaser */}
                            <div className="rounded-2xl bg-[#FFF0F0] border border-[#ffdcdd] p-4 mt-4">
                                <div className="flex gap-2 items-start">
                                    <Sparkles
                                        size={18}
                                        className="text-[#E1141C] mt-0.5 flex-shrink-0"
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">
                                            Your cart is already ready!
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Based on your previous orders, we've
                                            prepared{" "}
                                            {selectedPersona?.defaultCart
                                                .length ?? 0}{" "}
                                            items for this week.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom CTA */}
            <div className="px-5 pb-8 pt-4 flex gap-3">
                {step > 0 && (
                    <button
                        onClick={() => setStep(step - 1)}
                        className="w-14 h-14 flex items-center justify-center rounded-full bg-[#EFEEE9] text-[#6D6D6D] flex-shrink-0 tap-active"
                    >
                        <ChevronLeft size={20} />
                    </button>
                )}

                <button
                    onClick={() => {
                        if (step < 2) {
                            if (step === 0 && !selectedPersona) return;
                            setStep(step + 1);
                        } else {
                            handleFinish();
                        }
                    }}
                    disabled={step === 0 && !selectedPersona}
                    className={cn(
                        "flex-1 h-14 btn-picnic flex items-center justify-center gap-2 text-base",
                    )}
                >
                    {step < 2 ? (
                        <>
                            Continue
                            <ChevronRight size={18} strokeWidth={2.5} />
                        </>
                    ) : (
                        <>
                            <Sparkles size={18} />
                            Let&apos;s go!
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
