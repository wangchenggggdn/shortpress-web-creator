'use client';

import React, { useState } from 'react';
import TransactionTable from '../transaction-table';

interface Transaction {
    amount: number;
    paymentMethod: string;
    plan: string;
    customer: string;
    date: string;
}

interface TransactionListProps {
    transactions: Transaction[];
}

const RANGE_TABS = [
    { id: 'last7days', label: 'Last 7 Days' },
    { id: 'last14days', label: 'Last 14 Days' },
    { id: 'custom', label: 'Custom Range' },
] as const;

type RangeId = (typeof RANGE_TABS)[number]['id'];

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
    const [activeRange, setActiveRange] = useState<RangeId>('last14days');

    return (
        <div className="h-full w-full flex flex-col">
            <div className="flex justify-between items-center py-4">
                <div className="flex gap-4">
                    {RANGE_TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveRange(tab.id)}
                            className={`px-4 py-2 text-base font-medium rounded-full transition-colors ${activeRange === tab.id ? 'text-primary border border-primary bg-primary/5' : 'hover:text-gray-900'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 mb-6 overflow-scroll bg-white rounded-lg shadow-sm px-6 pb-6 pt-4">
                <TransactionTable transactions={transactions} />
            </div>
            {transactions.length === 0 && <div className="w-full h-full flex items-center justify-center">No Transactions Yet</div>}
        </div>
    );
};

export default TransactionList;
