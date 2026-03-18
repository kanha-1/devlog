/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        display: ["Syne", "sans-serif"],
      },
      colors: {
        base: {
          900: "#0d0d0d",
          800: "#141414",
          700: "#1a1a1a",
          600: "#222222",
          500: "#2a2a2a",
        },
        border: "rgba(255,255,255,0.07)",
        "border-hover": "rgba(255,255,255,0.13)",
        accent: "#e8e0d0",
      },
      keyframes: {
        "fade-in": { from: { opacity: 0, transform: "translateY(4px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        "slide-in": { from: { transform: "translateX(-8px)", opacity: 0 }, to: { transform: "translateX(0)", opacity: 1 } },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease",
        "slide-in": "slide-in 0.15s ease",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
