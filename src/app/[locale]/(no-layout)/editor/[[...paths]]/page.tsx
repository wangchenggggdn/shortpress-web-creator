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
    try{
        const res = await WebsiteApi.editGet(siteId);
        const resSite = await WebsiteApi.get(siteId);
        if(res.code === 0&&res.data.site_data.versions!==undefined&&res.data.site_data.versions!==null){
            initialData = res.data.site_data;
        }
        if(resSite.code === 0&&resSite.data){
            initialData.name = resSite.data.name;
            initialData.domain = resSite.data.domain||resSite.data.officialDomain;
        }
    }catch(error){

    }

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

