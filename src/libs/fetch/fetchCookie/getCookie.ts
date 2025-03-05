import { getServerSideCookie } from './serverCookies';
import { getClientSideCookie } from './clientCookies';

/**
 * Get cookie value based on environment (client/server)
 * @param key Cookie key to retrieve
 * @returns Promise resolving to cookie value
 */
export const getCookie = (key: string): any => {
    return new Promise(async resolve => {
        const isBrowser = typeof window !== 'undefined';

        if (isBrowser) {
            return resolve(getClientSideCookie(key));
        } else {
            return resolve(getServerSideCookie(key));
        }
    });
};
