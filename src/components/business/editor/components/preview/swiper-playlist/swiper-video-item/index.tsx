import React from 'react';

import { IconChevronRight } from '@tabler/icons-react';
import { IVideo } from '@/types/video';
import WebsiteVideoPlayer from '../video-player';

interface SwiperVideoItemProps {
    video: IVideo;
}

const SwiperVideoItem: React.FC<SwiperVideoItemProps> = ({
    video,
}) => {

    return (
        <WebsiteVideoPlayer
            poster={video.playlistCover ?? ''}
            cover={video.cover ?? ''}
            title={video.playlistTitle ?? ''}
            description={video.title}
        />
    );
};

export default SwiperVideoItem;
