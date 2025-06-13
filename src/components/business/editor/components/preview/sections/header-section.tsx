'use client';

import React from 'react';
import { Section } from '@/types/editor';
import BaseSection from '../common/base-section';
import Image from 'next/image';

interface HeaderSectionProps {
    section: Section;
    pageId: string;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ section, pageId }) => {
    const logo = section.params.extend.widgets?.find(widget => widget.type === 'logo');
    const menu = section.params.extend.widgets?.find(widget => widget.type === 'menu');

    return (
        <BaseSection section={section} pageId={pageId}>
            <div className="flex items-center justify-between p-4 bg-black">
                <div className="flex items-center">
                    {logo && (
                        <div className="w-8 h-8">
                            <Image 
                                src={logo.data.url || '/logo.png'} 
                                alt="Logo" 
                                width={32} 
                                height={32}
                                className="object-contain"
                            />
                        </div>
                    )}
                    <span className="ml-2 text-white text-xl font-bold">Dramahub</span>
                </div>
                <div className="flex items-center space-x-4">
                    {menu?.data?.items?.map((item: any, index: number) => (
                        <a 
                            key={index} 
                            href={item.link} 
                            className="text-white hover:text-gray-300"
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            </div>
        </BaseSection>
    );
};

export default HeaderSection; 