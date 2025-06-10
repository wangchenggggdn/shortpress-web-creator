'use client';

import React from 'react';
import EditorLayout from '@/components/business/editor/editor-layout';

interface EditorSectionPageProps {
    params: {
        siteId: string;
        pageId: string;
        sectionId: string;
    };
}

const EditorSectionPage: React.FC<EditorSectionPageProps> = ({ params }) => {
    return (
        <EditorLayout
            siteId={params.siteId}
            pageId={params.pageId}
            sectionId={params.sectionId}
        />
    );
};

export default EditorSectionPage; 