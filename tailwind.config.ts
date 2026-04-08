import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        picnic: {
          // Core brand
          red: "#E1141C",
          "red-dark": "#B40117",
          "red-bg": "#FDECEA",
          green: "#3E8B3E",
          "green-dark": "#2D6B2D",
          "green-bg": "#E8F5E8",
          // Greyscale (warm, from building blocks)
          grey0: "#F5F4F0",
          grey1: "#EFEEE9",
          grey2: "#E2E1DD",
          grey3: "#9B9B9B",
          grey4: "#6D6D6D",
          grey5: "#3D3D3D",
          // Tile secondary backgrounds
          "tile-default": "#F0E8DD",
          "tile-veggie": "#E7ECD7",
          "tile-dairy": "#E3EEEE",
          "tile-meat": "#EFDCDC",
          "tile-nonfood": "#EBE9E5",
          // Label colors
          "promo": "#FBD92B",
          "fancy": "#D9540D",
          "frozen": "#1977D5",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "2dp": "0 1px 2px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
        "4dp": "0 2px 4px rgba(0,0,0,0.07), 0 2px 6px rgba(0,0,0,0.05)",
        "8dp": "0 4px 8px rgba(0,0,0,0.08), 0 2px 12px rgba(0,0,0,0.06)",
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 8px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.10)",
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
        "bounce-in": "bounce-in 0.4s ease-out",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "60%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
