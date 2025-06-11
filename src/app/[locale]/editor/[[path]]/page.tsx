'use client';

import React from 'react';
import EditorLayout from '@/components/business/editor/editor-layout';
import { INITIAL_VERSION } from '@/constants/initial-version';

interface EditorSectionPageProps {
    params: {
        slug?: string[]; // slug 是一个可选的字符串数组
      };
}

const EditorSectionPage: React.FC<EditorSectionPageProps> = async ({ params }) => {
    const { slug } = params;
    const siteId = slug?.[0];
    const pageId = slug?.[1];
    const sectionId = slug?.[2];
    const initialData = {
        id: siteId,
        name: 'New Website',
        description: 'A new website',
        versions: [INITIAL_VERSION],
        currentVersion: INITIAL_VERSION.id
    };
    if (!initialData) {
        return <div>Failed to load website data</div>;
    }
    console.log('initialData', initialData);
    return <div>EditorSectionPage</div>;

    // return (
    //     <EditorLayout
    //         siteId={params.siteId}
    //         pageId={params.pageId}
    //         sectionId={params.sectionId}
    //         initialData={initialData}
    //     />
    // );
};

export default EditorSectionPage; 

