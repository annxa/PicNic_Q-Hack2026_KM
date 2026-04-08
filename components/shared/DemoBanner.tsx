"use client";
import { useState } from "react";
import { X } from "lucide-react";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#FBD92B] text-[#3D3D3D] text-[11px] font-medium sticky top-0 z-50">
      <span>🎬 Hackathon-Demo · Daten sind simuliert</span>
      <button
        onClick={() => setDismissed(true)}
        className="p-0.5 rounded opacity-60 hover:opacity-100 flex-shrink-0"
        aria-label="Schließen"
      >
        <X size={13} />
      </button>
    </div>
  );
}
