/** @type {import('tailwindcss').Config} */
export default {
   content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
   theme: {
     extend: {
       spacing: {
         '18': '4.5rem',
         '22': '5.5rem',
       },
       maxWidth: {
         '8xl': '88rem',
         '9xl': '96rem',
       },
       borderRadius: {
         '4xl': '2rem',
       },
       typography: {
         DEFAULT: {
           css: {
             maxWidth: '65ch',
             color: 'var(--tw-prose-body)',
             '[class~="lead"]': {
               color: 'var(--tw-prose-lead)',
             },
           },
         },
       },
     },
   },
   plugins: [
     require('@tailwindcss/forms')({
       strategy: 'class',
     }),
     require('@tailwindcss/typography'),
   ],
 };
