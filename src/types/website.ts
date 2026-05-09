import { MultiLanguageText, MultiLanguageSEO, MultiLanguageSite } from './translation';

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
    /** Template ID */
    templateId?: string;
    /** Template name */
    templateName?: string;
    /** Google Analytics ID */
    googleAnalyticsId?: string;
    /** Facebook Pixel ID */
    facebookPixelId?: string;
    /** ThinkingData App ID */
    thinkingdataAppId?: string;
    /** SEO information (legacy format for backward compatibility) */
    seo?: {
        /** SEO title */
        title?: string;
        /** SEO description */
        description?: string;
        /** SEO keywords */
        keywords?: string;
    };
    /** Multi-language SEO information */
    seoMultiLang?: MultiLanguageSEO;
    /** Multi-language website name */
    siteMultiLang?: MultiLanguageSite;
    /** Official domain */
    officialDomain?: string;
    /** Accent palette index (aligned with visitor `sites.theme`) */
    theme?: number;
}

export enum WebTemplate {
    /** Website list */
    ANIME = 'anime',
    SORA_APP = 'sora app',
    SHORT_DRAMA = 'short drama',
}
