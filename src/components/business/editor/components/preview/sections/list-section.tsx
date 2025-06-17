'use client';

import React, { useEffect, useState } from 'react';
import { Section } from '@/types/editor';
import BaseSection from '../common/base-section';
import Image from 'next/image';

interface ListSectionProps {
    section: Section;
    pageId: string;
}

const ListSection: React.FC<ListSectionProps> = ({ section, pageId }) => {
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
                <h2 className="text-2xl font-bold text-white mb-4">{section.title}</h2>
                <div className="space-y-4">
                    {currentItem.map((item: any, index: number) => (
                        <div key={index} className="flex space-x-4">
                            <div className="relative w-[100px] aspect-[2/3] rounded-lg overflow-hidden bg-gray-500">
                           { item.coverUrl && <Image
                                    src={item.coverUrl || '/placeholder.png'}
                                    alt={item.title || 'List item'}
                                    fill
                                    className="object-cover"
                                />
                           } </div>
                            <div className="flex-1 flex flex-col justify-between items-start">
                                <div>
                                    <h3 className="text-white font-medium">{item.title}</h3>
                                    {item.description && (
                                        <p className="text-gray-400 mt-2">{item.description}</p>
                                    )}
                                </div>
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