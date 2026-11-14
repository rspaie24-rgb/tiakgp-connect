import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f8f7",
          100: "#e1e9e8",
          600: "#176c64",
          700: "#155b58",
          800: "#103c40",
          900: "#0b3d44",
        },
        accent: "#efbb45",
      },
    },
  },
  plugins: [],
};
export default config;
