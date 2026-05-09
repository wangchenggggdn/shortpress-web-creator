'use client';

import { Modal, TextInput, Button, Group, Tooltip, Box, ActionIcon, Paper, Menu, Text, rem } from '@mantine/core';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import OrderedList from '@tiptap/extension-ordered-list';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import FloatingMenuExtension from '@tiptap/extension-floating-menu';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { RichTextEditor } from '@mantine/tiptap';
import { IconBold, IconItalic, IconUnderline, IconStrikethrough, IconHighlight, IconEraser, IconH1, IconH2, IconList, IconListNumbers, IconTypography } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { StaticPageType } from '@/types/staticPage';
import StaticPageApi from '@/api/staticPage';
import { toast } from 'sonner';
import '@mantine/tiptap/styles.css';

interface StructuredContentEditorProps {
    open: boolean;
    onClose: () => void;
    siteId: string;
    type: StaticPageType;
    pageName: string;
}

// Custom OrderedList extension to support parenthesized style
const ExtendedOrderedList = OrderedList.extend({
    name: 'orderedList', // Ensure name matches strictly
    content: 'listItem+',
    group: 'block list',
    addAttributes() {
        return {
            listStyle: {
                default: null,
                parseHTML: element => element.getAttribute('data-list-style'),
                renderHTML: attributes => {
                    if (!attributes.listStyle) {
                        return {};
                    }
                    return { 'data-list-style': attributes.listStyle };
                },
            },
        };
    },
});

// Custom TextStyle extension to support fontSize
const ExtendedTextStyle = TextStyle.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            fontSize: {
                default: null,
                parseHTML: element => element.style.fontSize,
                renderHTML: attributes => {
                    if (!attributes.fontSize) {
                        return {};
                    }
                    return { style: `font-size: ${attributes.fontSize}` };
                },
            },
        };
    },
});

// 迁移相关类型定义
interface LegacyContentSection {
    id: string;
    type: 'heading' | 'paragraph' | 'list' | 'ordered-list' | 'quote' | 'divider' | 'link' | 'table';
    level?: 1 | 2 | 3;
    content: string;
    url?: string;
    linkText?: string;
    visible?: boolean;
}

// 将旧数据迁移到 HTML 字符串
const migrateLegacyDataToHtml = (sections: LegacyContentSection[]): string => {
    if (!Array.isArray(sections) || sections.length === 0) return '';

    return sections
        .filter(s => s.visible !== false)
        .map(section => {
            // 简单的 Markdown 转 HTML 处理 (仅加粗, 斜体, 链接)
            const processMarkdown = (text: string) => {
                if (!text) return '';
                let processedText = text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
                    .replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italic

                // Basic Markdown link to HTML link
                processedText = processedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

                return processedText;
            };

            const content = processMarkdown(section.content);

            switch (section.type) {
                case 'heading':
                    const level = section.level || 2;
                    return `<h${level}>${content}</h${level}>`;
                case 'paragraph':
                    return `<p>${content}</p>`;
                case 'quote':
                    return `<blockquote><p>${content}</p></blockquote>`;
                case 'list':
                    return `<ul>${section.content
                        .split('\n')
                        .filter(Boolean)
                        .map(item => `<li>${processMarkdown(item)}</li>`)
                        .join('')}</ul>`;
                case 'ordered-list':
                    return `<ol>${section.content
                        .split('\n')
                        .filter(Boolean)
                        .map(item => `<li>${processMarkdown(item)}</li>`)
                        .join('')}</ol>`;
                case 'divider':
                    return '<hr>';
                case 'link':
                    return `<p><a href="${section.url}" target="_blank" rel="noopener noreferrer">${section.linkText || section.url}</a></p>`;
                case 'table':
                    // Tiptap StarterKit does not include tables by default.
                    // For migration, we'll convert table data into a preformatted block or paragraph
                    // to preserve the raw data, as direct HTML table rendering might not be editable
                    // in Tiptap without a specific table extension.
                    const tableLines = section.content.split('\n').filter(line => line.trim());
                    if (tableLines.length > 0) {
                        const headers = tableLines[0].split('|').map(h => h.trim());
                        const rows = tableLines.slice(1).map(line => line.split('|').map(cell => cell.trim()));

                        let tableHtml = '<table><thead><tr>';
                        headers.forEach(h => (tableHtml += `<th>${h}</th>`));
                        tableHtml += '</tr></thead><tbody>';
                        rows.forEach(row => {
                            tableHtml += '<tr>';
                            row.forEach(cell => (tableHtml += `<td>${cell}</td>`));
                            tableHtml += '</tr>';
                        });
                        tableHtml += '</tbody></table>';
                        return tableHtml;
                    }
                    return `<p>[Table Data]<br>${content}</p>`; // Fallback if table content is malformed
                default:
                    return `<p>${content}</p>`;
            }
        })
        .join('');
};

