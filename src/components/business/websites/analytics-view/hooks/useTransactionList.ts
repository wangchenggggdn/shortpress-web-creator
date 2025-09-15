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
    fetchData: (currentPage?: number, customStartTime?: number, customEndTime?: number) => Promise<void>;
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

    // Calculate custom time range with day start (00:00:00) and end (23:59:59)
    const calculateCustomTimeRange = useCallback((start: Date, end: Date): [number, number] => {
        const startDateTime = new Date(start);
        startDateTime.setHours(0, 0, 0, 0);
        const startTime = Math.floor(startDateTime.getTime() / 1000);

        const endDateTime = new Date(end);
        endDateTime.setHours(23, 59, 59, 999);
        const endTime = Math.floor(endDateTime.getTime() / 1000);

        return [startTime, endTime];
    }, []);

    const getTimeRange = useCallback((customStartTime?: number, customEndTime?: number): [number, number] => {
        if (rangeType === 'custom') {
            if (customStartTime && customEndTime) {
                return [customStartTime, customEndTime];
            }
            if (!startDate || !endDate) {
                return [0, 0];
            }
            return calculateCustomTimeRange(startDate, endDate);
        }

        // For non-custom ranges, use current time as end time
        const endTime = Math.floor(Date.now() / 1000);
        let startTime: number;

        switch (rangeType) {
            case 'last7days':
                startTime = endTime - (7 * 24 * 60 * 60);
                break;
            case 'last14days':
                startTime = endTime - (14 * 24 * 60 * 60);
                break;
            default:
                startTime = endTime - (7 * 24 * 60 * 60);
        }

        return [startTime, endTime];
    }, [rangeType, startDate, endDate, calculateCustomTimeRange]);

    const fetchData = useCallback(async (currentPage?: number, customStartTime?: number, customEndTime?: number) => {
        try {
            setIsLoading(true);
            const [startTime, endTime] = getTimeRange(customStartTime, customEndTime);

            console.log('Time Range:', {
                startTime: new Date(startTime * 1000).toLocaleString(),
                endTime: new Date(endTime * 1000).toLocaleString(),
                page: currentPage || 1
            });

            const response = await AnalyticsApi.getIncomeTransactions({
                siteId,
                startTime,
                endTime,
                page: currentPage || 1,
                pageSize: pageSize
            });

            if (response.code === 0 && response.data) {
                if (currentPage && currentPage > 1) {
                    setTransactions(prev => [...prev, ...response.data.items]);
                } else {
                    setTransactions(response.data.items);
                }
                setTotal(response.data.total);
                setPage(currentPage || 1);
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

    const handleDateChange = useCallback((date: Date | null, isStartDate: boolean) => {
        if (isStartDate) {
            setStartDate(date);
            // Fetch data only when both dates are selected in custom mode
            if (date && endDate && rangeType === 'custom') {
                const [startTime, endTime] = calculateCustomTimeRange(date, endDate);
                fetchData(1, startTime, endTime);
            }
        } else {
            setEndDate(date);
            // Fetch data only when both dates are selected in custom mode
            if (startDate && date && rangeType === 'custom') {
                const [startTime, endTime] = calculateCustomTimeRange(startDate, date);
                fetchData(1, startTime, endTime);
            }
        }
    }, [endDate, startDate, rangeType, calculateCustomTimeRange, fetchData]);

    const handleRangeTypeChange = (type: RangeType) => {
        setRangeType(type);
        if (type === 'custom') {
            // Reset all data when switching to custom mode
            setStartDate(null);
            setEndDate(null);
            setTransactions([]);
            setTotal(0);
        } else {
            fetchData(1);
        }
    };

    const onPageChange = (newPage: number) => {
        fetchData(newPage);
    };

    useEffect(() => {
        fetchData(1);
    }, []);

    return {
        transactions,
        isLoading,
        rangeType,
        setRangeType: handleRangeTypeChange,
        startDate,
        setStartDate: (date: Date | null) => handleDateChange(date, true),
        endDate,
        setEndDate: (date: Date | null) => handleDateChange(date, false),
        fetchData,
        total,
        page,
        pageSize,
        onPageChange,
    };
}; 