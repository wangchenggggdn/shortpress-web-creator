import React, { useRef, useEffect, useState } from 'react';
import { IconPlayerPlay } from '@tabler/icons-react';
import VideoInfo from '../video-info';


interface WebsiteVideoPlayerProps {
    poster?: string;
    title?: string;
    description?: string;
    cover?: string;
}

const WebsiteVideoPlayer: React.FC<WebsiteVideoPlayerProps> = ({
    poster,
    title,
    description,
    cover,
}) => {
    return <div className="relative w-full h-full">
        <div className='absolute w-full h-full object-cover'>
                <img className='w-full h-full object-cover' src={`${cover}?x-oss-process=image/resize,m-lfit,w_540/quality,q_60`} alt="cover" />
            </div>
        <div className="absolute inset-0 flex items-center justify-center cursor-pointer">
                <div className="bg-black/30 rounded-full p-4">
                    <IconPlayerPlay size={48} className="text-white" />
                </div>
        </div>

    
        <VideoInfo
                title={title}
                description={description}
                poster={`${poster}?x-oss-process=image/resize,m-lfit,w_160/quality,q_80`}
                cover={`${cover}?x-oss-process=image/resize,m-lfit,w_540/quality,q_60`}
            />

</div>
};

export default WebsiteVideoPlayer;
