'use client';

import React, { useEffect, useState } from 'react';
import { Page } from '@/types/editor';
import { SectionComponents } from '../sections';
import SwiperPlaylist from '../swiper-playlist';
import { IVideo } from '@/types/video';

interface PlaylistPageProps {
    page: Page;
    isPreview?: boolean;
}

const PlaylistPage: React.FC<PlaylistPageProps> = ({ page, isPreview = false }) => {
    const [playlist, setPlaylist] = useState<IVideo[]>([]);
    useEffect(() => {
        setPlaylist(playlist);
    }, [page]);
    
    return (
        <div className="flex flex-col min-h-screen">
            <SwiperPlaylist playlist={playlist} />
        </div>
    );
};

export default PlaylistPage; 