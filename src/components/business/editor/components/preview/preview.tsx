'use client';

import React from 'react';
import useEditorStore from '@/store/useEditorStore';
import { Section } from '@/types/editor';
import { SectionComponents } from './sections';

const Preview = () => {
    const { currentVersion, currentPage } = useEditorStore();

    if (!currentVersion || !currentPage) {
        return <div className="p-4 text-center text-gray-500">Loading...</div>;
    }

    const currentPageData = currentVersion.pages.find(page => page.id === currentPage);

    if (!currentPageData) {
        return <div className="p-4 text-center text-gray-500">Page not found</div>;
    }

    return (
        <div className="h-full overflow-auto bg-black">
            <div className="max-w-screen-xl mx-auto">
                {/* Sections */}
                <div className="space-y-8">
                    {currentPageData.sections
                        .sort((a: Section, b: Section) => a.order - b.order)
                        .map((section: Section) => {
                            const SectionComponent = SectionComponents[section.type];
                            if (!SectionComponent) return null;
                            
                            return (
                                <SectionComponent
                                    key={section.id}
                                    section={section}
                                    pageId={currentPage}
                                />
                            );
                        })}

                    {/* Empty State */}
                    {currentPageData.sections.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            Add sections to start building your page
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Preview;
