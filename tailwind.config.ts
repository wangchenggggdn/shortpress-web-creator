import type { Config } from 'tailwindcss';

const mediaMap = {
    sm: 576,
    md: 768,
    lg: 1024,
    xl: 1440,
    xl2: 1920,
    xl3: 2560,
    xl4: 3840,
};

const config: Config = {
    darkMode: 'class',
    content: ['./src/views/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        screens: {
            sm: `${mediaMap.sm}px`, // => @media (min-width: 576px) { ... }
            msm: { max: `${mediaMap.sm - 1}px` }, // => @media (max-width: 575px) { ... }
            md: `${mediaMap.md}px`, // => @media (min-width: 768px) { ... }
            mmd: { max: `${mediaMap.md - 1}px` }, // => @media (max-width: 767px) { ... }
            lg: `${mediaMap.lg}px`, // => @media (min-width: 1024px) { ... }
            mlg: { max: `${mediaMap.lg - 1}px` }, // => @media (max-width: 1023px) { ... }
            xl: `${mediaMap.xl}px`, // => @media (min-width: 1440px) { ... }
            mxl: { max: `${mediaMap.xl - 1}px` }, // => @media (max-width: 1439px) { ... }
            xl2: `${mediaMap.xl2}px`, // => @media (min-width: 1920) { ... }
            mxl2: { max: `${mediaMap.xl2 - 1}px` }, // => @media (max-width: 1919px) { ... }
            xl3: `${mediaMap.xl3}px`, // => @media (min-width: 2560) { ... }
            mxl3: { max: `${mediaMap.xl3 - 1}px` }, // => @media (max-width: 2559px) { ... }
            xl4: `${mediaMap.xl4}px`, // => @media (min-width: 3840) { ... }
            mxl4: { max: `${mediaMap.xl4 - 1}px` }, // => @media (max-width: 3839px) { ... }
        },
        colors: {
            primary: '#70F8A6',
            secondary: '#F7EA76',
            back: '#171717',
            backdrop: '#2e2e2e',
            backdrop1: '#b00cb3',
            backdrop2: '#550cb3',
            border: '#424242',
            warning: '#f7b750',
            danger: '#f31260',
            white: '#ffffff',
            black: '#000000',
            transparent: 'transparent',
            'black-purple': {
                DEFAULT: '#1F1A37',
                light: '#2F2955',
            },
        },
        extend: {
            fontFamily: {
                poppins: ['Poppins', 'sans-self'],
                coda: ['Coda', 'sans-self'],
            },
        },
    },
    plugins: [],
};

export default config;
