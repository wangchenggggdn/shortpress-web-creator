import { Version, Page, SectionType, WidgetType } from '@/types/editor';
import { createUniqueUUID } from '@/utils/public';

// 创建一个存储所有已使用ID的Set
const usedIds = new Set<string>();

// 生成唯一ID的辅助函数
const generateId = () => {
    const newId = createUniqueUUID(usedIds);
    usedIds.add(newId);
    return newId;
};

export const INITIAL_VERSION: Version = {
    id: generateId(),
    pages: [
        {
            id: generateId(),
            path: '/home',
            name: 'Home',
            isHome: true,
            metadata: {
                seo: {
                    title: 'Home',
                    description: 'Home page',
                    keywords: "home,page"
                }
            },
            type: 'playlist',
            sections: [],
        },
        {
            id: generateId(),
            path: '/explore',
            name: 'Explore',
            metadata: {
                seo: {
                    title: 'Explore',
                    description: 'Explore page',
                    keywords: "explore,page"
                }
            },
            sections: []
        }
    ],
    shareSections: [
        {
            id: generateId(),
            title: 'Header',
            type: SectionType.HEADER,
            order: 0,
            params: {
                extend: {
                    widgets: [
                        {
                            id: generateId(),
                            label: 'Logo',
                            content: '',
                            visible: true,
                            type: WidgetType.LOGO
                        },
                        {
                            id: generateId(),
                            label: 'DramaHub',
                            content: '',
                            visible: true,
                            type: WidgetType.DATA,
                        },
                        {
                            id: generateId(),
                            label: 'Search',
                            content: '',
                            visible: true,
                            type: WidgetType.PATH
                        },
                        {
                            id: generateId(),
                            label: 'Account',
                            content: '',
                            visible: true,
                            type: WidgetType.PATH
                        },
                        {
                            id: generateId(),
                            label: 'Vip',
                            content: '',
                            visible: true,
                            type: WidgetType.PATH
                        },
                        {
                            id: generateId(),
                            label: 'Nav Menu',
                            content: '',
                            visible: true,
                            type: WidgetType.NAV,
                            widgets: [
                                {
                                    id: generateId(),
                                    label: 'Nav icon',
                                    type: WidgetType.LOGO,
                                    visible: true
                                },
                                {
                                    id: generateId(),
                                    label: 'Home',
                                    type: WidgetType.PATH,
                                    path: '/home',
                                    visible: true
                                },
                                {
                                    id: generateId(),
                                    label: 'Explore',
                                    type: WidgetType.PATH,
                                    path: '/explore',
                                    visible: true
                                }
                            ]
                        }
                    ]
                },
            }
        }, {
            id: generateId(),
            title: 'Footer',
            type: SectionType.FOOTER,
            order: 0,
            params: {
                extend: {
                    widgets: [
                        {
                            id: generateId(),
                            label: 'Terms of Service',
                            content: '',
                            visible: true,
                            type: WidgetType.PATH,
                        },
                        {
                            id: generateId(),
                            label: 'Privacy Policy',
                            content: '',
                            visible: true,
                            type: WidgetType.PATH
                        },
                        {
                            id: generateId(),
                            label: 'Footer Text',
                            content: '',
                            visible: true,
                            type: WidgetType.DATA
                        },
                        {
                            id: generateId(),
                            label: 'logo',
                            content: '',
                            visible: true,
                            type: WidgetType.LOGO
                        }
                    ],
                    notSharePages: ['/home']
                },
            }
        }
    ]
};

export const DEFAULT_PAGES: Page[] = [
    {
        id: generateId(),
        name: '404',
        path: '404',
        sections: []
    },
    {
        id: generateId(),
        name: 'Search Result',
        path: 'search-result',
        sections: []
    },
    {
        id: generateId(),
        name: 'Category',
        path: 'category',
        sections: []
    },
    {
        id: generateId(),
        name: 'Playlist',
        path: 'playlist',
        sections: []
    },
    {
        id: generateId(),
        name: 'Player',
        path: 'player',
        sections: []
    },
    {
        id: generateId(),
        name: 'Privacy Policy',
        path: 'privacy-policy',
        sections: []
    },
    {
        id: generateId(),
        name: 'Terms of Service',
        path: 'terms-of-service',
        sections: []
    }
];