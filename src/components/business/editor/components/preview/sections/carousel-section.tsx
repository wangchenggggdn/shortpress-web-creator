/* eslint-disable @next/next/no-img-element */
'use client';

import { Section } from '@/types/editor';
import { createUniqueUUID } from '@/utils/public';
import React, { useEffect, useState, useMemo } from 'react';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import BaseSection from '../common/base-section';
import './ant-styles/swiper-carousel-style.css';

interface CarouselSectionProps {
    section: Section;
    pageId: string;
}

const CarouselSection: React.FC<CarouselSectionProps> = ({ section, pageId }) => {
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
            <div className="relative bg-black overflow-hidden">
                <Swiper
                    key={createUniqueUUID([])}
                    modules={[Autoplay]}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    loop
                    centeredSlides
                    slidesPerView={3}
                    grabCursor
                    className="mySimpleSwiper"
                >
                    {currentItem.map((item: any, index: number) => (
                        <SwiperSlide key={item.id || index}>
                            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-500">
                                {item.cover &&
                                    (item.cover.toLowerCase().includes('.webm') ? (
                                        <video src={item.cover} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline />
                                    ) : (
                                        <img src={item.cover} alt={item.title || ''} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                                    ))}
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </BaseSection>
    );
};

export default CarouselSection;
