'use client';

import React from 'react';
import { Section } from '@/types/editor';
import useEditorStore from '@/store/useEditorStore';
import { useRouter } from 'next/navigation';

interface BaseSectionProps {
    section: Section;
    pageId: string;
    isPreview?: boolean;
    children?: React.ReactNode;
}

const BaseSection: React.FC<BaseSectionProps> = ({ section, pageId, isPreview = false, children }) => {
    const { currentVersion,editWebsite, currentPage, currentSection, setCurrentSection, selectedComponent } = useEditorStore();
    const isSelected = currentSection?.id === section?.id;
    const router = useRouter();

    const handleClick = () => {
        if (!isPreview) {
            setCurrentSection(section);
            handleSectionChange(section.id);
        }
    };

        // Handle section change
        const handleSectionChange = (newSectionId: string | null) => {
            let page = currentVersion?.pages.find(p => p.id === currentPage);
            if (!page) {
                console.log('No current page found');
                return;
            }
    
            if (newSectionId) {
                let section = page.sections.find(s => s.id === newSectionId);
                if (!section) {
                    section = currentVersion?.shareSections.find(s => s.id === newSectionId);
                }
                if (section) {
                    router.push(`/editor/${editWebsite?.id}/${page.id}/${section.id}`);
                }
            } else {
                console.log('Navigating to page only:', page.name);
                router.push(`/editor/${editWebsite?.id}/${page.id}`);
            }
        };

    return (
       <>
       {!section.isHidden && (
        <div className={`relative transition-all ${isSelected && !isPreview ? 'outline outline-2 outline-blue-500' : ''}`} onClick={handleClick}>
            {/* {!isPreview && (
                <div className="absolute top-2 right-2 z-10 flex gap-2">
                    <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">{section.type}</span>
                </div>
            )} */}
            {children}
         </div>
       )}
       </>
    );
};

export default BaseSection;
