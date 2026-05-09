import { EditWebsite, Page, Section } from '@/types/editor';
import {
    createMultiLanguageText,
    mergeTranslations,
    SupportedLanguage,
    TranslationItem,
    TranslationResponseItem,
    TranslationFieldType,
    TranslationResultItem,
} from '@/types/translation';

/**
 * 翻译辅助工具类
 * 用于收集需要翻译的字段、应用翻译结果等
 */
export class TranslationHelper {
    /**
     * 从网站数据中提取需要翻译的字段
     * 合并同一对象的多个字段到一个翻译项中
     * @param website 网站数据
     * @returns 需要翻译的项目列表
     */
    static extractTranslationItems(website: EditWebsite): TranslationItem[] {
        const items: TranslationItem[] = [];

        // 遍历所有版本
        website.versions.forEach(version => {
            // 遍历所有页面
            version.pages.forEach(page => {
                const texts: any = {};
                
                // 页面名称
                if (page.name) {
                    texts.name = page.name;
                }

                // 页面 SEO
                if (page.metadata?.seo) {
                    if (page.metadata.seo.title) {
                        texts.title = page.metadata.seo.title;
                    }
                    if (page.metadata.seo.description) {
                        texts.description = page.metadata.seo.description;
                    }
                    if (page.metadata.seo.keywords) {
                        texts.keywords = page.metadata.seo.keywords;
                    }
                }

                // 如果有任何文本需要翻译，添加到列表
                if (Object.keys(texts).length > 0) {
                    items.push({
                        fieldType: TranslationFieldType.PAGE,
                        texts,
                        context: {
                            versionId: version.id,
                            pageId: page.id,
                        },
                    });
                }

                // 页面中的 Section 标题
                page.sections.forEach(section => {
                    if (section.title) {
                        items.push({
                            fieldType: TranslationFieldType.SECTION,
                            texts: {
                                title: section.title,
                            },
                            context: {
                                versionId: version.id,
                                pageId: page.id,
                                sectionId: section.id,
                                isSharedSection: false,
                            },
                        });
                    }
                });
            });

            // 共享的 Section 标题
            version.shareSections.forEach(section => {
                if (section.title) {
                    items.push({
                        fieldType: TranslationFieldType.SECTION,
                        texts: {
                            title: section.title,
                        },
                        context: {
                            versionId: version.id,
                            sectionId: section.id,
                            isSharedSection: true,
                        },
                    });
                }
            });

            // 固定页面 SEO
            if (version.staticPages) {
                version.staticPages.forEach(staticPage => {
                    if (staticPage.seo) {
                        const texts: any = {};
                        
                        if (staticPage.seo.title) {
                            texts.title = staticPage.seo.title;
                        }
                        if (staticPage.seo.description) {
                            texts.description = staticPage.seo.description;
                        }
                        if (staticPage.seo.keywords) {
                            texts.keywords = staticPage.seo.keywords;
                        }

                        // 如果有任何文本需要翻译，添加到列表
                        if (Object.keys(texts).length > 0) {
                            items.push({
                                fieldType: TranslationFieldType.STATIC_PAGE,
                                texts,
                                context: {
                                    versionId: version.id,
                                    staticPageId: staticPage.id,
                                },
                            });
                        }
                    }
                });
            }
        });

        return items;
    }

    /**
     * 将翻译结果应用到网站数据
     * @param website 网站数据
     * @param results 翻译结果
     * @returns 更新后的网站数据
     */
    static applyTranslationResults(website: EditWebsite, results: TranslationResponseItem[]): EditWebsite {
        // 深拷贝网站数据以避免直接修改
        const updatedWebsite = JSON.parse(JSON.stringify(website)) as EditWebsite;

        results.forEach(result => {
            const { fieldType, translations, context } = result;

            // 根据字段类型和上下文信息应用翻译
            this.applyTranslationByContext(updatedWebsite, fieldType, translations, context);
        });

        return updatedWebsite;
    }

