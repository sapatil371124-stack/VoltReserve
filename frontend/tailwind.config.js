/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm Ivory, Sand & Linen Palette
        sand: {
          50: '#FAF7F2',
          100: '#F5F0E8',
          200: '#EFE7DC',
          300: '#E5D9C8',
          400: '#D4C2AB',
          500: '#BFAF99',
          600: '#9E8D76',
        },
        // Editorial Warm Terracotta (Primary CTA & Brand)
        terracotta: {
          50: '#FDF7F3',
          100: '#FAEEE6',
          200: '#F5DC CE',
          300: '#E8B99D',
          400: '#B87548',
          500: '#9A5B35',
          600: '#844A29',
          700: '#6E3A1D',
          800: '#582C15',
          900: '#43200E',
        },
        // Warm Muted Amber & Apricot (Secondary Accent)
        amberaccent: {
          300: '#EBC4A0',
          400: '#E0A97E',
          500: '#D59A6A',
          600: '#C68A58',
        },
        // Deep Espresso & Charcoal (Typography)
        espresso: {
          950: '#1D1410',
          900: '#2D211A',
          800: '#433228',
          700: '#5D4A3E',
          600: '#6E594B',
          500: '#7D6B5E',
          400: '#8B786A',
          300: '#A69588',
          200: '#C8BCB0',
          100: '#E8DFD5',
        },
        // Soft Olive & Sage for clean status
        sage: {
          50: '#F2F8F4',
          100: '#E3F0E8',
          500: '#2D6A4F',
          600: '#24553F',
          700: '#1B4030',
        },
      },
      boxShadow: {
        'warm-sm': '0 2px 6px -1px rgba(45, 33, 26, 0.05), 0 1px 3px -1px rgba(45, 33, 26, 0.03)',
        'warm-md': '0 8px 20px -3px rgba(45, 33, 26, 0.07), 0 4px 8px -2px rgba(45, 33, 26, 0.04)',
        'warm-lg': '0 16px 36px -6px rgba(45, 33, 26, 0.09), 0 6px 14px -3px rgba(45, 33, 26, 0.05)',
        'warm-xl': '0 24px 48px -12px rgba(45, 33, 26, 0.12), 0 8px 18px -4px rgba(45, 33, 26, 0.06)',
        'warm-card': '0 10px 30px -5px rgba(45, 33, 26, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        'terracotta-glow': '0 8px 24px -4px rgba(154, 91, 53, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
