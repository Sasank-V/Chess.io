/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        vsregular: ['VS Regular', 'sans-serif'],
        vssemibold : ['VS SemiBold' , 'sans-serif']
      },
      colors : {
        active : "#7B61FF",
        board : {
          black : "#1f2937",
          white : "#E8EDF9"
        },
        peices : {
          black : "#34364C",
          white : "#F4F7FA"
        }
      }
    },
  },
  plugins: [],
}