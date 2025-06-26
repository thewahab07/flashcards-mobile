/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#f8fafc",
        backgroundDark: "#111827",
        borderColor: "#ebebed",
        borderDark: "#d4d1ff",
        primary: "#7c4dff",
      },
      fontFamily: {
        "urbanist-thin": ["Urbanist_100Thin"],
        "urbanist-extralight": ["Urbanist_200ExtraLight"],
        "urbanist-light": ["Urbanist_300Light"],
        "urbanist-regular": ["Urbanist_400Regular"],
        "urbanist-medium": ["Urbanist_500Medium"],
        "urbanist-semibold": ["Urbanist_600SemiBold"],
        "urbanist-bold": ["Urbanist_700Bold"],
        "urbanist-extrabold": ["Urbanist_800ExtraBold"],
        "urbanist-black": ["Urbanist_900Black"],
        "sevillana-regular": ["Sevillana_400Regular"],
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
