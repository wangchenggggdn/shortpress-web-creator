import fetch from '@/libs/fetch/fetch';
import { Website } from '@/types/website';
import { IPaginationResponse } from '@/types/public';
import { WebsiteArgs } from './args';
import { Playlist } from '@/types/playlist';
import { Version, Page, EditWebsite } from '@/types/editor';
import { IResponse } from '@/types/public';

/**
 * API class for website related operations
 */
export default class WebsiteApi {
    /**
     * Get list of user's websites
     * @returns Promise with array of Website objects
     */
    static list() {
        return fetch.get<IPaginationResponse<string>>('/api/site/list');
    }

    /**
     * Get website list
     * @param args Website list parameters
     * @returns Promise with paginated Website list
     */
    static batchGet(siteIds: string) {
        return fetch.get<IPaginationResponse<Website>>('/api/site/batch-get', { siteIds });
    }

    /**
     * Create a new website
     * @param args Website creation parameters
     * @returns Promise with created Website object
     */
    static create(args: WebsiteArgs.Modify) {
        return fetch.post<Website>('/api/site/create', args);
    }

    /**
     * Get website information by ID
     * @param siteId Website ID
     * @returns Promise with Website object
     */
    static get(siteId: string) {
        return fetch.get<Website>('/api/site/get', { siteId });
    }

    /**
     * Modify website information
     * @param args Website modification parameters
     * @returns Promise with updated Website object
     */
    static modify(args: WebsiteArgs.Modify) {
        return fetch.post<Website>('/api/site/modify', args);
    }

    /**
     * Add playlists to a website
     * @param siteId Website ID
     * @param playlistIds Array of playlist IDs to add
     * @returns Promise
     */
    static addPlaylists(siteId: string, playlistIds: string[]) {
        return fetch.post('/api/site/add-playlists', { siteId, playlistIds });
    }

    /**
     * Remove playlists from a website
     * @param siteId Website ID
     * @param playlistIds Array of playlist IDs to remove
     * @returns Promise
     */
    static removePlaylists(siteId: string, playlistIds: string[]) {
        return fetch.post('/api/site/remove-playlists', { siteId, playlistIds });
    }

    /**
     * Get playlists associated with a website
     * @param siteId Website ID
     * @param page Page number (default: 1)
     * @param pageSize Items per page (default: 20)
     * @returns Promise with paginated Playlist objects
     */
    static getPlaylists(siteId: string, page: number = 1, pageSize: number = 20) {
        return fetch.get<IPaginationResponse<Playlist>>('/api/site/playlists', {
            siteId,
            page,
            pageSize
        });
    }

    /**
     * Delete a website
     * @param siteId Website ID to delete
     * @returns Promise
     */
    static delete(siteId: string) {
        return fetch.post('/api/site/delete', { siteId });
    }

    /**
     * Search websites
     * @param args Search parameters
     * @returns Promise with paginated Website objects
     */
    static search(args: WebsiteArgs.Search) {
        return fetch.get<IPaginationResponse<Website>>('/api/site/search', args);
    }

    /**
     * Fetch websites from API and update local storage
     */
    static fetchWebsites = async (): Promise<Website[]> => {
        const res = await WebsiteApi.list();
        if (res.code !== 0 && (res.data?.items ?? []).length === 0) return [];
        const resD = await WebsiteApi.batchGet(res.data.items.join(','));
        if (resD.code !== 0 && (resD.data?.items ?? []).length === 0) return [];
        return resD.data.items;
    };

    /**
     * Check if a site path already exists
     * @param path Site path to check
     * @returns Promise with boolean indicating if path exists
     */
    static checkPathExists(path: string) {
        return fetch.get('/api/site/path/valid', { path });
    }

    // Editor-specific API methods
    /**
     * Get website information for editor
     * @param siteId Website ID
     * @returns Promise with Website object including versions
     */
    static editGet(siteId: string) {
        return fetch.get(`/api/pages-builder/info`, {
            siteId
        });
    }

    /**
     * Update website information in editor
     * @param website Website update data
     * @returns Promise
     */
    static editModify(siteId: string, editWebsite: Partial<EditWebsite>) {
        return fetch.post(`/api/pages-builder/save`, {
            siteId,
            siteData: editWebsite
        });
    }

    static editPublish(siteId: string) {
        return fetch.post(`/api/pages-builder/publish`, {
            siteId
        });
    }

    static getNewRelease(siteId: string) {
        return fetch.get<Playlist[]>(`/api/client-site/new-release`, {
            siteId
        });
    }

}