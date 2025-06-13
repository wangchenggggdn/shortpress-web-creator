'use client';

import React from 'react';
import { Section } from '@/types/editor';
import BaseSection from '../common/base-section';
import Image from 'next/image';

interface ListSectionProps {
    section: Section;
    pageId: string;
}

const ListSection: React.FC<ListSectionProps> = ({ section, pageId }) => {
    const title = section.params.extend.title || 'Top Rank';
    const items = section.params.extend.widgets || [];

    return (
        <BaseSection section={section} pageId={pageId}>
            <div className="p-4">
                <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
                <div className="space-y-4">
                    {items.map((item: any, index: number) => (
                        <div key={index} className="flex space-x-4">
                            <div className="relative w-[150px] aspect-[2/3] rounded-lg overflow-hidden">
                                <Image
                                    src={item.data.coverUrl || '/placeholder.png'}
                                    alt={item.data.title || 'List item'}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white text-xl font-medium">{item.data.title}</h3>
                                {item.data.description && (
                                    <p className="text-gray-400 mt-2">{item.data.description}</p>
                                )}
                                <button className="mt-4 px-6 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5]">
                                    Watch Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </BaseSection>
    );
};

export default ListSection; 