    /**
     * 根据上下文信息应用翻译
     */
    private static applyTranslationByContext(
        website: EditWebsite,
        fieldType: TranslationFieldType,
        translations: TranslationResultItem[],
        context: TranslationResponseItem['context']
    ): void {
        // 查找对应的版本
        const version = website.versions.find(v => v.id === context.versionId);
        if (!version) {
            console.warn(`Version not found: ${context.versionId}`);
            return;
        }

        // 根据字段类型处理
        switch (fieldType) {
            case TranslationFieldType.PAGE:
                this.applyPageTranslations(version, context.pageId!, translations);
                break;

            case TranslationFieldType.SECTION:
                this.applySectionTranslations(version, context, translations);
                break;

            case TranslationFieldType.STATIC_PAGE:
                this.applyStaticPageTranslations(version, context.staticPageId!, translations);
                break;

            default:
                console.warn(`Unknown field type: ${fieldType}`);
        }
    }

    /**
     * 应用页面翻译（包含 name 和 SEO）
     */
    private static applyPageTranslations(
        version: any,
        pageId: string,
        translations: TranslationResultItem[]
    ): void {
        const page = version.pages.find((p: any) => p.id === pageId);
        if (!page) {
            console.warn(`Page not found: ${pageId}`);
            return;
        }

        // 转换翻译结果为多语言格式
        const translationsByLang: Record<string, TranslationResultItem> = {};
        translations.forEach(t => {
            translationsByLang[t.lang] = t;
        });

        // 应用 name 翻译
        if (translationsByLang[Object.keys(translationsByLang)[0]]?.name !== undefined) {
            if (!page.nameMultiLang) {
                page.nameMultiLang = createMultiLanguageText(page.name);
            }
            const nameTranslations: any = {};
            Object.entries(translationsByLang).forEach(([lang, t]) => {
                if (t.name) {
                    nameTranslations[lang] = t.name;
                }
            });
            page.nameMultiLang = mergeTranslations(page.nameMultiLang, nameTranslations);
        }

        // 应用 SEO 翻译
        if (!page.metadata) {
            page.metadata = {};
        }
        if (!page.metadata.seoMultiLang) {
            page.metadata.seoMultiLang = {};
        }

        // title
        if (translationsByLang[Object.keys(translationsByLang)[0]]?.title !== undefined) {
            if (!page.metadata.seoMultiLang.title) {
                page.metadata.seoMultiLang.title = createMultiLanguageText(page.metadata.seo?.title || '');
            }
            const titleTranslations: any = {};
            Object.entries(translationsByLang).forEach(([lang, t]) => {
                if (t.title) {
                    titleTranslations[lang] = t.title;
                }
            });
            page.metadata.seoMultiLang.title = mergeTranslations(page.metadata.seoMultiLang.title, titleTranslations);
        }

        // description
        if (translationsByLang[Object.keys(translationsByLang)[0]]?.description !== undefined) {
            if (!page.metadata.seoMultiLang.description) {
                page.metadata.seoMultiLang.description = createMultiLanguageText(page.metadata.seo?.description || '');
            }
            const descTranslations: any = {};
            Object.entries(translationsByLang).forEach(([lang, t]) => {
                if (t.description) {
                    descTranslations[lang] = t.description;
                }
            });
            page.metadata.seoMultiLang.description = mergeTranslations(page.metadata.seoMultiLang.description, descTranslations);
        }

        // keywords
        if (translationsByLang[Object.keys(translationsByLang)[0]]?.keywords !== undefined) {
            if (!page.metadata.seoMultiLang.keywords) {
                page.metadata.seoMultiLang.keywords = createMultiLanguageText(page.metadata.seo?.keywords || '');
            }
            const keywordsTranslations: any = {};
            Object.entries(translationsByLang).forEach(([lang, t]) => {
                if (t.keywords) {
                    keywordsTranslations[lang] = t.keywords;
                }
            });
            page.metadata.seoMultiLang.keywords = mergeTranslations(page.metadata.seoMultiLang.keywords, keywordsTranslations);
        }
    }

