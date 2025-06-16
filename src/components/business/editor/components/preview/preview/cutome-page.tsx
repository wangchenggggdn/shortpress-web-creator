'use client';

import React, { useEffect, useState } from 'react';
import useEditorStore from '@/store/useEditorStore';
import { Section, SectionType } from '@/types/editor';
import { SectionComponents } from '../sections';
import HeaderSection from '../sections/header-section';
import FooterSection from '../sections/footer-section';
import { Box ,Button,Center, Collapse, Divider, Drawer,ScrollArea, ThemeIcon, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconPlusEqual } from '@tabler/icons-react';

const CustomPage = () => {
    const { currentVersion, currentPage } = useEditorStore();
    const [previewWidth, setPreviewWidth] = useState(0);
    const [drawerOpened, { toggle: toggleDrawer }] = useDisclosure(false);

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

    return (
        <div className="h-full w-full flex justify-center items-center">
            <div 
                className="h-full overflow-auto  bg-black"
                style={{ 
                    width: `${previewWidth}px`,
                    maxHeight: '100vh'
                }}
            >
                {/* Header */}
                <div className="bg-black sticky top-0 z-50">
                    <HeaderSection section={headerSection!} pageId={currentPage} />
                </div>
                {/* Sections */}
                    {currentPageData.sections
                        .sort((a: Section, b: Section) => a.order - b.order)
                        .map((section: Section) => {
                            const SectionComponent = SectionComponents[section.type];
                            if (!SectionComponent) return null;
                            
                            return (
                                <SectionComponent
                                    key={section.id}
                                    section={section}
                                    pageId={currentPage}
                                />
                            );
                        })}

                    {/* Empty State */}
                    {currentPageData.sections.length === 0 && (
                        <div className="flex justify-center items-center h-full">
                            <Button color="primary" leftSection={<IconPlus size={16} />}>
                                Add Section
                            </Button>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="h-[100px]">
                        <FooterSection section={footerSection!} pageId={currentPage} />
                    </div>

                    <Drawer opened={drawerOpened} onClose={toggleDrawer}  size="100%" padding="md" title="Navigation" hiddenFrom="md" zIndex={1000000}>
                       <ScrollArea className="h-100vh pb-5" type="always" mx="-md">
                            <Divider className="mb-4" />
                            <ul className="px-4 flex flex-col gap-4">
                            </ul>
                         </ScrollArea>
                    </Drawer>
             </div>
             
        </div>
    );
};

export default CustomPage;
