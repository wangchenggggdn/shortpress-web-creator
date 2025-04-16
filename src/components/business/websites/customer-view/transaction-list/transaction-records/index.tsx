import React, { useEffect, useState } from 'react';
import { Table } from '@mantine/core';
import CustomerApi from '@/api/customer';
import { UserResponse } from '@/api/respone';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import LoadingData from '@/components/common/loading-data';

interface TransactionRecordsProps {
    email: string;
}

const TransactionRecords: React.FC<TransactionRecordsProps> = ({ email }) => {
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState<UserResponse.CoinTransaction[]>([]);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const response = await CustomerApi.getCoinTransactions({
                page: 1,
                pageSize: 20,
                email,
            });
            setTransactions(response.data.transactions);
        } catch (error) {
            console.error('Failed to load transactions:', error);
            toast.error('Failed to load transaction history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, []);

    if (loading) {
        return (
            <div className="h-40 flex items-center justify-center">
                <LoadingData />
            </div>
        );
    }

    return (
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Amount</Table.Th>
                    <Table.Th>Method</Table.Th>
                    <Table.Th>Plan</Table.Th>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Description</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {transactions.map(transaction => (
                    <Table.Tr key={transaction.transactionId}>
                        <Table.Td>
                            {transaction.amount > 0 ? '+' : ''}
                            {transaction.amount} coins
                        </Table.Td>
                        <Table.Td>{transaction.source}</Table.Td>
                        <Table.Td>{transaction.type === 1 ? 'Manual' : 'Stripe'}</Table.Td>
                        <Table.Td>{dayjs(transaction.createdAt * 1000).format('YYYY-MM-DD HH:mm')}</Table.Td>
                        <Table.Td>{transaction.description}</Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );
};

export default TransactionRecords;
