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
 * Section parameters interface
 */
export interface SectionParams {
    id: string;
    type: DataSourceType;
    title?: string;
    description?: string;
    style?: Record<string, any>;
    data?: any;
}

/**
 * Section interface
 */
export interface Section {
    id: string;
    type: SectionType;
    params: SectionParams;
    order: number;
}

/**
 * Page interface
 */
export interface Page {
    id: string;
    name: string;
    path: string;
    sections: Section[];
}

/**
 * Version interface
 */
export interface Version {
    id: string;
    number: number;
    pages: Page[];
    createdAt: string;
    updatedAt: string;
}

/**
 * Website interface
 */
export interface Website {
    id: string;
    name: string;
    domain?: string;
    versions: Version[];
    currentVersion: number;
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
    website: Website | null;
    currentVersion: Version | null;
    currentPage: string | null;
    currentSection: string | null;
    selectedComponent: string | null;
    isDirty: boolean;
    history: HistoryRecord[];
    currentHistoryIndex: number;
} 