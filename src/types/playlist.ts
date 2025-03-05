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
} 