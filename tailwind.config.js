/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/*.jsx", "./src/app/**/*.jsx", "./src/app/**/**/*.jsx", "./src/components/**/*.jsx", "./src/components/**/*.js"],
  theme: {
    extend: {
      colors:{
        primary:'#1f1f1f',
        secondary:'#eaeaea',
        tertiary:'#0b7a75',
        greyshade:'#7d8491'
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
  plugins: [

  ],
  assets: ["./assets/fonts"],
}

