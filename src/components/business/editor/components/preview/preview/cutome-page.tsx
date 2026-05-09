'use client';

import useEditorStore from '@/store/useEditorStore';
import { Section, SectionType } from '@/types/editor';
import { Button, Menu, ScrollArea } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import SectionTypeSelector from '../../common/SectionTypeSelector';
import { SectionComponents } from '../sections';
import FooterNavigation from '../sections/footer-navigation';
import FooterSection from '../sections/footer-section';
import HeaderSection from '../sections/header-section';
import styles from './style.module.css';

const CustomPage = () => {
    const { currentVersion, currentPage, addSection, currentSection } = useEditorStore();
    const currentSectionRef = useRef<Section | null>(null);
    const [previewWidth, setPreviewWidth] = useState(0);

    // Calculate preview width based on height and iPhone 15's aspect ratio (19.5:9)
    useEffect(() => {
        const updatePreviewWidth = () => {
            const containerHeight = window.innerHeight;
            // iPhone 15 aspect ratio is 19.5:9
            // If container height is h, then width should be (h * 9 / 19.5)
            const width = Math.min(500, Math.floor((containerHeight * 9) / 19.5));
            setPreviewWidth(width);
        };

        updatePreviewWidth();
        window.addEventListener('resize', updatePreviewWidth);
        return () => window.removeEventListener('resize', updatePreviewWidth);
    }, []);

    useEffect(() => {
        // if(currentSection&&(currentSectionRef.current?.id!==currentSection.id)){
        //     scrollToTarget(currentSection.id);
        // }
        currentSectionRef.current = currentSection;
    }, [currentSection]);

    if (!currentVersion || !currentPage) {
        return <div className="p-4 text-center text-gray-500">Loading...</div>;
    }

    const currentPageData = currentVersion.pages.find(page => page.id === currentPage);

    if (!currentPageData) {
        return <div className="p-4 text-center text-gray-500">Page not found</div>;
    }

    let headerSection = currentVersion.shareSections.find((section: Section) => section.type === SectionType.HEADER);
    let footerSection = currentVersion.shareSections.find((section: Section) => section.type === SectionType.FOOTER);
    let navigationSection = currentVersion.shareSections.find((section: Section) => section.type === SectionType.NAVIGATION);

    if (!headerSection) {
        headerSection = currentPageData.sections.find((section: Section) => section.type === SectionType.HEADER);
    }
    if (!footerSection) {
        footerSection = currentPageData.sections.find((section: Section) => section.type === SectionType.FOOTER);
    }
    if (!navigationSection) {
        navigationSection = currentPageData.sections.find((section: Section) => section.type === SectionType.NAVIGATION);
    }

    const handleAddSection = (type: SectionType) => {
        addSection(currentPage, type);
    };

    const navigationWidgets = navigationSection?.params?.extend?.widgets || [];
    const navigationPaths = navigationWidgets.filter((w: any) => w.visible && w.path).map((w: any) => w.path);
    const isNavigationVisible =
        !!navigationSection && currentPageData && (currentPageData.isHome || (navigationPaths.length > 0 && navigationPaths.includes(currentPageData.path)));

    return (
        <div className="w-full flex justify-center items-center">
            <div className="relative h-full">
                <div className="sticky top-0 left-0 w-full z-30">
                    {/* Header */}
                    {currentPageData.isHome && headerSection && !headerSection.isHidden && (
                        <div className="bg-black sticky top-0 z-10" id={`${headerSection.id}`}>
                            <HeaderSection section={headerSection!} pageId={currentPage} />
                        </div>
                    )}
                </div>
                <div className="h-full relative">
                    <ScrollArea
                        className="h-[calc(100vh-110px)] overflow-auto bg-black"
                        type="never"
                        classNames={{ viewport: styles['custom-scroll'] }}
                        style={{ width: `${previewWidth}px` }}
                    >
                        {/* Sections */}
                        {currentPageData.sections
                            .sort((a: Section, b: Section) => a.order - b.order)
                            .map((section: Section) => {
                                const SectionComponent = SectionComponents[section.type];
                                if (!SectionComponent) return null;

                                return (
                                    <div id={`${section.id}`} key={section.id}>
                                        <SectionComponent section={section} pageId={currentPage} />
                                    </div>
                                );
                            })}

                        {/* Empty State */}
                        <div className={`flex justify-center items-center pb-20 ${currentPageData.sections.length === 0 ? 'h-full' : ''}`}>
                            <Menu>
                                <Menu.Target>
                                    <Button color="primary" leftSection={<IconPlus size={16} />}>
                                        Add Section
                                    </Button>
                                </Menu.Target>
                                <SectionTypeSelector onSelect={handleAddSection} />
                            </Menu>
                        </div>

                        {/* Footer Section (inside scroll area) */}
                        {currentPageData.isHome && footerSection && !footerSection.isHidden && (
                            <div className="bg-black pb-16" id={`${footerSection.id}`}>
                                <FooterSection section={footerSection!} pageId={currentPage} />
                            </div>
                        )}
                    </ScrollArea>

                    {/* Footer Navigation (fixed at bottom, outside scroll area) */}
                    {isNavigationVisible && (
                        <div className="absolute bottom-0 left-0 right-0 z-20 bg-black" style={{ width: `${previewWidth}px` }}>
                            <FooterNavigation section={navigationSection!} pageId={currentPage} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomPage;
