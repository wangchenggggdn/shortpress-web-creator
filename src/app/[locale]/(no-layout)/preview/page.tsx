'use client';

import IframePage from '@/components/business/editor/components/preview/preview/iframe-page';
import React, { useEffect, useState } from 'react';


interface WebsitePreviewPageProps {
    searchParams: {
        url: string;
        preview: boolean;
    };
}

const CustomPreviewPage: React.FC<WebsitePreviewPageProps> = ({ searchParams }) => {
    const url = decodeURIComponent(searchParams.url);
    return (
        <div className='h-full w-full flex justify-center items-center bg-black'>
             <div className='h-screen w-full xl:max-w-[375px]'>
                <IframePage url={url} />
            </div>
        </div>
    );
};

export default CustomPreviewPage;
