'use client';

import { Modal, TextInput, Textarea, Button } from '@mantine/core';
import { IconPlus, IconTrash, IconGripVertical, IconEye, IconEyeOff } from '@tabler/icons-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useEffect } from 'react';
import { FAQItem } from '@/types/staticPage';
import { createUniqueUUID } from '@/utils/public';
import StaticPageApi from '@/api/staticPage';
import { toast } from 'sonner';

interface FAQEditorProps {
    open: boolean;
    onClose: () => void;
    siteId: string;
}

// FAQ 项组件
const FAQItemComponent: React.FC<{
    item: FAQItem;
    onUpdate: (item: FAQItem) => void;
    onDelete: () => void;
}> = ({ item, onUpdate, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: item.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className={`p-4 border rounded-lg ${item.visible ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
            <div className="flex items-start gap-2">
                <div {...attributes} {...listeners} className="cursor-move mt-2">
                    <IconGripVertical size={20} className="text-gray-400" />
                </div>

                <div className="flex-1 space-y-2">
                    <TextInput
                        label="Question"
                        value={item.question}
                        onChange={e =>
                            onUpdate({
                                ...item,
                                question: e.target.value,
                            })
                        }
                        placeholder="Enter your question"
                    />
                    <Textarea
                        label="Answer"
                        value={item.answer}
                        onChange={e =>
                            onUpdate({
                                ...item,
                                answer: e.target.value,
                            })
                        }
                        placeholder="Enter the answer"
                        minRows={3}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <button
                        onClick={() =>
                            onUpdate({
                                ...item,
                                visible: !item.visible,
                            })
                        }
                        className={`p-2 rounded ${item.visible ? 'text-blue-500 hover:bg-blue-50' : 'text-gray-400 hover:bg-gray-100'}`}
                        title={item.visible ? 'Hide question' : 'Show question'}
                    >
                        {item.visible ? <IconEye size={20} /> : <IconEyeOff size={20} />}
                    </button>
                    <button onClick={onDelete} className="p-2 text-red-500 hover:bg-red-50 rounded" title="Delete question">
                        <IconTrash size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// FAQ 编辑器
const FAQEditor: React.FC<FAQEditorProps> = ({ open, onClose, siteId }) => {
    const [title, setTitle] = useState('Frequently Asked Questions');
    const [items, setItems] = useState<FAQItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isNewConfig, setIsNewConfig] = useState(true);

    // 加载 FAQ 内容
    useEffect(() => {
        if (open && siteId) {
            loadContent();
        }
    }, [open, siteId]);

    const loadContent = async () => {
        setLoading(true);
        try {
            const item = await StaticPageApi.getPageConfig('faq');
            if (item && item.config) {
                setIsNewConfig(false);
                try {
                    const configObj = typeof item.config === 'string' ? JSON.parse(item.config) : item.config;
                    setTitle(configObj.title || 'Frequently Asked Questions');

                    // 解析 JSON 内容
                    if (configObj.content) {
                        try {
                            const parsedItems = JSON.parse(configObj.content) as FAQItem[];
                            setItems(parsedItems);
                        } catch (parseError) {
                            console.error('Failed to parse FAQ content:', parseError);
                            setItems([]);
                        }
                    } else {
                        setItems([]);
                    }
                } catch (e) {
                    console.error('Failed to parse config:', e);
                    setTitle('Frequently Asked Questions');
                    setItems([]);
                }
            } else {
                // 如果没有数据,使用默认值
                setIsNewConfig(true);
                setTitle('Frequently Asked Questions');
                setItems([]);
            }
        } catch (error) {
            console.error('Failed to load FAQ content:', error);
            // 加载失败时使用默认值
            setTitle('Frequently Asked Questions');
            setItems([]);
            setIsNewConfig(true);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        const newItem: FAQItem = {
            id: createUniqueUUID(items.map(i => i.id)),
            question: '',
            answer: '',
            order: items.length,
            visible: true,
        };
        setItems([...items, newItem]);
    };

    const handleUpdateItem = (id: string, updatedItem: FAQItem) => {
        setItems(items.map(item => (item.id === id ? updatedItem : item)));
    };

    const handleDeleteItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = items.findIndex(i => i.id === active.id);
            const newIndex = items.findIndex(i => i.id === over.id);
            const reorderedItems = arrayMove(items, oldIndex, newIndex);

            // 更新 order 字段
            setItems(
                reorderedItems.map((item, index) => ({
                    ...item,
                    order: index,
                }))
            );
        }
    };

    const handleSave = async () => {
        // 验证
        if (!title.trim()) {
            toast.error('Please enter a title');
            return;
        }

        if (items.length === 0) {
            toast.error('Please add at least one question');
            return;
        }

        // 检查是否有空问题或答案
        const hasEmptyFields = items.some(item => !item.question.trim() || !item.answer.trim());

        if (hasEmptyFields) {
            toast.error('Please fill in all questions and answers');
            return;
        }

        setSaving(true);
        try {
            // 将 items 转换为 JSON 字符串
            const contentJson = JSON.stringify(
                items.map((item, index) => ({
                    ...item,
                    question: item.question.trim(),
                    answer: item.answer.trim(),
                    order: index, // 确保 order 是连续的
                }))
            );

            const configObj = {
                title: title.trim(),
                content: contentJson,
            };

            let success = false;

            if (isNewConfig) {
                success = await StaticPageApi.createPageConfig({
                    type: 'faq',
                    config: configObj,
                });
            } else {
                success = await StaticPageApi.updatePageConfig({
                    type: 'faq',
                    config: configObj,
                });
            }

            if (success) {
                toast.success('FAQ saved successfully');
                setIsNewConfig(false);
                onClose();
            } else {
                toast.error('Failed to save FAQ');
            }
        } catch (error) {
            console.error('Failed to save FAQ:', error);
            toast.error('Failed to save FAQ');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal opened={open} onClose={onClose} title="Edit FAQ" size="xl" closeOnClickOutside={false}>
            {loading ? (
                <div className="text-center py-8">
                    <div className="text-gray-500">Loading FAQ...</div>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* 页面标题 */}
                    <TextInput label="Page Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Frequently Asked Questions" required />

                    {/* FAQ 列表 */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium">FAQ Items ({items.length})</label>
                            <Button leftSection={<IconPlus size={16} />} onClick={handleAddItem} size="sm" variant="light">
                                Add Question
                            </Button>
                        </div>

                        {items.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                                <p>No questions yet. Click "Add Question" to get started.</p>
                            </div>
                        ) : (
                            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                        {items.map(item => (
                                            <FAQItemComponent
                                                key={item.id}
                                                item={item}
                                                onUpdate={updated => handleUpdateItem(item.id, updated)}
                                                onDelete={() => handleDeleteItem(item.id)}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                        <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50" disabled={saving}>
                            Cancel
                        </button>
                        <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50" disabled={saving}>
                            {saving ? 'Saving...' : 'Save FAQ'}
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default FAQEditor;
