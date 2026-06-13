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
        bg: {
          base: "#05060e",
          surface: "#0b0e1a",
          raised: "#111526",
        },
        border: "rgba(255,255,255,0.06)",
        text: {
          primary: "#e2e8f0",
          secondary: "#64748b",
          muted: "#334155",
        },
        accent: {
          DEFAULT: "#ff6b35",
          dim: "rgba(255,107,53,0.15)",
        },
        threat: {
          critical: "#dc2626",
          high: "#ea580c",
          medium: "#ca8a04",
          low: "#2563eb",
        }
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      }
    },
  },
  plugins: [],
};
export default config;