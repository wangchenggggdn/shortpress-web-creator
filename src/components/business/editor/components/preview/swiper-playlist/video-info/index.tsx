import { IconChevronRight } from '@tabler/icons-react';
import React from 'react';
import style from './style.module.css';

interface VideoInfoProps {
    title?: string;
    description?: string;
    poster?: string;
    cover?: string;
}

import useEditorStore from '@/store/useEditorStore';
import { SectionType } from '@/types/editor';

const VideoInfo: React.FC<VideoInfoProps> = ({ title, description, poster, cover }) => {
    const { currentVersion } = useEditorStore();
    const forYouPage = currentVersion?.pages.find(p => p.path === '/for-you');
    const playerSection = forYouPage?.sections.find(s => s.type === SectionType.PLAYER);
    const buttonText = playerSection?.title || 'Watch Full Episodes';
    return (
        <div className="h-full w-full">
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex flex-col gap-2">
                    {/* <div className="w-12 h-20 flex-shrink-0 rounded-md overflow-hidden cursor-pointer">
                        <DefultImage poster={poster ?? ''} classNameSize="w-full h-full" />
                    </div> */}

                    <h2 className="text-white text-sm font-medium cursor-pointer w-[60%] break-words line-clamp-1">{title}</h2>
                    <p className="w-[80%] break-words line-clamp-1 text-white">{description}</p>
                </div>

                <div>
                    <button
                        className={`mt-4 mb-2 w-full py-2 px-5 rounded-full flex items-center justify-between text-white text-sm font-medium transition-colors bg-white/10 ${style['gradient-icon-border']}`}
                    >
                        <span className="text-lg font-medium">{buttonText}</span>
                        <IconChevronRight size={18} />
                    </button>
                    {/* <div className="flex flex-row items-center gap-2">
                        <div className="flex-1">
                            <Slider
                                value={0}
                                color={'#22C58F'}
                                styles={{
                                    thumb: {
                                        background: '#22C58F',
                                        width: 8,
                                        height: 8,
                                    },
                                    track: {
                                        height: 3,
                                    },
                                }}
                            />
                        </div>
                        <button className="text-white/80 hover:text-white transition-colors">
                            <IconMinimize size={20} />
                        </button>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default VideoInfo;
