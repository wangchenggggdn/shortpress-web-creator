import { EditWebsite, Page, Section } from '@/types/editor';
import { createMultiLanguageText, MultiLanguageText } from '@/types/translation';
import { Website } from '@/types/website';

/**
 * 数据迁移工具
 * 用于将现有的单语言数据迁移到多语言格式
 */
export class DataMigrationHelper {
    /**
     * 迁移网站数据到多语言格式
     * @param website 网站数据
     * @returns 迁移后的网站数据
     */
    static migrateWebsite(website: Website): Website {
        const migratedWebsite = { ...website };

        // 迁移网站名称
        if (website.name && !website.siteMultiLang?.name) {
            migratedWebsite.siteMultiLang = {
                name: createMultiLanguageText(website.name),
            };
        }

        // 迁移 SEO 数据
        if (website.seo && !website.seoMultiLang) {
            migratedWebsite.seoMultiLang = {};

            if (website.seo.title) {
                migratedWebsite.seoMultiLang.title = createMultiLanguageText(website.seo.title);
            }

            if (website.seo.description) {
                migratedWebsite.seoMultiLang.description = createMultiLanguageText(website.seo.description);
            }

            if (website.seo.keywords) {
                migratedWebsite.seoMultiLang.keywords = createMultiLanguageText(website.seo.keywords);
            }
        }

        return migratedWebsite;
    }

    /**
     * 迁移编辑器网站数据到多语言格式
     * @param editWebsite 编辑器网站数据
     * @returns 迁移后的编辑器网站数据
     */
    static migrateEditWebsite(editWebsite: EditWebsite): EditWebsite {
        const migratedWebsite = JSON.parse(JSON.stringify(editWebsite)) as EditWebsite;

        // 迁移所有版本
        migratedWebsite.versions.forEach(version => {
            // 迁移页面
            version.pages.forEach(page => {
                this.migratePage(page);
            });

            // 迁移共享 Section
            version.shareSections.forEach(section => {
                this.migrateSection(section);
            });
        });

        return migratedWebsite;
    }

    /**
     * 迁移页面数据到多语言格式
     * @param page 页面数据
     */
    private static migratePage(page: Page): void {
        // 迁移页面名称
        if (page.name && !page.nameMultiLang) {
            page.nameMultiLang = createMultiLanguageText(page.name);
        }

        // 迁移页面 SEO
        if (page.metadata?.seo && !page.metadata.seoMultiLang) {
            page.metadata.seoMultiLang = {};

            if (page.metadata.seo.title) {
                page.metadata.seoMultiLang.title = createMultiLanguageText(page.metadata.seo.title);
            }

            if (page.metadata.seo.description) {
                page.metadata.seoMultiLang.description = createMultiLanguageText(page.metadata.seo.description);
            }

            if (page.metadata.seo.keywords) {
                page.metadata.seoMultiLang.keywords = createMultiLanguageText(page.metadata.seo.keywords);
            }
        }

        // 迁移页面中的 Section
        page.sections.forEach(section => {
            this.migrateSection(section);
        });
    }

    /**
     * 迁移 Section 数据到多语言格式
     * @param section Section 数据
     */
    private static migrateSection(section: Section): void {
        // 迁移 Section 标题
        if (section.title && !section.titleMultiLang) {
            section.titleMultiLang = createMultiLanguageText(section.title);
        }
    }

    /**
     * 检查网站是否需要迁移
     * @param website 网站数据
     * @returns 是否需要迁移
     */
    static needsMigration(website: Website): boolean {
        // 检查网站名称
        if (website.name && !website.siteMultiLang?.name) {
            return true;
        }

        // 检查 SEO
        if (website.seo && !website.seoMultiLang) {
            return true;
        }

        return false;
    }

    /**
     * 检查编辑器网站是否需要迁移
     * @param editWebsite 编辑器网站数据
     * @returns 是否需要迁移
     */
    static needsEditWebsiteMigration(editWebsite: EditWebsite): boolean {
        for (const version of editWebsite.versions) {
            // 检查页面
            for (const page of version.pages) {
                if (this.needsPageMigration(page)) {
                    return true;
                }
            }

            // 检查共享 Section
            for (const section of version.shareSections) {
                if (this.needsSectionMigration(section)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 检查页面是否需要迁移
     * @param page 页面数据
     * @returns 是否需要迁移
     */
    private static needsPageMigration(page: Page): boolean {
        // 检查页面名称
        if (page.name && !page.nameMultiLang) {
            return true;
        }

        // 检查页面 SEO
        if (page.metadata?.seo && !page.metadata.seoMultiLang) {
            return true;
        }

        // 检查页面中的 Section
        for (const section of page.sections) {
            if (this.needsSectionMigration(section)) {
                return true;
            }
        }

        return false;
    }

    /**
     * 检查 Section 是否需要迁移
     * @param section Section 数据
     * @returns 是否需要迁移
     */
    private static needsSectionMigration(section: Section): boolean {
        return !!(section.title && !section.titleMultiLang);
    }

    /**
     * 批量迁移网站列表
     * @param websites 网站列表
     * @returns 迁移后的网站列表
     */
    static batchMigrateWebsites(websites: Website[]): Website[] {
        return websites.map(website => this.migrateWebsite(website));
    }
}
