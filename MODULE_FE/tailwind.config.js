/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Semantic tokens (dùng CSS var để hỗ trợ theming) ──────────────
        background:       "var(--color-background)",
        foreground:       "var(--color-foreground)",
        card:             "var(--color-card)",
        muted:            "var(--color-muted)",
        "muted-foreground": "var(--color-muted-foreground)",
        border:           "var(--color-border)",
        ring:             "var(--color-ring)",

        // ── Accent (Electric Blue gradient pair) ──────────────────────────
        accent:           "var(--color-accent)",
        "accent-secondary": "var(--color-accent-secondary)",
        "accent-foreground": "var(--color-accent-foreground)",

        // ── SpaceLens brand (teal — giữ nguyên để không vỡ UI cũ) ─────────
        primary:          "#0D9488",

        // ── Status / semantic colors (giữ nguyên) ─────────────────────────
        red:              "#EF4444",
        orange:           "#F97316",
        yellow:           "#EAB308",
        green:            "#22C55E",
        blueLight:        "#06B6D4",
        blueDark:         "#3B82F6",
        purple:           "#8B5CF6",
        white:            "#FFFFFF",
        black:            "#000000",
        greenLight:       "#E3FCEB",
        pinkLight:        "#FEEAEA",
        blueLighter:      "#E9F2FF",
        orangeLight:      "#FEFCE8",
      },

      fontFamily: {
        // UI & body — giữ Inter như cũ
        sans:    ["Inter", "system-ui", "sans-serif"],
        // Monospace — nâng cấp sang JetBrains Mono cho section labels/badges
        mono:    ["JetBrains Mono", "DM Mono", "monospace"],
        // Display — Calistoga cho headlines (dùng font-display)
        display: ["Calistoga", "Georgia", "serif"],
      },

      boxShadow: {
        // ── Layered shadow system ──────────────────────────────────────────
        sm:           "0 1px 3px rgba(0,0,0,0.06)",
        md:           "0 4px 6px rgba(0,0,0,0.07)",
        lg:           "0 10px 15px rgba(0,0,0,0.08)",
        xl:           "0 20px 25px rgba(0,0,0,0.10)",
        // Accent-tinted shadows cho primary buttons & featured cards
        accent:       "0 4px 14px rgba(0,82,255,0.25)",
        "accent-lg":  "0 8px 24px rgba(0,82,255,0.35)",
      },

      backgroundImage: {
        // ── Signature gradient (Electric Blue) ────────────────────────────
        "gradient-accent":    "linear-gradient(to right, #0052FF, #4D7CFF)",
        "gradient-accent-d":  "linear-gradient(135deg, #0052FF, #4D7CFF)",
        // Dot pattern texture cho inverted sections
        "dot-pattern":
          "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },

      backgroundSize: {
        // Dot grid spacing
        "dot-32": "32px 32px",
      },

      borderRadius: {
        // Giữ nguyên scale cũ, thêm token rõ ràng hơn
        xl:   "12px",
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },

      animation: {
        // Continuous animations cho hero graphic & badges
        "spin-slow":   "spin 60s linear infinite",
        "float":       "float 5s ease-in-out infinite",
        "float-delay": "float 4s ease-in-out infinite 0.5s",
        "pulse-dot":   "pulseDot 2s ease-in-out infinite",
      },

      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
        pulseDot: {
          "0%, 100%": { transform: "scale(1)",   opacity: "1" },
          "50%":      { transform: "scale(1.3)", opacity: "0.7" },
        },
      },

      transitionTimingFunction: {
        // Custom easing cho entrance animations
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
