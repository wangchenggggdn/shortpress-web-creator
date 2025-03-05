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