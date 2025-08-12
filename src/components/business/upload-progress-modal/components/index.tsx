// components/UploadProgressItem.tsx

'use client';

import React, { useEffect, useRef } from 'react';
import { IconCheck, IconRefresh, IconX } from '@tabler/icons-react';
import { IUploadVideo, VideoUploadStatus } from '@/types/video';
import VideoApi from '@/api/video';
import fileUploadStore from '@/store/useFileUploadStore';
import profileEventBus from '@/utils/profileEventBus';
import { EventName } from '@/types/event';

interface IProps {
    item: IUploadVideo;
    onDelete: (item: IUploadVideo) => void;
}

const UploadProgressItem: React.FC<IProps> = ({ item, onDelete }) => {
    // Get the update state function directly from Zustand store
    const { setUploadFileList } = fileUploadStore();
    // Each Item component instance maintains its own XMLHttpRequest reference
    const xhrRef = useRef<XMLHttpRequest | null>(null);

    // This is the core logic: when the parent component marks this item's status as UPLOADING, start the upload
    useEffect(() => {
        if (item.uploadStatus === VideoUploadStatus.UPLOADING && !xhrRef.current) {
            handleUpload();
        }

        // Cleanup function: when component unmounts or item object reference changes (e.g., deleted), ensure to abort any ongoing requests
        return () => {
            if (xhrRef.current) {
                xhrRef.current.abort();
                xhrRef.current = null;
            }
        };
    }, [item.uploadStatus, item.vid]); // Dependencies are key, ensuring trigger on status changes

    const handleUpload = async () => {
        if (!item.file) return;

        const formData = new FormData();
        formData.append('files', item.file);

        try {
            const res = await VideoApi.upload(
                formData,
                item.playlistId ?? '',
                (progress: number) => {
                    // Check if request was cancelled before updating progress
                    if (xhrRef.current) {
                        setUploadFileList((currentList) =>
                            (currentList ?? []).map(video =>
                                video.vid === item.vid ? { ...video, progress: Math.floor(progress) } : video
                            )
                        );
                    }
                },
                (xhr: XMLHttpRequest | null) => {
                    // Save the xhr instance to the component's own ref
                    xhrRef.current = xhr;
                }
            );

            // After successful request, clear xhr reference and update status
            xhrRef.current = null;
            if (res && res.data && res.data.vids && res.data.vids.length > 0) {
                const vidFromServer = res.data.vids[0];
                profileEventBus.emit(EventName.UploadVideoSuccess);
                setUploadFileList((currentList) =>
                    (currentList ?? []).map(video =>
                        video.vid === item.vid ? { ...video, vid: vidFromServer, uploadStatus: VideoUploadStatus.UPLOAD_SUCCESS, progress: 100 } : video
                    )
                );
            } else {
                handleUploadFailed();
            }

        } catch (error) {
            xhrRef.current = null;
            handleUploadFailed();
        }
    };

    const handleUploadFailed = () => {
        setUploadFileList((currentList) =>
            (currentList ?? []).map(video =>
                video.vid === item.vid ? { ...video, uploadStatus: VideoUploadStatus.UPLOAD_FAILED } : video
            )
        );
    };
    
    // Cancel or delete operation
    const handleCancelOrDelete = () => {
        // If there's an ongoing request, abort it
        if (xhrRef.current) {
            xhrRef.current.abort();
            xhrRef.current = null;
        }
        // Notify parent component to remove itself from the list
        onDelete(item);
    };

    // Retry operation
    const handleRetry = () => {
        // Reset status to waiting, parent component's queue manager will re-trigger it
        setUploadFileList((currentList) => 
            (currentList ?? []).map(video =>
                video.vid === item.vid ? { ...video, uploadStatus: VideoUploadStatus.NOT_UPLOADED, progress: 0 } : video
            )
        );
    };

    return (
        <div className="flex items-center gap-4 py-1">
            <div className="flex-1">
                <div className="flex justify-between mb-1">
                    <span className="text-sm truncate pr-8 max-w-sm">{item.title}</span>
                    <span className="text-sm">
                        {/* Uploading */}
                        {item.uploadStatus === VideoUploadStatus.UPLOADING && item.progress !== 100 && (
                            <div className="flex flex-row items-center gap-2">
                                <div>{item.progress ?? 0}%</div>
                                <IconX className="text-red-500 cursor-pointer" size={18} onClick={handleCancelOrDelete} />
                            </div>
                        )}
                        {/* Upload Success */}
                        {(item.uploadStatus === VideoUploadStatus.UPLOAD_SUCCESS || (item.progress === 100 && item.uploadStatus === VideoUploadStatus.UPLOADING)) && 
                            <IconCheck className="text-green-500" size={18} />
                        }
                        {/* Upload Failed */}
                        {item.uploadStatus === VideoUploadStatus.UPLOAD_FAILED && (
                            <IconRefresh onClick={handleRetry} className="text-primary cursor-pointer" size={18} />
                        )}
                        {/* Waiting */}
                        {item.uploadStatus !== VideoUploadStatus.UPLOADING && item.uploadStatus !== VideoUploadStatus.UPLOAD_SUCCESS && item.uploadStatus !== VideoUploadStatus.UPLOAD_FAILED &&
                            <span className="text-gray-400">Waiting...</span>
                        }
                    </span>
                </div>
                {/* Progress Bar */}
                {item.uploadStatus === VideoUploadStatus.UPLOADING && (
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${item.progress ?? 0}%` }} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadProgressItem;