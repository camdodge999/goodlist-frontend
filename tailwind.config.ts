import { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
    darkMode: false,
    content: [
      "./pages/**/*.{js,jsx}",
      "./components/**/*.{js,jsx}",
      "./app/**/*.{js,jsx}",
      "./src/**/*.{js,jsx}",
      "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
      extend: {
        colors: {
          border: "hsl(var(--border))",
          input: "hsl(var(--input))",
          ring: "hsl(var(--ring))",
          background: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
          primary: {
            DEFAULT: "oklch(54.6% 0.245 262.881)",
            foreground: "oklch(0.985 0 0)",
            50:  "oklch(97% 0.014 254.604)",    
            100: "oklch(93.2% 0.032 255.585)",
            200: "oklch(88.2% 0.059 254.128)",  
            300: "oklch(80.9% 0.105 251.813)",
            400: "oklch(70.7% 0.165 254.624)",
            500: "oklch(62.3% 0.214 259.815)",
            600: "oklch(54.6% 0.245 262.881)",
            700: "oklch(48.8% 0.243 264.376)",
            800: "oklch(42.4% 0.199 265.638)",
            900: "oklch(37.9% 0.146 265.522)",
            950: "oklch(28.2% 0.091 267.935)",
          },
          secondary: {
            DEFAULT: "hsl(var(--secondary))",
            foreground: "hsl(var(--secondary-foreground))",
          },
          destructive: {
            DEFAULT: "hsl(var(--destructive))",
            foreground: "hsl(var(--destructive-foreground))",
          },
          muted: {
            DEFAULT: "hsl(var(--muted))",
            foreground: "hsl(var(--muted-foreground))",
          },
          accent: {
            DEFAULT: "hsl(var(--accent))",
            foreground: "hsl(var(--accent-foreground))",
          },
          popover: {
            DEFAULT: "hsl(var(--popover))",
            foreground: "hsl(var(--popover-foreground))",
          },
          card: {
            DEFAULT: "hsl(var(--card))",
            foreground: "hsl(var(--card-foreground))",
          },
        },
        borderRadius: {
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
        },
        keyframes: {
          "accordion-down": {
            from: { height: 0 },
            to: { height: "var(--radix-accordion-content-height)" },
          },
          "accordion-up": {
            from: { height: "var(--radix-accordion-content-height)" },
            to: { height: 0 },
          },
          "fade-in": {
            "0%": { opacity: "0" },
            "100%": { opacity: "1" },
          },
          "fade-in-up": {
            "0%": { opacity: "0", transform: "translateY(20px)" },
            "100%": { opacity: "1", transform: "translateY(0)" },
          },
          "subtle-zoom": {
            "0%": { transform: "scale(1)" },
            "100%": { transform: "scale(1.05)" },
          },
          fadeInUp: {
            "0%": {
              opacity: "0",
              transform: "translateY(20px)",
            },
            "100%": {
              opacity: "1",
              transform: "translateY(0)",
            },
          },
          fadeIn: {
            "0%": {
              opacity: "0",
            },
            "100%": {
              opacity: "1",
            },
          },
          subtleZoom: {
            "0%, 100%": {
              transform: "scale(1)",
            },
            "50%": {
              transform: "scale(1.05)",
            },
          },
          gradient: {
            "0%, 100%": {
              "background-size": "200% 200%",
              "background-position": "left center",
            },
            "50%": {
              "background-size": "200% 200%",
              "background-position": "right center",
            },
          },
          float: {
            "0%, 100%": {
              transform: "translateY(0)",
            },
            "50%": {
              transform: "translateY(-20px)",
            },
          },
          wave: {
            "0%, 100%": {
              transform: "translateY(0)",
            },
            "50%": {
              transform: "translateY(-10px)",
            },
          },
          blob: {
            "0%": {
              transform: "translate(0px, 0px) scale(1)",
            },
            "33%": {
              transform: "translate(50px, -50px) scale(1.2)",
            },
            "66%": {
              transform: "translate(-30px, 30px) scale(0.8)",
            },
            "100%": {
              transform: "translate(0px, 0px) scale(1)",
            },
          },
          "grid-fade": {
            "0%, 100%": {
              opacity: "0.3",
            },
            "50%": {
              opacity: "0.5",
            },
          },
          bounceSubtle: {
            "0%, 100%": {
              transform: "translateY(0)",
            },
            "50%": {
              transform: "translateY(-10px)",
            },
          },
        },
        animation: {
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
          "fade-in": "fade-in 0.5s ease-out",
          "fade-in-up": "fadeInUp 0.5s ease-out forwards",
          "subtle-zoom": "subtleZoom 20s ease-in-out infinite",
          "gradient": "gradient 8s linear infinite",
          float: "float 5s ease-in-out infinite",
          wave: "wave 3s ease-in-out infinite",
          blob: "blob 7s infinite",
          "grid-fade": "grid-fade 8s ease-in-out infinite",
          "bounce-subtle": "bounceSubtle 3s ease-in-out infinite",
          "spin-slow": "spin 8s linear infinite",
          "spin-slow-reverse": "spin 8s linear infinite reverse",
        },
      },
    },
  plugins: [tailwindcssAnimate],
} satisfies Config;
