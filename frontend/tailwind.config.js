/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F5F7FA",
        surface: "#FFFFFF",
        border: "#E4E7EC",
        ink: "#101828",
        slate: "#475467",
        primary: {
          DEFAULT: "#1D4E89",
          dark: "#163C69",
          light: "#EAF1F8",
        },
        status: {
          open: "#475467",
          pending: "#B7791F",
          overdue: "#B42318",
          inProgress: "#2F6FB0",
          verified: "#1D4E89",
          closed: "#1B7F4C",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        DEFAULT: "6px",
      },
    },
  },
  plugins: [],
};
