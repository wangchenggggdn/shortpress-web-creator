/**
 * Section type enum
 */
export enum SectionType {
    HEADER = 'header',
    FEATURE = 'feature',
    CAROUSEL = 'carousel',
    SCROLL = 'scroll',
    GRID = 'grid',
    LIST = 'list',
    COLUMN = 'column',
    FOOTER = 'footer'
}

/**
 * Section data source type enum
 */
export enum DataSourceType {
    PLAYLIST = 'playlist',
    CONTINUE_WATCHING = 'continue_watching',
    NEW_RELEASE = 'new_release'
}

export enum WidgetType {
    DEFAULT = 'default',
    LOGO = 'logo',
    NAV = 'nav',
    DATA = 'data',
    PATH = 'path',
}

/**
 * Base section parameters interface
 */
export interface BaseSectionParams {
    extend: {
        widgets?: any[];
        notSharePages?: string[];
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
    type: SectionType;
    params: BaseSectionParams;
    order: number; //delete
    isHidden?: boolean;
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
    };
    sections: Section[];
}

/**
 * Version interface
 */
export interface Version {
    id: string;
    pages: Page[];
    shareSections: Section[];
}

/**
 * Website interface
 */
export interface EditWebsite {
    id: string;
    name: string;
    domain?: string;
    versions: Version[];
    currentVersion: string;
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