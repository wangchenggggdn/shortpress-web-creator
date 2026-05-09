/**
 * 支持的语言类型
 */
export enum SupportedLanguage {
    ZH_CN = 'zh-CN', // 简体中文
    ZH_TW = 'zh-TW', // 繁体中文
    EN = 'en',       // 英语
    JA = 'ja',       // 日语
    DE = 'de',       // 德语
    KO = 'ko',       // 韩语
    FR = 'fr',       // 法语
    ID = 'id',       // 印尼语
}

/**
 * 翻译字段类型
 */
export enum TranslationFieldType {
    // 网站相关
    WEBSITE = 'website',                   // 网站（包含 name）
    WEBSITE_SEO = 'website_seo',           // 网站 SEO（包含 title, description, keywords）
    
    // 页面相关
    PAGE = 'page',                         // 页面（包含 name 和 SEO）
    
    // Section 相关
    SECTION = 'section',                   // Section（包含 title）
    
    // 固定页面相关
    STATIC_PAGE = 'static_page',           // 固定页面（包含 SEO）
}

/**
 * 多语言文本类型
 * 包含原始文本和各语言的翻译
 */
export interface MultiLanguageText {
    /** 原始文本（用户输入的文本，作为翻译源） */
    original: string;
    /** 各语言的翻译映射 */
    translations?: Partial<Record<SupportedLanguage, string>>;
}

/**
 * SEO 多语言数据
 */
export interface MultiLanguageSEO {
    title?: MultiLanguageText;
    description?: MultiLanguageText;
    keywords?: MultiLanguageText;
}

/**
 * 网站多语言数据
 */
export interface MultiLanguageSite {
    name?: MultiLanguageText;
}

/**
 * 翻译请求项
 * 一个对象包含多个需要翻译的文本字段
 */
export interface TranslationItem {
    /** 
     * 字段类型
     */
    fieldType: TranslationFieldType;
    
    /** 
     * 需要翻译的文本字段
     * 不同的 fieldType 包含不同的字段
     */
    texts: {
        /** 名称（可选，用于页面名称） */
        name?: string;
        /** 标题（可选） */
        title?: string;
        /** 描述（可选） */
        description?: string;
        /** 关键词（可选） */
        keywords?: string;
    };
    
    /**
     * 上下文信息（用于前端应用翻译结果）
     */
    context: {
        /** 网站 ID（可选，网站相关字段需要） */
        websiteId?: string;
        /** 版本 ID（可选） */
        versionId?: string;
        /** 页面 ID（可选，页面相关字段需要） */
        pageId?: string;
        /** Section ID（可选，Section 相关字段需要） */
        sectionId?: string;
        /** 是否是共享 Section（可选） */
        isSharedSection?: boolean;
        /** 固定页面 ID（可选，固定页面相关字段需要） */
        staticPageId?: string;
    };
}

/**
 * 翻译请求参数
 */
export interface TranslationRequest {
    /** 需要翻译的项目列表 */
    items: TranslationItem[];
    /** 目标语言列表（如果不指定，则翻译所有支持的语言） */
    targetLanguages?: SupportedLanguage[];
}

/**
 * 翻译结果项（单个语言）
 * 后端返回的格式
 */
export interface TranslationResultItem {
    /** 名称（可选） */
    name?: string;
    /** 标题（可选） */
    title?: string;
    /** 描述（可选） */
    description?: string;
    /** 关键词（可选） */
    keywords?: string;
    /** 语言代码 */
    lang: string;
}

/**
 * 翻译响应项
 * 包含所有语言的翻译结果
 */
export interface TranslationResponseItem {
    /** 字段类型 */
    fieldType: TranslationFieldType;
    /** 所有语言的翻译结果 */
    translations: TranslationResultItem[];
    /** 上下文信息（与请求中的 context 相同） */
    context: {
        versionId?: string;
        pageId?: string;
        sectionId?: string;
        isSharedSection?: boolean;
        staticPageId?: string;
    };
}

/**
 * 翻译响应
 */
export interface TranslationResponse {
    /** 翻译结果列表 */
    results: TranslationResponseItem[];
    /** 是否成功 */
    success: boolean;
    /** 错误信息（如果有） */
    error?: string;
    /** 错误码（如果有）*/
    errorCode?: number;
}

/**
 * 获取缺失的语言
 * @param existingTranslations 已有的翻译
 * @param allLanguages 所有支持的语言
 * @returns 缺失的语言列表
 */
export function getMissingLanguages(
    existingTranslations?: Partial<Record<SupportedLanguage, string>>,
    allLanguages: SupportedLanguage[] = Object.values(SupportedLanguage)
): SupportedLanguage[] {
    if (!existingTranslations) {
        return allLanguages;
    }

    return allLanguages.filter(lang => {
        const translation = existingTranslations[lang];
        return !translation || translation.trim() === '';
    });
}

/**
 * 创建多语言文本对象
 * @param original 原始文本
 * @param translations 已有的翻译
 * @returns 多语言文本对象
 */
export function createMultiLanguageText(
    original: string,
    translations?: Partial<Record<SupportedLanguage, string>>
): MultiLanguageText {
    return {
        original,
        translations: translations || {},
    };
}

/**
 * 合并翻译结果到多语言文本对象
 * @param multiLangText 多语言文本对象
 * @param newTranslations 新的翻译结果
 * @returns 更新后的多语言文本对象
 */
export function mergeTranslations(
    multiLangText: MultiLanguageText,
    newTranslations: Partial<Record<SupportedLanguage, string>>
): MultiLanguageText {
    return {
        ...multiLangText,
        translations: {
            ...multiLangText.translations,
            ...newTranslations,
        },
    };
}
