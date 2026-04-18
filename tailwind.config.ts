import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        forne: {
          cream: "#F7F3EC",
          sand: "#E7DED1",
          stone: "#CBBDAA",
          forest: "#22312B",
          slate: "#5B645F"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(34,49,43,0.08)"
      }
    }
  },
  plugins: [],
};

export default config;
