'use client';

import React from 'react';
import { IconArrowLeft } from '@tabler/icons-react';
import useEditorStore from '@/store/useEditorStore';
import { Section, SectionType } from '@/types/editor';
import HeaderEditor from './header-editor';
import FooterEditor from './footer-editor';
import CarouselEditor from './carousel-editor';

interface SectionEditorProps {
    sectionId: string;
    onBack: () => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({ sectionId, onBack }) => {
    const { currentVersion, currentPage } = useEditorStore();
    const currentPageData = currentVersion?.pages.find(page => page.id === currentPage);
    let section = currentPageData?.sections.find(s => s.id === sectionId);

    if (!section) {
        section = currentVersion?.shareSections.find(s => s.id === sectionId);
        if (!section) {
            return <div className="p-4 text-center text-gray-500">Section not found</div>;
        }
    }

    switch (section.type) {
        case SectionType.HEADER:
            return <HeaderEditor onBack={onBack} />;
        case SectionType.FOOTER:
            return <FooterEditor onBack={onBack} />;
        case SectionType.CAROUSEL:
            return <CarouselEditor section={section} onBack={onBack} />;
        default:
            return (
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-200 rounded"
                            title="Back to sections"
                        >
                            <IconArrowLeft size={20} />
                        </button>
                        <h2 className="text-lg font-medium">Edit {section.type}</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="text-gray-500">
                            Section editor for {section.type} is under development
                        </div>
                    </div>
                </div>
            );
    }
};

export default SectionEditor; 