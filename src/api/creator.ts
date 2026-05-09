import fetch from '@/libs/fetch/fetch';
import { CreatorArgs } from './args';
import {
    IUserLoginState,
    IUserProfile,
    IUserStats,
} from '@/types/user';

/**
 * API class for creator (user) related operations
 */
export default class CreatorApi {
    /**
     * Login creator
     * @param args Login parameters
     * @returns Promise with user login state
     */
    static login(args: CreatorArgs.Login) {
        return fetch.post<IUserLoginState>('/api/creator/login', args);
    }

    /**
     * Register new creator
     * @param args Registration parameters
     * @returns Promise
     */
    static register(args: CreatorArgs.Register) {
        return fetch.post('/api/creator/register', args);
    }

    /**
     * Get creator profile information
     * @returns Promise with user profile
     */
    static profile() {
        return fetch.get<IUserProfile>('/api/creator/profile');
    }

    /**
     * Reset creator password
     * @param args Password reset parameters
     * @returns Promise
     */
    static resetPassword(args: CreatorArgs.ResetPassword) {
        return fetch.post('/api/creator/resetpwd', args);
    }

    /**
     * Get creator's websites
     * @param creatorId Creator ID
     * @returns Promise with creator's websites
     */
    static getSites(creatorId: string) {
        return fetch.get('/api/creator/sites', { creatorId });
    }

    /**
     * Upload file for creator
     * @param formData FormData containing file
     * @returns Promise with uploaded file URL
     */
    static uploadFile(formData: FormData) {
        return fetch.upload<string>('/api/creator/upload-file', formData);
    }

    /**
     * Get creator statistics
     * @returns Promise with user statistics
     */
    static stats() {
        return fetch.get<IUserStats>('/api/creator/stats');
    }

    /**
     * Logout creator and clear auth cookies on server
     */
    static logout() {
        return fetch.post('/api/creator/logout');
    }

    /**
     * Complete creator guides
     * @param args Complete guides parameters
     * @returns Promise
     */
    static completeGuides(args: CreatorArgs.CompleteGuides) {
        return fetch.post('/api/creator/complete-guides', args);
    }

} 