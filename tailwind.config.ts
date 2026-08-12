import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1B4D72",
          dark: "#134060",
        },
      },
    },
  },
  plugins: [],
};

export default config;
