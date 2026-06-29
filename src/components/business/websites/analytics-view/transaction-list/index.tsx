'use client';

import React from 'react';
import TransactionTable from '../transaction-table';
import { useTransactionList, RangeType } from '../hooks/useTransactionList';
import { SiteContext } from '@/components/business/websites/useContext/site-context';
import Header from '@/components/system/header';
import { IconArrowLeft } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import Search from '@/components/common/search';

const RANGE_TABS = [
    { id: 'last7days', label: 'Last 7 Days' },
    { id: 'last14days', label: 'Last 14 Days' },
    { id: 'custom', label: 'Custom Range' },
] as const;

const TransactionList: React.FC = () => {
    const { params } = React.useContext(SiteContext);
    const siteId = params.siteId;
    const router = useRouter();
    const { transactions, isLoading, rangeType, setRangeType, startDate, setStartDate, endDate, setEndDate, fetchData, total, page, pageSize, onPageChange, emailSearch, setEmailSearch } = useTransactionList({
        siteId,
    });

    const handleLoadMore = () => {
        onPageChange(page + 1);
    };

    return (
        <div className="flex flex-col h-screen">
            <Header
                customTitle={
                    <div className="font-medium text-xl flex items-center gap-2">
                        <div
                            onClick={() => {
                                router.back();
                            }}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <IconArrowLeft size={20} />
                        </div>
                        <span className="text-black-purple/50">Analytics / </span> Transactions
                    </div>
                }
            />
            <div className="flex-1 min-h-0 px-6 flex flex-col">
                <div className="h-full w-full flex flex-col">
                    <div className="flex justify-between items-center py-4 gap-4">
                        <div className="flex gap-4">
                            {RANGE_TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setRangeType(tab.id as RangeType);
                                    }}
                                    className={`px-4 py-2 text-base font-medium rounded-full transition-colors ${
                                        rangeType === tab.id ? 'text-primary border border-primary bg-primary/5' : 'hover:text-gray-900'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3 items-center">
                            {rangeType === 'custom' && (
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={startDate ? startDate.toISOString().split('T')[0] : ''}
                                        onChange={e => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                                        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <input
                                        type="date"
                                        value={endDate ? endDate.toISOString().split('T')[0] : ''}
                                        onChange={e => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                                        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            )}
                            <Search
                                value={emailSearch}
                                onChange={setEmailSearch}
                                placeholder="Search by Account Email or Payment Email"
                                className="w-80"
                            />
                        </div>
                    </div>

                    <div className="flex-1 mb-6 bg-white rounded-lg shadow-sm px-6 pb-6 pt-4">
                        <TransactionTable
                            variant="transaction-list"
                            transactions={transactions}
                            isLoading={isLoading}
                            hasMore={page * pageSize < total}
                            onLoadMore={handleLoadMore}
                        />
                    </div>
                    {!isLoading && transactions.length === 0 && <div className="w-full h-full flex items-center justify-center">No Transactions Yet</div>}
                </div>
            </div>
        </div>
    );
};

export default TransactionList;
