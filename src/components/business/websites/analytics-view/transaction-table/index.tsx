'use client';

import React from 'react';
import { Table } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { AnalyticsResponse } from '@/api/respones';
import LoadingData from '@/components/common/loading-data';

interface TransactionTableProps {
    transactions: AnalyticsResponse.IncomeTransaction[];
    isLoading?: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, isLoading }) => {
    const router = useRouter();

    const handleRowClick = (transactionId: string) => {
        router.push(`./transactions/${transactionId}`);
    };

    if (isLoading) {
        return <LoadingData />;
    }

    return (
        <Table>
            <Table.Thead>
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
    );
};

export default TransactionTable;
