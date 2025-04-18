import { useState, useCallback } from 'react';
import AnalyticsApi from '@/api/analytics';
import { AnalyticsResponse } from '@/api/respones';
import { toast } from 'sonner';

export type RangeType = 'last7days' | 'last14days' | 'custom';

interface UseTransactionListProps {
    siteId: string;
}

interface UseTransactionListReturn {
    transactions: AnalyticsResponse.IncomeTransaction[];
    isLoading: boolean;
    rangeType: RangeType;
    setRangeType: (type: RangeType) => void;
    startDate: Date | null;
    setStartDate: (date: Date | null) => void;
    endDate: Date | null;
    setEndDate: (date: Date | null) => void;
    fetchData: () => Promise<void>;
}

export const useTransactionList = ({ siteId }: UseTransactionListProps): UseTransactionListReturn => {
    const [transactions, setTransactions] = useState<AnalyticsResponse.IncomeTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [rangeType, setRangeType] = useState<RangeType>('last7days');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const getTimeRange = useCallback((): [number, number] => {
        const now = Date.now();
        const endTime = Math.floor(now / 1000);
        let startTime: number;

        switch (rangeType) {
            case 'last7days':
                startTime = endTime - (7 * 24 * 60 * 60);
                break;
            case 'last14days':
                startTime = endTime - (14 * 24 * 60 * 60);
                break;
            case 'custom':
                if (!startDate || !endDate) {
                    return [endTime - (7 * 24 * 60 * 60), endTime];
                }
                startTime = Math.floor(startDate.getTime() / 1000);
                const customEndTime = Math.floor(endDate.getTime() / 1000);
                return [startTime, customEndTime];
            default:
                startTime = endTime - (7 * 24 * 60 * 60);
        }

        return [startTime, endTime];
    }, [rangeType, startDate, endDate]);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [startTime, endTime] = getTimeRange();
            console.log('startTime:', new Date(startTime * 1000).toLocaleString());
            console.log('endTime:', new Date(endTime * 1000).toLocaleString());
            const response = await AnalyticsApi.getIncomeTransactions({
                siteId,
                startTime,
                endTime,
                page: 1,
                pageSize: 10
            });

            if (response.code === 0 && response.data) {
                setTransactions(response.data.items);
            } else {
                toast.error('Failed to fetch transactions');
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Failed to fetch transactions');
        } finally {
            setIsLoading(false);
        }
    }, [siteId, getTimeRange]);

    return {
        transactions,
        isLoading,
        rangeType,
        setRangeType,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        fetchData
    };
}; 