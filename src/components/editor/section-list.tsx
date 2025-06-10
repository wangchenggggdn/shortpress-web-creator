'use client';

import React from 'react';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import useEditorStore from '@/store/useEditorStore';
import { Section, SectionType, DataSourceType } from '@/types/editor';

interface SectionListProps {
    onSectionChange?: (sectionId: string | null) => void;
}

const SectionList: React.FC<SectionListProps> = ({ onSectionChange }) => {
    const {
        currentVersion,
        currentPage,
        currentSection,
        addSection,
        deleteSection,
        setCurrentSection,
    } = useEditorStore();

    const currentPageData = currentVersion?.pages.find(page => page.id === currentPage);

    const handleAddSection = (type: SectionType) => {
        if (!currentPage) return;

        const newSection: Section = {
            id: `section-${Date.now()}`,
            type,
            order: currentPageData?.sections.length ?? 0,
            params: {
                id: `params-${Date.now()}`,
                type: DataSourceType.PLAYLIST,
                title: `New ${type} Section`,
            }
        };

        addSection(currentPage, newSection);
        setCurrentSection(newSection.id);
        console.log('handleAddSection', newSection.id);
        if (onSectionChange) {
            onSectionChange(newSection.id);
        }
    };

    const handleDeleteSection = (sectionId: string) => {
        if (!currentPage) return;
        deleteSection(currentPage, sectionId);
        if (currentSection === sectionId) {
            setCurrentSection(null);
            console.log('handleDeleteSection', null);
            if (onSectionChange) {
                onSectionChange(null);
            }
        }
    };

    const handleSectionClick = (sectionId: string) => {
        setCurrentSection(sectionId);
        console.log('handleSectionClick', sectionId);
        if (onSectionChange) {
            onSectionChange(sectionId);
        }
    };

    if (!currentVersion) {
        return <div className="p-4 text-center text-gray-500">Loading...</div>;
    }

    if (!currentPage) {
        return (
            <div className="p-4 text-center text-gray-500">
                Select a page to manage sections
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Sections</h2>
                <div className="relative group">
                    <button
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Add new section"
                    >
                        <IconPlus size={20} />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                        {Object.values(SectionType).map(type => (
                            <button
                                key={type}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100"
                                onClick={() => handleAddSection(type)}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                {currentPageData?.sections.map((section: Section) => (
                    <div
                        key={section.id}
                        className={`flex items-center p-2 rounded cursor-pointer ${
                            currentSection === section.id
                                ? 'bg-blue-100'
                                : 'hover:bg-gray-100'
                        }`}
                        onClick={() => handleSectionClick(section.id)}
                    >
                        <span className="flex-1 truncate">
                            {section.params.title || section.type}
                        </span>
                        <button
                            onClick={e => {
                                e.stopPropagation();
                                handleDeleteSection(section.id);
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Delete section"
                        >
                            <IconTrash size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SectionList; 