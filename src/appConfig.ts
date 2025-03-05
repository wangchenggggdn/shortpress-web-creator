import { createTheme, MantineThemeOverride } from '@mantine/core';

interface IConfig {
    appName: string;
    baseDomain: string;
    locales: string[];
    defaultLocale: string;
    colorScheme: 'light' | 'dark';
    subjectColor: string;
    theme: MantineThemeOverride;
}

const primaryColor = '#6355FF';
const primaryHoverColor = '#4F44CC';

export const theme: MantineThemeOverride = {
    colors: {
        primary: [
            '#F0EEFF', // 0: Lightest
            '#D6D1FF', // 1
            '#B8B2FF', // 2
            '#9A93FF', // 3
            '#7C74FF', // 4
            '#6355FF', // 5: Primary
            '#4F44CC', // 6: Hover
            '#3B3399', // 7
            '#282266', // 8
            '#141133', // 9: Darkest
        ],
    },
    primaryColor: 'primary',
    primaryShade: 5,
    defaultRadius: 'sm',
    cursorType: 'pointer',
    autoContrast: true,
    luminanceThreshold: 0.5,
    breakpoints: {
        sm: '30em',
        md: '48em',
        lg: '64em',
        xl: '90em',
        xl2: '120em',
        xl3: '160em',
        xl4: '240em',
    },
};

const appConfig: IConfig = {
    appName: 'SpeedScribe',
    baseDomain: process.env.NEXT_PUBLIC_DOMAIN!,
    locales: ['en', 'zh'],
    defaultLocale: 'en',
    colorScheme: 'light',
    subjectColor: primaryColor,
    theme,
};

export default appConfig;
