"use client";
import { useState } from "react";
import { X } from "lucide-react";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-900 text-white text-xs font-medium sticky top-0 z-50">
      <span>🎬 Hackathon-Demo – Daten sind simuliert</span>
      <button
        onClick={() => setDismissed(true)}
        className="p-0.5 rounded opacity-70 hover:opacity-100"
        aria-label="Schließen"
      >
        <X size={14} />
      </button>
    </div>
  );
}
