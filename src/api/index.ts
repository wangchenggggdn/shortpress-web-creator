import { IResponse } from "@/types/public";

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