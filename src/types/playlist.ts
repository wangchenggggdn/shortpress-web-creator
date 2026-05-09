import { IVideo } from './video';

/**
 * Interface for playlist information
 */
export interface Playlist {
    /** Unique playlist identifier */
    playlistId: string;
    /** Playlist title */
    title: string;
    /** Playlist description */
    description?: string;
    /** Playlist tags */
    tags?: string;
    /** Playlist utm source */
    utmSource?: string;
    /** Playlist cover image URL */
    cover?: string;
    /** Number of videos in playlist */
    videoCount: number;
    /** Array of videos in playlist */
    videos?: IVideo[];
    /** Playlist status */
    status?: number;
    /** SEO information */
    seo?: {
        /** SEO title */
        title?: string;
        /** SEO description */
        description?: string;
        /** SEO keywords */
        keywords?: string;
    }
    /** Creation timestamp */
    createdAt: number;
    /** Last update timestamp */
    updatedAt: number;
    /** Access type */
    accessType: number;
    /** Single video price */
    singleVideoPrice: number;
    /** Free videos */
    freeVideos: number;
    /** Slug */
    slug: string;
}

/**
 * Interface for playlist video order response
 */
export interface PlaylistVideoOrder {
    /** Playlist identifier */
    playlistId: string;
    /** Version of the order */
    version: string;
    /** Video order data */
    sortData: {
        /** Array of video IDs in order */
        vids: string[];
    };
}

/**
 * Enum for video status
 */
export enum PlaylistStatus {
    NULL = 0,
    /** Video is not published */
    UNPUBLISHED = 1,
    /** Video is published */
    PUBLISHED = 2,
    /** Video is disabled */
    DISABLED = 3,
    /** Video is deleted */
    DELETED = 127,
    /** All video statuses */
    ALL = 128
}