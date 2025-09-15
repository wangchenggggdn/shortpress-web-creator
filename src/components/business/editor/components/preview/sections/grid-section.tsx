'use client';

import React, { useEffect, useState } from 'react';
import { Section } from '@/types/editor';
import BaseSection from '../common/base-section';
import Image from 'next/image';
import CacheLazyImage from '@/components/common/cache-lazy-image';

interface GridSectionProps {
    section: Section;
    pageId: string;
}

const GridSection: React.FC<GridSectionProps> = ({ section, pageId }) => {
    const items = [
        { id: 'placeholder-1', title: 'Placeholder 1' },
        { id: 'placeholder-2', title: 'Placeholder 2' },
        { id: 'placeholder-3', title: 'Placeholder 3' },
        { id: 'placeholder-4', title: 'Placeholder 4' },
        { id: 'placeholder-5', title: 'Placeholder 5' },
        { id: 'placeholder-6', title: 'Placeholder 6' }
    ];
    const [currentItems, setCurrentItems] = useState<any>(items);

    useEffect(() => {
        if ((section.params.extend.widgets?.[0]?.data || []).length > 0) {
            setCurrentItems(section.params.extend.widgets?.[0]?.data || []);
        } else {
            setCurrentItems(items);
        }
    }, [section.params.extend.widgets]);

    return (
        <BaseSection section={section} pageId={pageId}>
            <div className="px-4 pb-4">
                <h2 className="text-2xl font-bold text-white mb-4">{section.title}</h2>
                <div className="grid grid-cols-3 gap-2">
                    {currentItems.map((item: any, index: number) => (
                        <div key={index}>
                          <div >
                            <div className="relative aspect-[2/3] bg-gray-500 rounded-lg overflow-hidden">
                                {item.cover && <CacheLazyImage
                                    src={item.cover || '/placeholder.png'}
                                    alt={item.title || 'Grid item'}
                                    className="w-full h-full object-cover"
                                />}
                            </div>
                            <div className="pt-1">
                                    <h3 className="text-gray-400 text-sm line-clamp-2 break-words">
                                        {item.title || 'Coming Soon'}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </BaseSection>
    );
};

export default GridSection; 