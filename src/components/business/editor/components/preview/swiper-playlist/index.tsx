import { IVideo } from '@/types/video';
import React from 'react';
import { Swiper } from 'antd-mobile';
import SwiperVideoItem from './swiper-video-item';

interface VideoInfoProps {
    playlist:IVideo[];
}

const SwiperPlaylist: React.FC<VideoInfoProps> = ({playlist}) => {

    return (
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
            {playlist.map((item, index) => (
                <SwiperVideoItem key={index} video={item} />
            ))}
    </Swiper>
    );
};

export default SwiperPlaylist;
