/**
 * Request parameters for Creator related operations
 */
export namespace CreatorArgs {
    /**
     * Login request parameters
     */
    export interface Login {
        email: string;
        password: string;
    }

    /**
     * Registration request parameters
     */
    export interface Register {
        email: string;
        password: string;
        // creatorName: string;  // Unique path name for creator
        // nickname: string;
    }

    /**
     * Password reset request parameters
     */
    export interface ResetPassword {
        email: string;
        newPassword: string;
    }

    export interface CompleteGuides {
        guides: string[];
    }
}

/**
 * Request parameters for Website related operations
 */
export namespace WebsiteArgs {
    /**
     * Website modification request parameters
     */
    export interface Modify {
        siteId?: string;
        name?: string;
        domain?: string;
        path?: string;
        logo?: string;
        status?: number;
        seo?: {
            title?: string;
            description?: string;
            keywords?: string;
        };
    }

    /**
     * Playlist operation request parameters (add/remove)
     */
    export interface PlaylistOperation {
        siteId: string;
        playlistIds: string[];
    }

    /**
     * Get playlists request parameters
     */
    export interface GetPlaylists {
        siteId: string;
        page?: number;
        pageSize?: number;
    }

    /**
     * Website search request parameters
     */
    export interface Search {
        keyword: string;    // Search keyword
        page?: number;      // Page number, default 1
        pageSize?: number;  // Items per page, default 10
        status?: number;    // Website status
    }
}

/**
 * Request parameters for Playlist related operations
 */
export namespace PlaylistArgs {
    /**
     * Create playlist request parameters
     */
    export interface Create {
        title: string;
        description?: string;
        cover?: string;
        tags?: string;
    }

    /**
     * Modify playlist request parameters
     */
    export interface Modify {
        playlistId: string;
        title?: string;
        description?: string;
        cover?: string;
        tags?: string;
    }

    /**
     * Video operation request parameters (add/remove)
     */
    export interface VideoOperation {
        playlistId: string;
        videoIds: string[];
    }

    /**
     * Get videos list request parameters
     */
    export interface GetVideos {
        playlistId: string;
        page?: number;
        pageSize?: number;
        status?: number;
    }

    /**
     * List playlists request parameters
     */
    export interface List {
        siteId?: string;
        page: number;
        pageSize: number;
        orderType: number;
        status?: number;
    }

    /**
     * Search playlists request parameters
     */
    export interface Search {
        orderType?: number;  // Sort method (0: creation time desc, 1: name asc)
        siteId?: string;    // Site ID
        status?: number;    // Playlist status
        page?: number;      // Page number, default 1
        pageSize?: number;  // Items per page, default 10
        keyword: string;    // Search keyword
    }
}

/**
 * Request parameters for Video related operations
 */
export namespace VideoArgs {
    /**
     * Modify video information request parameters
     */
    export interface Modify {
        vid: string;
        title?: string;
        description?: string;
        seo?: {
            title?: string;
            description?: string;
            keywords?: string;
        };
        cover?: string;
        videoPath?: string;
        videoSourceUrl?: string;
        tags?: string;
    }

    /**
     * Get videos list request parameters
     */
    export interface List {
        page: number;
        pageSize: number;
        uploadStatus?: string; // Upload status (0: not uploaded, 1: uploading, 2: success, 3: failed)
        status?: number;
        orderType?: number; // Sort type (0: creation time, 1: update time)
    }

    /**
     * Search videos request parameters
     */
    export interface Search extends List {
        playlistId?: string;
        keyword?: string;
    }

    /**
     * Delete videos request parameters
     */
    export interface Delete {
        vids: string[];
    }

    /**
     * Replace video request parameters
     */
    export interface Replace {
        vid: string;
        formData: FormData;
    }
}
