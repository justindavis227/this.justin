import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'os-black': '#0F1117',
        'signal-blue': {
          DEFAULT: '#3B82F6',
          700: '#2563EB',
          100: '#DBEAFE',
        },
        'live-yellow': {
          DEFAULT: '#FBBF24',
          600: '#D9A312',
        },
        cloud: '#F9FAFB',
        'os-slate': '#1E293B',
        'border-dark': '#2A3344',
        'os-muted': '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
