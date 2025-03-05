import { create } from 'zustand';
import { IUserProfile } from '@/types/user';
import { Website } from '@/types/website';

/**
 * Interface for user store state and actions
 */
interface IUserStore {
    /** User profile information, null indicates not logged in */
    userInfo: null | IUserProfile;
    /** Whether user information is currently being loaded */
    loadUserInfo: boolean;
    /** Set user profile information */
    setUserInfo: (info: null | IUserProfile) => void;
    /** Set user information loading state */
    setLoadUserInfo: (result: boolean) => void;
}

/**
 * User store using Zustand
 * Manages user authentication state and profile information
 */
const userStore = create<IUserStore>(set => ({
    userInfo: null,
    loadUserInfo: true,
    setUserInfo: info => set({ userInfo: info }),
    setLoadUserInfo: result => set({ loadUserInfo: result }),
}));

export default userStore;
