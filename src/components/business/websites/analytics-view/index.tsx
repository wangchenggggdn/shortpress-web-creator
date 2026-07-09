'use client';

import React, { useState, useEffect, useContext } from 'react';
import RevenueChart from './line-chat';
import Header from '@/components/system/header';
import { useRouter } from 'next/navigation';
import TransactionTable from './transaction-table';
import { useAnalytics, TimeRange, CHART_TIMEZONE_OPTIONS } from './hooks/useAnalytics';
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

    const {
        incomeData,
        transactions,
        isLoading,
        isTransactionsLoading,
        timeRange,
        setTimeRange,
        chartTimezone,
        setChartTimezone,
        fetchData,
        fetchTransactions,
        totalAmount,
        total,
        page,
        pageSize,
        onPageChange,
    } = useAnalytics({
        siteId,
    });

    useEffect(() => {
        fetchData();
        fetchTransactions();
    }, [fetchData, fetchTransactions]);

    const chartData =
        incomeData?.map(item => ({
            date: item.date,
            iap: item.iapAmount ?? 0,
            subscription: item.subscriptionAmount ?? 0,
            renewal: item.renewalAmount ?? 0,
            total: item.totalAmount ?? 0,
        })) || [];

    const revenueBreakdown = incomeData?.reduce(
        (acc, item) => ({
            iap: acc.iap + (item.iapAmount ?? 0),
            subscription: acc.subscription + (item.subscriptionAmount ?? 0),
            renewal: acc.renewal + (item.renewalAmount ?? 0),
        }),
        { iap: 0, subscription: 0, renewal: 0 },
    ) ?? { iap: 0, subscription: 0, renewal: 0 };

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
                    <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-medium text-gray-900">Total Revenue</h2>
                            <span className="text-3xl font-bold text-primary leading-none">${totalAmount.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Timezone</span>
                                <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                                    {CHART_TIMEZONE_OPTIONS.map(option => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setChartTimezone(option.value)}
                                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                                chartTimezone === option.value
                                                    ? 'bg-white text-primary shadow-sm font-medium'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    fetchData();
                                    fetchTransactions();
                                }}
                                disabled={isLoading || isTransactionsLoading}
                                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <svg
                                    className={`h-3.5 w-3.5 ${isLoading || isTransactionsLoading ? 'animate-spin' : ''}`}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                                    <polyline points="21 3 21 9 15 9" />
                                </svg>
                                Refresh
                            </button>
                        </div>
                    </div>
                    <div className="mb-6 flex flex-wrap gap-3">
                        {[
                            { label: 'In-App Purchase', amount: revenueBreakdown.iap, color: 'bg-emerald-500' },
                            { label: 'Subscription', amount: revenueBreakdown.subscription, color: 'bg-primary' },
                            { label: 'Renewal', amount: revenueBreakdown.renewal, color: 'bg-amber-500' },
                        ].map(item => (
                            <div
                                key={item.label}
                                className="flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-3 py-1.5 text-sm text-gray-700"
                            >
                                <span className={`h-2 w-2 rounded-full ${item.color}`} />
                                <span>{item.label}</span>
                                <span className="font-semibold text-gray-900">${item.amount.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    {isLoading ? (
                        <div className="h-[300px] flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <RevenueChart data={chartData} />
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
