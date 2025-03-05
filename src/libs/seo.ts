import { Metadata } from 'next/types';
import appConfig from '@/appConfig';

/**
 * Get language-specific URLs for a given path
 * @param path The path to generate URLs for
 * @returns Object mapping language codes to their respective URLs
 */
const getLanguages = (path: string) => {
    const languages: { [key in string]?: string } = {};

    for (let i = 0; i < appConfig.locales.length; i++) {
        const lang = appConfig.locales[i];
        languages[lang] = appConfig.baseDomain + (lang === appConfig.defaultLocale ? '' : `/${lang}`) + path;
    }

    return languages;
};

/**
 * Interface for SEO parameters
 */
interface ISEOParams {
    /** Page title */
    title: string;
    /** Page description */
    description: string;
    /** Page keywords */
    keywords?: string;
}

/**
 * Generate SEO metadata tags for a page
 * @param params SEO parameters including title, description and keywords
 * @returns Metadata object with SEO tags
 */
const getSEOTags: (params: ISEOParams) => Metadata = ({ title, description, keywords }) => {
    return {
        title,
        description,
        keywords: keywords || appConfig.appName,
        openGraph: {
            title,
            description,
            siteName: title,
            type: 'website',
            // images: {
            //     url: '',
            //     width: 1200,
            //     height: 630,
            // },
        },
        twitter: {
            title,
            description,
            card: 'summary_large_image',
            // images: '',
        },
    };
};

/**
 * Initialize language and URL-specific SEO tags
 * @param path Current page path
 * @param lang Current language code
 * @returns Metadata object with language-specific tags
 */
const initLangTags: (path: string, lang: string) => Metadata = (path, lang) => {
    return {
        alternates: {
            canonical: lang + path,
            languages: getLanguages(path),
        },
    };
};

/**
 * Initialize default SEO tags
 * @returns Metadata object with default SEO configuration
 */
const initSEOTags: () => Metadata = () => {
    return {
        title: '',
        description:
            '',
        keywords:
            '',
        applicationName: appConfig.appName,
        metadataBase: new URL(appConfig.baseDomain),
        robots: { index: true, follow: true },
    };
};

export { getSEOTags, initSEOTags, initLangTags };
