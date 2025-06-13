'use client';

import React, { useEffect, useState } from 'react';
import { IconPlus, IconTrash, IconEye, IconEyeOff } from '@tabler/icons-react';
import useEditorStore from '@/store/useEditorStore';
import { Section, SectionType, DataSourceType } from '@/types/editor';
import { createUniqueUUID } from '@/utils/public';

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
        updateSection,
    } = useEditorStore();

    const [showTypeSelector, setShowTypeSelector] = useState(false);

    const currentPageData = currentVersion?.pages.find(page => page.id === currentPage);

    useEffect(() => {
        console.log('currentSection：', currentSection);
    }, [currentSection]);

    const handleAddSection = (type: SectionType) => {
        if (!currentPage) return;
        addSection(currentPage, type);
        setShowTypeSelector(false);
    };

    const handleDeleteSection = (sectionId: string) => {
        if (!currentPage) return;
        deleteSection(currentPage, sectionId);
        if (currentSection?.id === sectionId) {
            setCurrentSection(null);
            console.log('handleDeleteSection', null);
            if (onSectionChange) {
                onSectionChange(null);
            }
        }
    };

    const handleSectionClick = (section: Section) => {
        console.log('handleSectionClick', section);
        setCurrentSection(section);
        if (onSectionChange) {
            onSectionChange(section.id);
        }
    };

    const handleToggleVisibility = (e: React.MouseEvent, section: Section) => {
        e.stopPropagation();
        if (!currentPage) return;
        updateSection(currentPage, section.id, {
            ...section,
            isHidden: !section.isHidden
        });
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
    const shareHeaderSection = currentVersion?.shareSections.find(s => s.type === SectionType.HEADER);
    const shareFooterSection = currentVersion?.shareSections.find(s => s.type === SectionType.FOOTER);

    const isVisibleShareFooter = shareFooterSection&&!shareFooterSection.isHidden&&!shareFooterSection.params.extend.notSharePages?.includes(currentPageData?.path??'');

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Sections</h2>
            </div>

            <div className="space-y-2">
                {/* Header Section */}
                {headerSection && <div
                    className={`flex items-center p-2 rounded-lg border border-gray-200 cursor-pointer ${
                        currentSection?.id === headerSection?.id
                            ? 'bg-[#EEF2FF] text-[#6366F1] border-[#6366F1]'
                            : 'hover:bg-gray-50'
                    }`}
                    onClick={() => headerSection && handleSectionClick(headerSection)}
                >
                    <button
                        onClick={(e) => handleToggleVisibility(e, headerSection)}
                        className="mr-2 text-gray-500 hover:text-gray-700"
                    >
                        {headerSection.isHidden ? (
                            <IconEyeOff size={16} />
                        ) : (
                            <IconEye size={16} />
                        )}
                    </button>
                    <span className="flex-1">Header</span>
                </div>}
                {!headerSection && shareHeaderSection && <div
                    className={`flex items-center p-2 rounded-lg border border-gray-200 cursor-pointer ${
                        currentSection?.id === shareHeaderSection?.id
                            ? 'bg-[#EEF2FF] text-[#6366F1] border-[#6366F1]'
                            : 'hover:bg-gray-50'
                    }`}
                    onClick={() => shareHeaderSection && handleSectionClick(shareHeaderSection)}
                >
                    <IconEye size={16} className="mr-2 text-gray-500" />
                    <span className="flex-1">Header</span>
                </div>}

                {/* Regular Sections */}
                {currentPageData?.sections
                    .filter(section => section.type !== SectionType.HEADER && section.type !== SectionType.FOOTER)
                    .sort((a, b) => a.order - b.order)
                    .map((section: Section) => (
                        <div
                            key={section.id}
                            className={`flex items-center p-2 rounded-lg border border-gray-200 cursor-pointer ${
                                currentSection?.id === section.id
                                    ? 'bg-[#EEF2FF] text-[#6366F1] border-[#6366F1]'
                                    : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleSectionClick(section)}
                        >
                            <button
                                onClick={(e) => handleToggleVisibility(e, section)}
                                className="mr-2 text-gray-500 hover:text-gray-700"
                            >
                                {section.isHidden ? (
                                    <IconEyeOff size={16} />
                                ) : (
                                    <IconEye size={16} />
                                )}
                            </button>
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
                        className="w-full p-2 text-left hover:bg-gray-100 rounded-lg border border-gray-200 flex items-center"
                        onClick={() => setShowTypeSelector(!showTypeSelector)}
                    >
                        <IconPlus size={16} className="mr-2" />
                        <span>Add Section</span>
                    </button>

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
                {footerSection && <div
                    className={`flex items-center p-2 rounded-lg border border-gray-200 cursor-pointer ${
                        currentSection?.id === footerSection?.id
                            ? 'bg-[#EEF2FF] text-[#6366F1] border-[#6366F1]'
                            : 'hover:bg-gray-50'
                    }`}
                    onClick={() => footerSection && handleSectionClick(footerSection)}
                >
                    <button
                        onClick={(e) => handleToggleVisibility(e, footerSection)}
                        className="mr-2 text-gray-500 hover:text-gray-700"
                    >
                        {footerSection.isHidden ? (
                            <IconEyeOff size={16} />
                        ) : (
                            <IconEye size={16} />
                        )}
                    </button>
                    <span className="flex-1">Footer</span>
                </div>}

                {!footerSection && isVisibleShareFooter && <div
                    className={`flex items-center p-2 rounded-lg border border-gray-200 cursor-pointer ${
                        currentSection?.id === shareFooterSection?.id
                            ? 'bg-[#EEF2FF] text-[#6366F1] border-[#6366F1]'
                            : 'hover:bg-gray-50'
                    }`}
                    onClick={() => shareFooterSection && handleSectionClick(shareFooterSection)}
                >
                    <IconEye size={16} className="mr-2 text-gray-500" />
                    <span className="flex-1">Footer</span>
                </div>}
            </div>
        </div>
    );
};

export default SectionList; 