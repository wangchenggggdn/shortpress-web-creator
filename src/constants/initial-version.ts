import { Version, Page, SectionType } from '@/types/editor';

export const INITIAL_VERSION: Version = {
    id: 'initial',
    pages: [
        {
            id: 'home',
            path: '/',
            name: 'Home',
            metadata: {
                title: 'Home',
                description: 'Home page',
                keywords: ['home', 'page']
            },
            sections: []
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