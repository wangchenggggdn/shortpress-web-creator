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
import { DataSourceType, EditWebsite, Page, Version } from '@/types/editor';
import { toast } from 'sonner';
import LoadingData from '@/components/common/loading-data';

interface EditorLayoutProps {
    siteId: string;
    pageId: string;
    sectionId?: string;
    initialData: EditWebsite;
}

const EditorLayout: React.FC<EditorLayoutProps> = ({ siteId, pageId, sectionId, initialData }) => {
    const router = useRouter();
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
        if(sectionId&&currentSection&&currentSection.id!==sectionId){
            scrollToTarget(sectionId);
        }
    }, [currentSection,sectionId]);

    const scrollToTarget = (id:string) => { 
        const targetElement = document.getElementById(id);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'auto',
                block: 'center'
            });
        }
    }

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
        if (!editWebsite || !isDirty || !currentVersion) return;

        try {
                const websiteUpdate = {
                    ...editWebsite,
                    versions: [currentVersion],
                    currentVersion: currentVersion.id,
                };

                const updateRes = await WebsiteApi.editModify(editWebsite.id,websiteUpdate);
                if (updateRes.code === 0) {
                    toast.success('Save success');
                    setEditWebsite(websiteUpdate);
                    saveVersion();
                }
        } catch (error) {
            console.error('Failed to save website:', error);
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
        return <div className="w-screen h-screen flex justify-center items-center">
                <div className='flex flex-col items-center gap-2'><LoadingData/><div className='text-sm font-medium text-purple-black'>Loading Editor...</div></div>
            </div>;
    }

    const currentPageData = currentVersion.pages.find(page => page.id === currentPage);
    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <EditorHeader siteId={siteId} onSave={handleSave} />

            {/* Main Content */}
            <div className="flex flex-1">
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
