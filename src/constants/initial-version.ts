import { Version, Page, SectionType, WidgetType } from '@/types/editor';
import { createUniqueUUID } from '@/utils/public';

const usedIds = new Set<string>();

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
            path: '/for-you',
            name: 'For You',
            isHome: true,
            type: 'playlist',
            sections: [],
        },
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
                                    label: 'For You',
                                    type: WidgetType.PATH,
                                    path: '/for-you',
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
                            content: 'Terms of Service',
                            visible: true,
                            type: WidgetType.PATH,
                            path: '/terms-of-service'
                        },
                        {
                            id: generateId(),
                            label: 'Privacy Policy',
                            content: 'Privacy Policy',
                            visible: true,
                            type: WidgetType.PATH,
                            path: '/privacy-policy'
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
                            content: 'Powered by ShortPress.com',
                            visible: true,
                            type: WidgetType.LOGO
                        }
                    ],
                    notSharePages: ['/for-you']
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