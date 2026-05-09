'use client';

import React, { useEffect, useState } from 'react';
import { IconEye, IconEyeOff, IconPlus, IconPlayerPlay } from '@tabler/icons-react';
import { Menu } from '@mantine/core';
import useEditorStore from '@/store/useEditorStore';
import { Section, SectionType } from '@/types/editor';
import { createUniqueUUID } from '@/utils/public';
import SectionTypeSelector from './common/SectionTypeSelector';
import SectionItem from './common/SectionItem';
import InputModal from '@/components/common/input-modal';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface SectionListProps {
    onSectionChange?: (sectionId: string | null) => void;
}

const SectionList: React.FC<SectionListProps> = ({ onSectionChange }) => {
    const { currentVersion, currentPage, currentSection, addSection, deleteSection, setCurrentSection, updateSection, updateShareSection, isSharedSectionFunc, updatePage } =
        useEditorStore();
    const currentPageData = currentVersion?.pages.find(page => page.id === currentPage);
    const [sectionToRename, setSectionToRename] = useState<Section | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (currentPageData?.type === 'playlist') {
            const hasPlayer = currentPageData.sections.some(s => s.type === SectionType.PLAYER);
            if (!hasPlayer && currentPage) {
                addSection(currentPage, SectionType.PLAYER);
            }
        }
    }, [currentPageData, currentPage, addSection]);

    const handleAddSection = (type: SectionType) => {
        if (!currentPage) return;
        const newSection = addSection(currentPage, type);
        if (onSectionChange && newSection) {
            onSectionChange(newSection.id);
        }
    };

    const handleDeleteSection = (sectionId: string) => {
        if (!currentPage) return;
        deleteSection(currentPage, sectionId);
        if (currentSection?.id === sectionId) {
            setCurrentSection(null);
            if (onSectionChange) {
                onSectionChange(null);
            }
        }
    };

    const handleSectionClick = (section: Section) => {
        setCurrentSection(section);
        if (onSectionChange) {
            onSectionChange(section.id);
        }
    };

    const handleToggleVisibility = (e: React.MouseEvent, section: Section) => {
        e.stopPropagation();
        if (!currentPage) return;
        handleUpdateSection({
            ...section,
            isHidden: !section.isHidden,
        });
    };

    const handleDuplicateSection = (sectionId: string) => {
        if (!currentPage || !currentPageData) return;

        const sectionToDuplicate = currentPageData.sections.find(s => s.id === sectionId);
        if (!sectionToDuplicate) return;

        const newSection = addSection(currentPage, sectionToDuplicate.type);
        if (newSection) {
            handleUpdateSection({
                ...newSection,
                title: `${sectionToDuplicate.title} (Copy)`,
                params: sectionToDuplicate.params,
            });
        }
    };

    const handleRenameSection = (section: Section) => {
        setSectionToRename(section);
    };

    const handleRenameSectionConfirm = (newTitle: string) => {
        if (!sectionToRename || !currentPage) return false;

        handleUpdateSection({
            ...sectionToRename,
            title: newTitle,
        });

        setSectionToRename(null);
        return true;
    };

    const handleUpdateSection = (section: Section) => {
        if (isSharedSectionFunc(section)) {
            updateShareSection(section.id, section);
        } else if (currentPage) {
            updateSection(currentPage, section.id, section);
        }
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!active || !over || active.id === over.id || !currentPageData || !currentPage) return;

        const regularSections = currentPageData.sections.filter(section => section.type !== SectionType.HEADER && section.type !== SectionType.FOOTER);

        const oldIndex = regularSections.findIndex(section => section.id === active.id);
        const newIndex = regularSections.findIndex(section => section.id === over.id);

        if (oldIndex === undefined || newIndex === undefined) return;

        const newRegularSections = arrayMove(regularSections, oldIndex, newIndex);
        const updatedRegularSections = newRegularSections.map((section, index) => ({
            ...section,
            order: index,
        }));

        // Update the page with all sections (header, reordered regular sections, and footer)
        const headerSection = currentPageData.sections.find(s => s.type === SectionType.HEADER);
        const footerSection = currentPageData.sections.find(s => s.type === SectionType.FOOTER);

        const allSections = [...(headerSection ? [headerSection] : []), ...updatedRegularSections, ...(footerSection ? [footerSection] : [])];

        updatePage(currentPage, { sections: allSections });
    };

    if (!currentVersion) {
        return <div className="p-4 text-center text-gray-500">Loading...</div>;
    }

    if (!currentPage) {
        return <div className="p-4 text-center text-gray-500">Select a page to manage sections</div>;
    }

    // Get header and footer sections
    const headerSection = currentPageData?.sections.find(s => s.type === SectionType.HEADER);
    const footerSection = currentPageData?.sections.find(s => s.type === SectionType.FOOTER);
    const shareHeaderSection = currentVersion?.shareSections.find(s => s.type === SectionType.HEADER);
    const shareFooterSection = currentVersion?.shareSections.find(s => s.type === SectionType.FOOTER);
    const shareNavigationSection = currentVersion?.shareSections.find(s => s.type === SectionType.NAVIGATION);

    const isVisibleShareFooter = shareFooterSection && !shareFooterSection.params.extend.notSharePages?.includes(currentPageData?.path ?? '');

    const navigationWidgets = shareNavigationSection?.params?.extend?.widgets || [];
    const navigationPaths = navigationWidgets.filter((w: any) => w.visible && w.path).map((w: any) => w.path);

    const isNavigationVisible = currentPageData && (currentPageData.isHome || (navigationPaths.length > 0 && navigationPaths.includes(currentPageData.path)));

    // Get regular sections for drag and drop
    const regularSections =
        currentPageData?.sections
            .filter(section => section.type !== SectionType.HEADER && section.type !== SectionType.FOOTER && section.type !== SectionType.PLAYER)
            .sort((a, b) => a.order - b.order) || [];

    return (
        <div className="p-4 max-h-[calc(100vh-64px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Sections</h2>
            </div>

            <div className="space-y-2">
                {/* Header Section */}
                {currentPageData?.isHome && headerSection && (
                    <div
                        className={`flex items-center p-2 rounded-lg border border-gray-200 cursor-pointer ${
                            currentSection?.id === headerSection?.id ? 'bg-[#EEF2FF] text-[#6366F1] border-[#6366F1]' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => headerSection && handleSectionClick(headerSection)}
                    >
                        <button onClick={e => handleToggleVisibility(e, headerSection)} className="mr-2 text-gray-500 hover:text-gray-700">
                            {headerSection.isHidden ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                        </button>
                        <span className="flex-1">Header</span>
                    </div>
                )}
                {currentPageData?.isHome && !headerSection && shareHeaderSection && (
                    <div
                        className={`flex items-center p-2 rounded-lg border border-gray-200 cursor-pointer ${
                            currentSection?.id === shareHeaderSection?.id ? 'bg-[#EEF2FF] text-[#6366F1] border-[#6366F1]' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => shareHeaderSection && handleSectionClick(shareHeaderSection)}
                    >
                        <button onClick={e => handleToggleVisibility(e, shareHeaderSection)} className="mr-2 text-gray-500 hover:text-gray-700">
                            {shareHeaderSection.isHidden ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                        </button>
                        <span className="flex-1">Header</span>
                    </div>
                )}

                {/* Player Section for Playlist */}
                {currentPageData?.type === 'playlist' && (
                    <div className="space-y-2">
                        {currentPageData.sections
                            .filter(s => s.type === SectionType.PLAYER)
                            .map(section => (
                                <div
                                    key={section.id}
                                    className={`flex items-center p-2 rounded-lg border border-gray-200 cursor-pointer ${
                                        currentSection?.id === section.id ? 'bg-[#EEF2FF] text-[#6366F1] border-[#6366F1]' : 'hover:bg-gray-50'
                                    }`}
                                    onClick={() => handleSectionClick(section)}
                                >
                                    <button className="mr-2 text-gray-500">
                                        <IconPlayerPlay size={16} />
                                    </button>
                                    <span className="flex-1">{section.title || 'Player'}</span>
                                </div>
                            ))}
                    </div>
                )}

                {/* Regular Sections */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={regularSections} strategy={verticalListSortingStrategy}>
                        {regularSections.map((section: Section) => (
                            <SectionItem
                                key={section.id}
                                section={section}
                                isSelected={currentSection?.id === section.id}
                                onToggleVisibility={handleToggleVisibility}
                                onDuplicate={handleDuplicateSection}
                                onDelete={handleDeleteSection}
                                onRename={handleRenameSection}
                                onClick={handleSectionClick}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                {/* Add Section Button */}
                {currentPageData?.type !== 'playlist' && (
                    <div className="relative">
                        <Menu>
                            <Menu.Target>
                                <button className="w-full p-2 text-left hover:bg-gray-100 rounded-lg border border-gray-200 flex items-center">
                                    <IconPlus size={16} className="mr-2" />
                                    <span>Add Section</span>
                                </button>
                            </Menu.Target>
                            <SectionTypeSelector onSelect={handleAddSection} />
                        </Menu>
                    </div>
                )}

                {/* Footer Section */}
                {currentPageData?.isHome && footerSection && (
                    <div
                        className={`flex items-center p-2 rounded-lg border border-gray-200 cursor-pointer ${
                            currentSection?.id === footerSection?.id ? 'bg-[#EEF2FF] text-[#6366F1] border-[#6366F1]' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => footerSection && handleSectionClick(footerSection)}
                    >
                        <button onClick={e => handleToggleVisibility(e, footerSection)} className="mr-2 text-gray-500 hover:text-gray-700">
                            {footerSection.isHidden ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                        </button>
                        <span className="flex-1">Footer</span>
                    </div>
                )}

                {currentPageData?.isHome && !footerSection && shareFooterSection && isVisibleShareFooter && (
                    <div
                        className={`flex items-center p-2 rounded-lg border border-gray-200 cursor-pointer ${
                            currentSection?.id === shareFooterSection?.id ? 'bg-[#EEF2FF] text-[#6366F1] border-[#6366F1]' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => shareFooterSection && handleSectionClick(shareFooterSection)}
                    >
                        <button onClick={e => handleToggleVisibility(e, shareFooterSection)} className="mr-2 text-gray-500 hover:text-gray-700">
                            {shareFooterSection.isHidden ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                        </button>
                        <span className="flex-1">Footer</span>
                    </div>
                )}

                {/* Navigation Section */}
                {shareNavigationSection && isNavigationVisible && (
                    <div
                        className={`flex items-center p-2 rounded-lg border border-gray-200 cursor-pointer ${
                            currentSection?.id === shareNavigationSection?.id ? 'bg-[#EEF2FF] text-[#6366F1] border-[#6366F1]' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => shareNavigationSection && handleSectionClick(shareNavigationSection)}
                    >
                        <button onClick={e => handleToggleVisibility(e, shareNavigationSection)} className="mr-2 text-gray-500 hover:text-gray-700">
                            {shareNavigationSection.isHidden ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                        </button>
                        <span className="flex-1">Navigation</span>
                    </div>
                )}
            </div>

            {/* Rename Modal */}
            <InputModal
                opened={!!sectionToRename}
                onClose={() => setSectionToRename(null)}
                onSubmit={handleRenameSectionConfirm}
                title="Rename Section"
                placeholder="Enter section name"
                initialValue={sectionToRename?.title || ''}
            />
        </div>
    );
};

export default SectionList;
