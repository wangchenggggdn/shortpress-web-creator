import WebsiteApi from './website';
import { TranslationRequest, TranslationResponse } from '@/types/translation';

/**
 * 翻译 API 类
 * 负责调用后端翻译接口
 */
export default class TranslationAPI {
    /**
     * 调用后端翻译接口
     * 后端会处理实际的翻译逻辑
     * 
     * @param siteId 网站 ID
     * @param request 翻译请求参数
     * @returns 翻译结果
     * 
     * @example
     * const request = {
     *   items: [
     *     {
     *       fieldType: "page",
     *       texts: {
     *         name: "首页",
     *         title: "欢迎访问"
     *       },
     *       context: {
     *         versionId: "v1",
     *         pageId: "p1"
     *       }
     *     }
     *   ],
     *   targetLanguages: ["zh-CN", "zh-TW", "en", "ja", "de", "ko", "fr", "id"]
     * };
     * const response = await TranslationAPI.translate("site-123", request);
     */
    static async translate(siteId: string, request: TranslationRequest): Promise<TranslationResponse> {
        try {
            // 调用后端翻译接口
            const response = await WebsiteApi.translate(siteId, request);
            
            // 处理错误码
            if (response.code === 7001) {
                // 配置错误
                console.error('Translation configuration error:', response.info);
                return {
                    success: false,
                    results: [],
                    error: response.info || 'Translation service not configured',
                    errorCode: 7001,
                };
            }
            
            if (response.code === 7002) {
                // 翻译错误
                console.error('Translation service error:', response.info);
                return {
                    success: false,
                    results: [],
                    error: response.info || 'Translation service failed',
                    errorCode: 7002,
                };
            }
            
            if (response.code === 0 && response.data) {
                 // 成功
                return {
                    success: true,
                    results: response.data || [],
                };
            }else{
                // 其他错误
                console.error('Translation error:', response.info);
                return {
                    success: false,
                    results: [],
                    error: response.info || 'Translation failed',
                };
            }
            
           
        } catch (error) {
            console.error('Translation API error:', error);
            return {
                success: false,
                results: [],
                error: error instanceof Error ? error.message : 'Translation failed',
            };
        }
    }

    /**
     * 检查后端翻译服务是否可用
     * 
     * @param siteId 网站 ID
     * @returns 是否可用
     */
    static async checkAvailability(siteId: string): Promise<boolean> {
        try {
            // 发送一个空的翻译请求来检查服务是否可用
            const response = await WebsiteApi.translate(siteId, {
                items: [],
                // targetLanguages: [],
            });
            
            // 如果返回 7001，说明配置错误，服务不可用
            if (response.code === 7001) {
                return false;
            }
            
            // 其他情况认为服务可用
            return true;
        } catch (error) {
            console.error('Failed to check translation availability:', error);
            return false;
        }
    }
}