const StructuredContentEditor: React.FC<StructuredContentEditorProps> = ({ open, onClose, siteId, type, pageName }) => {
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isNewConfig, setIsNewConfig] = useState(true);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                orderedList: false, // Disable default OrderedList to use ExtendedOrderedList
            }),
            ExtendedOrderedList,
            Underline,
            Link.configure({
                autolink: true,
                linkOnPaste: true,
                openOnClick: false, // Prevent opening link on click in editor
            }),
            Highlight,
            ExtendedTextStyle,
            Color,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder: 'Write your content here...' }),
            BubbleMenuExtension,
            FloatingMenuExtension,
        ],
        content: '',
        immediatelyRender: false, // Fix hydration mismatch
    });

    useEffect(() => {
        if (open && siteId && type) {
            loadContent();
        } else {
            // Reset when closed
            editor?.commands.clearContent();
            setTitle('');
        }
    }, [open, siteId, type, editor]);

    const loadContent = async () => {
        setLoading(true);
        try {
            const item = await StaticPageApi.getPageConfig(type);
            if (item && item.config) {
                setIsNewConfig(false);
                try {
                    const configObj = typeof item.config === 'string' ? JSON.parse(item.config) : item.config;
                    setTitle(configObj.title || pageName);

                    if (configObj.content) {
                        try {
                            // 尝试解析 JSON
                            const parsedContent = JSON.parse(configObj.content);

                            // 检查是否是旧的数组格式
                            if (Array.isArray(parsedContent)) {
                                console.log('Migrating legacy content to Tiptap editor...');
                                const html = migrateLegacyDataToHtml(parsedContent as LegacyContentSection[]);
                                editor?.commands.setContent(html);
                            } else {
                                // 应该是 Tiptap JSON 格式，直接设置
                                editor?.commands.setContent(parsedContent);
                            }
                        } catch (e) {
                            // 如果不是 JSON，可能是纯文本或 HTML，直接作为 HTML 插入
                            editor?.commands.setContent(configObj.content);
                        }
                    } else {
                        editor?.commands.setContent('');
                    }
                } catch (e) {
                    console.error('Failed to parse config:', e);
                    setTitle(pageName);
                    editor?.commands.setContent('');
                }
            } else {
                setIsNewConfig(true);
                setTitle(pageName);
                editor?.commands.setContent('');
            }
        } catch (error) {
            console.error('Failed to load content:', error);
            setTitle(pageName);
            setIsNewConfig(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editor) return;

        if (!title.trim()) {
            toast.error('Please enter a title');
            return;
        }

        if (editor.isEmpty) {
            toast.error('Content cannot be empty');
            return;
        }

        setSaving(true);
        try {
            // 保存为 Tiptap JSON 字符串
            const contentJson = JSON.stringify(editor.getJSON());

            const configObj = {
                title: title.trim(),
                content: contentJson,
            };

            let success = false;

            if (isNewConfig) {
                success = await StaticPageApi.createPageConfig({
                    type,
                    config: configObj,
                });
            } else {
                success = await StaticPageApi.updatePageConfig({
                    type,
                    config: configObj,
                });
            }

            if (success) {
                toast.success('Content saved successfully');
                setIsNewConfig(false);
                onClose();
            } else {
                toast.error('Failed to save content');
            }
        } catch (error) {
            console.error('Failed to save content:', error);
            toast.error('Failed to save content');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal opened={open} onClose={onClose} title={`Edit ${pageName}`} size="xl" closeOnClickOutside={false} classNames={{ body: 'flex flex-col h-[80vh]' }}>
            {loading ? (
                <div className="text-center py-8">
                    <div className="text-gray-500">Loading content...</div>
                </div>
            ) : (
                <div className="flex flex-col h-full gap-4">
                    <TextInput label="Page Title" value={title} onChange={e => setTitle(e.target.value)} placeholder={`e.g., ${pageName}`} required />

                    <div className="flex-1 overflow-hidden border rounded-lg flex flex-col min-h-0">
                        <RichTextEditor editor={editor} className="flex-1 flex flex-col border-0 min-h-0 overflow-hidden">
                            <RichTextEditor.Toolbar>
                                <RichTextEditor.ControlsGroup>
                                    <Tooltip label="Bold" withArrow>
                                        <RichTextEditor.Bold />
                                    </Tooltip>
                                    <Tooltip label="Italic" withArrow>
                                        <RichTextEditor.Italic />
                                    </Tooltip>
                                    <Tooltip label="Underline" withArrow>
                                        <RichTextEditor.Underline />
                                    </Tooltip>
                                    <Tooltip label="Strikethrough" withArrow>
                                        <RichTextEditor.Strikethrough />
                                    </Tooltip>
                                    <Tooltip label="Clear formatting" withArrow>
                                        <RichTextEditor.ClearFormatting />
                                    </Tooltip>
                                    <Tooltip label="Highlight" withArrow>
                                        <RichTextEditor.Highlight />
                                    </Tooltip>
                                    <Tooltip label="Code" withArrow>
                                        <RichTextEditor.Code />
                                    </Tooltip>
                                </RichTextEditor.ControlsGroup>

                                <RichTextEditor.ControlsGroup>
                                    <Tooltip label="Heading 1" withArrow>
                                        <RichTextEditor.H1 />
                                    </Tooltip>
                                    <Tooltip label="Heading 2" withArrow>
                                        <RichTextEditor.H2 />
                                    </Tooltip>
                                    <Tooltip label="Heading 3" withArrow>
                                        <RichTextEditor.H3 />
                                    </Tooltip>
                                    <Tooltip label="Heading 4" withArrow>
                                        <RichTextEditor.H4 />
                                    </Tooltip>
                                </RichTextEditor.ControlsGroup>

                                <RichTextEditor.ControlsGroup>
                                    <Menu trigger="hover" shadow="md" width={100} withinPortal>
                                        <Menu.Target>
                                            <Tooltip label="Font Size" withArrow>
                                                <RichTextEditor.Control>
                                                    <IconTypography stroke={1.5} size="1rem" />
                                                </RichTextEditor.Control>
                                            </Tooltip>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item onClick={() => editor?.chain().focus().unsetMark('textStyle').run()}>Default</Menu.Item>
                                            <Menu.Item onClick={() => editor?.chain().focus().setMark('textStyle', { fontSize: '12px' }).run()} style={{ fontSize: '12px' }}>
                                                12px
                                            </Menu.Item>
                                            <Menu.Item onClick={() => editor?.chain().focus().setMark('textStyle', { fontSize: '14px' }).run()} style={{ fontSize: '14px' }}>
                                                14px
                                            </Menu.Item>
                                            <Menu.Item onClick={() => editor?.chain().focus().setMark('textStyle', { fontSize: '16px' }).run()} style={{ fontSize: '16px' }}>
                                                16px
                                            </Menu.Item>
                                            <Menu.Item onClick={() => editor?.chain().focus().setMark('textStyle', { fontSize: '18px' }).run()} style={{ fontSize: '18px' }}>
                                                18px
                                            </Menu.Item>
                                            <Menu.Item onClick={() => editor?.chain().focus().setMark('textStyle', { fontSize: '20px' }).run()} style={{ fontSize: '20px' }}>
                                                20px
                                            </Menu.Item>
                                            <Menu.Item onClick={() => editor?.chain().focus().setMark('textStyle', { fontSize: '24px' }).run()} style={{ fontSize: '24px' }}>
                                                24px
                                            </Menu.Item>
                                            <Menu.Item onClick={() => editor?.chain().focus().setMark('textStyle', { fontSize: '30px' }).run()} style={{ fontSize: '30px' }}>
                                                30px
                                            </Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>
                                </RichTextEditor.ControlsGroup>

                                <RichTextEditor.ControlsGroup>
                                    <Tooltip label="Blockquote" withArrow>
                                        <RichTextEditor.Blockquote />
                                    </Tooltip>
                                    <Tooltip label="Horizontal rule" withArrow>
                                        <RichTextEditor.Hr />
                                    </Tooltip>
                                    <Tooltip label="Bullet list" withArrow>
                                        <RichTextEditor.BulletList />
                                    </Tooltip>
                                    <Tooltip label="Ordered list (1. 2. 3.)" withArrow>
                                        <RichTextEditor.Control
                                            onClick={() => {
                                                const isOrdered = editor?.isActive('orderedList');
                                                const isParens = editor?.isActive('orderedList', { listStyle: 'parens' });

                                                if (isParens) {
                                                    // Switch to standard
                                                    editor?.chain().focus().updateAttributes('orderedList', { listStyle: null }).run();
                                                } else if (isOrdered) {
                                                    // Toggle off
                                                    editor?.chain().focus().toggleOrderedList().run();
                                                } else {
                                                    // Toggle on standard
                                                    editor?.chain().focus().toggleOrderedList().run();
                                                }
                                            }}
                                            active={editor?.isActive('orderedList') && !editor?.isActive('orderedList', { listStyle: 'parens' })}
                                        >
                                            <IconListNumbers stroke={1.5} size="1rem" />
                                        </RichTextEditor.Control>
                                    </Tooltip>
                                    <Tooltip label="Parenthesized list (1) (2)" withArrow>
                                        <RichTextEditor.Control
                                            onClick={() => {
                                                const isOrdered = editor?.isActive('orderedList');
                                                const isParens = editor?.isActive('orderedList', { listStyle: 'parens' });

                                                if (isParens) {
                                                    // Toggle off
                                                    editor?.chain().focus().toggleOrderedList().run();
                                                } else if (isOrdered) {
                                                    // Switch to parens
                                                    editor?.chain().focus().updateAttributes('orderedList', { listStyle: 'parens' }).run();
                                                } else {
                                                    // Toggle on parens
                                                    editor?.chain().focus().toggleOrderedList().updateAttributes('orderedList', { listStyle: 'parens' }).run();
                                                }
                                            }}
                                            active={editor?.isActive('orderedList', { listStyle: 'parens' })}
                                        >
                                            <span className="text-[10px] font-bold">(1)</span>
                                        </RichTextEditor.Control>
                                    </Tooltip>
                                </RichTextEditor.ControlsGroup>

                                <RichTextEditor.ControlsGroup>
                                    <Tooltip label="Link" withArrow>
                                        <RichTextEditor.Link />
                                    </Tooltip>
                                    <Tooltip label="Unlink" withArrow>
                                        <RichTextEditor.Unlink />
                                    </Tooltip>
                                </RichTextEditor.ControlsGroup>

                                <RichTextEditor.ControlsGroup>
                                    <Tooltip label="Align left" withArrow>
                                        <RichTextEditor.AlignLeft />
                                    </Tooltip>
                                    <Tooltip label="Align center" withArrow>
                                        <RichTextEditor.AlignCenter />
                                    </Tooltip>
                                    <Tooltip label="Align justify" withArrow>
                                        <RichTextEditor.AlignJustify />
                                    </Tooltip>
                                    <Tooltip label="Align right" withArrow>
                                        <RichTextEditor.AlignRight />
                                    </Tooltip>
                                </RichTextEditor.ControlsGroup>

                                <RichTextEditor.ControlsGroup>
                                    <Tooltip label="Undo" withArrow>
                                        <RichTextEditor.Undo />
                                    </Tooltip>
                                    <Tooltip label="Redo" withArrow>
                                        <RichTextEditor.Redo />
                                    </Tooltip>
                                </RichTextEditor.ControlsGroup>
                            </RichTextEditor.Toolbar>

                            <RichTextEditor.Content className="flex-1 overflow-y-auto p-4 legal-content [&_.ProseMirror]:min-h-full [&_.ProseMirror]:outline-none" />

                            {editor && (
                                <>
                                    <BubbleMenu editor={editor}>
                                        <Paper shadow="md" radius="sm" className="flex gap-1 p-1 border" withBorder>
                                            <ActionIcon
                                                variant={editor.isActive('bold') ? 'light' : 'subtle'}
                                                color={editor.isActive('bold') ? 'indigo' : 'gray'}
                                                onClick={() => editor.chain().focus().toggleBold().run()}
                                            >
                                                <IconBold size={16} />
                                            </ActionIcon>
                                            <ActionIcon
                                                variant={editor.isActive('italic') ? 'light' : 'subtle'}
                                                color={editor.isActive('italic') ? 'indigo' : 'gray'}
                                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                            >
                                                <IconItalic size={16} />
                                            </ActionIcon>
                                            <ActionIcon
                                                variant={editor.isActive('underline') ? 'light' : 'subtle'}
                                                color={editor.isActive('underline') ? 'indigo' : 'gray'}
                                                onClick={() => editor.chain().focus().toggleUnderline().run()}
                                            >
                                                <IconUnderline size={16} />
                                            </ActionIcon>
                                            <ActionIcon
                                                variant={editor.isActive('strike') ? 'light' : 'subtle'}
                                                color={editor.isActive('strike') ? 'indigo' : 'gray'}
                                                onClick={() => editor.chain().focus().toggleStrike().run()}
                                            >
                                                <IconStrikethrough size={16} />
                                            </ActionIcon>
                                            <ActionIcon
                                                variant={editor.isActive('highlight') ? 'light' : 'subtle'}
                                                color={editor.isActive('highlight') ? 'indigo' : 'gray'}
                                                onClick={() => editor.chain().focus().toggleHighlight().run()}
                                            >
                                                <IconHighlight size={16} />
                                            </ActionIcon>
                                            <ActionIcon variant="subtle" color="gray" onClick={() => editor.chain().focus().unsetAllMarks().run()}>
                                                <IconEraser size={16} />
                                            </ActionIcon>
                                        </Paper>
                                    </BubbleMenu>

                                    <FloatingMenu editor={editor}>
                                        <Paper shadow="md" radius="sm" className="flex gap-1 p-1 border" withBorder>
                                            <ActionIcon
                                                variant={editor.isActive('heading', { level: 1 }) ? 'light' : 'subtle'}
                                                color={editor.isActive('heading', { level: 1 }) ? 'indigo' : 'gray'}
                                                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                            >
                                                <IconH1 size={16} />
                                            </ActionIcon>
                                            <ActionIcon
                                                variant={editor.isActive('heading', { level: 2 }) ? 'light' : 'subtle'}
                                                color={editor.isActive('heading', { level: 2 }) ? 'indigo' : 'gray'}
                                                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                            >
                                                <IconH2 size={16} />
                                            </ActionIcon>
                                            <ActionIcon
                                                variant={editor.isActive('bulletList') ? 'light' : 'subtle'}
                                                color={editor.isActive('bulletList') ? 'indigo' : 'gray'}
                                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                                            >
                                                <IconList size={16} />
                                            </ActionIcon>
                                            <ActionIcon
                                                variant={editor.isActive('orderedList') ? 'light' : 'subtle'}
                                                color={editor.isActive('orderedList') ? 'indigo' : 'gray'}
                                                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                            >
                                                <IconListNumbers size={16} />
                                            </ActionIcon>
                                        </Paper>
                                    </FloatingMenu>
                                </>
                            )}
                        </RichTextEditor>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="default" onClick={onClose} disabled={saving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} loading={saving}>
                            Save Content
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default StructuredContentEditor;
