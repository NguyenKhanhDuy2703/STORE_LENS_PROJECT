/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bảng màu tùy chỉnh của bạn
        red: "#EF4444",
        orange: "#F97316",
        yellow: "#EAB308",
        green: "#22C55E",
        blueLight: "#06B6D4",
        blueDark: "#3B82F6",
        purple: "#8B5CF6",
        white: "#FFFFFF",
        black: "#000000",
        greenLight: "#E3FCEB",
        pinkLight: "#FEEAEA",
        blueLighter: "#E9F2FF",
        orangeLight: "#FEFCE8",
        // Bạn có thể thêm màu chủ đạo teal của StoreLens ở đây
        primary: "#0D9488", 
      },
      fontFamily: {
        // Áp dụng Inter cho văn bản và DM Mono cho số liệu
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}