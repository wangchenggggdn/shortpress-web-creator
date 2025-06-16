'use client';

import React from 'react';
import { Page } from '@/types/editor';
import { SectionComponents } from '../sections';

interface VideoPageProps {
    page: Page;
    isPreview?: boolean;
}

const VideoPage: React.FC<VideoPageProps> = ({ page, isPreview = false }) => {
    return (
        <div className="flex flex-col min-h-screen">
            {page.sections.map((section) => {
                const SectionComponent = SectionComponents[section.type];
                return SectionComponent ? (
                    <SectionComponent
                        key={section.id}
                        section={section}
                        pageId={page.id}
                    />
                ) : null;
            })}
        </div>
    );
};

export default VideoPage; 