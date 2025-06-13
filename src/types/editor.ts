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
    FOOTER = 'Footer'
}

/**
 * Section data source type enum
 */
export enum DataSourceType {
    PLAYLIST = 'Playlist',
    CONTINUE_WATCHING = 'Continue Watching',
    NEW_RELEASE = 'New Release'
}

export enum WidgetType {
    DEFAULT = 'Default',
    LOGO = 'Logo',
    NAV = 'Nav',
    DATA = 'Data',
    PATH = 'Path',
}

/**
 * Base section parameters interface
 */
export interface BaseSectionParams {
    extend: {
        widgets?: any[];
        notSharePages?: string[];
        dataSourceType?: DataSourceType;
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
    title: string;
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