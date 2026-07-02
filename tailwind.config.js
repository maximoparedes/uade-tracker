/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    { pattern: /^(border|text|bg)-(cyan|sky|blue|violet|purple|green|amber|rose)-400/ },
    { pattern: /^bg-(cyan|sky|blue|violet|purple|green|amber|rose)-400\/(10|15|20)/ },
    { pattern: /^border-(cyan|sky|blue|violet|purple|green|amber|rose)-400\/(30|50)/ },
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060c1a',
          900: '#0a1020',
          800: '#0e1829',
          700: '#152236',
          600: '#1e3347',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}

