/**
 * Interface for website information
 */
export interface Website {
    /** Unique website identifier */
    siteId: string;
    /** Website name */
    name: string;
    /** Website domain */
    domain: string;
    /** Website path */
    path: string;
    /** Website logo URL */
    logo?: string;
    /** Website status */
    status: number;
    /** Google Analytics ID */
    googleAnalyticsId?: string;
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