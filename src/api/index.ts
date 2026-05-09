import { IResponse } from '@/types/public';
import VideoApi from './video';

/**
 * Retry request
 * @param requestFn Request function
 * @returns Promise with API response
 */
export const retryRequest = async <T>(requestFn: () => Promise<IResponse<T>>): Promise<IResponse<T> | null> => {
    let retryCount = 0;
    const maxRetries = 3;
    const handleRetry = async (retryCount: number, maxRetries: number): Promise<boolean> => {
        if (retryCount === maxRetries) {
            return false;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        return true;
    };

    while (retryCount < maxRetries) {
        const result = await requestFn();
        if (result.code === -1) {
            retryCount++;
            if (await handleRetry(retryCount, maxRetries)) {
                continue;
            } else {
                return null;
            }
        }
        return result;
    }
    return null;
};

export const fetchPlaylistFeed = async (page: number, websitePath: string) => {
    let data = {
        total: 0,
        items: [],
        page: page,
        pageSize: 10,
        hasMore: true,
    };
    try {
        const res = await VideoApi.feed(websitePath, page, 10);
        if (res.code === 20002) {
            window.location.href = '/not-found';
            return data;
        }
        if (res.code !== 0 || (res.data.items ?? []).length === 0) return data;

        const resV = await VideoApi.batchGet(res.data.items.map(item => item.videoId).join(','));
        if (resV.code !== 0 || (resV.data.items ?? []).length === 0) return data;

        const resP = await VideoApi.playlistsInfoBatchGet(res.data.items.map(item => item.playlistId).join(','));

        const dataN = resV.data ?? data;
        dataN.items = dataN.items.map(item => {
            const video = res.data.items.find(itemV => itemV.videoId === item.vid);
            const playlistInfo = resP.data.items.find(itemP => itemP.playlistId === video?.playlistId);
            if (video) {
                item.playlistId = video.playlistId;
                item.episode = video.episode;
                item.playlistCover = playlistInfo?.cover;
                item.playlistTitle = playlistInfo?.title;
            }
            return item;
        });
        return dataN;
    } catch (error) {
        return null;
    }
};
