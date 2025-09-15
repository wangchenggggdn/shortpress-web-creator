import { IVideo } from '@/types/video';
import React from 'react';
import { Swiper } from 'antd-mobile';
import WebsiteVideoPlayer from './video-player';

interface VideoInfoProps {
    playlist:IVideo[];
}

const SwiperPlaylist: React.FC<VideoInfoProps> = ({playlist}) => {
    return (
        <div className='h-full w-full'>
            <Swiper
            style={
                {
                    height: '100%',
                    overflow: 'hidden',
                    '--swiper-transition-duration': '0ms',
                } as any
            }
            direction="vertical"
            loop={false}
            slideSize={100}
            trackOffset={0}
            defaultIndex={0}
            indicator={() => null}
        >
            {playlist.map((video, index) => (
                <Swiper.Item className='' key={index}>
                    <WebsiteVideoPlayer
                        poster={video.playlistCover ?? ''}
                        cover={video.cover ?? ''}
                        title={video.playlistTitle ?? ''}
                        description={video.title}
                    />
                </Swiper.Item>
            ))}
            </Swiper>
        </div>
        
    );
};

export default SwiperPlaylist;
