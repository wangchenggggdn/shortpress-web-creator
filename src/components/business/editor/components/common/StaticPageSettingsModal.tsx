import React, { useState, useEffect } from 'react';
import { IconArrowLeft } from '@tabler/icons-react';
import { TextInput, Textarea, Tabs } from '@mantine/core';
import { toast } from 'sonner';
import useEditorStore from '@/store/useEditorStore';
import { StaticPage } from '@/types/editor';
import WebsiteApi from '@/api/website';
import { SupportedLanguage, TranslationFieldType } from '@/types/translation';
import { TranslationHelper } from '@/utils/translationHelper';
import FAQEditor from './FAQEditor';
import StructuredContentEditor from './StructuredContentEditor';

interface StaticPageSettingsModalProps {
    open: boolean;
    onClose: () => void;
    staticPageId: string;
    staticPageName: string;
    staticPagePath: string;
    siteId: string; // ✅ 新增 siteId
}

const StaticPageSettingsModal: React.FC<StaticPageSettingsModalProps> = ({
    open,
    onClose,
    staticPageId,
    staticPageName,
    staticPagePath,
    siteId, // ✅ 新增
}) => {
    const { currentVersion, setCurrentVersion } = useEditorStore();
    const [activeTab, setActiveTab] = useState<string | null>('seo');
    const [showFAQEditor, setShowFAQEditor] = useState(false);
    const [showRichTextEditor, setShowRichTextEditor] = useState(false);

    // 查找当前固定页面的 SEO 配置
    const staticPage = currentVersion?.staticPages?.find(sp => sp.id === staticPageId);
    const seo = staticPage?.seo || {};

    const [title, setTitle] = useState(seo.title || '');
    const [description, setDescription] = useState(seo.description || '');
    const [keywords, setKeywords] = useState(seo.keywords || '');
    const [isTranslating, setIsTranslating] = useState(false);

    useEffect(() => {
        const staticPage = currentVersion?.staticPages?.find(sp => sp.id === staticPageId);
        const seo = staticPage?.seo || {};
        setTitle(seo.title || '');
        setDescription(seo.description || '');
        setKeywords(seo.keywords || '');
    }, [staticPageId, currentVersion]);

    if (!open || !currentVersion) return null;

    const handleUpdate = async () => {
        if (!currentVersion) return;

        setIsTranslating(true);

        try {
            // 深拷贝当前版本
            const updatedVersion = JSON.parse(JSON.stringify(currentVersion));

            // 确保 staticPages 数组存在
            if (!updatedVersion.staticPages) {
                updatedVersion.staticPages = [];
            }

            // 查找或创建固定页面配置
            let staticPageIndex = updatedVersion.staticPages.findIndex((sp: StaticPage) => sp.id === staticPageId);

            const updatedStaticPage: StaticPage = {
                id: staticPageId,
                name: staticPageName,
                path: staticPagePath,
                seo: {
                    title: title.trim(),
                    description: description.trim(),
                    keywords: keywords.trim(),
                },
            };

            // ✅ 清空对应的多语言字段（如果 SEO 字段为空）
            // 获取现有的 seoMultiLang
            const existingStaticPage = updatedVersion.staticPages.find((sp: StaticPage) => sp.id === staticPageId);
            if (existingStaticPage?.seoMultiLang) {
                const seoMultiLang = { ...existingStaticPage.seoMultiLang };

                // 如果 title 为空，删除 title 的多语言数据
                if (!title.trim()) {
                    delete seoMultiLang.title;
                }

                // 如果 description 为空，删除 description 的多语言数据
                if (!description.trim()) {
                    delete seoMultiLang.description;
                }

                // 如果 keywords 为空，删除 keywords 的多语言数据
                if (!keywords.trim()) {
                    delete seoMultiLang.keywords;
                }

                // 如果所有字段都被删除了，不设置 seoMultiLang
                if (Object.keys(seoMultiLang).length > 0) {
                    updatedStaticPage.seoMultiLang = seoMultiLang;
                }
                // 否则 seoMultiLang 保持 undefined（不设置）
            }

            // ✅ 先将用户输入保存到 staticPages 数组中
            // 这样 TranslationHelper 才能正确获取 original 值
            if (staticPageIndex >= 0) {
                updatedVersion.staticPages[staticPageIndex] = updatedStaticPage;
            } else {
                updatedVersion.staticPages.push(updatedStaticPage);
                staticPageIndex = updatedVersion.staticPages.length - 1;
            }

            // 尝试翻译 SEO 内容（只翻译非空字段）
            try {
                // 收集非空的 SEO 字段
                const seoTexts: any = {};
                if (title.trim()) seoTexts.title = title.trim();
                if (description.trim()) seoTexts.description = description.trim();
                if (keywords.trim()) seoTexts.keywords = keywords.trim();

                // 只有在有非空字段时才翻译
                if (Object.keys(seoTexts).length > 0) {
                    toast.info('Translating SEO content...');

                    const translationRequest = {
                        items: [
                            {
                                fieldType: TranslationFieldType.STATIC_PAGE,
                                texts: seoTexts,
                                context: {
                                    versionId: updatedVersion.id,
                                    staticPageId: staticPageId,
                                },
                            },
                        ],
                    };

                    const response = await WebsiteApi.translate(siteId, translationRequest);

                    // 检查翻译是否成功
                    if (response.code === 0 && response.data && response.data.length > 0) {
                        // 翻译成功，应用翻译结果
                        const translationResult = response.data[0];

                        // 创建临时网站对象用于应用翻译
                        const tempWebsite = {
                            id: '',
                            name: '',
                            versions: [updatedVersion],
                            currentVersion: updatedVersion.id,
                        };

                        // 应用翻译结果
                        const translatedWebsite = TranslationHelper.applyTranslationResults(tempWebsite, response.data);

                        // 从翻译后的网站中获取更新后的版本
                        const translatedVersion = translatedWebsite.versions[0];
                        const translatedStaticPage = translatedVersion.staticPages?.find((sp: StaticPage) => sp.id === staticPageId);

                        if (translatedStaticPage && translatedStaticPage.seoMultiLang) {
                            // ✅ 更新翻译结果到 staticPage
                            updatedVersion.staticPages[staticPageIndex].seoMultiLang = translatedStaticPage.seoMultiLang;
                        }

                        toast.success('SEO content translated successfully');
                    } else if (response.code === 7001) {
                        // 配置错误，直接保存
                        console.warn('Translation service not configured, saving without translation');
                        toast.warning('Translation service not configured, saving SEO without translation');
                    } else if (response.code === 7002) {
                        // 翻译错误，直接保存
                        console.warn('Translation service failed, saving without translation');
                        toast.warning('Translation failed, saving SEO without translation');
                    } else {
                        // 其他错误，直接保存
                        console.warn('Translation failed, saving without translation');
                        toast.warning('Translation failed, saving SEO without translation');
                    }
                } else {
                    // 所有 SEO 字段都是空的，跳过翻译
                    console.log('All SEO fields are empty, skipping translation');
                }
            } catch (translationError) {
                // 翻译失败，直接保存用户输入的值
                console.error('Translation error:', translationError);
                toast.warning('Translation failed, saving SEO without translation');
            }

            // ✅ 数据已经在翻译前保存到 updatedVersion.staticPages 中
            // 不需要再次保存

            // 更新版本并添加到历史记录（标记 isDirty）
            const { setCurrentVersion, addToHistory } = useEditorStore.getState();
            setCurrentVersion(updatedVersion);
            addToHistory(updatedVersion, 'update_static_page', `Updated static page SEO: ${staticPageName}`);

            toast.success('Static page SEO updated successfully');
            onClose();
        } catch (error) {
            console.error('Failed to update static page SEO:', error);
            toast.error('Failed to update SEO');
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex">
                {/* 遮罩 */}
                <div className="flex-1 bg-black/30" onClick={onClose}></div>
                {/* 侧边栏内容 */}
                <div className="w-[480px] h-full bg-white shadow-xl flex flex-col">
                    {/* 顶部 */}
                    <div className="flex items-center gap-2 px-4 py-4 border-b">
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
                            <IconArrowLeft size={20} />
                        </button>
                        <h2 className="text-lg font-semibold">{staticPageName} Settings</h2>
                    </div>

                    {/* 标签页 */}
                    <Tabs value={activeTab} onChange={setActiveTab} className="flex-1 flex flex-col">
                        <Tabs.List className="px-4 border-b">
                            <Tabs.Tab value="seo">SEO</Tabs.Tab>
                            <Tabs.Tab value="content">Content</Tabs.Tab>
                        </Tabs.List>

                        {/* SEO 标签页 */}
                        <Tabs.Panel value="seo" className="flex-1 flex flex-col">
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium mb-2">Page Name</h3>
                                    <TextInput value={staticPageName} disabled variant="filled" className="opacity-60" />
                                    <p className="text-xs text-gray-500 mt-1">This is a default page and cannot be renamed</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium mb-2">SEO Settings</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-xs font-medium mb-1">Title</div>
                                            <TextInput value={title} onChange={e => setTitle(e.target.value)} placeholder="Page Title in search results" variant="filled" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium mb-1">Description</div>
                                            <Textarea
                                                value={description}
                                                onChange={e => setDescription(e.target.value)}
                                                placeholder="Page Description in search results"
                                                minRows={3}
                                                variant="filled"
                                            />
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium mb-1">Keywords</div>
                                            <TextInput value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="Add keywords (comma separated)" variant="filled" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* 底部按钮 */}
                            <div className="p-6 border-t">
                                <button
                                    className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleUpdate}
                                    disabled={isTranslating}
                                >
                                    {isTranslating ? 'Translating & Saving...' : 'Update SEO'}
                                </button>
                            </div>
                        </Tabs.Panel>

                        {/* Content 标签页 */}
                        <Tabs.Panel value="content" className="flex-1 flex flex-col">
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium mb-2">{staticPageName} Content</h3>
                                        <p className="text-xs text-gray-500 mb-4">
                                            {staticPagePath === 'faq'
                                                ? 'Manage your frequently asked questions and answers.'
                                                : staticPagePath === 'privacy-policy'
                                                  ? 'Edit your privacy policy content.'
                                                  : 'Edit your terms of service content.'}
                                        </p>
                                        <button
                                            onClick={() => {
                                                if (staticPagePath === 'faq') {
                                                    setShowFAQEditor(true);
                                                } else {
                                                    setShowRichTextEditor(true);
                                                }
                                            }}
                                            className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark transition-colors"
                                        >
                                            Edit {staticPageName} Content
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Tabs.Panel>
                    </Tabs>
                </div>
            </div>

            {/* FAQ 编辑器模态框 */}
            {staticPagePath === 'faq' && <FAQEditor open={showFAQEditor} onClose={() => setShowFAQEditor(false)} siteId={siteId} />}

            {/* 富文本编辑器模态框 */}
            {(staticPagePath === 'privacy-policy' || staticPagePath === 'terms-of-service') && (
                <StructuredContentEditor
                    open={showRichTextEditor}
                    onClose={() => setShowRichTextEditor(false)}
                    siteId={siteId}
                    type={staticPagePath as 'privacy-policy' | 'terms-of-service'}
                    pageName={staticPageName}
                />
            )}
        </>
    );
};

export default StaticPageSettingsModal;
