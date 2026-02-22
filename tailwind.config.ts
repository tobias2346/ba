import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
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
      fontFamily: {
        body: ['Inter,'],
        headline: ['Nunito'],
      },
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--primary))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
        },
        background: 'hsl(var(--background))',
        light: 'hsl(var(--light))',
        dark: 'hsl(var(--dark))',
        popover: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--light))",
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success) / 0.1)',
        },
        error: {
          DEFAULT: 'hsl(var(--error))',
          foreground: 'hsl(var(--error) / 0.1)',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning) / 0.1)',
        },

        slate: {
          50: 'hsl(var(--slate50))',
          100: 'hsl(var(--slate100))',
          200: 'hsl(var(--slate200))',
          300: 'hsl(var(--slate300))',
          400: 'hsl(var(--slate400))',
          500: 'hsl(var(--slate500))',
          600: 'hsl(var(--slate600))',
          700: 'hsl(var(--slate700))',
          800: 'hsl(var(--slate800))',
          900: 'hsl(var(--slate900))',
          950: 'hsl(var(--slate950))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },

        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
} satisfies Config;
