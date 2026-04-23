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
          slate: "#5B645F",
          cloud: "#F7F8FA",
          line: "#E2E8F0",
          ink: "#070B1A",
          muted: "#64748B",
          panel: "#111827"
        }
      }
    }
  },
  plugins: []
};
export default config;
