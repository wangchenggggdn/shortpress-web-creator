'use client';

import React from 'react';
import { Section } from '@/types/editor';
import useEditorStore from '@/store/useEditorStore';

interface BaseSectionProps {
    section: Section;
    pageId: string;
    isPreview?: boolean;
    children?: React.ReactNode;
}

const BaseSection: React.FC<BaseSectionProps> = ({
    section,
    pageId,
    isPreview = false,
    children
}) => {
    const { currentSection, setCurrentSection, selectedComponent } = useEditorStore();
    const isSelected = currentSection?.id === section.id;

    const handleClick = () => {
        if (!isPreview) {
            setCurrentSection(section);
        }
    };

    return (
        <div
            className={`relative transition-all ${
                isSelected && !isPreview ? 'outline outline-2 outline-blue-500' : ''
            }`}
            onClick={handleClick}
        >
            {!isPreview && (
                <div className="absolute top-2 right-2 z-10 flex gap-2">
                    <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">
                        {section.type}
                    </span>
                </div>
            )}
            {children}
        </div>
    );
};

export default BaseSection; 