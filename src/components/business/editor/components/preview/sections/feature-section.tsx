'use client';

import React from 'react';
import { Section } from '@/types/editor';
import BaseSection from '../common/base-section';
import Image from 'next/image';

interface FeatureSectionProps {
    section: Section;
    pageId: string;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ section, pageId }) => {
    const title = section.params.extend.title || 'Feature';
    const items = section.params.extend.widgets || [];

    return (
        <BaseSection section={section} pageId={pageId}>
            <div className="p-4">
                <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
                <div className="relative">
                    <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
                        {items.map((item: any, index: number) => (
                            <div key={index} className="flex-none w-[300px]">
                                <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                                    <Image
                                        src={item.data.coverUrl || '/placeholder.png'}
                                        alt={item.data.title || 'Feature item'}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="mt-2">
                                    <h3 className="text-white font-medium">{item.data.title}</h3>
                                    {item.data.description && (
                                        <p className="text-gray-400 text-sm mt-1">{item.data.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </BaseSection>
    );
};

export default FeatureSection; 