'use client';

import React from 'react';
import { Table } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { AnalyticsResponse } from '@/api/respones';
import LoadingData from '@/components/common/loading-data';
import { SiteContext } from '@/components/business/websites/useContext/site-context';
import { useInView } from 'react-intersection-observer';

interface TransactionTableProps {
    transactions: AnalyticsResponse.IncomeTransaction[];
    isLoading?: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    variant?: 'analytics' | 'transaction-list';
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, isLoading, hasMore, onLoadMore, variant = 'analytics' }) => {
    const router = useRouter();
    const { params } = React.useContext(SiteContext);
    const siteId = params.siteId;

    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0,
    });

    React.useEffect(() => {
        if (inView && hasMore && !isLoading) {
            onLoadMore();
        }
    }, [inView, hasMore, isLoading]);

    const handleRowClick = (transactionId: string) => {
        router.push(`/websites/${siteId}/analytics/transactions/${transactionId}`);
    };

    if (isLoading && transactions.length === 0) {
        return <LoadingData />;
    }

    return (
        <div className={`flex flex-col ${variant === 'analytics' ? 'h-[calc(100vh-720px)]' : 'h-[calc(100vh-200px)]'} overflow-hidden`}>
            <div className="flex-1 min-h-0 overflow-y-auto">
                <Table>
                    <Table.Thead className="sticky top-0 bg-white z-10">
                        <Table.Tr>
                            <Table.Th className="text-black-purple/60">Amount</Table.Th>
                            <Table.Th className="text-black-purple/60">Payment Method</Table.Th>
                            <Table.Th className="text-black-purple/60">Plan</Table.Th>
                            <Table.Th className="text-black-purple/60">Customer</Table.Th>
                            <Table.Th className="text-black-purple/60">Date</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {transactions.map(transaction => (
                            <Table.Tr key={transaction.transactionId} onClick={() => handleRowClick(transaction.transactionId)} className="cursor-pointer hover:bg-gray-50">
                                <Table.Td className="text-green-500 font-bold">${transaction.amount.toFixed(2)}</Table.Td>
                                <Table.Td className="text-black-purple/70">{transaction.provider}</Table.Td>
                                <Table.Td className="text-black-purple/70">{transaction.name + ' coins'}</Table.Td>
                                <Table.Td className="text-black-purple/70">{transaction.email}</Table.Td>
                                <Table.Td className="text-black-purple/70">{new Date(transaction.createdAt * 1000).toLocaleString()}</Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
                {/* 加载更多的观察目标 */}
                <div ref={loadMoreRef} style={{ height: '20px' }}>
                    {isLoading && transactions.length > 0 && (
                        <div className="py-4 flex justify-center">
                            <LoadingData />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionTable;
