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

/**
 * Base section parameters interface
 */
export interface BaseSectionParams {
    extend: {
        menuItems?: MenuItem[];
        notSharePages?: string[];
    };
}

/**
 * Menu item interface
 */
export interface MenuItem {
    id: string;
    label: string;
    content?: string;
    image?: string;
    visible: boolean;
}

export interface pathMenuItem extends MenuItem {
    path: string;
}

export interface dataMenuItem extends MenuItem {
    data: any;
}

/**
 * Nav menu interface
 */
export interface NavMenu extends MenuItem {
    items: MenuItem[];
}

/**
 * Section interface
 */
export interface Section {
    id: string;
    type: SectionType;
    params: BaseSectionParams;
    order: number;
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
        title?: string;
        description?: string;
        keywords?: string[];
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