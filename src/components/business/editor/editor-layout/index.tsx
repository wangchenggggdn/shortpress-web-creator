'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useEditorStore from '@/store/useEditorStore';
import PageList from '@/components/business/editor/components/page-list';
import SectionList from '@/components/business/editor/components/section-list';
import SectionEditor from '@/components/business/editor/components/section-editor';
import Preview from '@/components/business/editor/components/preview';
import EditorHeader from '@/components/business/editor/components/common/EditorHeader';
import WebsiteApi from '@/api/website';
import { DataSourceType, EditWebsite, Page, Section, SectionType, Version } from '@/types/editor';
import { Website } from '@/types/website';
import { TranslationFieldType } from '@/types/translation';
import { TranslationHelper } from '@/utils/translationHelper';
import { toast } from 'sonner';
import LoadingData from '@/components/common/loading-data';
import useUserStore from '@/store/useUserStore';

interface EditorLayoutProps {
    siteId: string;
    pageId: string;
    sectionId?: string;
    initialData: EditWebsite;
    siteData?: Website;
}

const EditorLayout: React.FC<EditorLayoutProps> = ({ siteId, pageId, sectionId, initialData, siteData }) => {
    const router = useRouter();
    const [isSaving, setIsSaving] = React.useState(false);
    const userInfo = useUserStore(state => state.userInfo);
    const setUserInfo = useUserStore(state => state.setUserInfo);
    const {
        editWebsite,
        setEditWebsite,
        currentVersion,
        setCurrentVersion,
        currentPage,
        setCurrentPage,
        currentSection,
        setCurrentSection,
        isDirty,
        saveVersion,
        undo,
        redo,
        initializeHistory,
    } = useEditorStore();

    useEffect(() => {
        if (sectionId && currentSection && currentSection.id == sectionId && currentSection.type !== SectionType.HEADER && currentSection.type !== SectionType.FOOTER) {
            scrollToTarget(sectionId);
        }
    }, [currentSection, sectionId]);

    const scrollToTarget = (id: string) => {
        const targetElement = document.getElementById(id);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'auto',
                block: 'center',
            });
        }
    };

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.returnValue = 'refresh will lost your changes, please save first';
            e.preventDefault();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // Initialize with server-side data
    useEffect(() => {
        if (!editWebsite && initialData) {
            let nowData = initialData;
            setEditWebsite(nowData);
            console.log('editWebsite', nowData);
            const version = nowData.versions.find((v: Version) => v.id === nowData.currentVersion);
            if (version) {
                setCurrentVersion(version);
                initializeHistory(version);
            }
        }
    }, [initialData, editWebsite, setEditWebsite, setCurrentVersion, initializeHistory]);

    // Sync siteData to userStore
    useEffect(() => {
        if (siteData && userInfo && (!userInfo.website || userInfo.website.siteId !== siteData.siteId)) {
            setUserInfo({ ...userInfo, website: siteData });
        }
    }, [siteData, userInfo, setUserInfo]);

    // Sync route params with store
    useEffect(() => {
        if (currentVersion) {
            console.log('currentVersion', currentVersion);
            console.log('pageId', pageId);
            // Find page by name
            const page = currentVersion.pages.find(p => p.id === pageId);
            console.log('currentPage', page);
            if (page) {
                console.log('Found page:', page.name, page.id);
                if (page.id !== currentPage) {
                    setCurrentPage(page.id);
                }
                console.log('sectionId', sectionId);
                // Find section by type
                if (sectionId) {
                    let section = page.sections.find(s => s.id === sectionId);
                    if (!section) {
                        section = currentVersion?.shareSections.find(s => s.id === sectionId);
                    }
                    if (section) {
                        console.log('Found section:', section.type, section.id);
                        if (section.id !== currentSection?.id) {
                            setCurrentSection(section);
                        }
                    }

                    console.log('currentSection', section);
                } else if (currentSection) {
                    console.log('Clearing section');
                    setCurrentSection(null);
                }
            }
        }
    }, [pageId, sectionId, currentVersion, currentPage, currentSection, setCurrentPage, setCurrentSection]);

    // Handle page change
    const handlePageChange = (newPageId: string) => {
        router.push(`/editor/${siteId}/${newPageId}`);
    };

    // Handle section change
    const handleSectionChange = (newSectionId: string | null) => {
        let page = currentVersion?.pages.find(p => p.id === currentPage);
        if (!page) {
            console.log('No current page found');
            return;
        }

        if (newSectionId) {
            router.push(`/editor/${siteId}/${page.id}/${newSectionId}`);
        } else {
            console.log('Navigating to page only:', page.name);
            router.push(`/editor/${siteId}/${page.id}`);
        }
    };

    const handleSave = async () => {
        if (!editWebsite || !isDirty || !currentVersion || isSaving) return;

        setIsSaving(true);
        try {
            toast.info('Translating sections...');

            // 收集所有需要翻译的 section titles
            const translationItems = [];

            // 遍历所有页面的 sections
            for (const page of currentVersion.pages) {
                if (page.sections && page.sections.length > 0) {
                    for (const section of page.sections) {
                        if (section.title && section.title.trim()) {
                            translationItems.push({
                                fieldType: TranslationFieldType.SECTION,
                                texts: {
                                    title: section.title.trim(),
                                },
                                context: {
                                    versionId: currentVersion.id,
                                    pageId: page.id,
                                    sectionId: section.id,
                                },
                            });
                        }
                    }
                }
            }

            // 遍历所有 shareSections
            if (currentVersion.shareSections && currentVersion.shareSections.length > 0) {
                for (const section of currentVersion.shareSections) {
                    if (section.title && section.title.trim()) {
                        translationItems.push({
                            fieldType: TranslationFieldType.SECTION,
                            texts: {
                                title: section.title.trim(),
                            },
                            context: {
                                versionId: currentVersion.id,
                                sectionId: section.id,
                            },
                        });
                    }
                }
            }

            let updatedVersion = currentVersion;

            // 如果有需要翻译的内容，执行翻译
            if (translationItems.length > 0) {
                try {
                    const translationRequest = {
                        items: translationItems,
                    };

                    const response = await WebsiteApi.translate(siteId, translationRequest);

                    if (response.code === 0 && response.data && response.data.length > 0) {
                        // 深拷贝当前版本
                        updatedVersion = JSON.parse(JSON.stringify(currentVersion));

                        // 创建临时网站对象用于应用翻译
                        const tempWebsite = {
                            id: editWebsite.id,
                            name: editWebsite.name,
                            versions: [updatedVersion],
                            currentVersion: updatedVersion.id,
                        };

                        // 应用翻译结果
                        const translatedWebsite = TranslationHelper.applyTranslationResults(tempWebsite, response.data);
                        updatedVersion = translatedWebsite.versions[0];

                        // 更新 store 中的版本
                        setCurrentVersion(updatedVersion);

                        toast.success('Sections translated successfully');
                    }
                } catch (translationError) {
                    console.error('Translation error:', translationError);
                    toast.warning('Translation failed, saving without translation');
                }
            }

            const websiteUpdate = {
                ...editWebsite,
                versions: [updatedVersion],
                currentVersion: updatedVersion.id,
            };

            const updateRes = await WebsiteApi.editModify(editWebsite.id, websiteUpdate);
            if (updateRes.code === 0) {
                toast.success('Save success');
                setEditWebsite(websiteUpdate);
                saveVersion();
            }
        } catch (error) {
            console.error('Failed to save website:', error);
            toast.error('Save failed');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    if (e.shiftKey) {
                        redo();
                    } else {
                        undo();
                    }
                } else if (e.key === 'y') {
                    e.preventDefault();
                    redo();
                } else if (e.key === 's') {
                    e.preventDefault();
                    handleSave();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    if (!editWebsite || !currentVersion) {
        return (
            <div className="w-screen h-screen flex justify-center items-center">
                <div className="flex flex-col items-center gap-2">
                    <LoadingData />
                    <div className="text-sm font-medium text-purple-black">Loading Editor...</div>
                </div>
            </div>
        );
    }

    const currentPageData = currentVersion.pages.find(page => page.id === currentPage);
    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <EditorHeader siteId={siteId} onSave={handleSave} isSaving={isSaving} />

            {/* Main Content */}
            <div className="flex max-h-[calc(100vh-68px)] h-full">
                {/* Left Sidebar - Pages */}
                <div className="w-64 bg-gray-100 border-r">
                    <PageList
                        siteId={siteId}
                        onPageChange={newPageId => {
                            handlePageChange(newPageId);
                        }}
                    />
                </div>

                {/* Middle - Sections or Section Editor */}
                <div className="w-80 bg-white border-r">
                    {sectionId ? <SectionEditor sectionId={sectionId} onBack={() => handleSectionChange(null)} /> : <SectionList onSectionChange={handleSectionChange} />}
                </div>

                {/* Right - Preview */}
                <div className="flex-1">
                    <Preview page={currentPageData!} />
                </div>
            </div>
        </div>
    );
};

export default EditorLayout;
