'use client';

import React from 'react';
import { Button, Table } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { AnalyticsResponse } from '@/api/respones';
import dayjs from 'dayjs';
interface TransactionDetailProps {
    transaction: AnalyticsResponse.IncomeTransactionInfo;
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({ transaction }) => {
    const router = useRouter();

    return (
        <div className="flex-1 min-h-0 px-6 flex flex-col">
            {/* Payment Amount */}
            <div className="my-6">
                <h3 className="text-gray-500 mb-2">Payment</h3>
                <div className="text-4xl font-bold text-primary">${transaction.amount.toFixed(2)} USD</div>
            </div>

            {/* Transaction Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-medium text-gray-900">Details</h2>

                    <Button
                        onClick={() => {
                            // First encode to base64
                            const encodedEmail = btoa(transaction.email);
                            // Then make it URL safe
                            const urlSafeEmail = encodeURIComponent(encodedEmail);
                            router.push(`../../customers/${urlSafeEmail}`);
                        }}
                        variant="outline"
                        className="text-sm font-medium"
                    >
                        View Customer
                    </Button>
                </div>
                <Table withRowBorders={false}>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th className="text-black-purple/60">Email</Table.Th>
                            <Table.Th className="text-black-purple/60">Method</Table.Th>
                            <Table.Th className="text-black-purple/60">Plan</Table.Th>
                            <Table.Th className="text-black-purple/60">Date</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        <Table.Tr>
                            <Table.Td className="text-black-purple/70">{transaction.email}</Table.Td>
                            <Table.Td className="text-black-purple/70">{transaction.provider}</Table.Td>
                            <Table.Td className="text-black-purple/70">{transaction.name}</Table.Td>
                            <Table.Td className="text-black-purple/70">{dayjs(transaction.createdAt * 1000).format('YYYY-MM-DD HH:mm')}</Table.Td>
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </div>
        </div>
    );
};

export default TransactionDetail;
