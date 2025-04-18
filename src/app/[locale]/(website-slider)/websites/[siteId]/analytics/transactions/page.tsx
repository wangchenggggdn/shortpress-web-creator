'use client';

import React from 'react';
import TransactionList from '@/components/business/websites/analytics-view/transaction-list';
import Header from '@/components/system/header';

export default function TransactionsPage() {
    return (
        <div className="flex flex-col h-screen">
            <Header
                customTitle={
                    <h1 className="font-medium text-xl">
                        <span className="text-black-purple/50">Analytics / </span> Transactions
                    </h1>
                }
            />
            <div className="flex-1 min-h-0 px-6 flex flex-col">
                <TransactionList />
            </div>
        </div>
    );
}
