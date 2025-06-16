import React from 'react';
import EditorLayout from '@/components/business/editor/editor-layout';
import { INITIAL_VERSION } from '@/constants/initial-version';
import { redirect } from 'next/navigation';

interface EditorSectionPageProps {
    params: {
        siteId?:string,
        paths?: string[], // slug 是一个可选的字符串数组
      };
}

const EditorSectionPage: React.FC<EditorSectionPageProps> = async ({ params }) => {
    const { paths} = params;
    let siteId = paths?.[0];
    let pageId = paths?.[1];
    let sectionId = paths?.[2];

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

    if(!pageId){
        pageId = initialData.versions[0].pages[0].id;
        redirect(`/editor/${siteId}/${pageId}`);
    }

    return (
        <EditorLayout
            siteId={siteId}
            pageId={pageId??''}
            sectionId={sectionId}
            initialData={initialData}
        />
    );
};

export default EditorSectionPage; 

