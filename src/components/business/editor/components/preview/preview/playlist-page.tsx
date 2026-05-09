'use client';

import { fetchPlaylistFeed } from '@/api';
import useEditorStore from '@/store/useEditorStore';
import { Page, Section, SectionType } from '@/types/editor';
import { IVideo } from '@/types/video';
import React, { useEffect, useState } from 'react';
import FooterNavigation from '../sections/footer-navigation';
import SwiperPlaylist from '../swiper-playlist';

interface PlaylistPageProps {
    page: Page;
    isPreview?: boolean;
}

const PlaylistPage: React.FC<PlaylistPageProps> = ({ page, isPreview = false }) => {
    const [playlist, setPlaylist] = useState<IVideo[]>([]);
    const [previewWidth, setPreviewWidth] = useState(0);
    const { currentVersion, currentPage, editWebsite } = useEditorStore();

    // Calculate preview width based on height and iPhone 15's aspect ratio (19.5:9)
    useEffect(() => {
        const updatePreviewWidth = () => {
            const containerHeight = window.innerHeight;
            // iPhone 15 aspect ratio is 19.5:9
            // If container height is h, then width should be (h * 9 / 19.5)
            const width = Math.min(500, Math.floor((containerHeight * 9) / 19.5));
            setPreviewWidth(width);
        };

        updatePreviewWidth();
        window.addEventListener('resize', updatePreviewWidth);
        return () => window.removeEventListener('resize', updatePreviewWidth);
    }, []);

    useEffect(() => {
        fetchPlaylistFeed(1, editWebsite?.path ?? '').then(res => {
            setPlaylist(res?.items ?? []);
        });
    }, [page]);

    useEffect(() => {
        setPlaylist(playlist);
    }, [page]);

    if (!currentVersion || !currentPage) {
        return <div className="p-4 text-center text-gray-500">Loading...</div>;
    }

    const currentPageData = currentVersion.pages.find(page => page.id === currentPage);
    if (!currentPageData) {
        return <div className="p-4 text-center text-gray-500">Page not found</div>;
    }

    let headerSection = currentVersion.shareSections.find((section: Section) => section.type === SectionType.HEADER);
    let footerSection = currentVersion.shareSections.find((section: Section) => section.type === SectionType.FOOTER);
    let navigationSection = currentVersion.shareSections.find((section: Section) => section.type === SectionType.NAVIGATION);

    if (!headerSection) {
        headerSection = currentPageData.sections.find((section: Section) => section.type === SectionType.HEADER);
    }
    if (!footerSection) {
        footerSection = currentPageData.sections.find((section: Section) => section.type === SectionType.FOOTER);
    }
    if (!navigationSection) {
        navigationSection = currentPageData.sections.find((section: Section) => section.type === SectionType.NAVIGATION);
    }

    const navigationWidgets = navigationSection?.params?.extend?.widgets || [];
    const navigationPaths = navigationWidgets.filter((w: any) => w.visible && w.path).map((w: any) => w.path);
    const isNavigationVisible =
        !!navigationSection && currentPageData && (currentPageData.isHome || (navigationPaths.length > 0 && navigationPaths.includes(currentPageData.path)));

    return (
        <div className="h-full w-full flex flex-col justify-center items-center">
            <div
                className="h-full overflow-auto  bg-black"
                style={{
                    width: `${previewWidth}px`,
                    maxHeight: '100vh',
                }}
            >
                <div className="relative w-full h-full">
                    <SwiperPlaylist playlist={playlist} />
                </div>
            </div>
            <div
                className="sticky left-0 bottom-0 z-10"
                style={{
                    width: `${previewWidth}px`,
                }}
            >
                {isNavigationVisible && <FooterNavigation section={navigationSection!} pageId={currentPage} />}
            </div>
        </div>
    );
};

export default PlaylistPage;
