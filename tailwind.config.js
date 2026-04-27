/** @type {import('tailwindcss').Config} */
// Tokens transcribed from design-system/colors_and_type.css
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        steel: {
          50: '#f1f5f9', 100: '#e2e8f0', 200: '#cbd5e1', 300: '#94a3b8',
          400: '#64748b', 500: '#475569', 600: '#334155', 700: '#1e293b',
          800: '#0f172a', 900: '#020617',
        },
        primary: {
          50: '#eef4ff', 100: '#d9e6ff', 200: '#b3ccff', 300: '#7da6ff',
          400: '#4d80f5', 500: '#2c5fd9', 600: '#1f47b3', 700: '#173a8f',
          800: '#112c6e', 900: '#0a1c4a',
        },
        amber: {
          50: '#fff8eb', 100: '#ffecc4', 200: '#ffd98a', 300: '#ffbf4a',
          400: '#f5a524', 500: '#d98a0e', 600: '#b56d09', 700: '#8a510a',
        },
        crimson: {
          50: '#fef2f3', 100: '#fde3e5', 200: '#fac8cd', 300: '#f59ba4',
          400: '#ec6373', 500: '#dc2f47', 600: '#b91c34', 700: '#971529',
        },
        emerald: {
          50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
          400: '#34d399', 500: '#10a965', 600: '#0d8a52', 700: '#086c40',
        },
        violet: { 500: '#7c3aed' },

        // Semantic surface / fg tokens
        bg: '#f7f8fa',
        'bg-subtle': '#eef0f4',
        surface: '#ffffff',
        'surface-2': '#fafbfc',
        'fg-1': '#0f172a',
        'fg-2': '#475569',
        'fg-3': '#94a3b8',
        border: { DEFAULT: '#e4e7ec', strong: '#cbd5e1' },
      },
      fontFamily: {
        display: ['Manrope', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        // [size, lineHeight] tuples — matches token scale
        xs: ['12px', '16px'],
        sm: ['13px', '18px'],
        base: ['14px', '20px'],
        md: ['15px', '22px'],
        lg: ['17px', '24px'],
        xl: ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '38px'],
        '4xl': ['36px', '44px'],
        '5xl': ['48px', '56px'],
      },
      spacing: {
        // 4-pt grid extras (Tailwind already has 1=4px, 2=8px etc.)
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
        '18': '72px',
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        pill: '999px',
      },
      boxShadow: {
        xs: '0 1px 1px rgba(15, 23, 42, 0.04)',
        sm: '0 1px 2px rgba(15, 23, 42, 0.06), 0 1px 1px rgba(15, 23, 42, 0.04)',
        md: '0 4px 8px -2px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        lg: '0 12px 24px -8px rgba(15, 23, 42, 0.14), 0 4px 8px -4px rgba(15, 23, 42, 0.06)',
        xl: '0 24px 48px -12px rgba(15, 23, 42, 0.22)',
        focus: '0 0 0 3px rgba(44, 95, 217, 0.25)',
        'focus-amber': '0 0 0 3px rgba(245, 165, 36, 0.30)',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        emphasize: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        fast: '120ms',
        base: '180ms',
        slow: '280ms',
        celebrate: '520ms',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.85)', opacity: 0 },
          '60%': { transform: 'scale(1.06)', opacity: 1 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245,165,36,0)' },
          '50%': { boxShadow: '0 0 0 12px rgba(245,165,36,0)' },
        },
        skeleton: {
          '0%, 100%': { opacity: 0.5 },
          '50%': { opacity: 1 },
        },
      },
      animation: {
        pop: 'pop 520ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        glow: 'glow 2.5s ease-in-out infinite',
        skeleton: 'skeleton 1.4s ease-in-out infinite',
      },
      letterSpacing: {
        display: '-0.02em',
        h1: '-0.018em',
        h2: '-0.012em',
        caption: '0.06em',
      },
      maxWidth: {
        page: '1280px',
      },
    },
  },
  plugins: [],
}
