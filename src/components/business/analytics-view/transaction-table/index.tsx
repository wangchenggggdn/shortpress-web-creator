'use client';

import React from 'react';
import { Table } from '@mantine/core';
import { useRouter } from 'next/navigation';

interface Transaction {
    amount: number;
    paymentMethod: string;
    plan: string;
    customer: string;
    date: string;
}

interface TransactionTableProps {
    transactions: Transaction[];
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
    const router = useRouter();

    const handleRowClick = (index: number) => {
        router.push(`./transactions/${index}`);
    };

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
                {transactions.map((transaction, index) => (
                    <Table.Tr key={`transaction-${index}`} onClick={() => handleRowClick(index)} className="cursor-pointer hover:bg-gray-50">
                        <Table.Td className="text-green-500 font-bold">${transaction.amount.toFixed(2)}</Table.Td>
                        <Table.Td className="text-black-purple/70">{transaction.paymentMethod}</Table.Td>
                        <Table.Td className="text-black-purple/70">{transaction.plan}</Table.Td>
                        <Table.Td className="text-black-purple/70">{transaction.customer}</Table.Td>
                        <Table.Td className="text-black-purple/70">{transaction.date}</Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );
};

export default TransactionTable;
