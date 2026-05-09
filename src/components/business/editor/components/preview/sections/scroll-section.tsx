/* eslint-disable @next/next/no-img-element */
'use client';

import { Section } from '@/types/editor';
import { IconChevronRight } from '@tabler/icons-react';
import React, { useEffect, useState, useMemo } from 'react';
import BaseSection from '../common/base-section';

interface ScrollSectionProps {
    section: Section;
    pageId: string;
}

const ScrollSection: React.FC<ScrollSectionProps> = ({ section, pageId }) => {
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
            <div className="pl-4 pb-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white mb-4">{section.title || 'Scroll Section'}</h2>
                    {section.link && (
                        <div className="flex items-center gap-2 pr-4">
                            <p className="text-[#999999] text-xs">View All</p>
                            <IconChevronRight size={16} color="#999999" />
                        </div>
                    )}
                </div>
                <div className="flex overflow-x-auto space-x-4 scrollbar-hide">
                    {currentItem.map((item: any, index: number) => (
                        <div key={index} className="flex-none w-[16vh]">
                            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-500">
                                {item.cover &&
                                    (item.cover.toLowerCase().includes('.webm') ? (
                                        <video src={item.cover} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline />
                                    ) : (
                                        <img src={item.cover} alt={item.title || ''} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                                    ))}
                            </div>
                            <div className="pt-1">
                                <h3 className="text-gray-400 text-sm font-bold truncate">{item.title || 'Coming Soon'}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </BaseSection>
    );
};

export default ScrollSection;
