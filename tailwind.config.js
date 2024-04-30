/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.jsx", "./components/**/*.jsx"],
  theme: {
    extend: {
      colors:{
        primary:'#1f1f1f',
        secondary:'#eaeaea',
        tertiary:'#0b7a75'
      },
      fontFamily:{
         iregular:["Inter-Regular"],
         iBlack:["Inter-Black"],
         iBold:["Inter-Bold"],
         iItalic:["Inter-Italic"],
         iLight:["Inter-Light"],
         iThin:["Inter-Thin"],
      }
    },
  },
  plugins: [],
  assets: ["./assets/fonts"],
}

