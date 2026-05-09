import WebsiteApi from '@/api/website';
import EditorLayout from '@/components/business/editor/editor-layout';
import { INITIAL_VERSION, getInitialVersion, getNavigationSection } from '@/constants/initial-version';
import { EditWebsite, SectionType } from '@/types/editor';
import { Website } from '@/types/website';
import { redirect } from 'next/navigation';
import React from 'react';

interface EditorSectionPageProps {
    params: {
        siteId?: string;
        paths?: string[]; // slug 是一个可选的字符串数组
    };
}

const EditorSectionPage: React.FC<EditorSectionPageProps> = async ({ params }) => {
    const { paths } = params;
    let siteId = paths?.[0];
    let pageId = paths?.[1];
    let sectionId = paths?.[2];

    if (!siteId) {
        return <div>Failed to load website data</div>;
    }

    let siteData: Website | undefined;
    let initialData: EditWebsite = {
        id: siteId,
        name: 'New Website',
        description: 'A new website',
        path: '',
        versions: [INITIAL_VERSION],
        currentVersion: INITIAL_VERSION.id,
    };
    try {
        const res = await WebsiteApi.editGet(siteId);
        const resSite = await WebsiteApi.get(siteId);
        if (res.code === 0 && res.data.site_data.versions !== undefined && res.data.site_data.versions !== null) {
            initialData = res.data.site_data;
            initialData.id = siteId;
        }
        if (resSite.code === 0 && resSite.data) {
            siteData = resSite.data;
            initialData.name = resSite.data.name;
            initialData.domain = resSite.data.domain || resSite.data.officialDomain;
            initialData.path = resSite.data.path;

            // If versions are still default (editGet failed or returned no versions), regenerate with correct template
            if (resSite.data) {
                if (initialData.versions[0] === INITIAL_VERSION) {
                    const newVersion = getInitialVersion(resSite.data.templateName);
                    initialData.versions = [newVersion];
                    initialData.currentVersion = newVersion.id;
                } else {
                    // Loaded from DB, check if Navigation exists (might be deleted in JSON)
                    const ver = initialData.versions.find(v => v.id === initialData.currentVersion) || initialData.versions[0];
                    if (ver && ver.shareSections) {
                        const hasNav = ver.shareSections.some(s => s.type === SectionType.NAVIGATION);
                        if (!hasNav) {
                            // Use templateName or default (handled by getNavigationSection)
                            ver.shareSections.push(getNavigationSection(resSite.data.templateName));
                        }
                    }
                }
            }
        }
    } catch (error) {}

    if (!pageId) {
        pageId = initialData.versions[0].pages[0].id;
        redirect(`/editor/${siteId}/${pageId}`);
    }

    return <EditorLayout siteId={siteId} pageId={pageId ?? ''} sectionId={sectionId} initialData={initialData} siteData={siteData} />;
};

export default EditorSectionPage;
