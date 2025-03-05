/**
 * Enum for site status
 */
export enum SiteStatus {
    /** Site is not published */
    UNPUBLISHED = 0,
    /** Site is published */
    PUBLISHED = 1,
    /** Site is disabled */
    DISABLED = 2
}

/**
 * Interface for site information
 */
export interface ISite {
    /** Unique site identifier */
    siteId: string;
    /** Site domain */
    domain: string;
    /** Whether to redirect to domain */
    redirect?: boolean;
    /** Site path */
    path: string;
    /** Site name */
    name: string;
    /** Site logo URL */
    logo?: string;
    /** Current site status */
    status: SiteStatus;
    /** Site title */
    title?: string;
    /** Site description */
    description?: string;
    /** Creation timestamp */
    createdAt: string;
    /** Last update timestamp */
    updatedAt: string;
}