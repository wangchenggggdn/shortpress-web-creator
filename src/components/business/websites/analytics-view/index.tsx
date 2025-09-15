'use client';

import React, { useState, useEffect, useContext } from 'react';
import LineChart from './line-chat';
import Header from '@/components/system/header';
import { useRouter } from 'next/navigation';
import TransactionTable from './transaction-table';
import { useAnalytics, TimeRange } from './hooks/useAnalytics';
import { SiteContext } from '@/components/business/websites/useContext/site-context';

const TABS = [{ id: 'income', label: 'Income' }] as const;
const TIME_RANGES: { label: string; value: TimeRange }[] = [
    { label: '1D', value: 'day' },
    { label: '3D', value: '3days' },
    { label: '7D', value: 'week' },
    { label: '1M', value: 'month' },
];

type TabId = (typeof TABS)[number]['id'];

const AnalyticsView: React.FC = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabId>('income');
    const { params } = useContext(SiteContext);
    const siteId = params.siteId;

    const { incomeData, transactions, isLoading, isTransactionsLoading, timeRange, setTimeRange, fetchData, fetchTransactions, totalAmount, total, page, pageSize, onPageChange } =
        useAnalytics({
            siteId,
        });

    useEffect(() => {
        fetchData();
        fetchTransactions();
    }, [fetchData, fetchTransactions]);

    const chartData =
        incomeData?.map(item => ({
            date: item.date,
            revenue: item.totalAmount,
        })) || [];

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex-1 min-h-0 px-6 flex flex-col overflow-auto">
                {/* Custom Navigation */}
                <div className="flex gap-4 my-4">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="px-4 py-2 text-base font-medium rounded-full transition-colors text-primary border border-primary bg-primary/5"
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Income Statistics */}
                <div className="mb-6 p-6 bg-white rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-medium text-gray-900">Total Revenue</h2>
                        {/* <div className="flex gap-2">
                            {TIME_RANGES.map(range => (
                                <button
                                    key={range.value}
                                    onClick={() => setTimeRange(range.value)}
                                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                        timeRange === range.value ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div> */}
                    </div>
                    <div className="text-3xl font-bold text-primary mb-6">${totalAmount.toFixed(2) || '0.00'}</div>
                    {isLoading ? (
                        <div className="h-[250px] flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <LineChart data={chartData} />
                    )}
                </div>

                {/* Latest Transactions */}
                <div className="flex-1 h-full px-6 py-4 mb-6 flex flex-col bg-white rounded-lg shadow-sm">
                    <h2 className="text-xl font-medium text-gray-900 mb-6">Latest Transactions</h2>
                    <div className="overflow-auto">
                        <TransactionTable
                            variant="analytics"
                            transactions={transactions}
                            isLoading={isTransactionsLoading}
                            hasMore={page * pageSize < total}
                            onLoadMore={() => onPageChange(page + 1)}
                        />
                    </div>
                    {!isTransactionsLoading && transactions.length === 0 && <div className="w-full h-full flex items-center justify-center">No Transactions Yet</div>}
                    {!isTransactionsLoading && transactions.length > 0 && (
                        <div
                            onClick={() => router.push('./analytics/transactions')}
                            className="mt-4 text-primary hover:text-primary/90 cursor-pointer"
                        >{`View all transactions >>`}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsView;
