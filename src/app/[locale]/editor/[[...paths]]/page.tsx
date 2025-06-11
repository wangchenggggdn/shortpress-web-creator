import React from 'react';
import EditorLayout from '@/components/business/editor/editor-layout';
import { INITIAL_VERSION } from '@/constants/initial-version';

interface EditorSectionPageProps {
    params: {
        paths?: string[]; // slug 是一个可选的字符串数组
      };
}

const EditorSectionPage: React.FC<EditorSectionPageProps> = async ({ params }) => {
    const { paths } = params;
    const siteId = paths?.[0];
    const pageId = paths?.[1]??'home';
    const sectionId = paths?.[2];

    console.log('paths:', paths);
    if (!siteId ) {
        return <div>Failed to load website data</div>;
    }

    const initialData = {
        id: siteId,
        name: 'New Website',
        description: 'A new website',
        versions: [INITIAL_VERSION],
        currentVersion: INITIAL_VERSION.id
    };

    return (
        <EditorLayout
            siteId={siteId}
            pageId={pageId}
            sectionId={sectionId}
            initialData={initialData}
        />
    );
};

export default EditorSectionPage; 

