'use client';

import React from 'react';
import { TextInput, Button, Select, Textarea } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import userStore from '@/store/useUserStore';
import { WebsiteArgs } from '@/api/args';
import { Website } from '@/types/website';
import { toast } from 'sonner';
import LogoUploader from '@/components/common/logo-uploader';

/**
 * Props interface for CreateSiteModal component
 */
interface CreateSiteModalProps {
    /** Whether the modal is open */
    opened?: boolean;
    /** Callback function when modal is closed */
    onClose?: () => void;
    /** Whether the modal is in edit mode */
    isEdit?: boolean;
    /** Website data for editing */
    websiteOld?: Website;
    /** Loading state for submit button */
    loading?: boolean;
    /** Callback function when form is submitted */
    onSubmit: (siteData: WebsiteArgs.Modify, coverFile?: File) => void;
    type?: 'setting' | 'modal';
}

/**
 * Modal component for creating or editing a website
 * Provides form fields for website details and SEO settings
 * @returns React component with website creation/editing interface
 */
const CreateSiteModal: React.FC<CreateSiteModalProps> = ({
    opened = false,
    onClose,
    isEdit = false,
    onSubmit,
    websiteOld = { status: 2 } as Website,
    loading = false,
    type = 'modal',
}) => {
    const { userInfo } = userStore();
    const [website, setWebsite] = React.useState<Website>(JSON.parse(JSON.stringify(websiteOld)));
    let coverFile: File | undefined;
    console.log('siteId:', website?.siteId);
    /**
     * Handle form submission
     * @param websiteData Website data to submit
     */
    const handleSubmit = (websiteData: Partial<Website>) => {
        if (!websiteData.name) {
            toast.error('Please enter a site name');
            return;
        }
        websiteOld = {
            ...websiteOld,
            ...websiteData,
        };
        onSubmit(
            {
                siteId: website?.siteId ?? '',
                path: website?.path ?? userInfo?.creatorName ?? '',
                ...websiteData,
            },
            coverFile
        );
    };

    /**
     * Handle logo file selection
     * @param file Selected logo file
     */
    const onFileSelect = (file: File) => {
        coverFile = file;
    };

    if (!opened) return null;

    return (
        <div className="overflow-y-scroll">
            {/* Header */}
            {type === 'modal' && (
                <div className="flex items-center justify-between px-6 h-16">
                    <h2 className="text-2xl font-medium">{isEdit ? 'Edit Site' : 'Create Site'}</h2>
                    <Button variant="subtle" color="gray" onClick={onClose} className="hover:bg-gray-100">
                        <IconX size={20} />
                    </Button>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 px-6 space-y-6 ">
                {/* Domain Section */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Domain</h3>
                    <div className="h-11 bg-[#F4F4F7] rounded flex items-center px-4">
                        <span className="text-gray-400">{`${website?.domain ?? userInfo?.defultSiteDomain}/`}</span>
                        <span className="line-clamp-1">{website?.path ?? userInfo?.creatorName ?? ''}</span>
                    </div>
                </div>

                {/* Site Name Section */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Site name</h3>
                    <TextInput
                        onChange={e => {
                            website.name = e.target.value;
                        }}
                        defaultValue={website?.name ?? ''}
                        placeholder="Site name"
                        variant="filled"
                    />
                </div>

                {/* Logo Upload Section */}
                <LogoUploader logo={website?.logo} onFileSelect={onFileSelect} />

                {/* Status Section */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Status</h3>
                    <Select
                        defaultValue={(website?.status ?? 0) === 2 ? 'published' : 'unpublished'}
                        onChange={value => {
                            website.status = value === 'published' ? 2 : 1;
                        }}
                        data={[
                            { value: 'published', label: 'Published' },
                            { value: 'unpublished', label: 'Unpulished' },
                        ]}
                        variant="filled"
                    />
                </div>

                {/* SEO Section (Edit Mode Only) */}
                {isEdit && (
                    <div>
                        <h3 className="text-lg font-medium mb-4">SEO</h3>
                        <div className="space-y-4">
                            <TextInput
                                label="Title"
                                defaultValue={website?.seo?.title ?? ''}
                                onChange={e => {
                                    website.seo = {
                                        title: e.target.value,
                                        description: website.seo?.description ?? '',
                                        keywords: website.seo?.keywords ?? '',
                                    };
                                }}
                                placeholder="Add title"
                                variant="filled"
                            />
                            <Textarea
                                label="Description"
                                defaultValue={website?.seo?.description ?? ''}
                                onChange={e => {
                                    website.seo = {
                                        title: website.seo?.title ?? '',
                                        description: e.target.value,
                                        keywords: website.seo?.keywords ?? '',
                                    };
                                }}
                                placeholder="Add description"
                                minRows={3}
                                variant="filled"
                            />
                            <TextInput
                                label="Keywords"
                                defaultValue={website?.seo?.keywords ?? ''}
                                onChange={e => {
                                    website.seo = {
                                        title: website.seo?.title ?? '',
                                        description: website.seo?.description ?? '',
                                        keywords: e.target.value,
                                    };
                                }}
                                placeholder="Add keywords"
                                variant="filled"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-6">
                <Button loading={loading} fullWidth size="md" color="primary" onClick={() => handleSubmit(website)}>
                    {isEdit ? 'Save Changes' : 'Create Site'}
                </Button>
            </div>
        </div>
    );
};

export default CreateSiteModal;
