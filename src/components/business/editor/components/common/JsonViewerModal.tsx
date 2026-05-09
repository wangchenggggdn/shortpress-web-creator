'use client';

import useEditorStore from '@/store/useEditorStore';
import { ActionIcon, CopyButton, Modal, Tabs, Tooltip } from '@mantine/core';
import { IconCheck, IconCopy, IconDownload } from '@tabler/icons-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface JsonViewerModalProps {
    opened: boolean;
    onClose: () => void;
}

/**
 * JSON Viewer Modal Component
 * Displays the complete website data structure in JSON format
 * Provides copy and download functionality
 */
const JsonViewerModal: React.FC<JsonViewerModalProps> = ({ opened, onClose }) => {
    const { editWebsite, currentVersion } = useEditorStore();
    const [activeTab, setActiveTab] = useState<string | null>('full');

    // Format JSON with indentation
    const getFormattedJson = (data: any) => {
        return JSON.stringify(data, null, 2);
    };

    // Download JSON file
    const handleDownload = (data: any, filename: string) => {
        const jsonString = getFormattedJson(data);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Downloaded ${filename}`);
    };

    // Get full website data
    const getFullWebsiteData = () => {
        return editWebsite;
    };

    // Get current version data only
    const getCurrentVersionData = () => {
        return currentVersion;
    };

    // Render JSON content with copy and download buttons
    const renderJsonContent = (data: any, filename: string) => {
        const jsonString = getFormattedJson(data);

        return (
            <div className="relative">
                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex gap-2 z-10">
                    <CopyButton value={jsonString} timeout={2000}>
                        {({ copied, copy }) => (
                            <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="left">
                                <ActionIcon color={copied ? 'teal' : 'gray'} variant="filled" onClick={copy}>
                                    {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                </ActionIcon>
                            </Tooltip>
                        )}
                    </CopyButton>
                    <Tooltip label="Download" withArrow position="left">
                        <ActionIcon color="blue" variant="filled" onClick={() => handleDownload(data, filename)}>
                            <IconDownload size={16} />
                        </ActionIcon>
                    </Tooltip>
                </div>

                {/* JSON content */}
                <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[600px] text-xs font-mono">
                    <code>{jsonString}</code>
                </pre>
            </div>
        );
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Website JSON Data" size="xl" centered>
            <Tabs value={activeTab} onChange={setActiveTab}>
                <Tabs.List>
                    <Tabs.Tab value="full">Full Website Data</Tabs.Tab>
                    <Tabs.Tab value="version">Current Version Only</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="full" pt="md">
                    <div className="mb-2 text-sm text-gray-600">Complete website data including all versions and metadata</div>
                    {renderJsonContent(getFullWebsiteData(), `${editWebsite?.name || 'website'}-full.json`)}
                </Tabs.Panel>

                <Tabs.Panel value="version" pt="md">
                    <div className="mb-2 text-sm text-gray-600">Current version data including pages and sections</div>
                    {renderJsonContent(getCurrentVersionData(), `${editWebsite?.name || 'website'}-version-${currentVersion?.id}.json`)}
                </Tabs.Panel>
            </Tabs>
        </Modal>
    );
};

export default JsonViewerModal;
