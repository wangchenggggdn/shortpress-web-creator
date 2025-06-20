'use client';

import React, { useEffect, useState } from 'react';
import { Section } from '@/types/editor';
import BaseSection from '../common/base-section';
import Image from 'next/image';
import { createUniqueUUID } from '@/utils/public';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import './ant-styles/swiper-feature-style.css';

interface FeatureSectionProps {
    section: Section;
    pageId: string;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ section, pageId }) => {
    const items =  [
        { id: 'placeholder-1', title: 'Placeholder 1' },
        { id: 'placeholder-2', title: 'Placeholder 2' },
        { id: 'placeholder-3', title: 'Placeholder 3' },
        { id: 'placeholder-4', title: 'Placeholder 4' },
        { id: 'placeholder-5', title: 'Placeholder 5' },
        { id: 'placeholder-6', title: 'Placeholder 6' }
    ];
    const [currentItem, setCurrentItem] = useState<any>(items);


    useEffect(() => {
        if((section.params.extend.widgets?.[0]?.data || []).length > 0){
            setCurrentItem(section.params.extend.widgets?.[0]?.data || []);
        }else{
            setCurrentItem(items);
        }
    }, [section.params.extend.widgets]);
    
    return (
        <BaseSection section={section} pageId={pageId}>
        <div className="relative bg-black overflow-hidden">
            <Swiper
                    key={createUniqueUUID([])}
                    // === 关键参数 ===
                    loop={true}
                    centeredSlides={true}
                    slidesPerView={'auto'} // <-- 回到 3！这保证了三列布局。
                    grabCursor={true}
                    className="mySimpleSwiper"      
            >
                {currentItem.map((item: any, index: number) => (
                    <SwiperSlide key={index}>
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-500">
                            {item.cover && (
                                <Image
                                    src={item.cover}
                                    alt={item.title || ''}
                                    fill
                                    className="object-cover"
                                />
                            )}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                                <h3 className="text-white text-sm font-bold line-clamp-2">
                                    {item.title || 'Coming Soon'}
                                </h3>
                                {/* {item.description && (
                                    <p className="text-gray-200 mt-1 text-sm line-clamp-2">
                                        {item.description}
                                    </p>
                                )} */}
                                <button className="w-full mt-2 px-4 py-1.5 bg-[#6366F1] text-white text-sm rounded-lg hover:bg-[#4F46E5]">
                                    Watch Now
                                </button>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    </BaseSection>
    );
};

export default FeatureSection; 