'use client';

import React from 'react';
import TransactionDetail from '@/components/business/analytics-view/transaction-detail';
import Header from '@/components/system/header';

interface TransactionPageProps {
    params: {
        transactionId: string;
    };
}

const TransactionPage: React.FC<TransactionPageProps> = ({ params }) => {
    // 这里可以根据transactionId获取交易详情数据
    // 目前使用模拟数据
    const mockTransaction = {
        amount: 299.99,
        paymentMethod: 'Credit Card',
        plan: 'Premium Plan',
        customer: 'John Doe',
        date: '2024-03-15',
        email: 'john.doe@example.com',
    };

    return (
        <div className="flex-1 min-h-0 flex flex-col">
            <Header
                customTitle={
                    <h1 className="font-medium text-xl">
                        <span className="text-black-purple/50">Analytics / Transactions / </span> Detail
                    </h1>
                }
            />
            <TransactionDetail transaction={mockTransaction} />
        </div>
    );
};

export default TransactionPage;
