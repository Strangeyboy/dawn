/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './**/*.liquid',
    './src/**/*.{js,jsx,ts,tsx}',
    './**/*.css'
  ],
  safelist: [
    'col-span-1',
    'col-span-2',
    'col-span-3',
    'col-span-4',
    'col-span-5',
    'col-span-6',
    'col-span-7',
    'col-span-8',
    'col-span-9',
    'col-span-10',
    'col-span-11',
    'col-span-12',
    'col-start-9',
    'md:col-span-6',
    'md:col-start-9',
    'md:col-span-2'
  ],
  theme: {
    extend: {
      spacing: {
        'px': '1px',
        '0': '0',
        '1': '4px', // 0.25rem (4px)
        '2': '8px', // 0.5rem (8px)
        '3': '12px', // 0.75rem (12px)
        '4': '16px', // 1rem (16px)
        '5': '20px', // 1.25rem (20px)
        '6': '24px', // 1.5rem (24px)
        '8': '32px', // 2rem (32px)
        '10': '40px', // 2.5rem (40px)
        '12': '48px', // 3rem (48px)
        '14': '56px', // 3.5rem (56px)
        '16': '64px', // 4rem (64px)
        '20': '80px', // 5rem (80px)
        '24': '96px', // 6rem (96px)
        '28': '112px', // 7rem (112px)
        '32': '128px', // 8rem (128px)
        '36': '144px', // 9rem (144px)
        '40': '160px', // 10rem (160px)
        '44': '176px', // 11rem (176px)
        '48': '192px', // 12rem (192px)
        '52': '208px', // 13rem (208px)
        '56': '224px', // 14rem (224px)
        '60': '240px', // 15rem (240px)
        '64': '256px', // 16rem (256px)
        '72': '288px', // 18rem (288px)
        '80': '320px', // 20rem (320px)
        '96': '384px', // 24rem (384px)
      }
    },
  },
  plugins: [],
}