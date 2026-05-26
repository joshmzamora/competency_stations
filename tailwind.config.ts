import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Rajdhani", "Bahnschrift", "Segoe UI", "sans-serif"],
        body: ["Aptos", "Segoe UI", "sans-serif"]
      },
      colors: {
        charcoal: "#080b0f",
        panel: "#101820",
        trauma: "#ff304d",
        scrub: "#24f5c7",
        monitor: "#6ef7ff",
        amber: "#ffb020"
      },
      boxShadow: {
        alert: "0 0 28px rgba(255, 48, 77, 0.34)",
        scrub: "0 0 24px rgba(36, 245, 199, 0.24)"
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" }
        },
        pulseLine: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.95" }
        }
      },
      animation: {
        scan: "scan 8s linear infinite",
        pulseLine: "pulseLine 2.2s ease-in-out infinite"
      }
    }
  },
  plugins: []
} satisfies Config;
