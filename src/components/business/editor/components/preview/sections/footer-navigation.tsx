'use client';

import IconForYou from '@/components/svg-icon/IconForYou/idnex';
import IconForYouFilled from '@/components/svg-icon/IconFOrYouFilled/idnex';
import IconHome from '@/components/svg-icon/IconHome';
import IconHomeFilled from '@/components/svg-icon/IconHomeFilled';
import IconTime from '@/components/svg-icon/IconTime/idnex';
import IconTimeFilled from '@/components/svg-icon/IconTimeFilled/idnex';
import IconUser from '@/components/svg-icon/IconUser/idnex';
import IconUserFilled from '@/components/svg-icon/IconUserFilled/idnex';
import { IconPlus } from '@tabler/icons-react';
import { Section, WidgetType, SectionType } from '@/types/editor';
import useEditorStore from '@/store/useEditorStore';
import React, { useEffect, useMemo, useState } from 'react';
import style from './style.module.css';
import IconCreate from '@/components/svg-icon/IconCreate';
import IconCreateFilled from '@/components/svg-icon/IconCreateFilled';

interface FooterNavigationProps {
    section: Section;
    pageId: string;
}

const FooterNavigation: React.FC<FooterNavigationProps> = ({ section, pageId }) => {
    const [currentItem, setCurrentItem] = useState<any>([]);
    const [activeTab, setActiveTab] = useState<string>('Home');

    const { currentVersion } = useEditorStore();

    const dataSource = useMemo(() => {
        const shared = currentVersion?.shareSections?.find(s => s.type === SectionType.NAVIGATION);
        return shared || section;
    }, [currentVersion?.shareSections, section]);

    useEffect(() => {
        if (dataSource?.params?.extend?.widgets && dataSource.params.extend.widgets.length > 0) {
            setCurrentItem(dataSource.params.extend.widgets || []);
        } else {
            setCurrentItem([]);
        }
    }, [dataSource?.params?.extend?.widgets]);

    if (!dataSource) return null;

    const getNavigationItems = (): any[] => {
        const items = currentItem || [];
        return items.filter((item: any) => item.type === WidgetType.PATH);
    };

    const navigationItems = getNavigationItems();

    const colCount = useMemo(() => {
        return navigationItems.filter((item: any) => item.visible).length;
    }, [navigationItems]);

    const iconMap: Record<string, { active: React.ComponentType<any>; inactive: React.ComponentType<any> }> = {
        'For you': {
            active: IconForYouFilled,
            inactive: IconForYou,
        },
        History: {
            active: IconTimeFilled,
            inactive: IconTime,
        },
        Personal: {
            active: IconUserFilled,
            inactive: IconUser,
        },
        Home: {
            active: IconHomeFilled,
            inactive: IconHome,
        },
        Create: {
            active: IconCreateFilled,
            inactive: IconCreate,
        },
    };

    return (
        <div className={`bg-[#25262B] ${style['gradient-border']}`}>
            <div className="grid" style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}>
                {navigationItems.map((item: any) => {
                    if (!item.visible) return null;
                    const iconSet = iconMap[item.label] || iconMap['Home'];
                    const IconComponent = item.label === activeTab ? iconSet.active : iconSet.inactive;
                    return (
                        <button key={item.id} onClick={() => setActiveTab(item.label)} className="flex flex-col items-center justify-center gap-1 transition-colors pb-4 pt-2">
                            <div className={item.label === activeTab ? 'text-[#22C58F]' : 'text-white/70'}>
                                <IconComponent size={24} />
                            </div>
                            <span className={`text-xs ${item.label === activeTab ? 'text-[#22C58F]' : 'text-white/70'}`}>{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default FooterNavigation;
