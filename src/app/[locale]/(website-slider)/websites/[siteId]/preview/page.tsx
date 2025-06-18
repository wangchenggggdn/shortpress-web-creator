'use client';

import React, { useEffect, useState } from 'react';
import WebsiteApi from '@/api/website';
import { Button, Select } from '@mantine/core';
import { IconDeviceMobile, IconShare } from '@tabler/icons-react';
import LoadingData from '@/components/common/loading-data';
import { Website } from '@/types/website';
import { useRouter } from 'next/navigation';
import { getWebsitePreviewUrl } from '@/utils/path';
import { EditWebsite, Version } from '@/types/editor';
import { toast } from 'sonner';

interface WebsitePreviewPageProps {
    params: {
        siteId: string;
    };
}

const WebsitePreviewPage: React.FC<WebsitePreviewPageProps> = ({ params }) => {
    const [editWebsite, setEditWebsite] = useState<EditWebsite | null>(null);
    const [website, setWebsite] = useState<Website | null>(null);
    const [versionNumber, setVersionNumber] = useState<number>(0);
    const [lastVersionNumber, setLastVersionNumber] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState<string | null>(null);
    const [currentVersion, setCurrentVersion] = useState<Version | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchEditWebsite = async () => {
            try {
                const res = await WebsiteApi.editGet(params.siteId as string);
                if (res.code === 0 && res.data) {
                    const currentVersion = res.data.site_data.versions[0];
                    const currentPage = currentVersion.pages.find(page => page.isHome === true);
                    console.log('------1-----currentPage', currentPage);
                    setCurrentPage(currentPage?.path || '');
                    setCurrentVersion(currentVersion);
                    setEditWebsite(res.data.site_data);
                    setVersionNumber(res.data.version_number);
                    setLastVersionNumber(res.data.last_published_version);
                    console.log('data', res.data);
                }
            } catch (error) {
                console.error('Failed to fetch website:', error);
            } finally {
                setIsLoading(false);
            }
        };
        const fetchWebsite = async () => {
            try {
                const res = await WebsiteApi.get(params.siteId as string);
                if (res.code === 0 && res.data) {
                    setWebsite(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch website:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEditWebsite();
        fetchWebsite();
    }, [params.siteId]);

    const handlePublish = async () => {
        if (!editWebsite) return;
        try {
            const res = await WebsiteApi.editPublish(editWebsite.id);
            if (res.code === 0) {
               toast.success('Publish success');
            }
        } catch (error) {
            console.error('Failed to publish website:', error);
        }
    };

    if (isLoading) {
        return <div className='w-full h-full flex justify-center items-center'><LoadingData/></div>;
    }

    if (!website) {
        return <div className='w-full h-full flex justify-center items-center'>Website not found</div>;
    }

    return (
        <div className="min-h-screen">
            {/* top toolbar */}
            <div className="h-14 border-b flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <IconDeviceMobile size={20}/>
                    <Button
                        variant={"subtle"}
                        color='black'
                        onClick={() => {
                            const url = encodeURIComponent(getWebsitePreviewUrl(website,'',true));
                            window.open(`/preview?url=${url}`, '_blank');
                        }}
                    >
                        <IconShare size={20} />
                    </Button>
                </div>
                 {/* page switch - center */}
            <div className="flex-1 flex justify-center">
                <Select
                    value={currentPage}
                    onChange={(value) => {
                        setCurrentPage(value);
                    }}
                    data={currentVersion?.pages.map(page => ({
                        value: page.path,
                        label: page.name
                    })) || []}
                    placeholder="Select a page"
                    className="w-64"
                />
            </div>
                <Button
                    variant="filled"
                    className="bg-indigo-500 hover:bg-indigo-600"
                    onClick={() => {
                        router.push(`/editor/${website.siteId}`);
                    }}
                >
                    Customize
                </Button>
            </div>

            {/* unpublish */}
            {versionNumber !== lastVersionNumber && (
                <div className="bg-yellow-50 border-b border-yellow-100 p-4 text-center">
                    <span className="text-yellow-800">Your last changes haven't pulished.</span>
                    <button className="ml-2 text-indigo-600 hover:text-indigo-700 font-medium" onClick={handlePublish}>
                        Publish Now
                    </button>
                </div>
            )}

            {/* preview content */}
            <div className="flex justify-center py-8 px-4">
                <div className={`bg-white shadow-lg  w-[350px] h-[calc(100vh-200px)]`}>
                
                    <div className="h-6 bg-gray-100 flex items-center justify-center">
                        <div className="w-16 h-1 bg-gray-300 rounded" />
                    </div>
                
                    <div className="relative h-full">
                        <iframe
                            src={`/preview?url=${encodeURIComponent(getWebsitePreviewUrl(website, currentPage || '',true))}`}
                            className="w-full h-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WebsitePreviewPage;
