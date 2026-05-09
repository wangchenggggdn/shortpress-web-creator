import { IconPlayerPlayFilled } from '@tabler/icons-react';
import React from 'react';
import VideoInfo from '../video-info';

interface WebsiteVideoPlayerProps {
    poster?: string;
    title?: string;
    description?: string;
    cover?: string;
}

const WebsiteVideoPlayer: React.FC<WebsiteVideoPlayerProps> = ({ poster, title, description, cover }) => {
    return (
        <div className="relative w-full h-full">
            <div className="absolute w-full h-full flex items-center justify-center">
                {cover &&
                    (cover.toLowerCase().includes('.webm') ? (
                        <video src={cover} className="max-w-full max-h-full object-cover" autoPlay muted loop playsInline />
                    ) : (
                        <img className="max-w-full max-h-full object-cover" src={`${cover}?x-oss-process=image/resize,m-lfit,w_540/quality,q_60`} alt="cover" />
                    ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center cursor-pointer">
                <div className="backdrop-blur-md rounded-full gradient-icon-border bg-[rgba(240,240,240,0.3)] p-3">
                    <IconPlayerPlayFilled size={56} className="text-[#22C58F]" />
                </div>
            </div>

            <VideoInfo
                title={title}
                description={description}
                poster={`${poster}?x-oss-process=image/resize,m-lfit,w_160/quality,q_80`}
                cover={`${cover}?x-oss-process=image/resize,m-lfit,w_540/quality,q_60`}
            />
        </div>
    );
};

export default WebsiteVideoPlayer;