    /**
     * 应用 Section 标题翻译
     */
    private static applySectionTranslations(
        version: any,
        context: TranslationResponseItem['context'],
        translations: TranslationResultItem[]
    ): void {
        let section: any;

        if (context.isSharedSection) {
            // 共享 Section
            section = version.shareSections.find((s: any) => s.id === context.sectionId);
        } else {
            // 页面中的 Section
            const page = version.pages.find((p: any) => p.id === context.pageId);
            if (page) {
                section = page.sections.find((s: any) => s.id === context.sectionId);
            }
        }

        if (!section) {
            console.warn(`Section not found: ${context.sectionId}`);
            return;
        }

        // 应用 title 翻译
        if (!section.titleMultiLang) {
            section.titleMultiLang = createMultiLanguageText(section.title);
        }

        const titleTranslations: any = {};
        translations.forEach(t => {
            if (t.title) {
                titleTranslations[t.lang] = t.title;
            }
        });

        section.titleMultiLang = mergeTranslations(section.titleMultiLang, titleTranslations);
    }

    /**
     * 应用固定页面 SEO 翻译
     */
    private static applyStaticPageTranslations(
        version: any,
        staticPageId: string,
        translations: TranslationResultItem[]
    ): void {
        // 确保 staticPages 数组存在
        if (!version.staticPages) {
            version.staticPages = [];
        }

        // 查找或创建固定页面
        let staticPage = version.staticPages.find((sp: any) => sp.id === staticPageId);
        if (!staticPage) {
            staticPage = {
                id: staticPageId,
                seo: {},
                seoMultiLang: {},
            };
            version.staticPages.push(staticPage);
        }

        // 确保 seoMultiLang 存在
        if (!staticPage.seoMultiLang) {
            staticPage.seoMultiLang = {};
        }

        // 转换翻译结果
        const translationsByLang: Record<string, TranslationResultItem> = {};
        translations.forEach(t => {
            translationsByLang[t.lang] = t;
        });

        // title
        if (translationsByLang[Object.keys(translationsByLang)[0]]?.title !== undefined) {
            if (!staticPage.seoMultiLang.title) {
                staticPage.seoMultiLang.title = createMultiLanguageText(staticPage.seo?.title || '');
            }
            const titleTranslations: any = {};
            Object.entries(translationsByLang).forEach(([lang, t]) => {
                if (t.title) {
                    titleTranslations[lang] = t.title;
                }
            });
            staticPage.seoMultiLang.title = mergeTranslations(staticPage.seoMultiLang.title, titleTranslations);
        }

        // description
        if (translationsByLang[Object.keys(translationsByLang)[0]]?.description !== undefined) {
            if (!staticPage.seoMultiLang.description) {
                staticPage.seoMultiLang.description = createMultiLanguageText(staticPage.seo?.description || '');
            }
            const descTranslations: any = {};
            Object.entries(translationsByLang).forEach(([lang, t]) => {
                if (t.description) {
                    descTranslations[lang] = t.description;
                }
            });
            staticPage.seoMultiLang.description = mergeTranslations(staticPage.seoMultiLang.description, descTranslations);
        }

        // keywords
        if (translationsByLang[Object.keys(translationsByLang)[0]]?.keywords !== undefined) {
            if (!staticPage.seoMultiLang.keywords) {
                staticPage.seoMultiLang.keywords = createMultiLanguageText(staticPage.seo?.keywords || '');
            }
            const keywordsTranslations: any = {};
            Object.entries(translationsByLang).forEach(([lang, t]) => {
                if (t.keywords) {
                    keywordsTranslations[lang] = t.keywords;
                }
            });
            staticPage.seoMultiLang.keywords = mergeTranslations(staticPage.seoMultiLang.keywords, keywordsTranslations);
        }
    }

    /**
     * 检查是否需要翻译
     * @param website 网站数据
     * @returns 是否需要翻译
     */
    static needsTranslation(website: EditWebsite): boolean {
        const items = this.extractTranslationItems(website);
        return items.length > 0;
    }

    /**
     * 获取需要翻译的字段数量
     * @param website 网站数据
     * @returns 需要翻译的字段数量
     */
    static getTranslationItemCount(website: EditWebsite): number {
        return this.extractTranslationItems(website).length;
    }
}
