import React, { useState } from 'react';
import { Tabs } from '@mantine/core';
import classNames from 'classnames';
import TransactionRecords from './transaction-records';
import UnlockHistory from './unlock-history';

const TABS = [
    { id: 'transactions', label: 'Transactions' },
    { id: 'unlock', label: 'Unlock history' },
] as const;

type TabId = (typeof TABS)[number]['id'];

interface TransactionListProps {
    email: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ email }) => {
    const [activeTab, setActiveTab] = useState<TabId>('transactions');

    return (
        <div className="bg-white rounded-lg border border-gray-200 mt-4 h-full">
            {/* Custom Navigation */}
            <div className="flex gap-4 p-4 border-b border-gray-200">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={classNames(
                            'px-4 py-2 text-base font-medium rounded-full transition-colors',
                            activeTab === tab.id ? 'text-primary border border-primary bg-primary/5' : 'text-gray-500 hover:text-gray-900'
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-4 flex-1 overflow-y-scroll">
                <div className="mb-6">
                    {activeTab === 'transactions' && <TransactionRecords email={email} />}
                    {activeTab === 'unlock' && <UnlockHistory email={email} />}
                </div>
            </div>
        </div>
    );
};

export default TransactionList;
