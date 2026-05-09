import { Section, SectionType } from '@/types/editor';
import CarouselSection from './carousel-section';
import FeatureSection from './feature-section';
import FooterNavigation from './footer-navigation';
import FooterSection from './footer-section';
import GridSection from './grid-section';
import HeaderSection from './header-section';
import ListSection from './list-section';
import ScrollSection from './scroll-section';
import TemplateSection from './template-create-section';
import CreateSection from './create-section';

interface SectionComponentProps {
    section: Section;
    pageId: string;
}

type SectionComponent = React.FC<SectionComponentProps>;

const PlayerPlaceholder: SectionComponent = ({ section }) => (
    <div className="w-full aspect-video bg-gray-900 flex items-center justify-center text-gray-500 border-b border-gray-800">
        <span className="text-sm font-medium">Player Section: {section.title}</span>
    </div>
);

export const SectionComponents: Record<SectionType, SectionComponent> = {
    [SectionType.HEADER]: HeaderSection,
    [SectionType.FOOTER]: FooterSection,
    [SectionType.FEATURE]: FeatureSection,
    [SectionType.CAROUSEL]: CarouselSection,
    [SectionType.SCROLL]: ScrollSection,
    [SectionType.LIST]: ListSection,
    [SectionType.GRID]: GridSection,
    [SectionType.COLUMN]: GridSection, // 使用 GridSection 作为默认的 Column 布局
    [SectionType.NAVIGATION]: FooterNavigation,
    [SectionType.CREATE]: CreateSection,
    [SectionType.TEMPLATE_CREATE]: TemplateSection,
    [SectionType.PLAYER]: PlayerPlaceholder,
};
