'use client';

import React, { useCallback } from 'react';
import { TextInput, Button, Select, Textarea } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import userStore from '@/store/useUserStore';
import { WebsiteArgs } from '@/api/args';
import { Website } from '@/types/website';
import { toast } from 'sonner';
import LogoUploader from '@/components/common/logo-uploader';
import WebsiteApi from '@/api/website';
import { debounce } from 'lodash';

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
    const [pathError, setPathError] = React.useState<string>("");
    let coverFile: File | undefined;

    const checkPath = async (name: string) => {
        if (!name) return;
        
        const path = websiteOld.siteId === null || websiteOld.siteId === undefined ? name : website.path;
        try {
            const res = await WebsiteApi.checkPathExists(path ?? '');
            if (res.code!==0) {
                setPathError(res.info??'');
            } else {
                setPathError("");
            }
        } catch (error) {
            setPathError("Failed to validate path");
        }
    };

    // 创建防抖函数，延迟500ms
    const debouncedCheck = useCallback(
        debounce((name: string) => checkPath(name), 500),
        []
    );

    const handleSubmit = (websiteData: Partial<Website>) => {
        if (!websiteData.name) {
            toast.error('Please enter a site name');
            return;
        }
        
        if(websiteOld.siteId === null || websiteOld.siteId === undefined){
            websiteData.path = websiteData.name;
        }

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
                {/* Site Name Section */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Site name</h3>
                    <TextInput
                        onChange={e => {
                            const newName = e.target.value;
                            setWebsite({ ...website, name: newName });
                            if (!isEdit) {
                                debouncedCheck(newName);
                            }
                        }}
                        defaultValue={website?.name ?? ''}
                        placeholder="Site name"
                        variant="filled"
                    />
                </div>

                {/* Domain Section */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Site URL</h3>
                    <div className="h-11 bg-[#F4F4F7] rounded flex items-center px-4">
                        <span className="text-gray-400">{`${website?.path??website?.name??''}.${website?.domain ? website?.domain : website?.officialDomain ?? userInfo?.defultSiteDomain}`}</span>
                    </div>
                    {pathError && <p className="text-red-500">{pathError}</p>}
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
                <Button 
                    loading={loading} 
                    fullWidth 
                    size="md" 
                    color="primary" 
                    onClick={() => handleSubmit(website)}
                    disabled={!!pathError}
                >
                    {isEdit ? 'Save Changes' : 'Create Site'}
                </Button>
            </div>
        </div>
    );
};

export default CreateSiteModal;
