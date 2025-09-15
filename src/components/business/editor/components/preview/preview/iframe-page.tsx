'use client';

import React, { useEffect, useState } from 'react';
import { Page } from '@/types/editor';

interface IframePageProps {
    url: string;
}

const IframePage: React.FC<IframePageProps> = ({ url }) => {    
    const [previewWidth, setPreviewWidth] = useState(0);

    // Calculate preview width based on height and iPhone 15's aspect ratio (19.5:9)
    useEffect(() => {
        const updatePreviewWidth = () => {
            const containerHeight = window.innerHeight;
            // iPhone 15 aspect ratio is 19.5:9
            // If container height is h, then width should be (h * 9 / 19.5)
            const width = Math.min(500, Math.floor(containerHeight * 9 / 19.5));
            setPreviewWidth(width);
        };

        updatePreviewWidth();
        window.addEventListener('resize', updatePreviewWidth);
        return () => window.removeEventListener('resize', updatePreviewWidth);
    }, []);

    return (
        <div className="h-full w-full flex justify-center items-center bg-black">
            <iframe src={url} className="w-full h-full" />
       </div>
    );
};

export default IframePage; 