/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#f8fafc",
        backgroundDark: "#121212",
        borderColor: "#ebebed",
        primary: "#7c4dff",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
