import { IPaginationParams } from "@/types/public";

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
        googleAnalyticsId?: string;

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
        excludeSiteId?: string;
        status?: number;    // Playlist status
        page?: number;      // Page number, default 1
        pageSize?: number;  // Items per page, default 10
        keyword: string;    // Search keyword
    }

    /**
     * Change playlist access type request parameters
     */
    export interface AccessChange {
        /** Playlist ID */
        playlistId: string;
        /** Access type (1:free 2:paid 3:member-only) */
        accessType: 1 | 2 | 3;
        /** Number of free videos before requiring payment */
        freeVideos?: number;
        /** Cost in coins to unlock a single video */
        singleVideoPrice?: number;
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
        excludePlaylistId?: string;
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

/**
 * Request parameters for Ads related operations
 */
export namespace AdsArgs {
    /**
     * Ad unit base interface
     */
    export interface AdUnit {
        adId?: string;
        adNetwork: string;
        clientId: string;
        format: number;
        frequency: number;
        name: string;
        page: string;
        siteId: string;
        status: number;
        unitId: string;
    }

    /**
     * Create ad unit request parameters
     */
    export interface Create extends AdUnit { }

    /**
     * Modify ad unit request parameters
     */
    export interface Modify extends AdUnit { }

    /**
     * Get ad units list request parameters
     */
    export interface List {
        siteId: string;
    }
}

export namespace CustomerArgs {
    export interface Search {
        query?: string;
        page?: number;
        pageSize?: number;
        siteId: string;
    }

    export interface ChangeStatus {
        email: string;
        siteId: string;
        status: number;  // 2=activate, 3=forbidden, 127=delete
    }

    export interface GetInfo {
        email: string;
        siteId: string;
    }

    /**
     * Get coin transactions request parameters
     */
    export interface GetCoinTransactions extends IPaginationParams {
        email: string;
        siteId: string;
    }

    /**
     * Get video unlock transactions request parameters
     */
    export interface GetVideoUnlockTransactions extends IPaginationParams {
        email: string;
        siteId: string;
    }
}

/**
 * Request parameters for Payment related operations
 */
export namespace PaymentArgs {
    /**
     * Get payment account information parameters
     */
    export interface GetAccountInfo {
        provider: string;  // Payment service provider (e.g., stripe)
        siteId: string;   // Site ID
    }

    /**
     * Create coin package parameters
     */
    export interface CreateCoinPackage {
        siteId: string;           // Required: Site ID
        name: string;             // Required: Package name
        coinAmount: number;       // Required: Amount of coins, minimum: 1
        price: number;            // Required: Price, minimum: 0.01
        description?: string;     // Optional: Package description
        discountPercentage?: number; // Optional: Discount percentage
        originalPrice?: number;   // Optional: Original price before discount
    }

    /**
     * Get coin package list parameters
     */
    export interface GetCoinPackageList {
        siteId: string;
    }

    /**
     * Save payment configuration parameters
     */
    export interface SaveConfig {
        provider: string;         // Required: Payment provider name
        siteId: string;          // Required: Site ID
        stripeConf?: {           // Optional: Stripe configuration
            pk: string;          // Publishable key
            sk: string;          // Secret key
        };
        paypalConf?: {           // Optional: PayPal configuration
            clientId: string;
            clientSecret: string;
        };
    }

    /**
     * Test payment configuration parameters
     */
    export interface TestConfig extends SaveConfig {
        webhook?: string;
    }

    /**
     * Create order parameters
     */
    export interface CreateOrder {
        siteId: string;          // Required: Site ID
        packageId: string;       // Required: ID of the coin package or subscription package
        orderType: 'coin' | 'sub'; // Required: Order type
        currency?: string;       // Optional: Override for currency
        returnUrl?: string;      // Optional: URL to redirect after payment
        cancelUrl?: string;      // Optional: URL to redirect if canceled
    }

    export interface CoinTransactions {
        siteId: string;
        email: string;
        page?: number;
        pageSize?: number;
    }

    export interface VideoUnlockTransactions {
        siteId: string;
        email: string;
        page?: number;
        pageSize?: number;
    }

    /**
     * Get payment configuration parameters
     */
    export interface GetConfig {
        siteId: string;           // Required: Site ID
    }

    export interface GrantCoins {
        siteId: string;
        userEmail: string;
        coinAmount: number;
        reason?: string;
    }

    /**
     * Get user's coin balance request parameters
     */
    export interface GetUserCoinsBalance {
        userEmail: string;  // User's email address
        siteId: string;     // Site ID
    }
}

/**
 * Request parameters for Analytics related operations
 */
export namespace AnalyticsArgs {
    /**
     * Income statistics request parameters
     */
    export interface IncomeStatistics {
        siteId: string;
        startTime: number;  // Unix timestamp in milliseconds
        endTime: number;    // Unix timestamp in milliseconds
    }

    /**
     * Income transactions request parameters
     */
    export interface IncomeTransactions {
        siteId: string;
        startTime?: number;  // Unix timestamp in milliseconds
        endTime?: number;    // Unix timestamp in milliseconds
        page?: number;      // Page number, default 1
        pageSize?: number;  // Items per page, default 10
        userEmail?: string;
    }

    export interface IncomeTransactionInfo {
        transactionId: string;
    }
}

