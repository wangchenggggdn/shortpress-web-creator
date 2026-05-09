/**
 * 静态页面类型
 */
export type StaticPageType = 'faq' | 'privacy-policy' | 'terms-of-service';

/**
 * FAQ 项
 */
export interface FAQItem {
    id: string;
    question: string;
    answer: string;
    order: number;
    visible?: boolean;
}

/**
 * 页面配置参数
 */
export interface PageConfigParams {
    type: string;
    config: Record<string, any>;
}

/**
 * 页面配置项信息
 */
export interface PageConfigItem {
    type: string;
    config: string;
}
