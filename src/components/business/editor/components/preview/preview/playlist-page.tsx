'use client';

import React, { useEffect, useState } from 'react';
import { Page, Section, SectionType } from '@/types/editor';
import { SectionComponents } from '../sections';
import SwiperPlaylist from '../swiper-playlist';
import { IVideo } from '@/types/video';
import HeaderSection from '../sections/header-section';
import useEditorStore from '@/store/useEditorStore';
import { fetchPlaylistFeed } from '@/api';

interface PlaylistPageProps {
    page: Page;
    isPreview?: boolean;
}

const PlaylistPage: React.FC<PlaylistPageProps> = ({ page, isPreview = false }) => {
    const [playlist, setPlaylist] = useState<IVideo[]>([]);
    const [previewWidth, setPreviewWidth] = useState(0);
    const { currentVersion, currentPage,editWebsite } = useEditorStore();

    // Calculate preview width based on height and iPhone 15's aspect ratio (19.5:9)
    useEffect(() => {
        const updatePreviewWidth = () => {
            const containerHeight = window.innerHeight;
            // iPhone 15 aspect ratio is 19.5:9
            // If container height is h, then width should be (h * 9 / 19.5)
            const width = Math.min(500, Math.floor(containerHeight * 9 / 19.5));
            setPreviewWidth(width);
        };

        updatePreviewWidth();
        window.addEventListener('resize', updatePreviewWidth);
        return () => window.removeEventListener('resize', updatePreviewWidth);
    }, []);


    useEffect(() => {
        fetchPlaylistFeed(1,editWebsite?.path??'').then(res => {
            setPlaylist(res?.items??[]);
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

    if(!headerSection){
       headerSection = currentPageData.sections.find((section: Section) => section.type === SectionType.HEADER);
    }
    if(!footerSection){
        footerSection = currentPageData.sections.find((section: Section) => section.type === SectionType.FOOTER);
    }

    
    return (
        <div className="h-full w-full flex justify-center items-center">
        <div 
            className="h-full overflow-auto  bg-black"
            style={{ 
                width: `${previewWidth}px`,
                maxHeight: '100vh'
            }}
        >
           
           <div className='relative w-full h-full'>
                    <div className="absolute top-0 left-0 w-full z-10">
                        <HeaderSection section={headerSection!} pageId={currentPage} />
                    </div>
                    <div className="h-full">
                        <SwiperPlaylist playlist={playlist} />
                    </div>
              </div>
      
        </div>
        </div>
    );
};

export default PlaylistPage; 