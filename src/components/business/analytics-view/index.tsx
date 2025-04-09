'use client';

import React, { useState } from 'react';
import LineChart from './line-chat';
import Header from '@/components/system/header';
import { useRouter } from 'next/navigation';
import TransactionTable from './transaction-table';

interface Transaction {
    amount: number;
    paymentMethod: string;
    plan: string;
    customer: string;
    date: string;
}

interface AnalyticsViewProps {
    initialTransactions: Transaction[];
}

const TABS = [{ id: 'income', label: 'Income' }] as const;

type TabId = (typeof TABS)[number]['id'];

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ initialTransactions }) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabId>('income');
    const [transactions] = useState<Transaction[]>(initialTransactions);

    // 模拟收入数据
    const incomeData = [
        { date: 'Mar 4', revenue: 0 },
        { date: 'Mar 7', revenue: 100 },
        { date: 'Mar 10', revenue: 200 },
        { date: 'Mar 13', revenue: 150 },
        { date: 'Mar 16', revenue: 300 },
        { date: 'Mar 19', revenue: 280 },
        { date: 'Mar 22', revenue: 400 },
        { date: 'Mar 25', revenue: 380 },
        { date: 'Mar 28', revenue: 500 },
        { date: 'Mar 31', revenue: 600 },
    ];

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex-1 min-h-0 px-6 flex flex-col overflow-scroll">
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
                    <h2 className="text-xl font-medium text-gray-900 mb-2">Total Revenue</h2>
                    <div className="text-3xl font-bold text-primary mb-6">${incomeData[incomeData.length - 1].revenue.toFixed(2)}</div>
                    <LineChart data={incomeData} />
                </div>

                {/* Latest Transactions */}
                <div className="flex-1 h-full px-6 py-4 mb-6 flex flex-col bg-white rounded-lg shadow-sm">
                    <h2 className="text-xl font-medium text-gray-900 mb-6">Latest Transactions</h2>
                    <div className="overflow-scroll">
                        <TransactionTable transactions={transactions} />
                    </div>
                    {transactions.length === 0 && <div className="w-full h-full flex items-center justify-center">No Transactions Yet</div>}
                    {transactions.length > 0 && (
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
