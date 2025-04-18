import React, { useEffect, useState } from 'react';
import { Table } from '@mantine/core';
import CustomerApi from '@/api/customer';
import { VideoUnlockTransaction } from '@/types/payment';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import LoadingData from '@/components/common/loading-data';
import { SiteContext } from '@/components/business/websites/useContext/site-context';
interface UnlockHistoryProps {
    email: string;
}

const UnlockHistory: React.FC<UnlockHistoryProps> = ({ email }) => {
    const [loading, setLoading] = useState(false);
    const [unlockHistory, setUnlockHistory] = useState<VideoUnlockTransaction[]>([]);
    const { params } = React.useContext(SiteContext);

    const loadUnlockHistory = async () => {
        try {
            setLoading(true);
            const response = await CustomerApi.getVideoUnlockTransactions({
                page: 1,
                pageSize: 20,
                email,
                siteId: params.siteId,
            });
            setUnlockHistory(response.data.items);
        } catch (error) {
            console.error('Failed to load unlock history:', error);
            toast.error('Failed to load unlock history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUnlockHistory();
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
                    <Table.Th>Content Type</Table.Th>
                    <Table.Th>Content ID</Table.Th>
                    <Table.Th>Cost</Table.Th>
                    <Table.Th>Unlock Time</Table.Th>
                    <Table.Th>Expiry Time</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {unlockHistory.map(record => (
                    <Table.Tr key={record.transactionId}>
                        <Table.Td>{record.contentType}</Table.Td>
                        <Table.Td>{record.contentId}</Table.Td>
                        <Table.Td>{record.coinCost} coins</Table.Td>
                        <Table.Td>{dayjs(record.unlockedAt * 1000).format('YYYY-MM-DD HH:mm')}</Table.Td>
                        <Table.Td>{record.expiredAt ? dayjs(record.expiredAt * 1000).format('YYYY-MM-DD HH:mm') : '-'}</Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );
};

export default UnlockHistory;
