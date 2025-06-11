'use client';

import React, { useEffect } from 'react';
import useEditorStore from '@/store/useEditorStore';
import PageList from '@/components/editor/page-list';
import SectionList from '@/components/editor/section-list';
import Preview from '@/components/editor/preview';
import WebsiteApi from '@/api/website';
import { EditWebsite, Version } from '@/types/editor';

interface EditorClientProps {
    siteId: string;
}

const EditorClient: React.FC<EditorClientProps> = ({ siteId }) => {
    const { editWebsite, setEditWebsite, currentVersion, setCurrentVersion, isDirty, saveVersion } = useEditorStore();

    useEffect(() => {
        const loadWebsite = async () => {
            try {
                const res = await WebsiteApi.editGet(siteId);
                const websiteData = res.code === 0 && res.data ? res.data : null;
                
                if (websiteData) {
                    setEditWebsite(websiteData);
                    // Load the current version
                    const version = websiteData.versions.find((v: Version) => v.id === websiteData.currentVersion);
                    if (version) {
                        setCurrentVersion(version);
                    }
                }
            } catch (error) {
                console.error('Failed to load website:', error);
            }
        };

        if (siteId) {
            loadWebsite();
        }
    }, [siteId, setEditWebsite, setCurrentVersion]);

    const handleSave = async () => {
        if (!editWebsite || !isDirty || !currentVersion) return;

        try {
            // Create a new version with current pages
            const res = await WebsiteApi.editCreateVersion(editWebsite.id, currentVersion.pages);
            if (res.code === 0 && res.data) {
                const newVersion = res.data;
                // Update website with new version
                const updateRes = await WebsiteApi.editModify({
                    id: editWebsite.id,
                    versions: [...editWebsite.versions, newVersion],
                    currentVersion: newVersion.id
                } as Partial<EditWebsite>);

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

    if (!editWebsite || !currentVersion) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex h-screen">
            {/* Left Sidebar - Pages */}
            <div className="w-64 bg-gray-100 border-r">
                <PageList />
            </div>

            {/* Middle - Sections */}
            <div className="w-80 bg-white border-r">
                <SectionList />
            </div>

            {/* Right - Preview */}
            <div className="flex-1 bg-gray-50">
                <Preview />
            </div>

            {/* Save Button */}
            <button
                className={`fixed bottom-4 right-4 px-4 py-2 rounded ${
                    isDirty
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={handleSave}
                disabled={!isDirty}
            >
                Save Changes
            </button>
        </div>
    );
};

export default EditorClient; 