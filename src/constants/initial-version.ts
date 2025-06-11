import { Version, Page, SectionType } from '@/types/editor';

export const INITIAL_VERSION: Version = {
    id: 'initial',
    pages: [
        {
            id: 'home',
            path: '/',
            name: 'Home',
            isHome: true,
            metadata: {
                title: 'Home',
                description: 'Home page',
                keywords: ['home', 'page']
            },
            sections: [
                {
                    id: 'footer',
                    type: SectionType.FOOTER,
                    order: 0,
                    params: {
                        extend: {},
                    },
                    isHidden: true
                }
            ]
        },
        {
            id: 'explore',
            path: '/explore',
            name: 'Explore',
            metadata: {
                title: 'Explore',
                description: 'Explore page',
                keywords: ['explore', 'page']
            },
            sections: []
        }
    ],
    shareSections: [
        {
            id: 'header',
            type: SectionType.HEADER,
            order: 0,
            params: {
                extend: {},
            }
        }, {
            id: 'footer',
            type: SectionType.FOOTER,
            order: 0,
            params: {
                extend: {},
            }
        }
    ]
};

export const DEFAULT_PAGES: Page[] = [
    {
        id: '404',
        name: '404',
        path: '404',
        sections: []
    },
    {
        id: 'search-result',
        name: 'Search Result',
        path: 'search-result',
        sections: []
    },
    {
        id: 'category',
        name: 'Category',
        path: 'category',
        sections: []
    },
    {
        id: 'playlist',
        name: 'Playlist',
        path: 'playlist',
        sections: []
    },
    {
        id: 'player',
        name: 'Player',
        path: 'player',
        sections: []
    },
    {
        id: 'privacy-policy',
        name: 'Privacy Policy',
        path: 'privacy-policy',
        sections: []
    },
    {
        id: 'terms-of-service',
        name: 'Terms of Service',
        path: 'terms-of-service',
        sections: []
    }
];