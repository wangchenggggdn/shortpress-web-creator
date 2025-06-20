'use client';

import React, { useEffect, useState } from 'react';
import { Section, Widget, WidgetType } from '@/types/editor';
import BaseSection from '../common/base-section';
import useEditorStore from '@/store/useEditorStore';

interface FooterSectionProps {
    section: Section;
    pageId: string;
}

const FooterSection: React.FC<FooterSectionProps> = ({ section, pageId }) => {
    const { editWebsite } = useEditorStore();
    const [currentItem, setCurrentItem] = useState<any>([]);

    useEffect(() => {
        if((section.params.extend.widgets || []).length > 0){
            setCurrentItem(section.params.extend.widgets || []);
        }else{
            setCurrentItem([]);
        }
    }, [section.params.extend.widgets]);


    const getMenuItem = (type: string): any | undefined => {
        return currentItem?.find((item: any) => item.type === type);
    };

    const getFooterItems = (): any[] => {
        const items = currentItem || [];
        return items.filter((item: any) => item.type === WidgetType.PATH);
    };

    const footerItems = getFooterItems();
    const footerText = getMenuItem(WidgetType.DATA);
    const shortPressLogo = getMenuItem(WidgetType.LOGO);

    return (
        <BaseSection section={section} pageId={pageId}>
            <div className="bg-black text-gray-400 p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    {footerItems.map((item: any) => (
                       item.visible && <div className="hover:text-gray-300 text-center" key={item.id}>{item.label}</div>
                    ))}
                </div>
                <div className="text-center text-sm text-gray-400">
                    {footerText&&footerText.visible && <p>{footerText?.data||`© 2025 ${editWebsite?.name}. All Rights reserved`}</p>}
                    {shortPressLogo&&shortPressLogo.visible && <p>{shortPressLogo?.data||'Powered by ShortPress.com'}</p>}
                </div>
            </div>
        </BaseSection>
    );
};

export default FooterSection; 