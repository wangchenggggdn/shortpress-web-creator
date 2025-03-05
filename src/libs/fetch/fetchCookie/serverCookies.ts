'use server';
import { cookies } from 'next/headers';

/**
 * Get cookie value from server-side
 * @param key Cookie key to retrieve
 * @returns Cookie value or empty string if not found
 */
export const getServerSideCookie = (key: string): any => {
    const cookieStore = cookies();

    const cookieDetail = cookieStore.get(key);

    return cookieDetail ? cookieDetail.value : '';
};
