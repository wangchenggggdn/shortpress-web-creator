'use client';

import React from 'react';
import useEditorStore from '@/store/useEditorStore';
import { Section, SectionType } from '@/types/editor';
import BaseSection from './base-section';

// 动态导入各种类型的 Section 组件
const SectionComponents: Record<SectionType, React.FC<any>> = {
    [SectionType.HEADER]: BaseSection,
    [SectionType.FEATURE]: BaseSection,
    [SectionType.CAROUSEL]: BaseSection,
    [SectionType.SCROLL]: BaseSection,
    [SectionType.GRID]: BaseSection,
    [SectionType.LIST]: BaseSection,
    [SectionType.COLUMN]: BaseSection,
    [SectionType.FOOTER]: BaseSection,
};

const Preview = () => {
    const { currentVersion, currentPage } = useEditorStore();
    const currentPageData = currentVersion?.pages.find(page => page.id === currentPage);

    if (!currentVersion) {
        return (
            <div className="h-full flex items-center justify-center text-gray-500">
                Loading...
            </div>
        );
    }

    if (!currentPage || !currentPageData) {
        return (
            <div className="h-full flex items-center justify-center text-gray-500">
                Select a page to preview
            </div>
        );
    }

    return (
        <div className="h-full overflow-auto bg-white">
            <div className="max-w-screen-xl mx-auto">
                {/* Page Info */}
                <div className="p-4 border-b">
                    <h1 className="text-2xl font-bold">{currentPageData.name}</h1>
                    <p className="text-gray-500">/{currentPageData.path}</p>
                </div>

                {/* Sections */}
                <div className="p-4 space-y-8">
                    {currentPageData.sections
                        .sort((a: Section, b: Section) => a.order - b.order)
                        .map((section: Section) => {
                            const SectionComponent = SectionComponents[section.type];
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