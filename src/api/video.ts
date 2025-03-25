import fetch from '@/libs/fetch/fetch';
import { IVideo, VideoStatus } from '@/types/video';
import { IPaginationResponse } from '@/types/public';
import { VideoArgs } from './args';

/**
 * API class for video related operations
 */
export default class VideoApi {
    /**
     * Upload a video
     * @param formData FormData containing video file and metadata
     * @returns Promise with array of video IDs
     */
    static upload(formData: FormData, playlistId: string | null, onProgress?: (progress: number) => void) {
        let params = {};
        if (playlistId) {
            params = {
                playlistId
            }
        }
        return fetch.upload<{ vids: string[] }>('/api/video/upload', formData, params, onProgress);
    }

    /**
     * Get video information by ID
     * @param vid Video ID
     * @returns Promise with Video object
     */
    static get(vid: string) {
        return fetch.get<IVideo>('/api/video/get', { vid });
    }

    /**
     * Modify video information
     * @param args Video modification parameters
     * @returns Promise
     */
    static modify(args: VideoArgs.Modify) {
        return fetch.post('/api/video/modify', args);
    }

    /**
     * Delete videos
     * @param vids Array of video IDs to delete
     * @returns Promise
     */
    static delete(vids: string[]) {
        return fetch.post('/api/video/delete', { vids });
    }

    /**
     * Get list of videos
     * @param args List parameters
     * @returns Promise with paginated Video objects
     */
    static list(args: VideoArgs.List) {
        return fetch.get<IPaginationResponse<string>>('/api/video/list', args);
    }

    /**
     * Search videos
     * @param args Search parameters
     * @returns Promise with paginated Video objects
     */
    static search(args: VideoArgs.Search) {
        return fetch.get<IPaginationResponse<string>>('/api/video/search', args);
    }

    /**
     * Replace video file
     * @param args Replace parameters including video ID and new file
     * @returns Promise with updated video information
     */
    static replace(args: VideoArgs.Replace) {
        return fetch.upload<{ vid: string, cover: string, videoSourceUrl: string }>('/api/video/replace', args.formData, { vid: args.vid });
    }

    /**
     * Get video upload status for multiple videos
     * @param vids Comma-separated string of video IDs
     * @returns Promise with paginated Video objects
     */
    static batchGet(vids: string) {
        return fetch.get<IPaginationResponse<IVideo>>('/api/video/batch-get', { vids });
    }
} 