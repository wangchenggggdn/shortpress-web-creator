import { Website } from "@/types/website";

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
 * Format path
 * @param pathname Current path
 * @returns Formatted path
 */
export const formatPath = (pathname: string): string => {
    return pathname === '/' ? '/home' : pathname;
};


export const getWebsitePreviewUrl = (website: Website, sectionPath: string = '', isPreview: boolean = false): string => {
    if (process.env.NEXT_PUBLIC_NODE_ENV === 'local_dev') {
        return `${isPreview ? process.env.NEXT_PUBLIC_DOMAIN_CUSTOM_PREVIEW : process.env.NEXT_PUBLIC_DOMAIN_CUSTOM}/${website.path}${sectionPath}`;
    }
    if (website.domain) {
        return `https://${website.domain}${sectionPath}`;
    }
    return `https://${website.officialDomain}/${website.path}${sectionPath}`;
};