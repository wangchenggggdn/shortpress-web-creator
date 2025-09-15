export interface Guide {
    name: string;
    status: number; // 1 completed, 0 not completed
}

export enum GuideName {
    UploadVideo = 'UPLOAD_VIDEO',
    AddFirstPlaylist = 'ADD_FIRST_PLAYLIST',
    AddVideoToPlaylist = 'ADD_VIDEO_TO_PLAYLIST',
}