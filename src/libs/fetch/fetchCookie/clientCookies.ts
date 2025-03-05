import Cookies from 'js-cookie';

/**
 * Get cookie value from client-side browser
 * @param key Cookie key to retrieve
 * @returns Cookie value or undefined if not found
 */
export const getClientSideCookie = (key: string): any => {
    return Cookies.get(key);
};
