import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAF8F5",
        surface: "#FFFFFF",
        "surface-muted": "#F4EFE6",
        emerald: {
          50: "#f0fdf7",
          100: "#dcfce9",
          200: "#bbf7d2",
          500: "#10b981",
          700: "#047857",
          800: "#0D4A3E",
          900: "#09332A",
          950: "#051F19",
        },
        gold: {
          50: "#fdfbf4",
          100: "#faf4df",
          200: "#f3e5b3",
          300: "#F5DF97",
          400: "#e6c354",
          500: "#D4AF37",
          600: "#B89025",
          700: "#926E17",
          800: "#755615",
          900: "#614716",
        },
        navy: {
          800: "#1E2A38",
          900: "#121A24",
        },
        border: "#E9E3D8",
        card: "#FFFFFF",
        "card-hover": "#FAF7F0",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        serif: ["Playfair Display", "Georgia", "Cambria", "serif"],
      },
      boxShadow: {
        subtle: "0 2px 10px rgba(13, 74, 62, 0.04)",
        elevated: "0 10px 30px rgba(13, 74, 62, 0.08)",
        gold: "0 4px 14px rgba(212, 175, 55, 0.25)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
};
export default config;
