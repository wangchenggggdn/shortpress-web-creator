import { Website } from '@/types/website';
import { getCachedConfig } from './config';

/**
 * Get page title from path
 * @param pathname Current path
 * @returns Formatted page title
 */
export const getPageTitleFromPath = (pathname: string): string => {
    const path = pathname.split('/').pop() || 'home';
    return path.charAt(0).toUpperCase() + path.slice(1);
};

/**
 * Get website preview URL
 * Server-side: uses process.env directly
 * Client-side: uses runtime config from cache
 * @param website Website object
 * @param sectionPath Optional section path
 * @returns Preview URL string
 */
export const getWebsitePreviewUrl = (website: Website, sectionPath: string = ''): string => {
    const websitePath = website.path.endsWith('/') ? website.path : `${website.path}/`;
    const isBrowser = typeof window !== 'undefined';

    let previewDomain = '';
    if (!isBrowser) {
        // Server-side: use process.env directly
        previewDomain = process.env.NEXT_PUBLIC_DOMAIN_PREVIEW || '';
    } else {
        // Client-side: use runtime config from cache
        const cached = getCachedConfig();
        previewDomain = cached?.previewDomain || process.env.NEXT_PUBLIC_DOMAIN_PREVIEW || '';
    }

    return `${previewDomain}/${websitePath}${sectionPath}`;
};
