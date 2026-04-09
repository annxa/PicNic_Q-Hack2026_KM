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
          // ── Core brand ───────────────────────────────────────────────
          red:    "#E1171E",  // Main Picnic red
          red2:   "#B40117",  // Darker Picnic red
          green:  "#308807",  // Interface elements outside tiles
          green8: "#295813",  // Darker green

          // ── Greybase (warm) ──────────────────────────────────────────
          white:  "#FFFFFF",
          grey0:  "#FCFAF9",  // Lightest warm white
          grey1:  "#F8F5F2",  // Page / section background
          grey2:  "#C9C6C3",  // Borders, dividers
          grey3:  "#787570",  // Muted / secondary text
          grey4:  "#5B534E",  // Icon / label text
          grey5:  "#333333",  // Primary body text
          black:  "#000000",

          // ── Labels ───────────────────────────────────────────────────
          label: {
            blue1:   "#1977D5",  // Frozen
            blue3:   "#04829A",  // Baby
            blue4:   "#2378C8",  // Baby (alt)
            orange1: "#D9540D",  // Fancy
            orange2: "#D54407",  // Baby (alt)
            yellow2: "#FBD92B",  // Promo
            yellow3: "#F7C86E",  // Baby
            red4:    "#6A1835",  // Christmas
            pink1:   "#CC3C8A",  // Baby
            purple1: "#7864DA",  // Baby
            green4:  "#628003",  // Sustainable
            green5:  "#F3F6E9",  // New label background
          },

          // ── Tile colours ─────────────────────────────────────────────
          tile: {
            brown1:  "#9C6D2B",  // Neutral primary
            brown2:  "#F0E8DD",  // Neutral secondary
            green6:  "#628003",  // Vegetables primary
            green7:  "#E7ECD7",  // Vegetables secondary
            blue5:   "#248282",  // Dairy primary
            blue6:   "#E3EEEE",  // Dairy secondary
            red2:    "#B40117",  // Meat primary
            red3:    "#EFDCDC",  // Meat secondary
            grey6:   "#81755F",  // Non-food primary
            grey7:   "#EBE9E5",  // Non-food secondary
          },
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
        "2dp":       "0 1px 2px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
        "4dp":       "0 2px 4px rgba(0,0,0,0.07), 0 2px 6px rgba(0,0,0,0.05)",
        "8dp":       "0 4px 8px rgba(0,0,0,0.08), 0 2px 12px rgba(0,0,0,0.06)",
        card:        "0 1px 3px rgba(0,0,0,0.06), 0 1px 8px rgba(0,0,0,0.04)",
        "card-hover":"0 4px 16px rgba(0,0,0,0.10)",
      },
      animation: {
        shimmer:    "shimmer 1.5s infinite",
        "bounce-in":"bounce-in 0.4s ease-out",
      },
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "bounce-in": {
          "0%":   { transform: "scale(0.8)", opacity: "0" },
          "60%":  { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)",   opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
