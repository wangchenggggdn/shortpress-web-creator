'use client';

import React from 'react';
import GuideItem from './guideItem';
import userStore from '@/store/useUserStore';
import { GuideName } from '@/types/guide';

/**
 * GuideCard component that displays onboarding steps for new users
 * Shows action items and guidance for getting started with the platform
 * @returns React component with onboarding card layout
 */
const GuideCard: React.FC = () => {
    const { userInfo } = userStore();
    return (
        <>
            {!(userInfo?.guides ?? []).every(item => item.status === 1) && (
                <div className="flex flex-col gap-4">
                    <div className="text-2xl text-black-purple font-bold">Hey, follow these steps to launch your site</div>

                    <div className="flex flex-col gap-4">
                        {userInfo?.guides.find(item => item.name === GuideName.AddFirstPlaylist)?.status === 0 && (
                            <GuideItem
                                title="Add Your First Playlist!"
                                description="Easily create a playlist that your audience will love, and it will be automatically added to your site."
                                buttonText="Create Playlist"
                                onClick={() => {
                                    window.location.href = '/playlists';
                                }}
                                buttonClassName="w-full md:w-60"
                            />
                        )}

                        {userInfo?.guides.find(item => item.name === GuideName.UploadVideo)?.status === 0 && (
                            <GuideItem
                                title="Upload a video"
                                description="Upload a video to get started with your audience"
                                buttonText="Upload Video"
                                onClick={() => {
                                    window.location.href = '/videos';
                                }}
                            />
                        )}

                        {userInfo?.guides.find(item => item.name === GuideName.AddVideoToPlaylist)?.status === 0 && (
                            <GuideItem
                                title="Add a Video to a Playlist"
                                description="Add a video to the playlist—your audience will see it in seconds!"
                                buttonText="Add videos to Playlist"
                                onClick={() => {
                                    window.location.href = '/playlists';
                                }}
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default GuideCard;
