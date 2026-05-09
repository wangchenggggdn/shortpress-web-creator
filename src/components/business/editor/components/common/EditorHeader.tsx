'use client';

import WebsiteApi from '@/api/website';
import { useAppConfig } from '@/hooks/useAppConfig';
import useEditorStore from '@/store/useEditorStore';
import { Website } from '@/types/website';
import { getWebsitePreviewUrl } from '@/utils/path';
import { Button, Group, Select, SelectProps } from '@mantine/core';
import { IconArrowBackUp, IconArrowForwardUp, IconArrowLeft, IconCheck, IconCode, IconDeviceMobile, IconHome, IconShare } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import JsonViewerModal from './JsonViewerModal';

interface EditorHeaderProps {
    siteId: string;
    onSave?: () => Promise<void>;
    isSaving?: boolean;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({ siteId, onSave, isSaving = false }) => {
    const [website, setWebsite] = useState<Website | null>(null);
    const [jsonModalOpened, setJsonModalOpened] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const router = useRouter();
    const { editWebsite, currentVersion, currentPage, isDirty, undo, redo } = useEditorStore();
    const config = useAppConfig();

    useEffect(() => {
        if (website && editWebsite) {
            editWebsite.name = website.name;
        }
    }, [website, editWebsite]);

    useEffect(() => {
        fetchWebsite();
    }, []);

    const handleBack = () => {
        router.push(`/websites/${siteId}/preview`);
    };

    const handlePublish = async () => {
        if (!editWebsite || !currentVersion || isPublishing) return;

        setIsPublishing(true);
        try {
            if (isDirty && onSave) {
                await onSave();
            }
            const res = await WebsiteApi.editPublish(editWebsite.id);
            if (res.code === 0) {
                toast.success('Publish success');
            }
        } catch (error) {
            console.error('Failed to publish website:', error);
            toast.error('Publish failed');
        } finally {
            setIsPublishing(false);
        }
    };

    const fetchWebsite = async () => {
        const res = await WebsiteApi.get(siteId as string);
        setWebsite(res.data);
        return res.data;
    };

    const iconProps = {
        stroke: 1.5,
        color: 'currentColor',
        opacity: 0.6,
        size: 18,
    };

    const renderSelectOption: SelectProps['renderOption'] = ({ option, checked }) => (
        <Group flex="1" gap="xs">
            {(option as any).icon}
            {option.label}
            {checked && <IconCheck style={{ marginInlineStart: 'auto' }} {...iconProps} />}
        </Group>
    );

    return (
        <div className="h-[68px] border-b flex items-center bg-white">
            <div className="w-64 border-r border-gray-200 flex items-center">
                {/* back */}
                <button onClick={handleBack} className="hover:bg-gray-100 p-2 rounded-full">
                    <IconArrowLeft size={20} />
                </button>

                {/* site name */}
                <span className="font-medium text-lg ml-4">{editWebsite?.name}</span>
            </div>

            {/* mobile and share button */}
            <div className=" flex items-center gap-2">
                <IconDeviceMobile size={20} className="ml-4 text-primary" />

                <Button
                    variant="subtle"
                    size="sm"
                    className="px-2"
                    onClick={() => {
                        const url = encodeURIComponent(getWebsitePreviewUrl(website!, ''));
                        window.open(`/preview?url=${url}`, '_blank');
                    }}
                    title="Preview Website"
                >
                    <IconShare size={20} />
                </Button>

                {/* json viewer button */}
                {/* {config?.nodeEnv === 'dev' && ( */}
                <Button variant="subtle" size="sm" className="px-2" onClick={() => setJsonModalOpened(true)} title="View JSON Data">
                    <IconCode size={20} />
                </Button>
                {/* )} */}
            </div>

            {/* page switch - center */}
            <div className="flex-1 flex justify-center">
                <Select
                    value={currentPage}
                    onChange={value => {
                        if (value) {
                            router.push(`/editor/${siteId}/${value}`);
                        }
                    }}
                    data={
                        currentVersion?.pages.map(page => ({
                            value: page.id,
                            label: page.name,
                            icon: page.isHome ? <IconHome size={18} className={`mr-2`} /> : null,
                        })) || []
                    }
                    placeholder="Select a page"
                    className="w-64"
                    renderOption={renderSelectOption}
                />
            </div>

            {/* right button group */}
            <div className="flex items-center gap-4">
                {/* undo/redo button */}
                <div className="flex items-center">
                    <Button variant="subtle" size="sm" onClick={undo} title="Undo (Ctrl+Z)" className="px-2">
                        <IconArrowBackUp size={20} />
                    </Button>
                    <Button variant="subtle" size="sm" onClick={redo} title="Redo (Ctrl+Y or Ctrl+Shift+Z)" className="px-2">
                        <IconArrowForwardUp size={20} />
                    </Button>
                </div>

                {/* save and publish button */}
                <div className="flex items-center gap-2 pr-2">
                    <Button variant="outline" onClick={onSave} disabled={!isDirty || isSaving || isPublishing} loading={isSaving}>
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button onClick={handlePublish} className="bg-indigo-500 hover:bg-indigo-600" disabled={isPublishing || isSaving} loading={isPublishing}>
                        {isPublishing ? 'Publishing...' : 'Publish'}
                    </Button>
                </div>
            </div>

            {/* JSON Viewer Modal */}
            <JsonViewerModal opened={jsonModalOpened} onClose={() => setJsonModalOpened(false)} />
        </div>
    );
};

export default EditorHeader;
