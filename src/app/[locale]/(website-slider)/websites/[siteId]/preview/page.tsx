'use client';

import React, { useEffect, useState } from 'react';
import WebsiteApi from '@/api/website';
import { Button } from '@mantine/core';
import { IconDeviceMobile, IconDeviceDesktop, IconShare } from '@tabler/icons-react';
import LoadingData from '@/components/common/loading-data';
import { Website } from '@/types/website';
import { useRouter } from 'next/navigation';

interface WebsitePreviewPageProps {
    params: {
        siteId: string;
    };
}

const WebsitePreviewPage: React.FC<WebsitePreviewPageProps> = ({ params }) => {
    const [website, setWebsite] = useState<Website | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
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

        fetchWebsite();
    }, [params.siteId]);

    if (isLoading) {
        return <div className='w-full h-full flex justify-center items-center'><LoadingData/></div>;
    }

    if (!website) {
        return <div className='w-full h-full flex justify-center items-center'>Website not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* top toolbar */}
            <div className="h-14 bg-white border-b flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <IconDeviceMobile size={20}/>
                    <Button
                        variant={"subtle"}
                        color='black'
                        onClick={() => {
                            window.open(`https://www.dramahub.com/preview/${website.siteId}`, '_blank');
                        }}
                    >
                        <IconShare size={20} />
                    </Button>
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
            {website.status !== 1 && (
                <div className="bg-yellow-50 border-b border-yellow-100 p-4 text-center">
                    <span className="text-yellow-800">Your last changes haven't pulished.</span>
                    <button className="ml-2 text-indigo-600 hover:text-indigo-700 font-medium">
                        Publish Now
                    </button>
                </div>
            )}

            {/* preview content */}
            <div className="flex justify-center py-8 px-4">
                <div className={`bg-white shadow-lg  w-[300px] h-[calc(100vh-200px)] overflow-y-auto`}>
                
                    <div className="h-6 bg-gray-100 flex items-center justify-center">
                        <div className="w-16 h-1 bg-gray-300 rounded" />
                    </div>
                
                    <div className="relative">
                        <iframe
                            src={`/preview/${website.siteId}`}
                            className="w-full h-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WebsitePreviewPage;
