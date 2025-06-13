import HeaderSection from './header-section';
import FooterSection from './footer-section';
import FeatureSection from './feature-section';
import CarouselSection from './carousel-section';
import ScrollSection from './scroll-section';
import ListSection from './list-section';
import GridSection from './grid-section';
import { Section, SectionType } from '@/types/editor';

interface SectionComponentProps {
    section: Section;
    pageId: string;
}

type SectionComponent = React.FC<SectionComponentProps>;

export const SectionComponents: Record<SectionType, SectionComponent> = {
    [SectionType.HEADER]: HeaderSection,
    [SectionType.FOOTER]: FooterSection,
    [SectionType.FEATURE]: FeatureSection,
    [SectionType.CAROUSEL]: CarouselSection,
    [SectionType.SCROLL]: ScrollSection,
    [SectionType.LIST]: ListSection,
    [SectionType.GRID]: GridSection,
    [SectionType.COLUMN]: GridSection, // 使用 GridSection 作为默认的 Column 布局
}; 