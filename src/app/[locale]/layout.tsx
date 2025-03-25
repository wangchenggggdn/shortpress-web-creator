import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { cookies } from 'next/headers';
import { pathname } from 'next-extra/pathname';
import { IUserProfile } from '@/types/user';
import CookieMap from '@/config/cookie-map';
import UserApi from '@/api/creator';
import appConfig from '@/appConfig';
import { initLangTags } from '@/libs/seo';

import ClientLayout from '@/components/system/clientLayout';
import { Website } from '@/types/website';
import WebsiteApi from '@/api/website';

/**
 * Props interface for the LocaleLayout component
 */
interface IProps {
    children: React.ReactNode;
    params: { locale: string };
}

/**
 * Root layout component that handles internationalization and user authentication
 * @param children Child components to be rendered
 * @returns React component with internationalization provider and client layout
 */
const LocaleLayout: React.FC<IProps> = async ({ children }) => {
    const messages = await getMessages();
    const cookieStore = cookies();
    const userState = cookieStore.get(CookieMap.UserState);
    let profile: null | IUserProfile = null;

    const fetchWebsites = async (): Promise<Website[]> => {
        return [];
        const res = await WebsiteApi.list();
        if (res.code !== 0 && (res.data?.items ?? []).length === 0) return [];
        const resD = await WebsiteApi.batchGet(res.data.items.join(','));
        if (resD.code !== 0 && (resD.data?.items ?? []).length === 0) return [];
        return resD.data.items;
    };

    if (userState) {
        const res = await UserApi.profile();
        if (res.code === 0 && res.data) {
            profile = { ...res.data };
        } else {
            console.warn('profile-error:', res.info);
        }
        const websites = await fetchWebsites();
        if (profile) {
            profile.website = websites[0];
        }
    }

    console.log('profile:', profile);
    return (
        <NextIntlClientProvider messages={messages}>
            <ClientLayout children={children} profile={profile} />
        </NextIntlClientProvider>
    );
};

export default LocaleLayout;

/**
 * Generate metadata for SEO purposes based on the current locale and path
 * @param props Component props containing locale information
 * @returns Metadata object for SEO
 */
export const generateMetadata: (props: IProps) => void = ({ params }) => {
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
