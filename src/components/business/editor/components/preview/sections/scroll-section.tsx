'use client';

import React, { useEffect, useState } from 'react';
import { Section } from '@/types/editor';
import BaseSection from '../common/base-section';
import Image from 'next/image';

interface ScrollSectionProps {
    section: Section;
    pageId: string;
}

const ScrollSection: React.FC<ScrollSectionProps> = ({ section, pageId }) => {
    const items = [
        { id: 'placeholder-1', title: 'Placeholder 1' },
        { id: 'placeholder-2', title: 'Placeholder 2' },
        { id: 'placeholder-3', title: 'Placeholder 3' },
        { id: 'placeholder-4', title: 'Placeholder 4' },
        { id: 'placeholder-5', title: 'Placeholder 5' },
        { id: 'placeholder-6', title: 'Placeholder 6' }
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
                <h2 className="text-2xl font-bold text-white mb-4">{section.title || 'Scroll Section'}</h2>
                <div className="flex overflow-x-auto space-x-4 scrollbar-hide">
                    {currentItem.map((item: any, index: number) => (
                        <div key={index} className="flex-none w-[100px]">
                            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-500">
                                {item.coverUrl && (
                                    <Image
                                        src={item.coverUrl}
                                        alt={item.title || ''}
                                        fill
                                        className="object-cover"
                                    />
                                )}
                            </div>
                            <div className="pt-1">
                                    <h3 className="text-white text-sm font-bold truncate">
                                        {item.title || 'Coming Soon'}
                                    </h3>
                                </div>
                        </div>
                    ))}
                </div>
            </div>
        </BaseSection>
    );
};

export default ScrollSection; 