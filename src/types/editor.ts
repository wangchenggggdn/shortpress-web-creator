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
    id: string;
    title?: string;
    description?: string;
    style?: Record<string, any>;
    data?: any;
    order: number;
    extend: Record<string, any>;
}

/**
 * Menu item interface
 */
export interface MenuItem {
    id: string;
    label: string;
    path: string;
    visible: boolean;
}

/**
 * Nav menu interface
 */
export interface NavMenu {
    showIcon?: boolean;
    icon?: string;
    items: MenuItem[];
}

/**
 * Header section specific parameters
 */
export interface HeaderSectionParams extends BaseSectionParams {
    extend: {
        showLogo?: boolean;
        logo?: string;
        showLabel?: boolean;
        label?: string;
        showSearchIcon?: boolean;
        showAccountIcon?: boolean;
        navMenu?: NavMenu;
        isGlobal?: boolean;
    };
}

/**
 * Footer section specific parameters
 */
export interface FooterSectionParams extends BaseSectionParams {
    extend: {
        menuItems?: MenuItem[];
        footerText?: string;
        showShortPressLogo?: boolean;
        isGlobal?: boolean;
    };
}

/**
 * Carousel section specific parameters
 */
export interface CarouselSectionParams extends BaseSectionParams {
    extend: {
        contentType?: DataSourceType;
        items?: Array<any>;
        headLine?: string;
    };
}

/**
 * Union type for all section parameters
 */
export type SectionParams = HeaderSectionParams | FooterSectionParams | CarouselSectionParams;

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
    shareSections?: Array<Section>;
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