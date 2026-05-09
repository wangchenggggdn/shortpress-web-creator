import { useState, useCallback } from 'react';
import TranslationAPI from '@/api/translation';
import { EditWebsite } from '@/types/editor';
import { SupportedLanguage, TranslationRequest } from '@/types/translation';
import { TranslationHelper } from '@/utils/translationHelper';

/**
 * 翻译状态
 */
interface TranslationState {
    /** 是否正在翻译 */
    isTranslating: boolean;
    /** 翻译进度（0-100） */
    progress: number;
    /** 错误信息 */
    error: string | null;
    /** 翻译服务是否可用 */
    isAvailable: boolean | null;
}

/**
 * 翻译 Hook 返回值
 */
interface UseTranslationReturn {
    /** 翻译状态 */
    state: TranslationState;
    /** 执行翻译 */
    translateWebsite: (siteId: string, website: EditWebsite) => Promise<EditWebsite | null>;
    /** 检查翻译服务是否可用 */
    checkAvailability: (siteId: string) => Promise<boolean>;
    /** 重置状态 */
    reset: () => void;
}

/**
 * 翻译 Hook
 * 用于在保存或发布时自动翻译网站内容
 */
export function useTranslation(): UseTranslationReturn {
    const [state, setState] = useState<TranslationState>({
        isTranslating: false,
        progress: 0,
        error: null,
        isAvailable: null,
    });

    /**
     * 检查翻译服务是否可用
     */
    const checkAvailability = useCallback(async (siteId: string): Promise<boolean> => {
        try {
            const available = await TranslationAPI.checkAvailability(siteId);
            setState(prev => ({ ...prev, isAvailable: available }));
            return available;
        } catch (error) {
            console.error('Failed to check translation availability:', error);
            setState(prev => ({ ...prev, isAvailable: false }));
            return false;
        }
    }, []);

    /**
     * 翻译网站内容
     * @param siteId 网站 ID
     * @param website 网站数据
     * @returns 翻译后的网站数据，如果失败或不需要翻译则返回 null
     */
    const translateWebsite = useCallback(async (siteId: string, website: EditWebsite): Promise<EditWebsite | null> => {
        try {
            // 重置状态
            setState({
                isTranslating: true,
                progress: 0,
                error: null,
                isAvailable: state.isAvailable,
            });

            // 检查是否需要翻译
            if (!TranslationHelper.needsTranslation(website)) {
                console.log('No translation needed');
                setState(prev => ({ ...prev, isTranslating: false, progress: 100 }));
                return null;
            }

            // 检查翻译服务是否可用
            const available = state.isAvailable ?? (await checkAvailability(siteId));
            if (!available) {
                console.log('Translation service not available, skipping translation');
                setState(prev => ({
                    ...prev,
                    isTranslating: false,
                    progress: 100,
                }));
                return null;
            }

            // 提取需要翻译的字段
            setState(prev => ({ ...prev, progress: 10 }));
            const items = TranslationHelper.extractTranslationItems(website);

            if (items.length === 0) {
                setState(prev => ({ ...prev, isTranslating: false, progress: 100 }));
                return null;
            }

            console.log(`Found ${items.length} items to translate`);

            // 构建翻译请求
            setState(prev => ({ ...prev, progress: 20 }));
            const request: TranslationRequest = {
                items,
                targetLanguages: Object.values(SupportedLanguage),
            };

            // 调用翻译 API
            setState(prev => ({ ...prev, progress: 30 }));
            const response = await TranslationAPI.translate(siteId, request);

            if (!response.success) {
                throw new Error(response.error || 'Translation failed');
            }

            // 应用翻译结果
            setState(prev => ({ ...prev, progress: 80 }));
            const updatedWebsite = TranslationHelper.applyTranslationResults(website, response.results);

            // 完成
            setState(prev => ({ ...prev, isTranslating: false, progress: 100 }));
            console.log('Translation completed successfully');

            return updatedWebsite;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Translation failed';
            console.error('Translation error:', error);
            setState(prev => ({
                ...prev,
                isTranslating: false,
                error: errorMessage,
                progress: 0,
            }));
            return null;
        }
    }, [state.isAvailable, checkAvailability]);

    /**
     * 重置状态
     */
    const reset = useCallback(() => {
        setState({
            isTranslating: false,
            progress: 0,
            error: null,
            isAvailable: null,
        });
    }, []);

    return {
        state,
        translateWebsite,
        checkAvailability,
        reset,
    };
}
