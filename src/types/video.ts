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
    UPLOAD_SUCCESS = 5,
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
    ALL = 128,
}

export enum VideoSourceType {
    LOCAL = 1,
    HTTP = 2,
    EMBED = 3,
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
    /** Current video status */
    status: VideoStatus;
    /** Video duration in seconds */
    duration?: number;
    /** ID of the creator who uploaded the video */
    creatorId: string;
    /** Creation timestamp */
    createdAt: number;
    /** Last update timestamp */
    updatedAt: number;
    /** Number of views */
    views?: number;
    /** SEO information */
    seo?: {
        /** SEO title */
        title?: string;
        /** SEO description */
        description?: string;
        /** SEO keywords */
        keywords?: string;
    };
    /** Video playlist cover */
    playlistCover?: string;
    /** Video playlist title */
    playlistTitle?: string;
    /** Video playlist id */
    playlistId?: string;
    /** Video episode */
    episode?: number;
    /** Video sources */
    sources?: IVideoSource[];
    /** Video subtitles */
    subtitles?: {
        [key: string]: {
            path: string;
            desc: string;
        };
    };
    /** Video config */
    config?: {
        coin?: number;
        effectId?: string;
        templateType?: CreateTemplateType;
        [key: string]: any;
    };
}

export enum CreateTemplateType {
    vidu = 'vidu',
    dance = 'dance',
    spicy = 'spicy',
    none = '',
}

export enum VideoUtmSource {
    facebook = 'm1',
    none = 'none',
    all = ''
}

export interface IUploadVideo extends IVideo {
    /** Upload progress percentage */
    progress?: number;
    /** Video file size in bytes */
    fileSize?: number;
    /** Current upload status */
    uploadStatus: VideoUploadStatus;
    /** Current video status */
    file?: File;
    /** Current playlist id */
    playlistId?: string;
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

/**
 * Interface for video source information
 */
export interface IVideoSource {
    /** Video duration in seconds */
    duration?: number;
    /** Video height in pixels */
    height?: number;
    /** Priority of the source */
    priority: number;
    /** Provider of the source */
    provider: string;
    /** Type of the source 1:local 2:http 3:Embed(iframe)*/
    sourceType: VideoSourceType;
    /** Upload status of the source */
    uploadStatus?: VideoUploadStatus;
    /** URL of the source */
    url: string;
    /** Video width in pixels */
    width?: number;
}
