'use client';

import React from 'react';
import EditorLayout from '@/components/business/editor/editor-layout';

interface EditorPageProps {
    params: {
        siteId: string;
        pageId: string;
    };
}

const EditorPage: React.FC<EditorPageProps> = ({ params }) => {
    return <EditorLayout siteId={params.siteId} pageId={params.pageId} />;
};

export default EditorPage; 