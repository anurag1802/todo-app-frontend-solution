/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      brightBlue: "#3A7BFD",
      veryLightGray: "#FAFAFA",
      veryLightGrayishBlue: "#E4E5F1",
      lightGrayishBlue: "#D2D3DB",
      darkGrayishBlueLight: "#9394A5",
      veryDarkGrayishBlue: "#484B6A",
      veryDarkBlue: "#161722",
      veryDarkDesaturatedBlue: "#25273C",
      lightGrayishBlue: "#CACDE8",
      lightGrayishBlueHover: "#E4E5F1",
      darkGrayishBlue: "#777A92",
      darkerGrayishBlue: "#4D5066",
      darkestGrayishBlue: "#393A4C",
      white: "#FFFFFF",
    },
    extend: {
      visibility: ["group-hover"],
      letterSpacing: {
        tight: "-0.02em",
        normal: "0",
        wide: "1rem",
      },
    },
  },
  plugins: [],
};
