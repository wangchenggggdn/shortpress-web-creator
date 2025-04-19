import React, { useEffect, useState } from 'react';
import { Table } from '@mantine/core';
import { IncomeTransaction } from '@/types/payment';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import LoadingData from '@/components/common/loading-data';
import { SiteContext } from '@/components/business/websites/useContext/site-context';
import AnalyticsApi from '@/api/analytics';
import { useInView } from 'react-intersection-observer';

interface TransactionRecordsProps {
    email: string;
}

const TransactionRecords: React.FC<TransactionRecordsProps> = ({ email }) => {
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState<IncomeTransaction[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 5;
    const { params } = React.useContext(SiteContext);

    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0,
    });

    const loadTransactions = async (currentPage: number, isLoadMore = false) => {
        if (loading) return;

        try {
            setLoading(true);
            const response = await AnalyticsApi.getIncomeTransactions({
                page: currentPage,
                pageSize,
                siteId: params.siteId,
                userEmail: email,
            });

            const newItems = response.data.items;
            setTransactions(prev => (isLoadMore ? [...prev, ...newItems] : newItems));
            setHasMore(response.data.total > currentPage * pageSize);
        } catch (error) {
            console.error('Failed to load transactions:', error);
            toast.error('Failed to load transaction history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions(1);
    }, []);

    useEffect(() => {
        if (inView && hasMore && !loading) {
            setPage(prev => prev + 1);
            loadTransactions(page + 1, true);
        }
    }, [inView, hasMore, loading]);

    if (loading && transactions.length === 0) {
        return (
            <div className="h-40 flex items-center justify-center">
                <LoadingData />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-420px)] overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto">
                <Table>
                    <Table.Thead className="sticky top-0 bg-white z-10">
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
                {/* 加载更多的观察目标 */}
                <div ref={loadMoreRef} style={{ height: '20px' }}>
                    {loading && (
                        <div className="py-4 flex justify-center">
                            <LoadingData />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionRecords;
