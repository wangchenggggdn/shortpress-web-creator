import React from 'react';
import { Viewport } from 'next/types';
import Script from 'next/script';
import { pathname } from 'next-extra/pathname';
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import appConfig from '@/appConfig';
import { initSEOTags } from '@/libs/seo';

import '@/assets/styles/globals.css';
import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';

interface IProps {
    children: React.ReactNode;
}

const RootLayout: React.FC<IProps> = ({ children }) => {
    const path = pathname();
    let lang = path.split('/')[1];
    if (!lang || !appConfig.locales.includes(lang)) {
        lang = appConfig.defaultLocale;
    }

    return (
        <html lang={lang}>
            <head>
                <link rel="icon" type="image/png" href="/favicon.png" />
                <ColorSchemeScript defaultColorScheme={appConfig.colorScheme} />
            </head>

            <body className="bg-back text-black-purple">
                <Toaster position="top-center" richColors />
                <NextTopLoader color={appConfig.subjectColor} showSpinner={false} />

                <MantineProvider defaultColorScheme={appConfig.colorScheme} theme={appConfig.theme}>
                    {children}
                </MantineProvider>
            </body>
        </html>
    );
};

export default RootLayout;

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    minimumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
};
export const metadata = initSEOTags();
