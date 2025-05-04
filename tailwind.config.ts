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
            DEFAULT: "rgb(64, 78, 204)",
            foreground: "rgb(250, 250, 250)",
            50:  "rgb(240, 242, 255)",    
            100: "rgb(226, 232, 255)",
            200: "rgb(210, 221, 255)",  
            300: "rgb(184, 201, 255)",
            400: "rgb(146, 169, 255)",
            500: "rgb(106, 138, 235)",
            600: "rgb(64, 78, 204)",
            700: "rgb(52, 64, 180)",
            800: "rgb(41, 50, 145)",
            900: "rgb(33, 41, 112)",
            950: "rgb(20, 28, 75)",
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
