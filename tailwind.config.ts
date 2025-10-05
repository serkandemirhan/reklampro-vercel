
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#17a2b8', // turkuaz-mavi
          dark: '#128293',
          light: '#e6f7f9'
        }
      }
    },
  },
  plugins: [],
}
export default config
