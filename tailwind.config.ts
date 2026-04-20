import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        forne: {
          cream: "#F7F3EC",
          stone: "#CBBDAA",
          forest: "#22312B",
          slate: "#5B645F"
        }
      }
    }
  },
  plugins: []
};
export default config;
