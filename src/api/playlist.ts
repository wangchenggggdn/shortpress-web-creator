import fetch from '@/libs/fetch/fetch';
import { Playlist } from '@/types/playlist';
import { IVideo } from '@/types/video';
import { IPaginationResponse } from '@/types/public';
import { PlaylistArgs } from './args';

/**
 * API class for playlist related operations
 */
export default class PlaylistApi {
    /**
     * Create a new playlist
     * @param args Playlist creation parameters
     * @returns Promise with created Playlist object
     */
    static create(args: PlaylistArgs.Create) {
        return fetch.post<Playlist>('/api/playlist/create', args);
    }

    /**
     * Get list of playlists
     * @param args List parameters
     * @returns Promise with paginated Playlist objects
     */
    static list(args: PlaylistArgs.List) {
        return fetch.get<IPaginationResponse<Playlist>>('/api/playlist/list', args);
    }

    /**
     * Get playlist information by ID
     * @param playlistId Playlist ID
     * @returns Promise with Playlist object
     */
    static get(playlistId: string) {
        return fetch.get<Playlist>('/api/playlist/get', { playlistId });
    }

    /**
     * Modify playlist information
     * @param args Playlist modification parameters
     * @returns Promise with updated Playlist object
     */
    static modify(args: PlaylistArgs.Modify) {
        return fetch.post<Playlist>('/api/playlist/modify', args);
    }

    /**
     * Delete playlists
     * @param playlistIds Array of playlist IDs to delete
     * @returns Promise
     */
    static delete(playlistIds: string[]) {
        return fetch.post('/api/playlist/delete', { playlistIds });
    }

    /**
     * Add videos to a playlist
     * @param playlistId Playlist ID
     * @param vids Array of video IDs to add
     * @returns Promise
     */
    static addVideos(playlistId: string, vids: string[]) {
        return fetch.post('/api/playlist/add-videos', { playlistId, vids });
    }

    /**
     * Remove videos from a playlist
     * @param playlistId Playlist ID
     * @param vids Array of video IDs to remove
     * @returns Promise
     */
    static removeVideos(playlistId: string, vids: string[]) {
        return fetch.post('/api/playlist/remove-videos', { playlistId, vids });
    }

    /**
     * Get videos in a playlist
     * @param args Get videos parameters
     * @returns Promise with paginated Video objects
     */
    static getVideos(args: PlaylistArgs.GetVideos) {
        return fetch.get<IPaginationResponse<IVideo>>('/api/playlist/videos', args);
    }

    /**
     * Search playlists
     * @param args Search parameters
     * @returns Promise with paginated Playlist objects
     */
    static search(args: PlaylistArgs.Search) {
        return fetch.get<IPaginationResponse<Playlist>>('/api/playlist/search', args);
    }
}