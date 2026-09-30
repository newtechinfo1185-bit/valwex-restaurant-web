import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "pos-red": "#d81f2a",
        "pos-red-dark": "#b91621",
        "pos-ink": "#0b1724",
        "pos-muted": "#667085",
        "pos-line": "#e7ebf0",
        "pos-bg": "#f5f7fa",
      },
    },
  },
  plugins: [],
};
export default config;
