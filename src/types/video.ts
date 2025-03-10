/**
 * Enum for video upload status
 */
export enum VideoUploadStatus {
    NULL = 0,
    /** Video has not been uploaded yet */
    NOT_UPLOADED = 1,
    /** Video is currently being uploaded */
    UPLOADING = 2,
    /** Video upload failed */
    UPLOAD_FAILED = 3,
    /** Video upload was cancelled */
    UPLOAD_CANCELLED = 4,
    /** Video upload completed successfully */
    UPLOAD_SUCCESS = 5
}

/**
 * Enum for video status
 */
export enum VideoStatus {
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

/**
 * Interface for video information
 */
export interface IVideo {
    /** Unique video identifier */
    vid: string;
    /** Video tags */
    tags?: string;
    /** Video title */
    title: string;
    /** Video description */
    description?: string;
    /** Video cover image URL */
    cover?: string;
    /** Current upload status */
    uploadStatus: VideoUploadStatus;
    /** Current video status */
    status: VideoStatus;
    /** Video source URL */
    videoSourceUrl?: string;
    /** Video duration in seconds */
    duration?: number;
    /** Video file size in bytes */
    fileSize?: number;
    /** ID of the creator who uploaded the video */
    creatorId: string;
    /** Creation timestamp */
    createdAt: number;
    /** Last update timestamp */
    updatedAt: number;
    /** Number of views */
    views?: number;
    /** Upload progress percentage */
    progress?: number;
    /** SEO information */
    seo?: {
        /** SEO title */
        title?: string;
        /** SEO description */
        description?: string;
        /** SEO keywords */
        keywords?: string;
    };
}

/**
 * Interface for video SEO information
 */
export interface IVideoSEO {
    /** Unique video identifier */
    vid: string;
    /** Video description */
    description?: string;
    /** Web video URL */
    webVideoUrl?: string;
    /** Creation timestamp */
    createdAt: string;
    /** Last update timestamp */
    updatedAt: string;
}

/**
 * Interface for tag information
 */
export interface ITag {
    /** Site ID */
    siteId: string;
    /** Tag name */
    name: string;
}

/**
 * Interface for playlist information
 */
export interface IPlaylist {
    /** Unique playlist identifier */
    playlistId: string;
    /** Playlist title */
    title?: string;
    /** Playlist description */
    description?: string;
    /** Playlist tags */
    tags?: string;
    /** Playlist cover image URL */
    cover?: string;
    /** Current playlist status */
    status: VideoStatus;
    /** Creation timestamp */
    createdAt: string;
    /** Last update timestamp */
    updatedAt: string;
}

/**
 * Interface for playlist SEO information
 */
export interface IPlaylistSEO {
    /** Unique playlist identifier */
    playlistId: string;
    /** Playlist title */
    title: string;
    /** Playlist description */
    description?: string;
    /** Web playlist URL */
    webPlaylistUrl?: string;
    /** Creation timestamp */
    createdAt: string;
    /** Last update timestamp */
    updatedAt: string;
}

/**
 * Interface for playlist-video relationship
 */
export interface IPlaylistVideo {
    /** Unique playlist identifier */
    playlistId: string;
    /** Unique video identifier */
    vid: string;
    /** Sort order in playlist */
    sortNumber: number;
    /** Creation timestamp */
    createdAt: string;
    /** Last update timestamp */
    updatedAt: string;
}
