/* eslint-disable @next/next/no-img-element */
'use client';

import { Section } from '@/types/editor';
import { IconChevronRight } from '@tabler/icons-react';
import React, { useEffect, useState, useMemo } from 'react';
import BaseSection from '../common/base-section';
import useUserStore from '@/store/useUserStore';
import { WebTemplate } from '@/types/website';

interface ListSectionProps {
    section: Section;
    pageId: string;
}

const ListSection: React.FC<ListSectionProps> = ({ section, pageId }) => {
    const userInfo = useUserStore(state => state.userInfo);
    const templateName = userInfo?.website?.templateName;

    const { btnText } = useMemo(() => {
        if (templateName === WebTemplate.SHORT_DRAMA) {
            return { btnText: 'Watch Now' };
        }
        if (templateName === WebTemplate.SORA_APP) {
            return { btnText: 'Try Now' };
        }
        return { btnText: 'Watch Now' };
    }, [templateName]);

    const items = [
        { id: 'placeholder-1', title: `Sample Data 1` },
        { id: 'placeholder-2', title: `Sample Data 2` },
        { id: 'placeholder-3', title: `Sample Data 3` },
        { id: 'placeholder-4', title: `Sample Data 4` },
        { id: 'placeholder-5', title: `Sample Data 5` },
        { id: 'placeholder-6', title: `Sample Data 6` },
    ];

    const [currentItem, setCurrentItem] = useState<any>(items);

    useEffect(() => {
        if ((section.params.extend.widgets?.[0]?.data || []).length > 0) {
            setCurrentItem(section.params.extend.widgets?.[0]?.data || []);
        } else {
            setCurrentItem(items);
        }
    }, [section.params.extend.widgets]);

    return (
        <BaseSection section={section} pageId={pageId}>
            <div className="px-4 pb-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white mb-4">{section.title}</h2>
                    {section.link && (
                        <div className="flex items-center gap-2">
                            <p className="text-[#999999] text-xs">View All</p>
                            <IconChevronRight size={16} color="#999999" />
                        </div>
                    )}
                </div>
                <div className="space-y-4">
                    {currentItem.map((item: any, index: number) => (
                        <div key={index} className="flex space-x-4">
                            <div className="relative w-[100px] aspect-[2/3] rounded-lg overflow-hidden bg-gray-500">
                                {item.cover &&
                                    (item.cover.toLowerCase().includes('.webm') ? (
                                        <video src={item.cover} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline />
                                    ) : (
                                        <img
                                            src={item.cover || '/placeholder.png'}
                                            alt={item.title || 'List item'}
                                            className="absolute inset-0 h-full w-full object-cover"
                                            loading="lazy"
                                        />
                                    ))}
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div className="flex flex-col justify-between items-start">
                                    <h3 className="text-white font-medium line-clamp-2">{item.title}</h3>
                                    {item.description && <p className="text-gray-400 mt-2 line-clamp-3">{item.description}</p>}
                                </div>
                                <div className="flex justify-end">
                                    <button className="mt-4 px-6 py-2 gradient-button">{btnText}</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </BaseSection>
    );
};

export default ListSection;
