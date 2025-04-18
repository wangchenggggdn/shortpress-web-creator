import React, { useEffect, useState } from 'react';
import { Table } from '@mantine/core';
import { IncomeTransaction } from '@/types/payment';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import LoadingData from '@/components/common/loading-data';
import { SiteContext } from '@/components/business/websites/useContext/site-context';
import AnalyticsApi from '@/api/analytics';
interface TransactionRecordsProps {
    email: string;
}

const TransactionRecords: React.FC<TransactionRecordsProps> = ({ email }) => {
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState<IncomeTransaction[]>([]);
    const { params } = React.useContext(SiteContext);
    const loadTransactions = async () => {
        try {
            setLoading(true);
            const response = await AnalyticsApi.getIncomeTransactions({
                page: 1,
                pageSize: 20,
                siteId: params.siteId,
                userEmail: email,
            });
            setTransactions(response.data.items);
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
                        <Table.Td>{transaction.provider}</Table.Td>
                        <Table.Td>{transaction.name}</Table.Td>
                        <Table.Td>{dayjs(transaction.createdAt * 1000).format('YYYY-MM-DD HH:mm')}</Table.Td>
                        <Table.Td>{transaction.description}</Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );
};

export default TransactionRecords;
