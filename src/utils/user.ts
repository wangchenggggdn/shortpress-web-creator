import Cookies from 'js-cookie';
import { IUserProfile } from '@/types/user';
import CookieMap from '@/config/cookie-map';

/**
 * Initialize or refresh user information
 * @param profile User profile information
 * @param setState Store's setState function
 */
export const refreshUserInfo = (
    profile: IUserProfile | null,
    setState: (state: { userInfo: IUserProfile | null; loadUserInfo: boolean }) => void
) => {
    // Initialize user related information
    setState({
        userInfo: profile,
        loadUserInfo: false
    });

    // Clear user login cache if no profile information exists  ,now server setCookie
    // if (!profile && Cookies.get(CookieMap.UserState)) {
    //     Cookies.remove(CookieMap.UserState);
    // }
}; 