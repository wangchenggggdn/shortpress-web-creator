import { Page, SectionType, Version, WidgetType, Section } from '@/types/editor';
import { WebTemplate } from '@/types/website';
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
                            visible: false,
                            type: WidgetType.LOGO,
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
                            type: WidgetType.PATH,
                        },
                        {
                            id: generateId(),
                            label: 'Vip',
                            content: '',
                            visible: false,
                            type: WidgetType.PATH,
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
                                    label: 'Nav Icon',
                                    type: WidgetType.LOGO,
                                    path: '',
                                    visible: true,
                                },
                                // {
                                //     id: generateId(),
                                //     label: 'For You',
                                //     type: WidgetType.PATH,
                                //     path: '/for-you',
                                //     visible: true,
                                // },
                            ],
                        },
                        {
                            id: generateId(),
                            label: 'Scroll Switching',
                            content: '',
                            visible: false,
                            scroll: false,
                            type: WidgetType.SCROLL,
                        },
                    ],
                },
            },
        },
        {
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
                            path: '/terms-of-service',
                        },
                        {
                            id: generateId(),
                            label: 'Privacy Policy',
                            content: 'Privacy Policy',
                            visible: true,
                            type: WidgetType.PATH,
                            path: '/privacy-policy',
                        },
                        {
                            id: generateId(),
                            label: 'Footer Text',
                            content: '',
                            visible: true,
                            type: WidgetType.DATA,
                        },
                        {
                            id: generateId(),
                            label: 'logo',
                            content: 'Powered by ShortPress.com',
                            visible: true,
                            type: WidgetType.LOGO,
                        },
                    ],
                    notSharePages: ['/for-you'],
                },
            },
        },

    ],
};

export const DEFAULT_PAGES: Page[] = [
    {
        id: generateId(),
        name: 'Search',
        path: 'search',
        sections: [],
    },
    {
        id: generateId(),
        name: 'Privacy Policy',
        path: 'privacy-policy',
        sections: [],
    },
    {
        id: generateId(),
        name: 'Terms of Service',
        path: 'terms-of-service',
        sections: [],
    },
    {
        id: generateId(),
        name: 'Profile',
        path: 'profile',
        sections: [],
    },
    {
        id: generateId(),
        name: 'Profile Store',
        path: 'profile/store',
        sections: [],
    },
    {
        id: generateId(),
        name: 'Profile Wallet',
        path: 'profile/wallet',
        sections: [],
    },
    {
        id: generateId(),
        name: 'Wallet Episodes',
        path: 'profile/wallet/episodes',
        sections: [],
    },
    {
        id: generateId(),
        name: 'Wallet Transaction',
        path: 'profile/wallet/transaction',
        sections: [],
    },
    {
        id: generateId(),
        name: 'Watch History',
        path: 'watch-history',
        sections: [],
    },
     {
        id: generateId(),
        name: 'FAQ',
        path: 'faq',
        sections: [],
    },
];

// 不同模板的默认页面路径配置
const DEFAULT_PAGES_PATHS = {
    [WebTemplate.ANIME]: ['search', 'privacy-policy', 'terms-of-service', 'profile', 'profile/store', 'profile/wallet', 'profile/wallet/episodes', 'profile/wallet/transaction', 'watch-history'],
    [WebTemplate.SHORT_DRAMA]: ['search', 'privacy-policy', 'terms-of-service', 'profile', 'profile/store', 'profile/wallet', 'profile/wallet/episodes', 'profile/wallet/transaction', 'watch-history'],
    [WebTemplate.SORA_APP]: ['faq', 'privacy-policy', 'terms-of-service', 'profile', 'profile/store', 'profile/wallet/transaction'],
};

/**
 * 根据模板名称获取默认页面
 * @param templateName 模板名称
 * @returns 默认页面数组
 */
export const getDefaultPagesByTemplateName = (templateName?: string): Page[] => {
    // 如果没有模板名称,返回所有默认页面
    if (!templateName) {
        return DEFAULT_PAGES;
    }

    // 获取对应模板的页面路径
    const paths = DEFAULT_PAGES_PATHS[templateName as keyof typeof DEFAULT_PAGES_PATHS];
    
    // 如果找不到对应的模板配置,返回所有默认页面
    if (!paths) {
        return DEFAULT_PAGES;
    }

    // 根据路径过滤出对应的页面
    return DEFAULT_PAGES.filter(page => paths.includes(page.path));
};

export const DEFAULT_FOOTER_NAVIGATION={
    [WebTemplate.ANIME]: [
        {label: 'Home', path: '/',visible: true},
        {label: 'For you', path: '/for-you',visible: false},
        {label: 'History', path: '/watch-history',visible: true},
        {label: 'Personal', path: '/profile',visible: true},
    ],
    [WebTemplate.SHORT_DRAMA]: [
        {label: 'Home', path: '/',visible: true},
        {label: 'For you', path: '/for-you',visible: true},
        {label: 'History', path: '/watch-history',visible: true},
        {label: 'Personal', path: '/profile',visible: true},
    ],
    [WebTemplate.SORA_APP]: [
        {label: 'Home', path: '/',visible: true},
        {label: 'For you', path: '/for-you',visible: true},
        {label: 'Create', path: '/create',visible: true},
        {label: 'Personal', path: '/profile',visible: true},
    ],
};

/**
 * 根据模板名称生成 Navigation Section
 * @param templateName 模板名称
 * @returns Navigation Section
 */
export const getNavigationSection = (templateName?: string): Section => {
    let template = (templateName as WebTemplate);
    
    // Normalize template name
    if (templateName) {
        const lowerName = templateName.toLowerCase();
        if (Object.values(WebTemplate).includes(lowerName as WebTemplate)) {
            template = lowerName as WebTemplate;
        }
    }

    // 获取对应的导航配置，默认为 ANIME
    const navItems = DEFAULT_FOOTER_NAVIGATION[template] || DEFAULT_FOOTER_NAVIGATION[WebTemplate.ANIME];

    // 生成 Widgets
    const widgets = navItems.map(item => ({
        id: generateId(),
        label: item.label,
        content: item.label,
        visible: item.visible,
        type: WidgetType.PATH,
        path: item.path
    }));

    return {
        id: generateId(),
        title: 'Navigation',
        type: SectionType.NAVIGATION,
        order: 0,
        params: {
            extend: {
                widgets
            }
        },
        // @ts-ignore - titleMultiLang undefined in Section type potentially
        titleMultiLang: {
            original: "Navigation",
            translations: {
              "zh-CN": "导航",
              "zh-TW": "導航",
              "en": "Navigation",
              "ja": "ナビゲーション",
              "de": "Navigation",
              "ko": "내비게이션",
              "fr": "Navigation",
              "id": "Navigasi"
            }
        }
    };
};

/**
 * 根据模板名称生成初始版本数据，动态添加 Navigation
 * @param templateName 模板名称
 * @returns 初始版本对象
 */
export const getInitialVersion = (templateName?: string): Version => {
    // 深拷贝基础初始版本
    const version: Version = JSON.parse(JSON.stringify(INITIAL_VERSION));
    
    // 添加 Navigation Section
    version.shareSections.push(getNavigationSection(templateName));

    return version;
};