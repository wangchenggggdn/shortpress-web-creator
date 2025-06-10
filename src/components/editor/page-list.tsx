'use client';

import React from 'react';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import useEditorStore from '@/store/useEditorStore';
import { Page } from '@/types/editor';

const PageList = () => {
    const { currentVersion, currentPage, setCurrentPage, addPage, deletePage } = useEditorStore();

    const handleAddPage = () => {
        if (!currentVersion) return;

        const newPage: Page = {
            id: `page-${Date.now()}`,
            name: `New Page ${currentVersion.pages.length + 1}`,
            path: `page-${currentVersion.pages.length + 1}`,
            sections: []
        };

        addPage(newPage);
        setCurrentPage(newPage.id);
    };

    const handleDeletePage = (pageId: string) => {
        deletePage(pageId);
    };

    if (!currentVersion) {
        return <div className="p-4 text-center text-gray-500">Loading...</div>;
    }

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Pages</h2>
                <button
                    onClick={handleAddPage}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="Add new page"
                >
                    <IconPlus size={20} />
                </button>
            </div>

            <div className="space-y-2">
                {currentVersion.pages.map((page: Page) => (
                    <div
                        key={page.id}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                            currentPage === page.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                        }`}
                        onClick={() => setCurrentPage(page.id)}
                    >
                        <span className="truncate">{page.name}</span>
                        <button
                            onClick={e => {
                                e.stopPropagation();
                                handleDeletePage(page.id);
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Delete page"
                        >
                            <IconTrash size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PageList; 