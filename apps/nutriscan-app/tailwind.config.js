/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#d3f660",
        "accent-red": "#FF5C5C",
        "accent-blue": "#5C9DFF",
        "accent-yellow": "#FFD25C",
        "background-light": "#f8f8f5",
        "background-dark": "#101010",
        "card-dark": "#1C1C1E",
        "card-inner": "#2C2C2E",
        "text-secondary": "#A0A0A0",
      },
      fontFamily: {
        display: ["Manrope_700Bold"],
        body: ["Inter_400Regular"],
      },
    },
  },
  plugins: [],
}
