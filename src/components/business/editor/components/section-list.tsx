'use client';

import React, { useState } from 'react';
import { IconPlus, IconTrash, IconEye } from '@tabler/icons-react';
import useEditorStore from '@/store/useEditorStore';
import { Section, SectionType, DataSourceType } from '@/types/editor';

interface SectionListProps {
    onSectionChange?: (sectionId: string | null) => void;
}

const SectionList: React.FC<SectionListProps> = ({ onSectionChange }) => {
    const {
        shareSections,
        currentVersion,
        currentPage,
        currentSection,
        addSection,
        deleteSection,
        setCurrentSection,
    } = useEditorStore();

    const [showTypeSelector, setShowTypeSelector] = useState(false);

    const currentPageData = currentVersion?.pages.find(page => page.id === currentPage);

    const handleAddSection = (type: SectionType) => {
        if (!currentPage) return;
        addSection(currentPage, type);
        setShowTypeSelector(false);
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

    // 获取当前页面的 header 和 footer sections
    const headerSection = currentPageData?.sections.find(s => s.type === SectionType.HEADER);
    const footerSection = currentPageData?.sections.find(s => s.type === SectionType.FOOTER);
    const shareHeaderSection = shareSections.find(s => s.type === SectionType.HEADER);
    const shareFooterSection = shareSections.find(s => s.type === SectionType.FOOTER);
    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Sections</h2>
            </div>

            <div className="space-y-2">
                {/* Header Section */}
                {headerSection&&!headerSection.isHidden&& <div
                    className={`flex items-center p-2 rounded cursor-pointer ${
                        currentSection === headerSection?.id
                            ? 'bg-blue-100'
                            : 'hover:bg-gray-100'
                    }`}
                    onClick={() => headerSection && handleSectionClick(headerSection.id)}
                >
                    <IconEye size={16} className="mr-2" />
                    <span className="flex-1">Header</span>
                </div>}
                {!headerSection&&shareHeaderSection&&!shareHeaderSection.isHidden&& <div
                    className={`flex items-center p-2 rounded cursor-pointer ${
                        currentSection === shareHeaderSection?.id
                            ? 'bg-blue-100'
                            : 'hover:bg-gray-100'
                    }`}
                    onClick={() => shareHeaderSection && handleSectionClick(shareHeaderSection.id)}
                >
                    <IconEye size={16} className="mr-2" />
                    <span className="flex-1">Header</span>
                </div>}

                {/* Regular Sections */}
                {currentPageData?.sections
                    .filter(section => section.type !== SectionType.HEADER && section.type !== SectionType.FOOTER)
                    .sort((a, b) => a.order - b.order)
                    .map((section: Section) => (
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
                                {section.type.toLowerCase()}
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

                {/* Add Section Button */}
                <div className="relative">
                    <button
                        className="w-full p-2 text-left hover:bg-gray-100 rounded flex items-center"
                        onClick={() => setShowTypeSelector(!showTypeSelector)}
                    >
                        <IconPlus size={16} className="mr-2" />
                        <span>Add Section</span>
                    </button>

                    {/* Section Type Selector */}
                    {showTypeSelector && (
                        <div className="absolute left-0 right-0 mt-1 py-2 bg-white rounded-lg shadow-xl z-10">
                            {Object.values(SectionType)
                                .filter(type => type !== SectionType.HEADER && type !== SectionType.FOOTER)
                                .map(type => (
                                    <button
                                        key={type}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
                                        onClick={() => handleAddSection(type)}
                                    >
                                        <span className="capitalize">{type.toLowerCase()}</span>
                                    </button>
                                ))}
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                {footerSection&&!footerSection.isHidden&& <div
                    className={`flex items-center p-2 rounded cursor-pointer ${
                        currentSection === footerSection?.id
                            ? 'bg-blue-100'
                            : 'hover:bg-gray-100'
                    }`}
                    onClick={() => footerSection && handleSectionClick(footerSection.id)}
                >
                    <IconEye size={16} className="mr-2" />
                    <span className="flex-1">Footer</span>
                </div>}

                {!footerSection&&shareFooterSection&&!shareFooterSection.isHidden&& <div
                    className={`flex items-center p-2 rounded cursor-pointer ${
                        currentSection === shareFooterSection?.id
                            ? 'bg-blue-100'
                            : 'hover:bg-gray-100'   
                    }`}
                    onClick={() => shareFooterSection && handleSectionClick(shareFooterSection.id)}
                >
                    <IconEye size={16} className="mr-2" />
                    <span className="flex-1">Footer</span>
                </div>} 
            </div>
        </div>
    );
};

export default SectionList; 