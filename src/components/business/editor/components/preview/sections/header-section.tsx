'use client';

import vipIcon from '@/assets/images/preview/vip.webp';
import useEditorStore from '@/store/useEditorStore';
import { Section } from '@/types/editor';
import { IconSearch } from '@tabler/icons-react';
import React, { useState } from 'react';
import BaseSection from '../common/base-section';
import { Burger, Menu } from '@mantine/core';

interface HeaderSectionProps {
    section: Section;
    pageId: string;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ section, pageId }) => {
    const { currentWidget, setCurrentWidget, editWebsite } = useEditorStore();
    const [menuOpened, setMenuOpened] = useState(false);

    const menus = section?.params?.extend?.widgets ?? [];
    const icon = menus[0];
    const title = menus[1];
    const search = menus[2];
    // const account = menus[3];
    const vip = menus[3];
    const nav = menus[5];
    const navIcon = nav?.widgets?.[0];

    // 当 currentWidget 改变时,控制菜单打开状态
    React.useEffect(() => {
        if (currentWidget && currentWidget.id === nav?.id) {
            setMenuOpened(true);
        } else {
            setMenuOpened(false);
        }
    }, [currentWidget, nav?.id]);

    return (
        <BaseSection section={section} pageId={pageId} isPreview={false}>
            <div className="flex items-center justify-between px-4 bg-gradient-to-b from-black to-transparent">
                <div className="flex flex-row justify-between w-full space-x-4">
                    <div className="flex items-center space-x-2">
                        {icon?.visible && icon?.image && (
                            <div className="w-6 h-6 aspect-square">
                                <img src={icon.image} alt={icon.label} width={24} height={24} className="object-cover w-full h-full rounded-full" />
                            </div>
                        )}
                        {title?.visible && <span className="text-white text-xl font-bold max-w-[200px] truncate">{title.data || editWebsite?.name}</span>}
                    </div>
                    <div className="flex items-center gap-4">
                        {search?.visible && <IconSearch color="white" size={35} className="p-1.5 rounded-full text-gray-500" />}
                        {/* {account?.visible && <IconUser size={16} className="w-6 h-6 p-1.5 rounded-full bg-white text-gray-500" />} */}
                        {vip?.visible && <img src={vipIcon.src} alt="vip" width={28} height={28} />}

                        {/* Nav Menu */}
                        {nav?.visible && navIcon?.visible && nav?.widgets && (
                            <Menu opened={menuOpened && nav.widgets?.slice(1)?.length > 0} onChange={setMenuOpened} position="bottom-end" offset={10} width={200}>
                                <Menu.Target>
                                    <div className="cursor-pointer">
                                        {!navIcon.image && <Burger color="white" aria-label="Toggle navigation" />}
                                        {navIcon.image && <img src={navIcon.image} alt={navIcon.label} width={24} height={24} />}
                                    </div>
                                </Menu.Target>

                                <Menu.Dropdown
                                    style={{
                                        backgroundColor: '#000000',
                                        border: '1px solid #333333',
                                    }}
                                >
                                    {nav.widgets?.slice(1)?.map((widget: any, index: number) =>
                                        widget.visible ? (
                                            <Menu.Item
                                                key={widget.id || index}
                                                style={{
                                                    color: '#ffffff',
                                                    backgroundColor: '#000000',
                                                }}
                                                styles={{
                                                    item: {
                                                        backgroundColor: '#000000',
                                                        '&:hover': {
                                                            backgroundColor: '#000000',
                                                        },
                                                        '&[data-hovered]': {
                                                            backgroundColor: '#000000',
                                                        },
                                                    },
                                                    itemLabel: {
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        maxWidth: '100%',
                                                    },
                                                }}
                                            >
                                                {widget.label}
                                            </Menu.Item>
                                        ) : null
                                    )}
                                </Menu.Dropdown>
                            </Menu>
                        )}
                    </div>
                </div>
            </div>
        </BaseSection>
    );
};

export default HeaderSection;
