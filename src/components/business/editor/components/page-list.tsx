'use client';

import WebsiteApi from '@/api/website';
import InputModal from '@/components/common/input-modal';
import { getDefaultPagesByTemplateName } from '@/constants/initial-version';
import useEditorStore from '@/store/useEditorStore';
import { DataSourceType, Page, Section, SectionType } from '@/types/editor';
import { TranslationFieldType } from '@/types/translation';
import { TranslationHelper } from '@/utils/translationHelper';
import { createUniqueUUID } from '@/utils/public';
import { Menu } from '@mantine/core';
import { IconCopy, IconDots, IconFile, IconHome, IconPencil, IconPlus, IconSettings, IconTrash } from '@tabler/icons-react';
import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import PageSettingsModal from './common/PageSettingsModal';
import StaticPageSettingsModal from './common/StaticPageSettingsModal';
import useUserStore from '@/store/useUserStore';

interface PageListProps {
    onPageChange?: (pageId: string) => void;
    siteId: string;
}

const PageList: React.FC<PageListProps> = ({ onPageChange, siteId }) => {
    const { currentVersion, currentPage, updateSection, updateShareSection, setCurrentPage, setCurrentWidget, addPage, deletePage, updatePage } = useEditorStore();
    const userInfo = useUserStore(state => state.userInfo);
    const [currentOperatePage, setCurrentOperatePage] = useState<Page | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    // 固定页面设置相关状态
    const [currentStaticPageId, setCurrentStaticPageId] = useState<string>('');
    const [currentStaticPageName, setCurrentStaticPageName] = useState<string>('');
    const [currentStaticPagePath, setCurrentStaticPagePath] = useState<string>('');
    const [isStaticPageSettingsOpen, setIsStaticPageSettingsOpen] = useState(false);

    // 根据模板名称动态获取默认页面
    const DEFAULT_PAGES = useMemo(() => {
        return getDefaultPagesByTemplateName(userInfo?.website?.templateName);
    }, [userInfo?.website?.templateName]);

    useEffect(() => {
        if (currentPage) {
            setCurrentWidget(null);
        }
    }, [currentPage]);

    //update navigation section when init
    useEffect(() => {
        if (!currentVersion) return;
        const homePath = currentVersion.pages.find(page => page.isHome)?.path;
        if (homePath) {
            updataNavigationSection(homePath);
        }
    }, []);

    const handleAddPage = async (pageName: string) => {
        if (!currentVersion) return false;
        const existingIds = [...currentVersion.pages.map(page => page.id), ...DEFAULT_PAGES.map(page => page.id)];
        const existingPath = currentVersion.pages.find(page => page.path === '/' + encodeURIComponent(pageName.toLowerCase().replace(/\s+/g, '-')));
        if (existingPath) {
            toast.error('Page path already exists');
            return false;
        }

        const newPageId = createUniqueUUID(existingIds);
        const newPage: Page = {
            id: newPageId,
            name: pageName,
            path: '/' + encodeURIComponent(pageName.toLowerCase().replace(/\s+/g, '-')),
            sections: [],
            metadata: {},
        };

        // 先添加页面
        addPage(newPage);

        // 尝试翻译页面名称
        try {
            toast.info('Translating page name...');

            const translationRequest = {
                items: [
                    {
                        fieldType: TranslationFieldType.PAGE,
                        texts: {
                            name: pageName.trim(),
                        },
                        context: {
                            versionId: currentVersion.id,
                            pageId: newPageId,
                        },
                    },
                ],
            };

            const response = await WebsiteApi.translate(siteId, translationRequest);

            // 检查翻译是否成功
            if (response.code === 0 && response.data && response.data.length > 0) {
                // 深拷贝当前版本
                const updatedVersion = JSON.parse(JSON.stringify(currentVersion));

                // 添加新页面到临时版本
                const pageIndex = updatedVersion.pages.findIndex((p: Page) => p.id === newPageId);
                if (pageIndex === -1) {
                    updatedVersion.pages.push(newPage);
                }

                // 创建临时网站对象用于应用翻译
                const tempWebsite = {
                    id: '',
                    name: '',
                    versions: [updatedVersion],
                    currentVersion: updatedVersion.id,
                };

                // 应用翻译结果
                const translatedWebsite = TranslationHelper.applyTranslationResults(tempWebsite, response.data);

                // 从翻译后的网站中获取更新后的页面
                const translatedVersion = translatedWebsite.versions[0];
                const translatedPage = translatedVersion.pages.find((p: Page) => p.id === newPageId);

                if (translatedPage && translatedPage.nameMultiLang) {
                    // 更新页面的翻译结果
                    updatePage(newPageId, {
                        nameMultiLang: translatedPage.nameMultiLang,
                    });
                    toast.success('Page created and translated successfully');
                } else {
                    toast.success('Page created successfully');
                }
            } else {
                // 翻译失败，但页面已创建
                toast.success('Page created successfully (translation skipped)');
            }
        } catch (translationError) {
            console.error('Translation error:', translationError);
            toast.success('Page created successfully (translation failed)');
        }

        if (onPageChange) {
            onPageChange(newPageId);
        }
        setIsAddModalOpen(false);
        return true;
    };

    const handleDeletePage = (pageId: string) => {
        deletePage(pageId);
    };

    const handlePageClick = async (pageId: string) => {
        if (onPageChange) {
            onPageChange(pageId);
        }
        const page = currentVersion?.pages.find(p => p.id === pageId);

        //update new release data when click page
        const isHaveNewRelease = page?.sections.some(s => s.params.extend.dataSourceType === DataSourceType.NEW_RELEASE);
        if (page && isHaveNewRelease) {
            const updatedPage = await updateSectionData(page, siteId);
            updateSection(pageId, updatedPage.sections[0].id, updatedPage.sections[0], false);
        }
        setCurrentPage(pageId);
    };

    const updateSectionData = async (currentPage: Page, siteId: string) => {
        if (!currentPage?.sections) return currentPage;
        const updatedSections = await Promise.all(
            currentPage.sections.map(async (section: any) => {
                const dataSourceType = section.params.extend.dataSourceType;
                if (dataSourceType === DataSourceType.NEW_RELEASE) {
                    try {
                        const response = await WebsiteApi.getNewRelease(siteId);
                        if (response) {
                            section.params.extend.widgets[0].data = response.data;
                            return section;
                        }
                    } catch (error) {
                        console.error('Error fetching new release data:', error);
                    }
                }
                return section;
            })
        );

        return {
            ...currentPage,
            sections: updatedSections,
        };
    };

    const handleSetAsHome = (page: Page) => {
        if (!currentVersion) return;

        // 先清除其他页面的home标记
        currentVersion.pages.forEach(p => {
            if (p.id !== page.id && p.isHome) {
                p.isHome = false;
            }
        });

        // 设置当前页面为home
        updatePage(page.id, {
            isHome: true,
        });

        updataNavigationSection(page.path);
    };

    // 更新 shareSections 中 Navigation 的 Home 路径
    const updataNavigationSection = (path: string) => {
        if (!currentVersion) return;

        const navigationSection = currentVersion.shareSections?.find((section: Section) => section.type === SectionType.NAVIGATION);
        if (navigationSection && navigationSection.params?.extend?.widgets) {
            const widgets = navigationSection.params.extend.widgets.map((w: any) =>
                w.label === 'Home'
                    ? {
                          ...w,
                          path: path,
                      }
                    : w
            );

            updateShareSection(navigationSection.id, {
                params: {
                    ...navigationSection.params,
                    extend: {
                        ...navigationSection.params.extend,
                        widgets,
                    },
                },
            });
        }
    };

    const handleDuplicatePage = async (page: Page) => {
        if (!currentVersion) return;

        // 获取所有已存在的页面ID
        const existingIds = [...currentVersion.pages.map(page => page.id), ...DEFAULT_PAGES.map(page => page.id)];

        const newPageId = createUniqueUUID(existingIds);

        // 生成唯一的页面名称
        let newPageName = `${page.name} Copy`;
        let counter = 2;

        // 检查名称是否已存在，如果存在则添加数字后缀
        while (currentVersion.pages.some(p => p.name === newPageName)) {
            newPageName = `${page.name} Copy ${counter}`;
            counter++;
        }

        const newPage: Page = {
            ...page,
            id: newPageId,
            name: newPageName,
            path: `${page.path}-copy`,
            isHome: false,
            metadata: {},
            // 清除原页面的多语言翻译，因为名称已改变
            nameMultiLang: undefined,
        };

        // 先添加页面
        addPage(newPage);

        // 尝试翻译新页面名称
        try {
            toast.info('Translating duplicated page name...');

            const translationRequest = {
                items: [
                    {
                        fieldType: TranslationFieldType.PAGE,
                        texts: {
                            name: newPageName.trim(),
                        },
                        context: {
                            versionId: currentVersion.id,
                            pageId: newPageId,
                        },
                    },
                ],
            };

            const response = await WebsiteApi.translate(siteId, translationRequest);

            // 检查翻译是否成功
            if (response.code === 0 && response.data && response.data.length > 0) {
                // 使用 useEditorStore 获取最新的版本（包含刚添加的页面）
                const latestVersion = useEditorStore.getState().currentVersion;

                if (!latestVersion) {
                    toast.success('Page duplicated successfully');
                    return;
                }

                // 深拷贝最新版本
                const updatedVersion = JSON.parse(JSON.stringify(latestVersion));

                // 确保 version ID 与翻译请求中的一致
                updatedVersion.id = currentVersion.id;

                // 确保新页面存在
                const pageIndex = updatedVersion.pages.findIndex((p: Page) => p.id === newPageId);

                if (pageIndex === -1) {
                    toast.success('Page duplicated successfully');
                    return;
                }

                // 创建临时网站对象用于应用翻译
                const tempWebsite = {
                    id: '',
                    name: '',
                    versions: [updatedVersion],
                    currentVersion: currentVersion.id,
                };

                // 应用翻译结果
                const translatedWebsite = TranslationHelper.applyTranslationResults(tempWebsite, response.data);

                // 从翻译后的网站中获取更新后的页面
                const translatedVersion = translatedWebsite.versions[0];
                const translatedPage = translatedVersion.pages.find((p: Page) => p.id === newPageId);

                if (translatedPage && translatedPage.nameMultiLang) {
                    // 更新页面的翻译结果
                    updatePage(newPageId, {
                        nameMultiLang: translatedPage.nameMultiLang,
                    });
                    toast.success('Page duplicated and translated successfully');
                } else {
                    toast.success('Page duplicated successfully');
                }
            } else {
                // 翻译失败，但复制已成功
                toast.success('Page duplicated successfully (translation skipped)');
            }
        } catch (translationError) {
            console.error('Translation error:', translationError);
            toast.success('Page duplicated successfully (translation failed)');
        }
    };

    const handleRenamePage = async (page: Page, newName: string) => {
        if (!currentVersion) return false;

        // 先更新名称
        updatePage(page.id, {
            name: newName,
        });

        // 尝试翻译页面名称
        try {
            toast.info('Translating page name...');

            const translationRequest = {
                items: [
                    {
                        fieldType: TranslationFieldType.PAGE,
                        texts: {
                            name: newName.trim(),
                        },
                        context: {
                            versionId: currentVersion.id,
                            pageId: page.id,
                        },
                    },
                ],
            };

            const response = await WebsiteApi.translate(siteId, translationRequest);

            // 检查翻译是否成功
            if (response.code === 0 && response.data && response.data.length > 0) {
                // 深拷贝当前版本
                const updatedVersion = JSON.parse(JSON.stringify(currentVersion));

                // 确保页面存在
                const pageIndex = updatedVersion.pages.findIndex((p: Page) => p.id === page.id);
                if (pageIndex === -1) {
                    toast.success('Page renamed successfully');
                    return true;
                }

                // 创建临时网站对象用于应用翻译
                const tempWebsite = {
                    id: '',
                    name: '',
                    versions: [updatedVersion],
                    currentVersion: updatedVersion.id,
                };

                // 应用翻译结果
                const translatedWebsite = TranslationHelper.applyTranslationResults(tempWebsite, response.data);

                // 从翻译后的网站中获取更新后的页面
                const translatedVersion = translatedWebsite.versions[0];
                const translatedPage = translatedVersion.pages.find((p: Page) => p.id === page.id);

                if (translatedPage && translatedPage.nameMultiLang) {
                    // 更新页面的翻译结果
                    updatePage(page.id, {
                        nameMultiLang: translatedPage.nameMultiLang,
                    });
                    toast.success('Page renamed and translated successfully');
                } else {
                    toast.success('Page renamed successfully');
                }
            } else {
                // 翻译失败，但重命名已成功
                toast.success('Page renamed successfully (translation skipped)');
            }
        } catch (translationError) {
            console.error('Translation error:', translationError);
            toast.success('Page renamed successfully (translation failed)');
        }

        return true;
    };

    if (!currentVersion) {
        return <div className="p-4 text-center text-gray-500">Loading...</div>;
    }

    const renderPageItem = (id: string, name: string, isCustom: boolean = false, page?: Page) => {
        const isHome = page?.isHome;
        const isForYou = page?.type === 'playlist';
        return (
            <div
                key={id}
                className={`flex items-center p-2 rounded-lg cursor-pointer group transition-colors ${
                    isCustom
                        ? currentPage === id
                            ? 'bg-primary text-white'
                            : 'bg-white border border-gray-200 hover:border-primary hover:text-primary'
                        : 'bg-white border border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                onClick={() => isCustom && handlePageClick(id)}
            >
                {id === 'home' ? (
                    <IconHome size={18} className={`mr-2 ${isCustom ? (currentPage === id ? 'text-white' : 'text-gray-400') : 'text-gray-400'}`} />
                ) : (
                    <IconFile size={18} className={`mr-2 ${isCustom ? (currentPage === id ? 'text-white' : 'text-gray-400') : 'text-gray-400'}`} />
                )}
                <span className="truncate flex-1 font-medium">{name}</span>
                {isCustom && (
                    <div className="flex items-center">
                        {isHome && <IconHome size={18} className={`mr-2 ${currentPage === id ? 'text-white' : 'text-primary'}`} />}
                        <Menu position="bottom-end" offset={4} withArrow>
                            <Menu.Target>
                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        setCurrentOperatePage(page!);
                                    }}
                                    className={`p-1 rounded ${currentPage === id ? 'hover:bg-primary-dark' : 'hover:bg-gray-100'}`}
                                >
                                    <IconDots size={16} className={currentPage === id ? 'text-white' : 'text-gray-500'} />
                                </button>
                            </Menu.Target>
                            <Menu.Dropdown>
                                {!isForYou && !isHome && (
                                    <Menu.Item
                                        leftSection={<IconHome size={16} />}
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleSetAsHome(page!);
                                        }}
                                    >
                                        Set as Home page
                                    </Menu.Item>
                                )}
                                <Menu.Item
                                    leftSection={<IconSettings size={16} />}
                                    onClick={e => {
                                        e.stopPropagation();
                                        setCurrentOperatePage(page!);
                                        setIsSettingsModalOpen(true);
                                    }}
                                >
                                    Settings
                                </Menu.Item>
                                <Menu.Item
                                    leftSection={<IconPencil size={16} />}
                                    onClick={e => {
                                        e.stopPropagation();
                                        setIsRenameModalOpen(true);
                                    }}
                                >
                                    Rename
                                </Menu.Item>
                                <Menu.Item
                                    leftSection={<IconCopy size={16} />}
                                    onClick={e => {
                                        e.stopPropagation();
                                        handleDuplicatePage(page!);
                                    }}
                                >
                                    Duplicate
                                </Menu.Item>
                                <Menu.Divider />
                                {!isForYou && !isHome && (
                                    <Menu.Item
                                        leftSection={<IconTrash size={16} />}
                                        color="red"
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleDeletePage(id);
                                        }}
                                    >
                                        Delete Page
                                    </Menu.Item>
                                )}
                            </Menu.Dropdown>
                        </Menu>
                    </div>
                )}
            </div>
        );
    };

    // 渲染固定页面项（带菜单）
    const renderStaticPageItem = (id: string, name: string, path: string) => {
        return (
            <div key={id} className="flex items-center p-2 rounded-lg bg-white border border-gray-200 text-gray-400 group transition-colors">
                <IconFile size={18} className="mr-2 text-gray-400" />
                <span className="truncate flex-1 font-medium">{name}</span>
                {/* 添加菜单 */}
                <div className="flex items-center transition-opacity">
                    <Menu position="bottom-end" offset={4} withArrow>
                        <Menu.Target>
                            <button
                                onClick={e => {
                                    e.stopPropagation();
                                }}
                                className="p-1 rounded hover:bg-gray-100"
                            >
                                <IconDots size={16} className="text-gray-500" />
                            </button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconSettings size={16} />}
                                onClick={e => {
                                    e.stopPropagation();
                                    setCurrentStaticPageId(id);
                                    setCurrentStaticPageName(name);
                                    setCurrentStaticPagePath(path); // ✅ 设置 path
                                    setIsStaticPageSettingsOpen(true);
                                }}
                            >
                                SEO Settings
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="flex flex-col h-full bg-gray-50/50 gap-2">
                <div className="px-4 pt-4 flex items-center justify-between mb-2 sticky top-0">
                    <h2 className="text-sm font-medium text-gray-500">Custom Pages</h2>
                    <button onClick={() => setIsAddModalOpen(true)} className="p-1 hover:bg-gray-100 rounded-lg text-primary" title="Add new page">
                        <IconPlus size={18} />
                    </button>
                </div>
                <div className="max-h-[calc(100vh-64px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]">
                    {/* Custom Pages Section */}
                    <div className="px-4">
                        <div className="space-y-1">{currentVersion.pages.map((page: Page) => renderPageItem(page.id, page.name, true, page))}</div>
                    </div>

                    {/* Default Pages Section */}
                    <div className="p-4 pb-8">
                        <h2 className="text-sm font-medium text-gray-500 mb-2">Default Pages</h2>
                        <div className="space-y-1">{DEFAULT_PAGES.map(page => renderStaticPageItem(page.id, page.name, page.path))}</div>
                    </div>
                </div>
            </div>

            <InputModal
                opened={isRenameModalOpen}
                onClose={() => setIsRenameModalOpen(false)}
                onSubmit={newName => handleRenamePage(currentOperatePage!, newName)}
                title="Rename Page"
                placeholder="Enter Page Name"
                submitText="Rename"
            />

            <InputModal
                opened={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddPage}
                title="Add New Page"
                placeholder="Enter Page Name"
                submitText="Add Page"
            />

            {currentOperatePage && (
                <PageSettingsModal
                    open={isSettingsModalOpen}
                    onClose={() => setIsSettingsModalOpen(false)}
                    page={currentOperatePage!}
                    onUpdate={updatedPage => updatePage(updatedPage.id, updatedPage)}
                    siteId={siteId}
                />
            )}

            {/* 固定页面设置模态框 */}
            <StaticPageSettingsModal
                open={isStaticPageSettingsOpen}
                onClose={() => setIsStaticPageSettingsOpen(false)}
                staticPageId={currentStaticPageId}
                staticPageName={currentStaticPageName}
                staticPagePath={currentStaticPagePath}
                siteId={siteId}
            />
        </>
    );
};

export default PageList;
