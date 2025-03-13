const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{jsx,tsx}", flowbite.content()],
  theme: {
    extend: {
      colors: {
        neutralSilver: "#F5F7FA",
        neutralDGrey: "#4D4D4D",
        brandPrimary: "#4CAF4F",
        neutralGrey: "#717171",
        gray800: "#18191F",
        gray900: "#000000",
        yellowMedi: "#D9AE46",
      },
    },
  },
  plugins: [flowbite.plugin()],
};
