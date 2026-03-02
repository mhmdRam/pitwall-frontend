/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pitRed: "#E10600",
        pitYellow: "#FFD000",
        pitGreen: "#00D084",
        pitBg: "#0A0A0A",
        pitCard: "#111111",
      },
    },
  },
  plugins: [],
}