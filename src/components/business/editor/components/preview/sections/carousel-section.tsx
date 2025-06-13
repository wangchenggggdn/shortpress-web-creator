'use client';

import React from 'react';
import { Section } from '@/types/editor';
import BaseSection from '../common/base-section';
import Image from 'next/image';

interface CarouselSectionProps {
    section: Section;
    pageId: string;
}

const CarouselSection: React.FC<CarouselSectionProps> = ({ section, pageId }) => {
    const items = section.params.extend.widgets || [];

    return (
        <BaseSection section={section} pageId={pageId}>
            <div className="relative aspect-[16/9] bg-black">
                {items.map((item: any, index: number) => (
                    <div 
                        key={index} 
                        className="absolute inset-0"
                        style={{ display: index === 0 ? 'block' : 'none' }}
                    >
                        <div className="relative w-full h-full">
                            <Image
                                src={item.data.coverUrl || '/placeholder.png'}
                                alt={item.data.title || 'Carousel item'}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent">
                                <h3 className="text-white text-2xl font-bold">{item.data.title}</h3>
                                {item.data.description && (
                                    <p className="text-gray-200 mt-2">{item.data.description}</p>
                                )}
                                <button className="mt-4 px-6 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5]">
                                    Watch Now
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </BaseSection>
    );
};

export default CarouselSection; 