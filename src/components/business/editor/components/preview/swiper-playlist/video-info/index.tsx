import React from 'react';
import { IconMaximize, IconMinimize, IconChevronRight } from '@tabler/icons-react';
import DefultImage from '@/components/common/defult-image';
import { Slider } from '@mantine/core';

interface VideoInfoProps {
    title?: string;
    description?: string;
    poster?: string;
    cover?: string;
}

const VideoInfo: React.FC<VideoInfoProps> = ({
    title,
    description,
    poster,
    cover,
}) => {
    
    return (
        <div className="h-full w-full">
            <div className="absolute bottom-0 left-0 right-0 p-4">
   
            <div className="flex flex-row items-center justify-start gap-3">
                        <div className="w-12 h-20 flex-shrink-0 rounded-md overflow-hidden cursor-pointer">
                            <DefultImage poster={poster??''} classNameSize="w-full h-full" />
                        </div>

                        <div className="flex-1 flex flex-row gap-2">
                            <h2 className="text-white text-sm font-medium cursor-pointer gap-2">
                                <span className={`max-w-[calc(100vw-140px)] break-words line-clamp-2 inline-block`}>
                                    {title}
                                </span>
                            </h2>
                        </div>
            </div>


                <div>
                    <button
                        className="w-full mt-4 mb-2 py-2 px-4 bg-primary/20 hover:bg-primary/30 rounded-full flex items-center justify-between text-white text-sm font-medium transition-colors"
                    >
                        <span>Watch Full Episodes</span>
                        <IconChevronRight size={18} />
                    </button>
                    <div className="flex flex-row items-center gap-2">
                        <div className='flex-1'>
                            <Slider
                                value={0}
                                styles={{
                                    thumb: {
                                        display: 'none',
                                    },
                                    track: {
                                        height: 2,
                                    },
                                }}
                            />
                        </div>
                        <button 
                           
                            className="text-white/80 hover:text-white transition-colors"
                        >
                             <IconMinimize size={20} /> 
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoInfo;
