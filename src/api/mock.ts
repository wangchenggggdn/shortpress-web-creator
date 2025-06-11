import { EditWebsite, Version, Page, Section, SectionType, DataSourceType } from '@/types/editor';

// 模拟数据
const mockWebsite: EditWebsite = {
    id: 'website-1',
    name: 'Dramahub',
    domain: 'dramahub.tv',
    versions: [
        {
            id: 'version-1',
            shareSections: [],
            pages: [
                {
                    id: 'page-1',
                    name: 'Home',
                    path: '/',
                    sections: [
                        {
                            id: 'section-1',
                            type: SectionType.HEADER,
                            order: 0,
                            params: {
                                extend: {
                                },
                            }
                        },
                        {
                            id: 'section-2',
                            type: SectionType.FEATURE,
                            order: 1,
                            params: {
                                extend: {
                                },
                            }
                        }
                    ]
                },
                {
                    id: 'page-2',
                    name: 'Explore',
                    path: '/explore',
                    sections: []
                }
            ],
        }
    ],
    currentVersion: 'version-1'
};

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟API响应
export const mockApi = {
    // 获取网站信息
    getWebsite: async (siteId: string): Promise<{ code: number; data: EditWebsite | null; info: string }> => {
        await delay(500);
        return {
            code: 0,
            data: mockWebsite,
            info: 'success'
        };
    },

    // 更新网站信息
    updateWebsite: async (website: Partial<EditWebsite>): Promise<{ code: number; info: string }> => {
        await delay(500);
        Object.assign(mockWebsite, website);
        return {
            code: 0,
            info: 'success'
        };
    },

    // 创建新版本
    createVersion: async (siteId: string, version: Version): Promise<{ code: number; data: Version; info: string }> => {
        await delay(500);
        const newVersion: Version = {
            id: `version-${mockWebsite.versions.length + 1}`,
            pages: version.pages,
            shareSections: version.shareSections,
        };
        mockWebsite.versions.push(newVersion);
        mockWebsite.currentVersion = newVersion.id;
        return {
            code: 0,
            data: newVersion,
            info: 'success'
        };
    },

    // 获取版本信息
    getVersion: async (siteId: string, versionId: string): Promise<{ code: number; data: Version | null; info: string }> => {
        await delay(500);
        const version = mockWebsite.versions.find((v: Version) => v.id === versionId);
        return {
            code: 0,
            data: version || null,
            info: version ? 'success' : 'version not found'
        };
    }
}; 