'use client';

import React, { useState } from 'react';
import { IconPlus, IconFile, IconHome, IconDots, IconTrash, IconSettings, IconCopy, IconPencil } from '@tabler/icons-react';
import useEditorStore from '@/store/useEditorStore';
import { Page, Section } from '@/types/editor';
import { DEFAULT_PAGES } from '@/constants/initial-version';
import { Menu } from '@mantine/core';
import InputModal from '@/components/common/input-modal';
import { createUniqueUUID } from '@/utils/public';
import PageSettingsModal from './common/PageSettingsModal';

interface PageListProps {
    onPageChange?: (pageId: string) => void;
}

const PageList: React.FC<PageListProps> = ({ onPageChange }) => {
    const { currentVersion, currentPage, setCurrentPage, addPage, deletePage, updatePage } = useEditorStore();
    const [currentOperatePage, setCurrentOperatePage] = useState<Page | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [settingsPage, setSettingsPage] = useState<Page | null>(null);

    const handleAddPage = (pageName: string) => {
        if (!currentVersion) return;

        // 获取所有已存在的页面ID
        const existingIds = [...currentVersion.pages.map(page => page.id), ...DEFAULT_PAGES.map(page => page.id)];

        const newPage: Page = {
            id: createUniqueUUID(existingIds),
            name: pageName,
            path: pageName.toLowerCase().replace(/\s+/g, '-'),
            sections: [],
            metadata: {},
        };

        addPage(newPage);
        setCurrentPage(newPage.id);
        if (onPageChange) {
            onPageChange(newPage.id);
        }
    };

    const handleDeletePage = (pageId: string) => {
        deletePage(pageId);
    };

    const handlePageClick = (pageId: string) => {
        setCurrentPage(pageId);
        if (onPageChange) {
            onPageChange(pageId);
        }
    };

    const handleSetAsHome = (page: Page) => {
        if (!currentVersion) return;

        // 先清除其他页面的home标记
        currentVersion.pages.forEach(p => {
            if (p.id !== page.id && p.isHome) {
                p.isHome = false;
            }
        });

        // 设置当前页面为home
        updatePage(page.id, {
            isHome: true,
        });
    };

    const handleDuplicatePage = (page: Page) => {
        if (!currentVersion) return;

        // 获取所有已存在的页面ID
        const existingIds = [...currentVersion.pages.map(page => page.id), ...DEFAULT_PAGES.map(page => page.id)];

        const newPage: Page = {
            ...page,
            id: createUniqueUUID(existingIds),
            name: `${page.name} Copy`,
            path: `${page.path}-copy`,
            isHome: false,
            metadata: {},
        };

        addPage(newPage);
    };

    const handleRenamePage = (page: Page, newName: string) => {
        if (!currentVersion) return;
        updatePage(page.id, {
            name: newName,
            path: newName.toLowerCase().replace(/\s+/g, '-'),
        });
    };

    if (!currentVersion) {
        return <div className="p-4 text-center text-gray-500">Loading...</div>;
    }

    const renderPageItem = (id: string, name: string, isCustom: boolean = false, page?: Page) => {
        const isHome = page?.isHome;

        return (
            <div
                key={id}
                className={`flex items-center p-2 rounded-lg cursor-pointer group transition-colors ${
                    isCustom
                        ? currentPage === id
                            ? 'bg-primary text-white'
                            : 'bg-white border border-gray-200 hover:border-primary hover:text-primary'
                        : 'bg-white border border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                onClick={() => isCustom && handlePageClick(id)}
            >
                {id === 'home' ? (
                    <IconHome size={18} className={`mr-2 ${isCustom ? (currentPage === id ? 'text-white' : 'text-gray-400') : 'text-gray-400'}`} />
                ) : (
                    <IconFile size={18} className={`mr-2 ${isCustom ? (currentPage === id ? 'text-white' : 'text-gray-400') : 'text-gray-400'}`} />
                )}
                <span className="truncate flex-1 font-medium">{name}</span>
                {isCustom && (
                    <div className="flex items-center">
                        {isHome && <IconHome size={18} className={`mr-2 ${currentPage === id ? 'text-white' : 'text-primary'}`} />}
                        <Menu position="bottom-end" offset={4} withArrow>
                            <Menu.Target>
                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        setCurrentOperatePage(page!);
                                    }}
                                    className={`p-1 rounded ${currentPage === id ? 'hover:bg-primary-dark' : 'hover:bg-gray-100'}`}
                                >
                                    <IconDots size={16} className={currentPage === id ? 'text-white' : 'text-gray-500'} />
                                </button>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item
                                    leftSection={<IconHome size={16} />}
                                    onClick={e => {
                                        e.stopPropagation();
                                        handleSetAsHome(page!);
                                    }}
                                >
                                    Set as Home page
                                </Menu.Item>
                                <Menu.Item
                                    leftSection={<IconSettings size={16} />}
                                    onClick={e => {
                                        e.stopPropagation();
                                        setCurrentOperatePage(page!);
                                        setIsSettingsModalOpen(true);
                                    }}
                                >
                                    Settings
                                </Menu.Item>
                                <Menu.Item
                                    leftSection={<IconPencil size={16} />}
                                    onClick={e => {
                                        e.stopPropagation();
                                        setIsRenameModalOpen(true);
                                    }}
                                >
                                    Rename
                                </Menu.Item>
                                <Menu.Item
                                    leftSection={<IconCopy size={16} />}
                                    onClick={e => {
                                        e.stopPropagation();
                                        handleDuplicatePage(page!);
                                    }}
                                >
                                    Duplicate
                                </Menu.Item>
                                <Menu.Divider />
                                {page?.id !== currentVersion.pages[0].id && <Menu.Item
                                    leftSection={<IconTrash size={16} />}
                                    color="red"
                                    onClick={e => {
                                        e.stopPropagation();
                                        handleDeletePage(id);
                                    }}
                                >
                                    Delete Page
                                </Menu.Item>}
                            </Menu.Dropdown>
                        </Menu>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <div className="flex flex-col h-full bg-gray-50/50 gap-2">
                <div className="px-4 pt-4 flex items-center justify-between mb-2 sticky top-0">
                    <h2 className="text-sm font-medium text-gray-500">Custom Pages</h2>
                    <button onClick={() => setIsAddModalOpen(true)} className="p-1 hover:bg-gray-100 rounded-lg text-primary" title="Add new page">
                        <IconPlus size={18} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {/* Custom Pages Section */}
                    <div className="px-4">
                        <div className="space-y-1">{currentVersion.pages.map((page: Page) => renderPageItem(page.id, page.name, true, page))}</div>
                    </div>

                    {/* Default Pages Section */}
                    <div className="p-4 pb-8">
                        <h2 className="text-sm font-medium text-gray-500 mb-2">Default Pages</h2>
                        <div className="space-y-1">{DEFAULT_PAGES.map(page => renderPageItem(page.id, page.name))}</div>
                    </div>
                </div>
            </div>

            <InputModal
                opened={isRenameModalOpen}
                onClose={() => setIsRenameModalOpen(false)}
                onSubmit={newName => handleRenamePage(currentOperatePage!, newName)}
                title="Rename Page"
                placeholder="Enter Page Name"
                submitText="Rename"
            />

            <InputModal
                opened={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddPage}
                title="Add New Page"
                placeholder="Enter Page Name"
                submitText="Add Page"
            />

            {currentOperatePage && (
                <PageSettingsModal
                    open={isSettingsModalOpen}
                    onClose={() => setIsSettingsModalOpen(false)}
                    page={currentOperatePage!}
                    onUpdate={updatedPage => updatePage(updatedPage.id, updatedPage)}
                />
            )}
        </>
    );
};

export default PageList;
