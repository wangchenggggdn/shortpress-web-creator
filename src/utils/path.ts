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


export const getWebsitePreviewUrl = (website: Website, sectionPath: string = '', isAddHttp: boolean = true): string => {
    const http = isAddHttp ? 'https://' : '';
    if (process.env.NEXT_PUBLIC_NODE_ENV === 'dev') {
        return `${http.replace('https://', 'http://')}localhost:3001/${website.path}/${sectionPath}`;
    }
    if (website.domain) {
        return `${http}${website.domain}/${sectionPath}`;
    }
    return `${http}${website.officialDomain}/${website.path}/${sectionPath}`;
};