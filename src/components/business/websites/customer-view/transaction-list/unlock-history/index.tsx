import React, { useEffect, useState } from 'react';
import { Table } from '@mantine/core';
import { VideoUnlockTransaction } from '@/types/payment';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import LoadingData from '@/components/common/loading-data';
import { SiteContext } from '@/components/business/websites/useContext/site-context';
import { PaymentAPI } from '@/api/payment';
import { useInView } from 'react-intersection-observer';

interface UnlockHistoryProps {
    email: string;
}

const UnlockHistory: React.FC<UnlockHistoryProps> = ({ email }) => {
    const [loading, setLoading] = useState(false);
    const [unlockHistory, setUnlockHistory] = useState<VideoUnlockTransaction[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 5;
    const { params } = React.useContext(SiteContext);

    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0,
    });

    const loadUnlockHistory = async (currentPage: number, isLoadMore = false) => {
        if (loading) return;

        try {
            setLoading(true);
            const response = await PaymentAPI.getVideoUnlockTransactions({
                page: currentPage,
                pageSize,
                email,
                siteId: params.siteId,
            });

            const newItems = response.data.items;
            setUnlockHistory(prev => (isLoadMore ? [...prev, ...newItems] : newItems));
            setHasMore(response.data.total > currentPage * pageSize);
        } catch (error) {
            console.error('Failed to load unlock history:', error);
            toast.error('Failed to load unlock history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUnlockHistory(1);
    }, []);

    useEffect(() => {
        if (inView && hasMore && !loading) {
            setPage(prev => prev + 1);
            loadUnlockHistory(page + 1, true);
        }
    }, [inView, hasMore, loading]);

    if (loading && unlockHistory.length === 0) {
        return (
            <div className="h-40 flex items-center justify-center">
                <LoadingData />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-500px)] overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto">
                <Table>
                    <Table.Thead className="sticky top-0 bg-white z-10">
                        <Table.Tr>
                            <Table.Th>Content Type</Table.Th>
                            <Table.Th>Content Title</Table.Th>
                            <Table.Th>Playlist Title</Table.Th>
                            <Table.Th>Cost</Table.Th>
                            <Table.Th>Unlock Time</Table.Th>
                            <Table.Th>Expiry Time</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {unlockHistory.map(record => (
                            <Table.Tr key={record.transactionId}>
                                <Table.Td>{record.contentType}</Table.Td>
                                <Table.Td>{record.contentTitle ?? '-'}</Table.Td>
                                <Table.Td>{record.playlistTitle ?? '-'}</Table.Td>
                                <Table.Td>{record.coinCost} coins</Table.Td>
                                <Table.Td>{dayjs(record.unlockedAt * 1000).format('YYYY-MM-DD HH:mm')}</Table.Td>
                                <Table.Td>{record.expiredAt ? dayjs(record.expiredAt * 1000).format('YYYY-MM-DD HH:mm') : '-'}</Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
                {/* Intersection observer target for loading more */}
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

export default UnlockHistory;
