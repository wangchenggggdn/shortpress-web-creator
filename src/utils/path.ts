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


export const getWebsitePreviewUrl = (website: Website, sectionPath: string = '', isPreview: boolean = false): string => {
    return `${isPreview ? process.env.NEXT_PUBLIC_DOMAIN_CUSTOM_PREVIEW : process.env.NEXT_PUBLIC_DOMAIN_CUSTOM}/${website.path}${sectionPath}`;
};