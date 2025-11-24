import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Minimal theme
        minimal: {
          bg: "#0a0a0a",
          fg: "#e5e5e5",
          primary: "#8b5cf6",
          secondary: "#6366f1",
          accent: "#a78bfa",
          muted: "#404040",
        },
        // Twilight theme
        twilight: {
          bg: "#0f0a1a",
          fg: "#e8e0f5",
          primary: "#9333ea",
          secondary: "#7c3aed",
          accent: "#c084fc",
          muted: "#4c1d95",
        },
        // Haunted theme
        haunted: {
          bg: "#1a0a2e",
          fg: "#f0e6ff",
          primary: "#a855f7",
          secondary: "#9333ea",
          accent: "#d8b4fe",
          muted: "#581c87",
        },
      },
      fontFamily: {
        heading: ["Cinzel", "serif"],
        body: ["Crimson Text", "serif"],
      },
      animation: {
        "breathing-glow": "breathingGlow 3s ease-in-out infinite",
      },
      keyframes: {
        breathingGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(139, 92, 246, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
