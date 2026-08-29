/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F5F7FA",     // app background
        surface: "#FFFFFF",   // cards/panels
        border: "#E4E7EC",
        ink: "#101828",       // primary text
        slate: "#475467",     // secondary text
        primary: {
          DEFAULT: "#1D4E89", // deep steel blue — governance/authority, not a bright SaaS blue
          dark: "#163C69",
          light: "#EAF1F8",   // tinted backgrounds for selected nav / soft highlights
        },
        status: {
          open: "#475467",       // neutral slate
          pending: "#B7791F",    // ochre
          overdue: "#B42318",    // red
          inProgress: "#2F6FB0", // blue
          verified: "#1D4E89",   // primary blue
          closed: "#1B7F4C",     // green
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
