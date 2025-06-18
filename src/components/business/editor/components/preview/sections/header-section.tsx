'use client';

import React from 'react';
import { Section, WidgetType } from '@/types/editor';
import BaseSection from '../common/base-section';
import { IconSearch, IconUser } from '@tabler/icons-react';
import vipIcon from '@/assets/images/preview/vip.webp';
import { Burger, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { InlinedDrawer } from '../common/inlineDrawer'; 
import useEditorStore from '@/store/useEditorStore';

interface HeaderSectionProps {
    section: Section;
    pageId: string;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ section, pageId }) => {
    const { currentWidget } = useEditorStore();
    const menus = section?.params?.extend?.widgets ?? [];
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
    const icon = menus[0];
    const title = menus[1];
    const searc = menus[2];
    const account = menus[3];
    const vip = menus[4];
    const nav = menus[5];

    return (
        <BaseSection section={section} pageId={pageId}>
            <div className="flex items-center justify-between px-4 bg-black">
                <div className="flex flex-row justify-between w-full space-x-4">
                    <div className="flex items-center space-x-2">
                        {icon?.visible && icon?.image && <img src={icon.image} alt={icon.label} width={24} height={24} />}
                        {title?.visible && <span className="text-white text-xl font-bold">{title.label}</span>}
                    </div>
                    <div className="flex items-center gap-4">
                        {searc?.visible && <IconSearch color='white' size={35} className="p-1.5 rounded-full text-gray-500" />}
                        {account?.visible && <IconUser size={16} className="w-6 h-6 p-1.5 rounded-full bg-white text-gray-500" />}
                        {vip?.visible && <img src={vipIcon.src} alt="vip" width={28} height={28} />}
                        <Burger color='white' opened={drawerOpened} onClick={toggleDrawer} aria-label="Toggle navigation" />
                    </div>
                </div>
            </div>

            {currentWidget && currentWidget.id === nav?.id && <div className='z-10'>
                <InlinedDrawer
                        opened={true}
                        onClose={(e)=>{
                            e.stopPropagation();
                            closeDrawer();
                        }}
                        title="Navigation"
                        size="80%"
                        
                    >
                        <div className="p-4"> 
                            <ul className="flex flex-col gap-4 mt-4 text-white">
                                    {nav?.widgets?.slice(1)?.map((widget: any,index:number) => ( // 假设数据在 nav.items
                                        <div key={index}>{widget.label}</div>
                                    ))}
                            </ul>
                         </div>       
                    </InlinedDrawer>
              </div>    
            }
        </BaseSection>
    );
};

export default HeaderSection;