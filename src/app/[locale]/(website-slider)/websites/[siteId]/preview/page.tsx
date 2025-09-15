'use client';

import React, { useEffect, useState } from 'react';
import WebsiteApi from '@/api/website';
import { Button, Group, Select, SelectProps } from '@mantine/core';
import { IconCheck, IconDeviceMobile, IconHome, IconShare } from '@tabler/icons-react';
import LoadingData from '@/components/common/loading-data';
import { Website } from '@/types/website';
import { useRouter } from 'next/navigation';
import { getWebsitePreviewUrl } from '@/utils/path';
import { EditWebsite, Version } from '@/types/editor';
import { toast } from 'sonner';
import { INITIAL_VERSION } from '@/constants/initial-version';
import IframePage from '@/components/business/editor/components/preview/preview/iframe-page';

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
                let initialData:EditWebsite = {
                    id: params.siteId,
                    name: 'New Website',
                    description: 'A new website',
                    path: '',
                    versions: [INITIAL_VERSION],
                    currentVersion: INITIAL_VERSION.id
                };
      
                    const res = await WebsiteApi.editGet(params.siteId);
                    const resSite = await WebsiteApi.get(params.siteId);
                    if(res.code === 0&&res.data.site_data.versions!==undefined&&res.data.site_data.versions!==null){
                        initialData = res.data.site_data;
                    }
                    if(resSite.code === 0&&resSite.data){
                        initialData.name = resSite.data.name;
                        initialData.domain = resSite.data.domain||resSite.data.officialDomain;
                        initialData.path = resSite.data.path;
                    }
 
                    const currentVersion = initialData.versions[0];
                    const currentPage = currentVersion.pages.find(page => page.isHome === true);
                    setCurrentPage(currentPage?.path || '');
                    setCurrentVersion(currentVersion);
                    setEditWebsite(initialData);
                    setVersionNumber(res.data.version_number??0);
                    setLastVersionNumber(res.data.last_published_version??0);
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
                        label: page.name,
                        icon: page.isHome ? <IconHome size={18} className={`mr-2`} /> : null
                    })) || []}
                    placeholder="Select a page"
                    className="w-64"
                    renderOption={renderSelectOption}
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
                        <IframePage url={`${getWebsitePreviewUrl(website, currentPage || '',true)}`} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WebsitePreviewPage;
