'use client';

import React from 'react';
import { IconArrowLeft } from '@tabler/icons-react';
import useEditorStore from '@/store/useEditorStore';
import { Section } from '@/types/editor';

interface SectionEditorProps {
    sectionId: string;
    onBack: () => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({ sectionId, onBack }) => {
    const { currentVersion, currentPage } = useEditorStore();
    const currentPageData = currentVersion?.pages.find(page => page.id === currentPage);
    const section = currentPageData?.sections.find(s => s.id === sectionId);

    if (!section) {
        return <div className="p-4 text-center text-gray-500">Section not found</div>;
    }

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
                {/* Section specific editor UI will go here */}
                <div className="text-gray-500">
                    Section editor for {section.type} is under development
                </div>
            </div>
        </div>
    );
};

export default SectionEditor; 