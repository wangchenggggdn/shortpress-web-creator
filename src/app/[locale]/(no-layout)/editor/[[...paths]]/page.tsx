import React from 'react';
import EditorLayout from '@/components/business/editor/editor-layout';
import { INITIAL_VERSION } from '@/constants/initial-version';
import { redirect } from 'next/navigation';
import WebsiteApi from '@/api/website';
import { EditWebsite } from '@/types/editor';

interface EditorSectionPageProps {
    params: {
        siteId?:string,
        paths?: string[], // slug 是一个可选的字符串数组
      };
}

const EditorSectionPage: React.FC<EditorSectionPageProps> = async ({ params }) => {
    const { paths} = params;
    console.error('------------initialData0:',params);
    let siteId = paths?.[0];
    let pageId = paths?.[1];
    let sectionId = paths?.[2];

    if (!siteId ) {
        return <div>Failed to load website data</div>;
    }

    let initialData:EditWebsite = {
        id: siteId,
        name: 'New Website',
        description: 'A new website',
        versions: [INITIAL_VERSION],
        currentVersion: INITIAL_VERSION.id
    };
    console.error('------------initialData1:',initialData);
    try{
        const res = await WebsiteApi.editGet(siteId);
        if(res.code === 0&&(res.data.site_data.versions!==undefined||res.data.site_data.versions!==null)){
            console.error('------------initialData3----:',res.data.site_data);
            initialData = res.data.site_data;
        }
    }catch(error){
        console.error('------------initialData3:',error);
    }

    console.error('------------initialData2:',initialData);

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

