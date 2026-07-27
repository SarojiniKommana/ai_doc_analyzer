/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F5F0",
        ink: "#1F2430",
        muted: "#6B7280",
        accent: "#3B4A8C",
        "accent-light": "#EEF0F9",
        card: "#FFFFFF",
        border: "#E4E1D8",
      },
      fontFamily: {
        serif: ['"Source Serif 4"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
