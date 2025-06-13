'use client';

import React, { useState, useEffect } from 'react';
import { IconArrowLeft, IconPlus } from '@tabler/icons-react';
import useEditorStore from '@/store/useEditorStore';
import { Section, SectionType, DataSourceType } from '@/types/editor';
import HeaderEditor from './header-editor';
import FooterEditor from './footer-editor';
import CarouselEditor from './nomal-editor/nomal-editor';
import SectionTypeModal from './section-type-modal';
import ContentTypeModal from './content-type-modal';
import NormalEditor from './nomal-editor/nomal-editor';

interface SectionEditorProps {
    sectionId: string;
    onBack: () => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({ sectionId, onBack }) => {
    const { currentVersion,currentSection, currentPage, updateSection, updateShareSection } = useEditorStore();
    const [localSection, setLocalSection] = useState<Section | null>(null);
    const [isSharedSection, setIsSharedSection] = useState(false);
    const [showTypeSelector, setShowTypeSelector] = useState(false);
    const [showContentSelector, setShowContentSelector] = useState(false);

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

    const handleContentTypeSelect = (type: DataSourceType) => {
        if (!localSection) return;
        
        // For CONTINUE_WATCHING and NEW_RELEASE, we just need to update the section params
        if (type === DataSourceType.CONTINUE_WATCHING || type === DataSourceType.NEW_RELEASE) {
            updateSectionData({
                params: {
                    extend: {
                        ...localSection.params.extend,
                        dataSourceType: type
                    }
                }
            });
        }
        
        setShowContentSelector(false);
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
        case SectionType.SCROLL:
        case SectionType.GRID:
        case SectionType.LIST:
        case SectionType.COLUMN:
        case SectionType.FEATURE:
            return <NormalEditor 
                section={localSection} 
                onBack={onBack} 
                updateSection={updateSectionData}
            />;
        default:
            return (
                <>
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
                            {/* Add Content Button */}
                            <button
                                className="w-full p-2 text-left hover:bg-gray-100 rounded-lg border border-gray-200 flex items-center"
                                onClick={() => setShowContentSelector(true)}
                            >
                                <IconPlus size={16} className="mr-2" />
                                <span>Add Content</span>
                            </button>

                            {/* Content List */}
                            {/* TODO: Add content list here */}
                        </div>
                    </div>

                    {/* Content Type Modal */}
                    <ContentTypeModal
                        open={showContentSelector}
                        onClose={() => setShowContentSelector(false)}
                        sectionType={localSection.type}
                        onSelect={handleContentTypeSelect}
                    />
                </>
            );
    }
};

export default SectionEditor; 