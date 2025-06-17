'use client';

import IframePage from '@/components/business/editor/components/preview/preview/iframe-page';
import React, { useEffect, useState } from 'react';


interface WebsitePreviewPageProps {
    searchParams: {
        url: string;
    };
}

const CustomPreviewPage: React.FC<WebsitePreviewPageProps> = ({ searchParams }) => {
    console.log('----------searchParams', searchParams);
    const url = decodeURIComponent(searchParams.url);
    return (
        <div className='h-screen'>
            <IframePage url={url} />
        </div>
    );
};

export default CustomPreviewPage;
