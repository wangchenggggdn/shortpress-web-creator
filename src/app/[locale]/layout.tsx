import UserApi from '@/api/creator';
import WebsiteApi from '@/api/website';
import appConfig from '@/appConfig';
import ClientLayout from '@/components/system/client-layout';
import CookieMap from '@/config/cookie-map';
import { RuntimeConfig } from '@/context/config-context';
import { initLangTags } from '@/libs/seo';
import { IUserProfile } from '@/types/user';
import { pathname } from 'next-extra/pathname';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { cookies } from 'next/headers';
import React from 'react';

/**
 * Props interface for the LocaleLayout component
 */
interface LocaleLayoutProps {
    children: React.ReactNode;
    params: { locale: string };
}

/**
 * Root layout component that handles internationalization and user authentication
 * @param children Child components to be rendered
 * @returns React component with internationalization provider and client layout
 */
const LocaleLayout: React.FC<LocaleLayoutProps> = async ({ children, params }) => {
    const messages = await getMessages();
    const cookieStore = cookies();
    const userState = cookieStore.get(CookieMap.UserState);
    const userState0 = cookieStore.get(CookieMap.UserState0);
    const userState1 = cookieStore.get(CookieMap.UserState1);
    let profile: null | IUserProfile = null;

    const fetchWebsites = async () => {
        const res = await WebsiteApi.list();
        if (res.code !== 0 && (res.data?.items ?? []).length === 0) return [];
        const resD = await WebsiteApi.batchGet(res.data.items.join(','));
        if (resD.code !== 0 && (resD.data?.items ?? []).length === 0) return [];
        return resD.data.items;
    };

    if (userState || userState0 || userState1) {
        const res = await UserApi.profile();
        if (res.code === 0 && res.data) {
            profile = { ...res.data };
            const resD = await fetchWebsites();
            if (resD.length !== 0) {
                profile.website = resD[0];
            }
        } else {
            console.warn('profile-error:', res.info);
        }
    }

    // Build runtime configuration from environment variables
    const runtimeConfig: RuntimeConfig = {
        domain: process.env.NEXT_PUBLIC_DOMAIN || '',
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || '',
        imageDomain: process.env.IMAGE_DOMAIN || '',
        videoDomain: process.env.VIDEO_DOMAIN || '',
        nodeEnv: process.env.NEXT_PUBLIC_NODE_ENV || 'dev',
        previewDomain: process.env.NEXT_PUBLIC_DOMAIN_PREVIEW || '',
    };

    console.log('profile:', profile);
    return (
        <NextIntlClientProvider messages={messages}>
            <ClientLayout children={children} profile={profile} runtimeConfig={runtimeConfig} />
        </NextIntlClientProvider>
    );
};

export default LocaleLayout;

/**
 * Generate metadata for SEO purposes based on the current locale and path
 * @param props Component props containing locale information
 * @returns Metadata object for SEO
 */
export const generateMetadata: (props: LocaleLayoutProps) => void = ({ params }) => {
    const path = pathname(); // Current URL path

    let lang = path.split('/')[1];

    let seoPath = path;
    let seoLang = '';

    if (appConfig.locales.includes(lang)) {
        seoPath = path.replace(`/${lang}`, '') || '/';
        seoLang = lang;
    }

    return initLangTags(seoPath, seoLang);
};
