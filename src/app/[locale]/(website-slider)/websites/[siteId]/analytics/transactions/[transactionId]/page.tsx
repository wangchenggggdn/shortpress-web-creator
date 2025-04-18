import React from 'react';
import TransactionDetail from '@/components/business/websites/analytics-view/transaction-detail';
import Header from '@/components/system/header';
import AnalyticsApi from '@/api/analytics';
import { AnalyticsResponse } from '@/api/respones';

interface TransactionPageProps {
    params: {
        transactionId: string;
    };
}

const TransactionPage: React.FC<TransactionPageProps> = async ({ params }) => {
    const response = await AnalyticsApi.getIncomeTransactionInfo({
        transactionId: params.transactionId,
    });

    if (response.code !== 0 || !response.data) {
        return null;
    }

    const transaction = response.data;

    return (
        <div className="flex-1 min-h-0 flex flex-col">
            <Header
                customTitle={
                    <h1 className="font-medium text-xl">
                        <span className="text-black-purple/50">Analytics / Transactions / </span> Detail
                    </h1>
                }
            />
            <TransactionDetail transaction={transaction} />
        </div>
    );
};

export default TransactionPage;
