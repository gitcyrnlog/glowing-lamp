export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#14452F",
        secondary: "#BD9526",
        dark: "#000000",
        light: "#FFFFFF"
      },
      fontFamily: {
        heading: ['Orbitron', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      backgroundImage: {
        'gradient-gold-green': 'linear-gradient(to right, #BD9526, #14452F)',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(189, 149, 38, 0.7)',
      },
    },
  },
  plugins: [],
}