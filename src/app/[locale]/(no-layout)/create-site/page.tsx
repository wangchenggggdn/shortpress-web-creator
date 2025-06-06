'use client';

import React, { useState, useCallback } from 'react';
import { TextInput, Button, Text, Select } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { toast } from 'sonner';
import Header from '@/components/system/header';
import LogoUploader from '@/components/common/logo-uploader';
import { WebsiteArgs } from '@/api/args';
import CreatorApi from '@/api/creator';
import userStore from '@/store/useUserStore';
import { useRouter } from '@/libs/navigation';
import WebsiteApi from '@/api/website';
import { debounce } from 'lodash';

interface CreateSitePageProps {}

const CreateSitePage: React.FC<CreateSitePageProps> = () => {
    const { userInfo } = userStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [siteData, setSiteData] = useState<WebsiteArgs.Modify>({
        name: '',
        path: userInfo?.creatorName ?? '',
        status: 2,
    });
    let coverFile: File | undefined;
    const [pathError, setPathError] = useState('');

    const checkPath = async (path: string) => {
        if (!path) return;
        try {
            const res = await WebsiteApi.checkPathExists(path);
            if (res.code !== 0) {
                setPathError(res.info ?? '');
            } else {
                setPathError("");
            }
        } catch (error) {
            setPathError("Failed to validate path");
        }
    };

    const debouncedCheck = useCallback(
        debounce((path: string) => checkPath(path), 500),
        []
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!siteData.name) {
            toast.error('Please enter a site name');
            return;
        }

        if (pathError) {
            return;
        }

        setLoading(true);
        try {
            if (coverFile) {
                const formData = new FormData();
                formData.append('file', coverFile);
                const uploadRes = await CreatorApi.uploadFile(formData);
                if (uploadRes.code === 0) {
                    siteData.logo = uploadRes.data;
                }
            }
            siteData.path = disposeSiteName(siteData.name??'');
            const res = await WebsiteApi.create(siteData);
            if (res.code === 0) {
                toast.success('Site created successfully');
                router.push('/');
            } else {
                setPathError(res.info);
            }
        } catch (error) {
            toast.error('Creation failed, please try again');
        } finally {
            setLoading(false);
        }
    };

    const onFileSelect = (file: File) => {
        coverFile = file;
    };

    const disposeSiteName = (siteName: string) => {
        if (!siteName) return '';
        const newSiteName = siteName
            .replace(/[`~!@#$%^&*()_\-+=<>?:"{}|｜,.\/;'\\[\]·~!！@#￥%……&*（）——\-+={}|《》〈〉？："""【】「」、；''，。、]/g, '')
            .replace(/\s/g, '-')
            .toLowerCase();
        return newSiteName;
    };

    return (
        <div className="flex flex-col h-screen">
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-2xl bg-white rounded-[32px] p-8 shadow-lg">
                    <div className="text-center text-3xl font-bold mb-6">Create Your Own Site</div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium mb-4">Site Name</h3>
                            <TextInput
                                value={siteData.name}
                                onChange={e => {
                                    const newName = e.target.value;
                                    if (newName.length > 40 || newName.length < 6) {
                                        setPathError('Site name must be between 6 and 40 characters');
                                    } else {
                                        setPathError('');
                                        const newPath = disposeSiteName(e.target.value);
                                        if (newPath) {
                                            debouncedCheck(newPath);
                                        }
                                    }
                                    setSiteData({ ...siteData, name: newName });
                                }}
                                placeholder="Enter site name"
                                variant="filled"
                                required
                                error={pathError}
                            />
                        </div>

                        <div>
                            <h3 className="text-lg font-medium text-[#1a1b1e] mb-4">Domain</h3>
                            <div className="h-11 bg-[#F4F4F7] rounded flex items-center px-4">
                                <span className="text-gray-400">{`${userInfo?.defultSiteDomain}/`}</span>
                                <span>{disposeSiteName(siteData.name??'')}</span>
                            </div>
                        </div>

                        <LogoUploader onFileSelect={onFileSelect} />

                        <Button 
                            type="submit" 
                            fullWidth 
                            color="primary" 
                            loading={loading}
                            disabled={!!pathError}
                        >
                            Create Site
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateSitePage;
