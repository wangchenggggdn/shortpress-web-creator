import { MultiLanguageText, MultiLanguageSEO } from './translation';

/**
 * Section type enum
 */
export enum SectionType {
    HEADER = 'Header',
    FEATURE = 'Feature',
    CAROUSEL = 'Carousel',
    SCROLL = 'Scroll',
    GRID = 'Grid',
    LIST = 'List',
    COLUMN = 'Column',
    FOOTER = 'Footer',
    NAVIGATION = 'Navigation',
    CREATE = 'Create',
    TEMPLATE_CREATE = 'Template Create',
    PLAYER = 'Player',
}

/**
 * Section data source type enum
 */
export enum DataSourceType {
    PLAYLIST = 'Playlist',
    CONTINUE_WATCHING = 'Continue Watching',
    NEW_RELEASE = 'New Release',
}

export enum WidgetType {
    DEFAULT = 'Default',
    LOGO = 'Logo',
    NAV = 'Nav',
    DATA = 'Data',
    PATH = 'Path',
    SCROLL = 'Scroll',
}

/**
 * Base section parameters interface
 */
export interface BaseSectionParams {
    extend: {
        widgets?: any[];
        notSharePages?: string[];
        dataSourceType?: DataSourceType;
        exampleImages?: string[];
        disablePlaylistLink?: boolean;
    };
}

/**
 * Menu item interface
 */
export interface Widget {
    id: string;
    label: string;
    type: WidgetType;
    content?: string;
    image?: string;
    visible: boolean;
}

export interface PathWidget extends Widget {
    type: WidgetType.PATH;
    path: string;
}

export interface ScrollWidget extends Widget {
    type: WidgetType.SCROLL;
    scroll: boolean;
}

export interface DataWidget extends Widget {
    type: WidgetType.DATA;
    data: any;
}

export interface NavMenu extends Widget {
    type: WidgetType.PATH;
    widgets: any[];
}

/**
 * Section interface
 */
export interface Section {
    id: string;
    title: string;
    type: SectionType;
    params: BaseSectionParams;
    order: number; //delete
    isHidden?: boolean;
    link?: LinkItem;
    coverLink?: LinkItem; // Cover jump path
    /** Multi-language title */
    titleMultiLang?: MultiLanguageText;
}

export interface LinkItem {
    id: string;
    label: string;
    type: WidgetType;
    content: string;
    path: string;
}

/**
 * Page interface
 */
export interface Page {
    id: string;
    path: string;
    name: string;
    isHome?: boolean;
    metadata?: {
        seo?: {
            title?: string;
            description?: string;
            keywords?: string;
        };
        /** Multi-language SEO */
        seoMultiLang?: MultiLanguageSEO;
    };
    type?: 'custom' | 'playlist' | 'video';
    sections: Section[];
    /** Multi-language page name */
    nameMultiLang?: MultiLanguageText;
}

/**
 * Static Page interface
 * 固定页面（如搜索页、播放历史页等）的 SEO 配置
 */
export interface StaticPage {
    /** 固定页面 ID（唯一标识，如 'search', 'history', 'profile' 等） */
    id: string;
    /** 页面名称 */
    name?: string;
    /** 页面路径 */
    path?: string;
    /** SEO 信息（用户输入的原始数据） */
    seo?: {
        /** SEO 标题 */
        title?: string;
        /** SEO 描述 */
        description?: string;
        /** SEO 关键词 */
        keywords?: string;
    };
    /** 多语言 SEO 信息 */
    seoMultiLang?: MultiLanguageSEO;
}

/**
 * Version interface
 */
export interface Version {
    id: string;
    pages: Page[];
    shareSections: Section[];
    /** 固定页面的 SEO 配置（可选，按需创建） */
    staticPages?: StaticPage[];
}

/**
 * Website interface
 */
export interface EditWebsite {
    id: string;
    name: string;
    description?: string;
    domain?: string;
    path?: string;
    versions: Version[];
    currentVersion: string;
    status?: number; // 0: 未发布, 1: 已发布
}

/**
 * History record interface
 */
export interface HistoryRecord {
    version: Version;
    timestamp: number;
    action: string;
    description: string;
}

/**
 * Editor state interface
 */
export interface EditorState {
    website: EditWebsite | null;
    currentVersion: Version | null;
    currentPage: string | null;
    currentSection: string | null;
    selectedComponent: string | null;
    isDirty: boolean;
    history: HistoryRecord[];
    currentHistoryIndex: number;
}
