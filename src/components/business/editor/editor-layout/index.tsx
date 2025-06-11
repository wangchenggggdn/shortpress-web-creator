'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useEditorStore from '@/store/useEditorStore';
import PageList from '@/components/business/editor/components/page-list';
import SectionList from '@/components/business/editor/components/section-list';
import SectionEditor from '@/components/business/editor/components/section-editor';
import Preview from '@/components/business/editor/components/preview';
import WebsiteApi from '@/api/website';
import { EditWebsite, Version } from '@/types/editor';

interface EditorLayoutProps {
    siteId: string;
    pageId: string;
    sectionId?: string;
    initialData: EditWebsite;
}

const EditorLayout: React.FC<EditorLayoutProps> = ({ siteId, pageId, sectionId, initialData }) => {
    const router = useRouter();
    const {
        shareSections,
        setShareSections,
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
        initializeHistory
    } = useEditorStore();

    // Initialize with server-side data
    useEffect(() => {
        if (!editWebsite && initialData) {
            setEditWebsite(initialData);
            const version = initialData.versions.find((v: Version) => v.id === initialData.currentVersion);
            if (version) {
                setCurrentVersion(version);
                initializeHistory(version);
                setShareSections(version.shareSections);
            }
        }
    }, [initialData, editWebsite, setEditWebsite, setCurrentVersion, initializeHistory]);

    // Sync route params with store
    useEffect(() => {
        if (currentVersion) {
            console.log('Syncing route params:', { pageId, sectionId, currentPage, currentSection });
            
            // Find page by name
            const page = currentVersion.pages.find(
                p => p.name.toLowerCase() === pageId.toLowerCase()
            );
            
            if (page) {
                console.log('Found page:', page.name, page.id);
                if (page.id !== currentPage) {
                    setCurrentPage(page.id);
                }

                // Find section by type
                if (sectionId) {
                    const section = page.sections.find(
                        s => s.type.toLowerCase() === sectionId.toLowerCase()
                    );
                    if (section) {
                        console.log('Found section:', section.type, section.id);
                        if (section.id !== currentSection) {
                            setCurrentSection(section.id);
                        }
                    }
                } else if (currentSection) {
                    console.log('Clearing section');
                    setCurrentSection(null);
                }
            }
        }
    }, [pageId, sectionId, currentVersion, currentPage, currentSection, setCurrentPage, setCurrentSection]);

    // Handle page change
    const handlePageChange = (newPageId: string) => {
        const page = currentVersion?.pages.find(p => p.id === newPageId);
        if (page) {
            router.push(`/editor/${siteId}/${page.name.toLowerCase()}`);
        }
    };

    // Handle section change
    const handleSectionChange = (newSectionId: string | null) => {
        const page = currentVersion?.pages.find(p => p.id === currentPage);
        if (!page) {
            console.log('No current page found');
            return;
        }

        if (newSectionId) {
            const section = page.sections.find(s => s.id === newSectionId);
            if (section) {
                console.log('Navigating to section:', section.type);
                router.push(`/editor/${siteId}/${page.name.toLowerCase()}/${section.type.toLowerCase()}`);
            }
        } else {
            console.log('Navigating to page only:', page.name);
            router.push(`/editor/${siteId}/${page.name.toLowerCase()}`);
        }
    };

    const handleSave = async () => {
        if (!editWebsite || !isDirty || !currentVersion) return;

        try {
            // Create a new version with current pages
            const res = await WebsiteApi.editCreateVersion(editWebsite.id, currentVersion.pages);

            if (res.code === 0 && res.data) {
                const newVersion = res.data;
                // Update website with new version
                const websiteUpdate: Partial<EditWebsite> = {
                    versions: [...editWebsite.versions, newVersion],
                    currentVersion: newVersion.id
                };
                const updateRes = await WebsiteApi.editModify(websiteUpdate);

                if (updateRes.code === 0) {
                    // Update local state
                    setEditWebsite({
                        ...editWebsite,
                        versions: [...editWebsite.versions, newVersion],
                        currentVersion: newVersion.id
                    });
                    setCurrentVersion(newVersion);
                    saveVersion();
                }
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
        return <div>Loading...</div>;
    }

    return (
        <div className="flex h-screen">
            {/* Left Sidebar - Pages */}
            <div className="w-64 bg-gray-100 border-r">
                <PageList onPageChange={(newPageId) => {
                    console.log('onPageChange', newPageId);
                    handlePageChange(newPageId);
                }} />
            </div>

            {/* Middle - Sections or Section Editor */}
            <div className="w-80 bg-white border-r">
                {sectionId ? (
                    <SectionEditor sectionId={sectionId} onBack={() => handleSectionChange(null)} />
                ) : (
                    <SectionList onSectionChange={handleSectionChange} />
                )}
            </div>

            {/* Right - Preview */}
            <div className="flex-1 bg-gray-50">
                <Preview />
            </div>

            {/* Toolbar */}
            <div className="fixed bottom-4 right-4 flex gap-2">
                {/* Undo/Redo */}
                <button
                    className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={undo}
                    title="Undo (Ctrl+Z)"
                >
                    ↩
                </button>
                <button
                    className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={redo}
                    title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
                >
                    ↪
                </button>
                {/* Save Button */}
                <button
                    className={`px-4 py-2 rounded ${
                        isDirty
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    onClick={handleSave}
                    disabled={!isDirty}
                    title="Save (Ctrl+S)"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default EditorLayout; 