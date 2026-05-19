/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        daylight: {
          cream:      '#F6F1EA',
          surface:    '#FFFFFF',
          ink:        '#16131A',
          'ink-sub':  '#6B5F6A',
          hair:       '#E9E1D6',
          pink:       '#FF2D72',
          'pink-ink': '#5C0E2E',
          'pink-soft':'#FFE0EC',
          mint:       '#0EBE89',
          'mint-ink': '#086D4F',
          'mint-soft':'#D8F3E8',
          red:        '#E2434B',
          'red-soft': '#FBE3E3',
          amber:      '#F4B400',
        },
        // Deprecated alias kept so any not-yet-migrated screen still compiles.
        padel: {
          pink:        '#FF2D72',
          'pink-light':'#FFE0EC',
          'pink-dark': '#5C0E2E',
          'pink-bg':   '#FFE0EC',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
