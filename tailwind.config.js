/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBlue: '#217093',
        medBlue: '#4eb8dd',
        lightBlue: '#ddf1fa',
        inputBG: '#f3fafd',
      },
    },
  },
  plugins: [],
}