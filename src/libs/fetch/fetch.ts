import CookieMap from '@/config/cookie-map';
import qs from 'query-string';
import { getCookie } from './fetchCookie/getCookie';
import { IResponse } from '@/types/public';

/**
 * Fetch class for handling HTTP requests
 * Provides methods for GET, POST and file upload operations
 */
class Fetch {
    /** Base URL for API requests */
    private baseUrl: string;
    /** Common headers for all requests */
    private publicHeaders: any = {
        'X-App-Name': '',
        'X-App-Version': '1.0.0',
    };

    /**
     * Initialize Fetch instance with base URL
     */
    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';
    }

    /**
     * Get authentication token from cookies
     * @returns Object containing Authorization header or empty string if no token
     */
    private async getToken() {
        let token = '';

        const userState = await getCookie(CookieMap.UserState);

        try {
            if (userState) {
                token = JSON.parse(decodeURIComponent(userState)).accessToken;
            }
        } catch (error) {
            console.warn(String(error));
        }
        if (token) {
            return {
                Authorization: `Bearer ${token}`,
            };
        } else {
            return '';
        }
    }

    /**
     * Send GET request
     * @param url API endpoint URL
     * @param params Query parameters
     * @returns Promise with API response
     */
    public async get<T>(url: string, params: Record<string, any> = {}): Promise<IResponse<T>> {
        const token = await this.getToken();

        const config: any = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...this.publicHeaders,
                ...token,
            },
        };

        let qsUrl = `?${qs.stringify(params)}`;

        const fetchUrl = `${this.baseUrl}${url}${qsUrl}`;
        console.log('fetchUrl:', fetchUrl);
        return fetch(fetchUrl, config)
            .then(async response => {
                const result = await response.json();

                if (result.code !== undefined && typeof result.code === 'number') {
                    if (response.status === 401) {
                        return Promise.resolve({
                            code: 401,
                            info: result.info,
                        });
                    }

                    return Promise.resolve(result);
                } else {
                    return Promise.resolve({
                        code: response.status,
                        info: response.statusText,
                    });
                }
            })
            .catch(error => {
                return {
                    code: -1,
                    info: String(error),
                };
            });
    }

    /**
     * Send POST request
     * @param url API endpoint URL
     * @param data Request body data
     * @returns Promise with API response
     */
    public async post<T>(url: string, data: Record<string, any> = {}): Promise<IResponse<T>> {
        const token = await this.getToken();

        const config: any = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.publicHeaders,
                ...token,
            },
            body: JSON.stringify(data),
        };

        const fetchUrl = `${this.baseUrl}${url}`;
        console.log('fetchUrl:', fetchUrl);
        console.log('config:', config);
        return fetch(fetchUrl, config)
            .then(async response => {
                const result = await response.json();

                if (result.code !== undefined && typeof result.code === 'number') {
                    if (response.status === 401) {
                        return Promise.resolve({
                            code: 401,
                            info: result.info,
                        });
                    }

                    return Promise.resolve(result);
                } else {
                    return Promise.resolve({
                        code: response.status,
                        info: response.statusText,
                    });
                }
            })
            .catch(error => {
                return {
                    code: -1,
                    info: String(error),
                };
            });
    }

    /**
     * Upload file using FormData
     * @param url API endpoint URL
     * @param data FormData containing file and other fields
     * @param params Additional query parameters
     * @returns Promise with API response
     */
    public async upload0<T>(url: string, data: FormData, params: Record<string, any> = {}): Promise<IResponse<T>> {
        const token = await this.getToken();

        const config: any = {
            method: 'POST',
            headers: {
                ...this.publicHeaders,
                ...token,
            },
            body: data,
        };

        let qsUrl = `?${qs.stringify(params)}`;
        const fetchUrl = `${this.baseUrl}${url}${qsUrl}`;
        return fetch(fetchUrl, config)
            .then(async response => {
                const result = await response.json();
                if (result.code !== undefined && typeof result.code === 'number') {
                    if (response.status === 401) {
                        return Promise.resolve({
                            code: 401,
                            info: result.info,
                        });
                    }

                    return Promise.resolve(result);
                } else {
                    return Promise.resolve({
                        code: response.status,
                        info: response.statusText,
                    });
                }
            })
            .catch(error => {
                return {
                    code: -1,
                    info: String(error),
                };
            });
    }

    public async upload<T>(
        url: string,
        data: FormData,
        params: Record<string, any> = {},
        onProgress?: (progress: number) => void
    ): Promise<IResponse<T>> {
        const token = await this.getToken();
        let qsUrl = `?${qs.stringify(params)}`;
        const fetchUrl = `${this.baseUrl}${url}${qsUrl}`;
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            // 监听上传进度
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable && onProgress) {
                    const progress = (event.loaded / event.total) * 100;
                    onProgress(progress);
                }
            };

            xhr.open('POST', fetchUrl);

            // 设置请求头
            Object.entries({
                ...this.publicHeaders,
                ...token,
            }).forEach(([key, value]) => {
                xhr.setRequestHeader(key, value as string);
            });

            xhr.onload = async () => {
                try {
                    const result = JSON.parse(xhr.responseText);
                    if (result.code !== undefined && typeof result.code === 'number') {
                        if (xhr.status === 401) {
                            return Promise.resolve({
                                code: 401,
                                info: result.info,
                            });

                        }
                        return Promise.resolve(result);
                    } else {
                        return Promise.resolve({
                            code: xhr.status,
                            info: xhr.statusText,
                        });
                    }
                } catch (error) {
                    return Promise.resolve({
                        code: -1,
                        info: String(error),
                    });
                }
            };

            xhr.onerror = () => {
                return Promise.resolve({
                    code: -1,
                    info: 'network error',
                });
            };

            xhr.send(data);
        });
    }
}

export default new Fetch();
