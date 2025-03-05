import fetch from '@/libs/fetch/fetch';

/**
 * API class for OSS (Object Storage Service) related operations
 */
export default class OssApi {
    /**
     * Upload image to OSS
     * @param args FormData containing image file
     * @returns Promise with uploaded image URL information
     */
    static uploadImage(args: FormData) {
        return fetch.upload<{ domain: string; path: string }>('/oss/upload-image', args);
    }
}
