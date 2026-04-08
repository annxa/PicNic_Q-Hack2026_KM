"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { personas } from "@/lib/mock/personas";
import { useStore } from "@/lib/store/useStore";
import { Persona, Restriction } from "@/types";
import { cn } from "@/lib/utils";
import { DemoBanner } from "@/components/shared/DemoBanner";

const DIET_OPTIONS = [
  { id: "omnivor", label: "Alles" },
  { id: "flexitarisch", label: "Flexitarisch" },
  { id: "vegetarisch", label: "Vegetarisch" },
  { id: "vegan", label: "Vegan" },
  { id: "pescetarisch", label: "Pescetarisch" },
];

const RESTRICTION_OPTIONS: { id: Restriction; label: string; emoji: string }[] = [
  { id: "laktose", label: "Laktosefrei", emoji: "🥛" },
  { id: "gluten", label: "Glutenfrei", emoji: "🌾" },
  { id: "nüsse", label: "Nussallergie", emoji: "🥜" },
  { id: "vegan", label: "Vegan", emoji: "🌱" },
  { id: "vegetarisch", label: "Vegetarisch", emoji: "🥦" },
  { id: "halal", label: "Halal", emoji: "☪️" },
  { id: "kosher", label: "Kosher", emoji: "✡️" },
  { id: "soja", label: "Sojaallgergie", emoji: "🫘" },
  { id: "ei", label: "Ohne Ei", emoji: "🥚" },
  { id: "fisch", label: "Kein Fisch", emoji: "🐟" },
];

const variants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function OnboardingPage() {
  const router = useRouter();
  const { initPersona, setHousehold, setRestrictions } = useStore();

  const [step, setStep] = useState(0);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [budget, setBudget] = useState(180);
  const [householdSize, setHouseholdSize] = useState(4);
  const [dietStyle, setDietStyle] = useState<string>("omnivor");
  const [activeRestrictions, setActiveRestrictions] = useState<Restriction[]>([]);

  const handlePersonaSelect = (persona: Persona) => {
    setSelectedPersona(persona);
    setBudget(persona.household.weeklyBudget);
    setHouseholdSize(persona.household.size);
    setDietStyle(persona.household.dietStyle);
    setActiveRestrictions(persona.defaultRestrictions);
  };

  const toggleRestriction = (r: Restriction) => {
    setActiveRestrictions((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
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
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 bg-[#E1141C] rounded-xl flex items-center justify-center">
            <span className="text-white text-xl font-black">P</span>
          </div>
          <span className="text-xl font-black text-gray-900">Picnic<span className="text-[#E1141C]">+</span></span>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 mb-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === step ? "bg-[#E1141C] w-8" : i < step ? "bg-[#E1141C] opacity-40 w-4" : "bg-gray-200 w-4"
              )}
            />
          ))}
        </div>

        <p className="text-xs text-gray-400 font-medium">
          {step === 0 && "Schritt 1 von 3 · Profil wählen"}
          {step === 1 && "Schritt 2 von 3 · Haushalt"}
          {step === 2 && "Schritt 3 von 3 · Ernährung"}
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
              <h1 className="text-2xl font-black text-gray-900 mb-1">
                Wer bist du?
              </h1>
              <p className="text-sm text-gray-500 mb-5">
                Wir personalisieren deinen Einkauf sofort.
              </p>

              <div className="space-y-3">
                {personas.map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => handlePersonaSelect(persona)}
                    className={cn(
                      "w-full text-left rounded-2xl border-2 p-4 transition-all tap-active",
                      selectedPersona?.id === persona.id
                        ? "border-[#E1141C] bg-[#FFF0F0]"
                        : "border-gray-100 bg-gray-50 hover:border-gray-200"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-4xl leading-none mt-0.5">{persona.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-900 text-base">{persona.name}</h3>
                          {selectedPersona?.id === persona.id && (
                            <span className="text-[#E1141C] text-lg">✓</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{persona.tagline}</p>
                        <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{persona.description}</p>
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
              <h1 className="text-2xl font-black text-gray-900 mb-1">
                Dein Haushalt
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                Schon vorausgefüllt – pass gerne an.
              </p>

              {/* Household size */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 block mb-3">
                  Wie viele Personen?
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      onClick={() => setHouseholdSize(n)}
                      className={cn(
                        "w-12 h-12 rounded-2xl text-sm font-bold border-2 transition-all",
                        householdSize === n
                          ? "bg-[#E1141C] border-[#E1141C] text-white"
                          : "bg-gray-50 border-gray-200 text-gray-700"
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
                  Wochenbudget
                  <span className="ml-2 text-[#E1141C] font-black text-lg">{budget} €</span>
                </label>
                <input
                  type="range"
                  min={20}
                  max={400}
                  step={5}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #E1141C ${((budget - 20) / 380) * 100}%, #e5e7eb ${((budget - 20) / 380) * 100}%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>20 €</span>
                  <span>400 €</span>
                </div>
              </div>

              {/* Diet style */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-3">
                  Ernährungsstil
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIET_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setDietStyle(opt.id)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all",
                        dietStyle === opt.id
                          ? "bg-[#E1141C] border-[#E1141C] text-white"
                          : "bg-gray-50 border-gray-200 text-gray-700"
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
              <h1 className="text-2xl font-black text-gray-900 mb-1">
                Unverträglichkeiten
              </h1>
              <p className="text-sm text-gray-500 mb-5">
                Was sollen wir immer im Blick behalten?
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {RESTRICTION_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => toggleRestriction(opt.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold border-2 transition-all",
                      activeRestrictions.includes(opt.id)
                        ? "bg-[#E1141C] border-[#E1141C] text-white"
                        : "bg-gray-50 border-gray-200 text-gray-700"
                    )}
                  >
                    <span>{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>

              {activeRestrictions.length === 0 && (
                <p className="text-xs text-gray-400 italic">Keine Einschränkungen ausgewählt</p>
              )}

              {/* Teaser */}
              <div className="rounded-2xl bg-[#FFF0F0] border border-[#ffdcdd] p-4 mt-4">
                <div className="flex gap-2 items-start">
                  <Sparkles size={18} className="text-[#E1141C] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      Dein Warenkorb ist schon bereit!
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Wir haben auf Basis deiner letzten Bestellungen {selectedPersona?.defaultCart.length ?? 0} Artikel für diese Woche vorbereitet.
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
            className="w-12 h-14 flex items-center justify-center rounded-2xl bg-gray-100 text-gray-500 flex-shrink-0"
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
            "flex-1 h-14 btn-picnic flex items-center justify-center gap-2 text-base disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          {step < 2 ? (
            <>
              Weiter
              <ChevronRight size={18} strokeWidth={2.5} />
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Los geht&apos;s!
            </>
          )}
        </button>
      </div>
    </div>
  );
}
