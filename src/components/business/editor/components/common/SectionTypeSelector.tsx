import React from 'react';
import { Menu } from '@mantine/core';
import { SectionType } from '@/types/editor';
import section_feature from '@/assets/images/section/section_feature.webp';
import section_carousel from '@/assets/images/section/section_carousel.webp';
import section_scroll from '@/assets/images/section/section_scroll.webp';
import section_grid from '@/assets/images/section/section_grid.webp';
import section_list from '@/assets/images/section/section_list.webp';

interface SectionTypeSelectorProps {
    onSelect: (type: SectionType) => void;
}

const SectionTypeSelector: React.FC<SectionTypeSelectorProps> = ({ onSelect }) => {
    const sectionTypes = [
        { type: SectionType.FEATURE, icon: section_feature, label: 'Feature' },
        { type: SectionType.CAROUSEL, icon: section_carousel, label: 'Carousel' },
        { type: SectionType.SCROLL, icon: section_scroll, label: 'Scroll' },
        { type: SectionType.GRID, icon: section_grid, label: 'Grid' },
        { type: SectionType.LIST, icon: section_list, label: 'List' }
    ];

    return (
        <Menu.Dropdown>
            {sectionTypes.map(({ type, icon, label }) => (
                <Menu.Item
                    key={type}
                    rightSection={<img src={icon.src} alt={label} className="w-20 h-12" />}
                    onClick={() => onSelect(type)}
                >
                    {label}
                </Menu.Item>
            ))}
        </Menu.Dropdown>
    );
};

export default SectionTypeSelector; 