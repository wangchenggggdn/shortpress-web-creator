import { useState, useCallback, useEffect } from 'react';
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
    fetchData: (currentPage?: number) => Promise<void>;
    total: number;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

export const useTransactionList = ({ siteId }: UseTransactionListProps): UseTransactionListReturn => {
    const [transactions, setTransactions] = useState<AnalyticsResponse.IncomeTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [rangeType, setRangeType] = useState<RangeType>('last7days');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
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

    const fetchData = useCallback(async (currentPage?: number) => {
        try {
            setIsLoading(true);
            const [startTime, endTime] = getTimeRange();
            const response = await AnalyticsApi.getIncomeTransactions({
                siteId,
                startTime,
                endTime,
                page: currentPage || page,
                pageSize: pageSize
            });

            if (response.code === 0 && response.data) {
                if (currentPage && currentPage > 1) {
                    setTransactions(prev => [...prev, ...response.data.items]);
                } else {
                    setTransactions(response.data.items);
                }
                setTotal(response.data.total);
                setPage(currentPage || page);
                setPageSize(response.data.pageSize);
            } else {
                toast.error('Failed to fetch transactions');
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Failed to fetch transactions');
        } finally {
            setIsLoading(false);
        }
    }, [siteId, getTimeRange, pageSize]);

    const handleRangeTypeChange = (type: RangeType) => {
        setRangeType(type);
        setPage(1);
        fetchData();
    };

    const onPageChange = (newPage: number) => {
        fetchData(newPage);
    };

    return {
        transactions,
        isLoading,
        rangeType,
        setRangeType: handleRangeTypeChange,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        fetchData,
        total,
        page,
        pageSize,
        onPageChange,
    };
}; 