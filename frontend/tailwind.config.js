/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        kannada: ['"Noto Sans Kannada"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        indic: {
          navy: '#101A9B',
          blue: '#1769F5',
          purple: '#873BEE',
          purpleDark: '#7025D8',
          purpleLight: '#F3E8FF',
          bg: '#F7F8FF',
          card: '#FFFFFF',
          border: '#D8E1FF',
          borderLight: '#E8EEFF',
          success: '#16B981',
          warning: '#F59E0B',
          danger: '#EF476F',
          textDark: '#101A9B',
          textBody: '#334155',
          textMuted: '#64748B',
        },
        navy: {
          950: '#080c15',
          900: '#0b101b',
          850: '#0f172a',
          800: '#111726',
          750: '#162038',
          700: '#1e293b',
          600: '#334155',
        },
        electric: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        accent: {
          violet: '#8b5cf6',
          teal: '#10b981',
          amber: '#f59e0b',
          crimson: '#ef4444',
        }
      },
      boxShadow: {
        'glow-electric': '0 0 20px -5px rgba(59, 130, 246, 0.3)',
        'glow-violet': '0 0 20px -5px rgba(139, 92, 246, 0.3)',
        'glow-teal': '0 0 20px -5px rgba(16, 185, 129, 0.3)',
        'indic-card': '0 4px 20px -2px rgba(23, 105, 245, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'indic-hover': '0 10px 25px -3px rgba(23, 105, 245, 0.1), 0 4px 10px -2px rgba(0, 0, 0, 0.04)',
        'indic-purple': '0 4px 14px 0 rgba(135, 59, 238, 0.35)',
      }
    },
  },
  plugins: [],
}
