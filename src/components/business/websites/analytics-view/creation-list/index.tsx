'use client';

import React from 'react';
import Header from '@/components/system/header';
import { SiteContext } from '@/components/business/websites/useContext/site-context';
import { useCreationList } from '../hooks/useCreationList';
import CreationTable from '../creation-table';

const CreationList: React.FC = () => {
    const { params } = React.useContext(SiteContext);
    const siteId = params.siteId;
    const { records, isLoading, total, page, pageSize, onPageChange, refresh } = useCreationList({ siteId });

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
                        <div className="text-sm text-gray-500">Recent user creations from Redis (last 24 hours)</div>
                        <button
                            onClick={refresh}
                            className="px-4 py-2 text-sm font-medium rounded-full border border-primary text-primary hover:bg-primary/5"
                        >
                            Refresh
                        </button>
                    </div>
                    <div className="flex-1 mb-6 bg-white rounded-lg shadow-sm px-6 pb-6 pt-4">
                        <CreationTable
                            records={records}
                            isLoading={isLoading}
                            hasMore={page * pageSize < total}
                            onLoadMore={() => onPageChange(page + 1)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreationList;
