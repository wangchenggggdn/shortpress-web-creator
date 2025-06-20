import React from 'react';
import { Page } from '@/types/editor';
import CustomPage from './preview/cutome-page';
import PlaylistPage from './preview/playlist-page';
import VideoPage from './preview/video-page';

export enum PreviewType {
    CUSTOM = 'Custom',
    PLAYLIST = 'Playlist',
    VIDEO = 'Video'
}

interface PreviewProps {
    page: Page;
    isPreview?: boolean;
}

type PreviewComponent = React.FC<PreviewProps>;

export const PreviewComponents: Record<PreviewType, PreviewComponent> = {
    [PreviewType.CUSTOM]: CustomPage,
    [PreviewType.PLAYLIST]: PlaylistPage,
    [PreviewType.VIDEO]: VideoPage,
};

const Preview: React.FC<PreviewProps> = ({ page, isPreview = false }) => {
    const getPreviewType = (page: Page): PreviewType => {
        console.error('page', page);
        if (page.type === 'playlist') {
            return PreviewType.PLAYLIST;
        }
        if (page.type === 'video') {
            return PreviewType.VIDEO;
        }
        return PreviewType.CUSTOM;
    };
    if(!page){
        return <div></div>;
    }

    const previewType = getPreviewType(page);
    const PreviewComponent = PreviewComponents[previewType];
    return <PreviewComponent page={page} isPreview={isPreview} />;
};

export default Preview;
