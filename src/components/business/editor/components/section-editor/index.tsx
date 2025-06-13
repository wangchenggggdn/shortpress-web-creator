'use client';

import React, { useState, useEffect } from 'react';
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
    const { currentVersion, currentPage, updateSection, updateShareSection } = useEditorStore();
    const [localSection, setLocalSection] = useState<Section | null>(null);
    const [isSharedSection, setIsSharedSection] = useState(false);

    // Sync with store when version changes
    useEffect(() => {
        if (!sectionId) return;
        
        // Check if the section is in shareSections
        const sharedSection = currentVersion?.shareSections.find((s: Section) => s.id === sectionId);
        if (sharedSection) {
            setLocalSection(sharedSection);
            setIsSharedSection(true);
            return;
        }

        // If not in shareSections, check in currentPage
        if (!currentVersion || !currentPage) return;
        const currentPageData = currentVersion.pages.find(p => p.id === currentPage);
        if (!currentPageData) return;
        
        const pageSection = currentPageData.sections.find((s: Section) => s.id === sectionId);
        if (pageSection) {
            setLocalSection(pageSection);
            setIsSharedSection(false);
        }
    }, [sectionId, currentPage, currentVersion]);

    const updateSectionData = (updates: Partial<Section>) => {
        if (!localSection) return;
        
        const updatedSection = {
            ...localSection,
            ...updates
        };
        
        setLocalSection(updatedSection);
        
        if (isSharedSection) {
            updateShareSection(localSection.id, updatedSection);
        } else if (currentPage) {
            updateSection(currentPage, localSection.id, updatedSection);
        }
    };

    if (!localSection) {
        return <div className="p-4 text-center text-gray-500">Loading...</div>;
    }

    switch (localSection.type) {
        case SectionType.HEADER:
            return <HeaderEditor 
                section={localSection} 
                onBack={onBack} 
                updateSection={updateSectionData}
            />;
        case SectionType.FOOTER:
            return <FooterEditor 
                section={localSection} 
                onBack={onBack} 
                updateSection={updateSectionData}
            />;
        case SectionType.CAROUSEL:
            return <CarouselEditor 
                section={localSection} 
                onBack={onBack} 
                updateSection={updateSectionData}
            />;
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
                        <h2 className="text-lg font-medium">Edit {localSection.type}</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="text-gray-500">
                            Section editor for {localSection.type} is under development
                        </div>
                    </div>
                </div>
            );
    }
};

export default SectionEditor; 