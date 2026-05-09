/* eslint-disable @next/next/no-img-element */
'use client';

import { Section } from '@/types/editor';
import { createUniqueUUID } from '@/utils/public';
import React, { useEffect, useState, useMemo } from 'react';
import useUserStore from '@/store/useUserStore';
import { WebTemplate } from '@/types/website';
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/react';
import BaseSection from '../common/base-section';
import './ant-styles/swiper-feature-style.css';

interface FeatureSectionProps {
    section: Section;
    pageId: string;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ section, pageId }) => {
    const userInfo = useUserStore(state => state.userInfo);
    const templateName = userInfo?.website?.templateName;

    const { btnText } = useMemo(() => {
        if (templateName === WebTemplate.SHORT_DRAMA) {
            return { btnText: 'Watch Now' };
        }
        if (templateName === WebTemplate.SORA_APP) {
            return { btnText: 'Try Now' };
        }
        return { btnText: 'Watch Now' };
    }, [templateName]);

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
                <Swiper key={createUniqueUUID([])} loop={true} centeredSlides={true} slidesPerView={'auto'} grabCursor={true}>
                    {currentItem.map((item: any, index: number) => (
                        <SwiperSlide key={index}>
                            <div className="relative h-[50vh] overflow-hidden bg-gray-500">
                                {item.cover &&
                                    (item.cover.toLowerCase().includes('.webm') ? (
                                        <video src={item.cover} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline />
                                    ) : (
                                        <img src={item.cover} alt={item.title || ''} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                                    ))}
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                                    <div className="flex items-center justify-center">
                                        <h3 className="text-white text-base font-medium line-clamp-2 break-words text-center w-[60%]">{item.title || 'Coming Soon'}</h3>
                                    </div>
                                    {/* {item.description && (
                                    <p className="text-gray-200 mt-1 text-sm line-clamp-2">
                                        {item.description}
                                    </p>
                                )} */}
                                    <div className="flex items-center justify-center">
                                        <button className="w-[60%] mt-2 px-4 py-1.5 gradient-button text-lg leading-[20px]">{btnText}</button>
                                    </div>
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
