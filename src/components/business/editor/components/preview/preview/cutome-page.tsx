'use client';

import React, { useEffect, useRef, useState } from 'react';
import useEditorStore from '@/store/useEditorStore';
import { Section, SectionType } from '@/types/editor';
import { SectionComponents } from '../sections';
import HeaderSection from '../sections/header-section';
import FooterSection from '../sections/footer-section';
import { Box ,Button,Center, Collapse, Divider, Drawer,Menu,ScrollArea, ThemeIcon, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconPlusEqual } from '@tabler/icons-react';
import SectionTypeSelector from '../../common/SectionTypeSelector';
import SwiperPlaylist from '../swiper-playlist';

const CustomPage = () => {
    const { currentVersion, currentPage,addSection,currentSection } = useEditorStore();
    const currentSectionRef = useRef<Section | null>(null);
    const [previewWidth, setPreviewWidth] = useState(0);

    // Calculate preview width based on height and iPhone 15's aspect ratio (19.5:9)
    useEffect(() => {
        const updatePreviewWidth = () => {
            const containerHeight = window.innerHeight;
            // iPhone 15 aspect ratio is 19.5:9
            // If container height is h, then width should be (h * 9 / 19.5)
            const width = Math.min(500, Math.floor(containerHeight * 9 / 19.5));
            setPreviewWidth(width);
        };

        updatePreviewWidth();
        window.addEventListener('resize', updatePreviewWidth);
        return () => window.removeEventListener('resize', updatePreviewWidth);
    }, []);

    useEffect(() => {
        if(currentSection&&(currentSectionRef.current?.id!==currentSection.id)){
            console.error('currentSection',currentSection,currentSectionRef.current,currentSectionRef.current?.id!==currentSection.id);
            //scrollToTarget(currentSection.id);
        }
        currentSectionRef.current = currentSection;
    }, [currentSection]);

    const scrollToTarget = (id:string) => { 
        const targetElement = document.getElementById(id);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    if (!currentVersion || !currentPage) {
        return <div className="p-4 text-center text-gray-500">Loading...</div>;
    }

    const currentPageData = currentVersion.pages.find(page => page.id === currentPage);

    if (!currentPageData) {
        return <div className="p-4 text-center text-gray-500">Page not found</div>;
    }

    let headerSection = currentVersion.shareSections.find((section: Section) => section.type === SectionType.HEADER);
    let footerSection = currentVersion.shareSections.find((section: Section) => section.type === SectionType.FOOTER);

    if(!headerSection){
       headerSection = currentPageData.sections.find((section: Section) => section.type === SectionType.HEADER);
    }
    if(!footerSection){
        footerSection = currentPageData.sections.find((section: Section) => section.type === SectionType.FOOTER);
    }

    const handleAddSection = (type: SectionType) => {
        addSection(currentPage, type);
    };

    return (
        <div className=" w-full flex justify-center items-center ">
            <div 
                className="h-[calc(100vh-64px)] overflow-auto bg-black"
                style={{ 
                    width: `${previewWidth}px`,
                }}
            >
            <div className='relative w-full h-full'>
                    <div className="absolute top-0 left-0 w-full z-10">
                         {/* Header */}
                        {headerSection&&!headerSection.isHidden && (
                            <div className="bg-black sticky top-0 z-10" id={`${headerSection.id}`}>
                                <HeaderSection section={headerSection!} pageId={currentPage} />
                            </div>
                        )}
                    </div>
                    <div className="h-full">
                 {/* Sections */}
                {currentPageData.sections
                        .sort((a: Section, b: Section) => a.order - b.order)
                        .map((section: Section) => {
                            const SectionComponent = SectionComponents[section.type];
                            if (!SectionComponent) return null;
                            
                            return (
                               <div id={`${section.id}`} key={section.id}>
                                    <SectionComponent
                                        section={section}
                                        pageId={currentPage}
                                    />
                               </div>
                            );
                        })}

                    {/* Empty State */}
                    <div className={`flex justify-center items-center  ${currentPageData.sections.length === 0 ? 'h-full' : ''}`}>
                        <Menu>
                            <Menu.Target>
                            <Button color="primary" leftSection={<IconPlus size={16} />}>
                                    Add Section
                                </Button>
                            </Menu.Target>
                            <SectionTypeSelector onSelect={handleAddSection} />
                        </Menu>   
                    </div>

                    {/* Footer */}
                    {footerSection&&!footerSection.isHidden && (
                        <div className="bg-black sticky bottom-0 z-10" id={`${footerSection.id}`}>
                            <FooterSection section={footerSection!} pageId={currentPage} />
                        </div>
                    )}
                </div>
              </div>
             </div>
        </div>
    );
};

export default CustomPage;
