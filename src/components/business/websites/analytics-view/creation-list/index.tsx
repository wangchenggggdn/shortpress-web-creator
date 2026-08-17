'use client';

import React, { useState } from 'react';
import Header from '@/components/system/header';
import { IconLayoutGrid, IconList } from '@tabler/icons-react';
import { SiteContext } from '@/components/business/websites/useContext/site-context';
import { useCreationList } from '../hooks/useCreationList';
import CreationTable, { CreationViewMode } from '../creation-table';
import Search from '@/components/common/search';

const CreationList: React.FC = () => {
    const { params } = React.useContext(SiteContext);
    const siteId = params.siteId;
    const { records, isLoading, total, page, pageSize, userIdSearch, setUserIdSearch, onPageChange, refresh } = useCreationList({ siteId });
    const [viewMode, setViewMode] = useState<CreationViewMode>('grid');

    return (
        <div className="flex flex-col h-screen">
            <Header
                customTitle={
                    <div className="font-medium text-xl flex items-center gap-2">
                        <span className="text-black-purple/50">Analytics / </span> Creations
                    </div>
                }
            />
            <div className="flex-1 min-h-0 px-6 flex flex-col">
                <div className="h-full w-full flex flex-col">
                    <div className="flex justify-between items-center py-4 gap-4">
                        <div className="text-sm text-gray-500">
                            {userIdSearch.trim()
                                ? `Creations matching user ID “${userIdSearch.trim()}” (last 24 hours)`
                                : 'Recent user creations from Redis (last 24 hours)'}
                        </div>
                        <div className="flex items-center gap-3">
                            <Search
                                value={userIdSearch}
                                onChange={setUserIdSearch}
                                placeholder="Search by User ID (fuzzy)"
                                className="w-72"
                            />
                            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('list')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                                        viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-800'
                                    }`}
                                >
                                    <IconList size={16} />
                                    List
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('grid')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                                        viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-800'
                                    }`}
                                >
                                    <IconLayoutGrid size={16} />
                                    Grid
                                </button>
                            </div>
                            <button
                                onClick={refresh}
                                className="px-4 py-2 text-sm font-medium rounded-full border border-primary text-primary hover:bg-primary/5"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 mb-6 bg-white rounded-lg shadow-sm px-6 pb-6 pt-4">
                        <CreationTable
                            records={records}
                            isLoading={isLoading}
                            hasMore={page * pageSize < total}
                            onLoadMore={() => onPageChange(page + 1)}
                            viewMode={viewMode}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreationList;
