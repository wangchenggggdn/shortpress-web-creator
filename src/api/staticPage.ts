import fetch from '@/libs/fetch/fetch';
import { PageConfigParams, PageConfigItem } from '@/types/staticPage';

class StaticPageApi {

    /**
     * 创建页面配置
     */
    static async createPageConfig(params: PageConfigParams): Promise<boolean> {
        const response: any = await fetch.post('/api/site/page-config/create', params);
        return response.code === 0;
    }

    /**
     * 查询页面配置
     */
    static async getPageConfig(type: string): Promise<PageConfigItem | null> {
        const response: any = await fetch.get('/api/site/page-config/get', {type});
        if (response.code === 0 && response.data) {
            return response.data;
        }
        return null;
    }

    /**
     * 更新页面配置
     */
    static async updatePageConfig(params: PageConfigParams): Promise<boolean> {
        const response: any = await fetch.post('/api/site/page-config/update', params);
        return response.code === 0;
    }

    /**
     * 查询页面配置列表
     */
    static async getPageConfigList(): Promise<PageConfigItem[]> {
        const response: any = await fetch.get('/api/site/page-config/list');
        if (response.code === 0 && Array.isArray(response.data)) {
            return response.data;
        }
        return [];
    }
}

export default StaticPageApi;
