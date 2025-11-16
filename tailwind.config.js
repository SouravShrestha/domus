/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./index.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "lato-regular": ["Lato-Regular"],
        "lato-black": ["Lato-Black"],
        "uber-move-medium": ["UberMoveMedium"],
        "uber-move-bold": ["UberMoveBold"],
      },
      colors: {
        background: "#FFFFFF",
        text: "#000000",
        primary: "#3B82F6",
        secondary: "#EC4899",
        accent: "#000000",
      },
    },
  },
  plugins: [],
};