'use client';

import React from 'react';
import { Section } from '@/types/editor';
import BaseSection from '../common/base-section';
import Image from 'next/image';

interface GridSectionProps {
    section: Section;
    pageId: string;
}

const GridSection: React.FC<GridSectionProps> = ({ section, pageId }) => {
    const title = section.params.extend.title || 'More Recommend';
    const items = section.params.extend.widgets || [];

    return (
        <BaseSection section={section} pageId={pageId}>
            <div className="p-4">
                <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {items.map((item: any, index: number) => (
                        <div key={index}>
                            <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                                <Image
                                    src={item.data.coverUrl || '/placeholder.png'}
                                    alt={item.data.title || 'Grid item'}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="mt-2">
                                <h3 className="text-white font-medium truncate">{item.data.title}</h3>
                                {item.data.description && (
                                    <p className="text-gray-400 text-sm mt-1 truncate">{item.data.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </BaseSection>
    );
};

export default GridSection; 