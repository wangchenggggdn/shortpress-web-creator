'use client';

import React from 'react';
import { IconArrowLeft, IconDeviceMobile, IconShare, IconArrowBackUp, IconArrowForwardUp } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import useEditorStore from '@/store/useEditorStore';
import WebsiteApi from '@/api/website';
import { EditWebsite } from '@/types/editor';
import { Button, Select } from '@mantine/core';

interface EditorHeaderProps {
    siteId: string;
    onSave?: () => Promise<void>;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({ siteId, onSave }) => {
    const router = useRouter();
    const {
        editWebsite,
        setEditWebsite,
        currentVersion,
        currentPage,
        setCurrentPage,
        isDirty,
        undo,
        redo,
    } = useEditorStore();

    const handleBack = () => {
        router.push(`/websites/${siteId}/preview`);
    };

    const handlePublish = async () => {
        if (!editWebsite || !currentVersion) return;

        try {
            if (isDirty && onSave) {
                await onSave();
            }
            const res = await WebsiteApi.publish(editWebsite.id);
            if (res.code === 0) {
                setEditWebsite({
                    ...editWebsite,
                    status: 1,
                });
            }
        } catch (error) {
            console.error('Failed to publish website:', error);
        }
    };

    return (
        <div className="h-14 border-b flex items-center bg-white">
            <div className="w-64 border-r border-gray-200 flex items-center">
                    {/* back */}
                    <button
                        onClick={handleBack}
                        className="hover:bg-gray-100 p-2 rounded-full"
                    >
                        <IconArrowLeft size={20} />
                    </button>

                    {/* site name */}
                    <span className="font-medium ml-4">Dramahub</span>
            </div>
          
            {/* mobile and share button */}
            <div className=" flex items-center gap-2">
                <Button
                    variant="subtle"
                    size="sm"
                    className="px-2"
                >
                    <IconDeviceMobile size={20} />
                </Button>
                <Button
                    variant="subtle"
                    size="sm"
                    className="px-2"
                >
                    <IconShare size={20} />
                </Button>
            </div>

            {/* page switch - center */}
            <div className="flex-1 flex justify-center">
                <Select
                    value={currentPage}
                    onChange={(value) => value && setCurrentPage(value)}
                    data={currentVersion?.pages.map(page => ({
                        value: page.id,
                        label: page.name
                    })) || []}
                    placeholder="Select a page"
                    className="w-64"
                />
            </div>

            {/* right button group */}
            <div className="flex items-center gap-4">
                {/* undo/redo button */}
                <div className="flex items-center">
                    <Button
                        variant="subtle"
                        size="sm"
                        onClick={undo}
                        title="Undo (Ctrl+Z)"
                        className="px-2"
                    >
                        <IconArrowBackUp size={20} />
                    </Button>
                    <Button
                        variant="subtle"
                        size="sm"
                        onClick={redo}
                        title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
                        className="px-2"
                    >
                        <IconArrowForwardUp size={20} />
                    </Button>
                </div>

                {/* save and publish button */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={onSave}
                        disabled={!isDirty}
                    >
                        Save
                    </Button>
                    <Button
                        onClick={handlePublish}
                        className="bg-indigo-500 hover:bg-indigo-600"
                    >
                        Publish
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EditorHeader;
